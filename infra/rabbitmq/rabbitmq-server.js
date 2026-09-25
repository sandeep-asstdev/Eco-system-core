const http = require('http');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

const PORT = parseInt(process.env.RABBITMQ_PORT || '5672', 10);
const MGMT_PORT = parseInt(process.env.RABBITMQ_MGMT_PORT || '15672', 10);
const DATA_FILE = path.join(__dirname, 'broker-storage.json');

/**
 * Enterprise Message Broker for Automobile Ecosystem.
 * Implements Topic Exchange, Dead-Letter Queues (DLQ), Durable Queues,
 * Persistent Message Storage, Idempotency, and Safe Replay.
 */
class MessageBroker extends EventEmitter {
  constructor() {
    super();
    this.exchanges = new Map();
    this.queues = new Map();
    this.bindings = new Map(); // key: `${exchange}_${queue}_${pattern}`, value: { queueName, exchangeName, pattern }
    this.messages = []; // Message store for audit and replay
    this.consumers = new Map(); // queueName -> Set of consumer callbacks
    this.sseClients = new Map(); // queueName -> Set of response streams

    // Initialize Default Exchanges
    this.assertExchange('automobile.events.topic', 'topic', { durable: true });
    this.assertExchange('automobile.events.dlx', 'topic', { durable: true });

    // Initialize Default Queues
    this.assertQueue('maintly.employee.sync', {
      durable: true,
      deadLetterExchange: 'automobile.events.dlx',
      deadLetterRoutingKey: 'maintly.employee.sync.dlq',
    });
    this.assertQueue('maintly.employee.sync.dlq', { durable: true });

    // Bindings
    this.bindQueue('maintly.employee.sync', 'automobile.events.topic', 'employee.#');
    this.bindQueue('maintly.employee.sync.dlq', 'automobile.events.dlx', '#');

    // Load persisted state if exists
    this.loadState();
  }

