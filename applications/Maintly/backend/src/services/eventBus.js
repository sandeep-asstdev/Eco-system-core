import http from 'http';
import { ENV } from '../config/env.js';

let amqp = null;
try {
  const amqpModule = await import('amqplib');
  amqp = amqpModule.default || amqpModule;
} catch (e) {
  // amqplib optional / fallback
}

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const BROKER_HTTP_PORT = parseInt(process.env.RABBITMQ_PORT || '5672', 10);
const BROKER_HTTP_HOST = process.env.RABBITMQ_HOST || 'localhost';

class MaintlyEventBus {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.isNativeConnected = false;
    this.sseRequest = null;
    this.isSubscribed = false;
    this.pollInterval = null;
  }

  async initNative() {
    if (!amqp) return false;
    try {
      this.connection = await amqp.connect(RABBITMQ_URL, { timeout: 1500 });
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue('maintly.employee.sync', {
        durable: true,
        deadLetterExchange: 'automobile.events.dlx',
        deadLetterRoutingKey: 'maintly.employee.sync.dlq',
      });
      this.isNativeConnected = true;
      console.log('🐰 [MAINTLY_EVENT_BUS] Connected natively to RabbitMQ AMQP server');

      this.connection.on('error', () => {
        this.isNativeConnected = false;
      });
      this.connection.on('close', () => {
        this.isNativeConnected = false;
      });
      return true;
    } catch (err) {
      this.isNativeConnected = false;
      return false;
    }
  }

  async subscribe(queueName, handler) {
    if (this.isSubscribed) return;
    this.isSubscribed = true;

    // Try native AMQP first
    const nativeOk = await this.initNative();
    if (nativeOk && this.channel) {
      try {
        await this.channel.consume(queueName, async (msg) => {
          if (!msg) return;
          try {
            const content = JSON.parse(msg.content.toString());
            await handler({
              id: msg.properties.messageId || msg.fields.deliveryTag,
              content,
              properties: msg.properties,
              fields: msg.fields,
              ack: () => this.channel.ack(msg),
              nack: (requeue = false) => this.channel.nack(msg, false, requeue),
            });
          } catch (e) {
            console.error('[MAINTLY_EVENT_BUS] Error processing native AMQP message:', e);
            this.channel.nack(msg, false, false);
          }
        });
        return;
      } catch (err) {
        console.warn('[MAINTLY_EVENT_BUS] Native AMQP consume failed, falling back to HTTP broker:', err.message);
        this.isNativeConnected = false;
      }
    }

    // Fallback: Real-time SSE stream with polling backup from Ecosystem Broker
    this.startHttpSubscription(queueName, handler);
  }

  startHttpSubscription(queueName, handler) {
    console.log(`📡 [MAINTLY_EVENT_BUS] Connecting to Ecosystem Broker at http://${BROKER_HTTP_HOST}:${BROKER_HTTP_PORT}...`);

    const connectSSE = () => {
      const options = {
        hostname: BROKER_HTTP_HOST,
        port: BROKER_HTTP_PORT,
        path: `/api/subscribe?queue=${encodeURIComponent(queueName)}`,
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      };

      const req = http.request(options, (res) => {
        let buffer = '';

        res.on('data', (chunk) => {
          buffer += chunk.toString();
          const lines = buffer.split('\n\n');
          buffer = lines.pop(); // keep remainder

          for (const line of lines) {
            const dataMatch = line.match(/^data:\s*(.+)$/m);
            if (dataMatch) {
              try {
                const message = JSON.parse(dataMatch[1]);
                this.dispatchHttpDelivery(queueName, message, handler);
              } catch (e) {
                // ignore keepalive comments or malformed lines
              }
            }
          }
        });

        res.on('end', () => {
          // Reconnect on disconnect after 3s
          setTimeout(connectSSE, 3000);
        });
      });

      req.on('error', () => {
        // Retry connection after 3s
        setTimeout(connectSSE, 3000);
      });

      req.end();
      this.sseRequest = req;
    };

    connectSSE();

    // Also poll every 3 seconds as a resilient backup for any backlog
    this.pollInterval = setInterval(async () => {
      try {
        await this.pollPendingMessages(queueName, handler);
      } catch (e) {
        // ignore poll errors
      }
    }, 3000);
  }

  async dispatchHttpDelivery(queueName, message, handler) {
    if (!message || !message.id) return;
    try {
      await handler({
        id: message.id,
        content: message.content,
        properties: message.properties || {},
        fields: {
          routingKey: message.routingKey,
          exchange: message.exchange,
        },
        ack: () => this.ackHttp(queueName, message.id),
        nack: (requeue = false) => this.nackHttp(queueName, message.id, requeue),
      });
    } catch (err) {
      console.error(`[MAINTLY_EVENT_BUS] Consumer error for message ${message.id}:`, err);
      this.nackHttp(queueName, message.id, false);
    }
  }

  async pollPendingMessages(queueName, handler) {
    return new Promise((resolve) => {
      const postData = JSON.stringify({ count: 10 });
      const req = http.request(
        {
          hostname: BROKER_HTTP_HOST,
          port: BROKER_HTTP_PORT,
          path: `/api/queues/${encodeURIComponent(queueName)}/get`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
          },
          timeout: 2000,
        },
        (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', async () => {
            if (res.statusCode === 200) {
              try {
                const { messages } = JSON.parse(body);
                if (Array.isArray(messages)) {
                  for (const msg of messages) {
                    await this.dispatchHttpDelivery(queueName, msg, handler);
                  }
                }
              } catch (e) {}
            }
            resolve();
          });
        }
      );

      req.on('error', () => resolve());
      req.on('timeout', () => {
        req.destroy();
        resolve();
      });
      req.write(postData);
      req.end();
    });
  }

  ackHttp(queueName, messageId) {
    const postData = JSON.stringify({ messageId });
    const req = http.request({
      hostname: BROKER_HTTP_HOST,
      port: BROKER_HTTP_PORT,
      path: `/api/queues/${encodeURIComponent(queueName)}/ack`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    });
    req.on('error', () => {});
    req.write(postData);
    req.end();
  }

  nackHttp(queueName, messageId, requeue = false) {
    const postData = JSON.stringify({ messageId, requeue });
    const req = http.request({
      hostname: BROKER_HTTP_HOST,
      port: BROKER_HTTP_PORT,
      path: `/api/queues/${encodeURIComponent(queueName)}/nack`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    });
    req.on('error', () => {});
    req.write(postData);
    req.end();
  }

  async close() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.sseRequest) this.sseRequest.destroy();
    if (this.channel) await this.channel.close().catch(() => {});
    if (this.connection) await this.connection.close().catch(() => {});
  }
}

export const maintlyEventBus = new MaintlyEventBus();
export default maintlyEventBus;