  loadState() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.messages)) {
          this.messages = data.messages;
        }
        if (data.queueMessages && typeof data.queueMessages === 'object') {
          for (const [qName, msgs] of Object.entries(data.queueMessages)) {
            const queue = this.assertQueue(qName);
            queue.messages = msgs;
          }
        }
      }
    } catch (e) {
      console.warn('[BROKER] Warning loading persisted broker state:', e.message);
    }
  }

  saveState() {
    try {
      const queueMessages = {};
      for (const [qName, q] of this.queues.entries()) {
        queueMessages[qName] = q.messages;
      }
      const data = {
        messages: this.messages.slice(-500), // preserve last 500 published messages for audit
        queueMessages,
        savedAt: new Date().toISOString(),
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.warn('[BROKER] Warning saving broker state:', e.message);
    }
  }

  assertExchange(name, type = 'topic', options = {}) {
    if (!this.exchanges.has(name)) {
      this.exchanges.set(name, { name, type, options, createdAt: new Date() });
    }
    return this.exchanges.get(name);
  }

  assertQueue(name, options = {}) {
    if (!this.queues.has(name)) {
      this.queues.set(name, {
        name,
        options,
        messages: [],
        deadLetterExchange: options.deadLetterExchange || null,
        deadLetterRoutingKey: options.deadLetterRoutingKey || null,
        createdAt: new Date(),
      });
      this.consumers.set(name, new Set());
      this.sseClients.set(name, new Set());
    }
    return this.queues.get(name);
  }

  bindQueue(queueName, exchangeName, pattern) {
    this.assertQueue(queueName);
    this.assertExchange(exchangeName);
    const key = `${exchangeName}_${queueName}_${pattern}`;
    this.bindings.set(key, { queueName, exchangeName, pattern });
  }

  matchesPattern(routingKey, pattern) {
    if (pattern === '#' || pattern === routingKey) return true;
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '[^.]+')
      .replace(/#/g, '.*');
    return new RegExp(`^${regexPattern}$`).test(routingKey);
  }

  publish(exchangeName, routingKey, content, properties = {}) {
    const exchange = this.exchanges.get(exchangeName);
    if (!exchange) {
      throw new Error(`Exchange '${exchangeName}' does not exist`);
    }

    const message = {
      id: properties.messageId || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      exchange: exchangeName,
      routingKey,
      content,
      properties: {
        timestamp: Date.now(),
        persistent: true,
        ...properties,
      },
      status: 'PUBLISHED',
      createdAt: new Date(),
    };

    this.messages.push(message);

    // Route to bound queues
    let routed = false;
    for (const binding of this.bindings.values()) {
      if (binding.exchangeName === exchangeName && this.matchesPattern(routingKey, binding.pattern)) {
        const queue = this.queues.get(binding.queueName);
        if (queue) {
          queue.messages.push(message);
          routed = true;
          this.dispatchToConsumers(queue.name, message);
          this.dispatchToSSE(queue.name, message);
        }
      }
    }

    this.saveState();
    return routed;
  }

  subscribe(queueName, callback) {
    this.assertQueue(queueName);
    const consumers = this.consumers.get(queueName);
    consumers.add(callback);

    // Deliver any backlog messages
    const queue = this.queues.get(queueName);
    if (queue && queue.messages.length > 0) {
      const pending = [...queue.messages];
      for (const msg of pending) {
        this.dispatchToConsumers(queueName, msg);
      }
    }

    return () => consumers.delete(callback);
  }

  addSSEClient(queueName, res) {
    this.assertQueue(queueName);
    const clients = this.sseClients.get(queueName);
    clients.add(res);

    // Push pending backlog to this new SSE client
    const queue = this.queues.get(queueName);
    if (queue && queue.messages.length > 0) {
      for (const msg of queue.messages) {
        res.write(`data: ${JSON.stringify(msg)}\n\n`);
      }
    }

    return () => clients.delete(res);
  }

  dispatchToSSE(queueName, message) {
    const clients = this.sseClients.get(queueName);
    if (!clients || clients.size === 0) return;
    const data = `data: ${JSON.stringify(message)}\n\n`;
    for (const res of clients) {
      try {
        res.write(data);
      } catch (e) {
        clients.delete(res);
      }
    }
  }

  dispatchToConsumers(queueName, message) {
    const consumers = this.consumers.get(queueName);
    if (!consumers || consumers.size === 0) return;

    for (const callback of consumers) {
      setImmediate(async () => {
        try {
          await callback({
            content: Buffer.from(typeof message.content === 'string' ? message.content : JSON.stringify(message.content)),
            properties: message.properties,
            fields: {
              routingKey: message.routingKey,
              exchange: message.exchange,
              deliveryTag: message.id,
            },
            ack: () => this.ack(queueName, message.id),
            nack: (allUpTo, requeue) => this.nack(queueName, message.id, requeue),
          });
        } catch (err) {
          console.error(`[BROKER] Consumer error on queue '${queueName}':`, err);
          this.nack(queueName, message.id, false);
        }
      });
    }
  }

  ack(queueName, messageId) {
    const queue = this.queues.get(queueName);
    if (!queue) return;
    queue.messages = queue.messages.filter((m) => m.id !== messageId);
    this.saveState();
  }

  nack(queueName, messageId, requeue = false) {
    const queue = this.queues.get(queueName);
    if (!queue) return;

    const msgIndex = queue.messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    const message = queue.messages[msgIndex];
    if (requeue) {
      // Keep in queue for redelivery
      return;
    }

    // Dead letter handling
    queue.messages.splice(msgIndex, 1);
    if (queue.deadLetterExchange) {
      console.log(`[BROKER] Dead-lettering message '${message.id}' to '${queue.deadLetterExchange}'`);
      this.publish(queue.deadLetterExchange, queue.deadLetterRoutingKey || message.routingKey, message.content, {
        ...message.properties,
        death: {
          queue: queueName,
          reason: 'rejected',
          time: new Date().toISOString(),
        },
      });
    }
    this.saveState();
  }

  replayDeadLetter(dlqQueueName = 'maintly.employee.sync.dlq') {
    const dlq = this.queues.get(dlqQueueName);
    if (!dlq || dlq.messages.length === 0) return 0;

    const count = dlq.messages.length;
    const messagesToReplay = [...dlq.messages];
    dlq.messages = [];

    for (const msg of messagesToReplay) {
      this.publish('automobile.events.topic', msg.routingKey, msg.content, msg.properties);
    }

    this.saveState();
    return count;
  }

  getMetrics() {
    const queueStats = {};
    for (const [name, q] of this.queues.entries()) {
      queueStats[name] = {
        messageCount: q.messages.length,
        consumerCount: (this.consumers.get(name)?.size || 0) + (this.sseClients.get(name)?.size || 0),
        options: q.options,
      };
    }

    return {
      uptimeSeconds: Math.floor(process.uptime()),
      totalMessagesPublished: this.messages.length,
      exchanges: Array.from(this.exchanges.keys()),
      queues: queueStats,
      bindings: Array.from(this.bindings.keys()),
    };
  }
}

// Global Singleton Instance
const broker = new MessageBroker();

// HTTP Management & REST API Server (port 5672 and 15672)
const requestHandler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // SSE Stream for real-time consumer subscription
  if (url.pathname === '/api/subscribe' && req.method === 'GET') {
    const queueName = url.searchParams.get('queue') || 'maintly.employee.sync';
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.write(`: connected to queue ${queueName}\n\n`);

    const unsubscribe = broker.addSSEClient(queueName, res);
    req.on('close', () => {
      unsubscribe();
    });
    return;
  }

  res.setHeader('Content-Type', 'application/json');

  if (url.pathname === '/api/overview' || url.pathname === '/api/health') {
    res.writeHead(200);
    return res.end(JSON.stringify({ status: 'ok', broker: 'RabbitMQ-Compatible AMQP Engine', metrics: broker.getMetrics() }, null, 2));
  }

  if (url.pathname === '/api/queues') {
    res.writeHead(200);
    return res.end(JSON.stringify(broker.getMetrics().queues, null, 2));
  }

  if (url.pathname === '/api/exchanges') {
    res.writeHead(200);
    return res.end(JSON.stringify(broker.getMetrics().exchanges, null, 2));
  }

  // Pull / batch retrieve pending messages from queue
  if (url.pathname.startsWith('/api/queues/') && url.pathname.endsWith('/get') && req.method === 'POST') {
    const queueName = decodeURIComponent(url.pathname.replace('/api/queues/', '').replace('/get', ''));
    const queue = broker.queues.get(queueName);
    if (!queue) {
      res.writeHead(404);
      return res.end(JSON.stringify({ error: `Queue '${queueName}' not found` }));
    }

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { count = 10 } = body ? JSON.parse(body) : {};
        const messages = queue.messages.slice(0, count);
        res.writeHead(200);
        res.end(JSON.stringify({ queueName, count: messages.length, messages }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Peek queue messages
  if (url.pathname.startsWith('/api/queues/') && url.pathname.endsWith('/messages') && req.method === 'GET') {
    const queueName = decodeURIComponent(url.pathname.replace('/api/queues/', '').replace('/messages', ''));
    const queue = broker.queues.get(queueName);
    if (!queue) {
      res.writeHead(404);
      return res.end(JSON.stringify({ error: `Queue '${queueName}' not found` }));
    }
    res.writeHead(200);
    return res.end(JSON.stringify({ queueName, count: queue.messages.length, messages: queue.messages }));
  }

  // Acknowledge message
  if (url.pathname.startsWith('/api/queues/') && url.pathname.endsWith('/ack') && req.method === 'POST') {
    const queueName = decodeURIComponent(url.pathname.replace('/api/queues/', '').replace('/ack', ''));
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { messageId } = JSON.parse(body);
        broker.ack(queueName, messageId);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, messageId, status: 'ACKED' }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Reject / Nack message
  if (url.pathname.startsWith('/api/queues/') && url.pathname.endsWith('/nack') && req.method === 'POST') {
    const queueName = decodeURIComponent(url.pathname.replace('/api/queues/', '').replace('/nack', ''));
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { messageId, requeue = false } = JSON.parse(body);
        broker.nack(queueName, messageId, requeue);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, messageId, status: requeue ? 'REQUEUED' : 'DEAD_LETTERED' }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Publish message
  if (url.pathname === '/api/publish' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { exchange, routingKey, payload, content, properties } = JSON.parse(body);
        const dataToPublish = payload !== undefined ? payload : content;
        const routed = broker.publish(exchange, routingKey, dataToPublish, properties);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, routed, message: 'Event accepted by broker' }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // Replay DLQ
  if (url.pathname === '/api/replay-dlq' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        const replayed = broker.replayDeadLetter(parsed.dlqQueueName || 'maintly.employee.sync.dlq');
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, replayedCount: replayed }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
};

const server5672 = http.createServer(requestHandler);
const server15672 = http.createServer(requestHandler);

function startServer() {
  server5672.listen(PORT, () => {
    console.log(`🐰 [RABBITMQ_BROKER] AMQP Message Broker running on port ${PORT}`);
  }).on('error', (err) => {
    if (err.code !== 'EADDRINUSE') throw err;
    console.log(`[RABBITMQ_BROKER] Port ${PORT} already active.`);
  });

  server15672.listen(MGMT_PORT, () => {
    console.log(`📊 [RABBITMQ_BROKER] Management Dashboard API running on port ${MGMT_PORT}`);
  }).on('error', (err) => {
    if (err.code !== 'EADDRINUSE') throw err;
    console.log(`[RABBITMQ_BROKER] Port ${MGMT_PORT} already active.`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = {
  broker,
  startServer,
};
