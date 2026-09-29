import amqp from 'amqplib';
import http from 'http';
import { EventEmitter } from 'events';

export class EcosystemEventBus extends EventEmitter {
  constructor(config = {}) {
    super();
    this.brokerUrl = config.brokerUrl || process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    this.httpBrokerUrl = config.httpBrokerUrl || process.env.BROKER_HTTP_URL || 'http://localhost:5672';
    this.exchange = config.exchange || 'automobile.events.topic';
    this.dlxExchange = config.dlxExchange || 'automobile.events.dlx';
    this.serviceName = config.serviceName || 'ecosystem-service';
    this.logger = config.logger || console;

    this.connection = null;
    this.channel = null;
    this.isConnected = false;
    this.isAmqpSupported = true;
    this.subscribers = new Map();
  }

  async connect() {
    try {
      this.connection = await amqp.connect(this.brokerUrl);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
      await this.channel.assertExchange(this.dlxExchange, 'direct', { durable: true });

      this.isConnected = true;
      this.logger.log(`📡 [${this.serviceName}] Connected to Ecosystem Event Broker via AMQP.`);

      this.connection.on('error', (err) => {
        this.logger.error(`[${this.serviceName}] Event bus connection error:`, err.message);
        this.isConnected = false;
      });

      this.connection.on('close', () => {
        this.logger.warn(`[${this.serviceName}] Event bus connection closed.`);
        this.isConnected = false;
      });

      return true;
    } catch (err) {
      this.logger.warn(`[${this.serviceName}] AMQP connection failed (${err.message}). Using HTTP fallback mode.`);
      this.isAmqpSupported = false;
      this.isConnected = true;
      return false;
    }
  }

  async publishEvent(eventType, data, options = {}) {
    const eventId = options.eventId || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const tenantId = options.tenantId || options.centralTenantId || data?.tenantId || data?.centralTenantId || null;
    const branchId = options.branchId || options.centralBranchId || data?.branchId || data?.centralBranchId || null;
    const occurredAt = options.occurredAt || new Date().toISOString();
    const correlationId = options.correlationId || `corr-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const envelope = {
      eventId,
      eventType,
      eventVersion: options.eventVersion || 1,
      sourceApp: this.serviceName,
      tenantId,
      firmId: options.firmId || data?.firmId || null,
      branchId,
      occurredAt,
      correlationId,
      data,
      // Compatibility aliases
      version: options.version || '1.0.0',
      producer: this.serviceName,
      timestamp: occurredAt,
      centralTenantId: tenantId,
      centralBranchId: branchId,
      metadata: {
        correlationId,
        causationId: options.causationId || null,
        schemaVersion: options.schemaVersion || '1.0',
        ...options.metadata
      }
    };

    if (this.channel && this.isAmqpSupported) {
      const routingKey = eventType;
      const buffer = Buffer.from(JSON.stringify(envelope));
      this.channel.publish(this.exchange, routingKey, buffer, {
        persistent: true,
        contentType: 'application/json',
        messageId: envelope.eventId,
        timestamp: Date.now()
      });
      return envelope;
    } else {
      // HTTP fallback publish to broker
      return await this._publishHttp(eventType, envelope);
    }
  }

  async _publishHttp(eventType, envelope) {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.httpBrokerUrl}/api/publish`);
      const postData = JSON.stringify({
        exchange: this.exchange,
        routingKey: eventType,
        message: envelope
      });

      const req = http.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(envelope);
          } else {
            reject(new Error(`HTTP publish failed with status ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  /**
   * Subscribes to a queue and routing key pattern with automatic dead-letter routing and idempotency.
   */
  async subscribe(queueName, routingKey, handler, options = {}) {
    const {
      dlqQueue = `${queueName}.dlq`,
      idempotencyCheck = null, // async (eventId) => boolean
      markProcessed = null     // async (eventId, eventType) => void
    } = options;

    if (this.channel && this.isAmqpSupported) {
      // Declare DLQ and bind to DLX
      await this.channel.assertQueue(dlqQueue, { durable: true });
      await this.channel.bindQueue(dlqQueue, this.dlxExchange, `dlq.${queueName}`);

      // Declare primary queue with DLX dead-lettering
      await this.channel.assertQueue(queueName, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': this.dlxExchange,
          'x-dead-letter-routing-key': `dlq.${queueName}`
        }
      });

      await this.channel.bindQueue(queueName, this.exchange, routingKey);

      this.channel.consume(queueName, async (msg) => {
        if (!msg) return;
        try {
          const payload = JSON.parse(msg.content.toString());
          const eventId = payload.eventId || msg.properties.messageId;

          // Idempotency check
          if (idempotencyCheck && eventId) {
            const alreadyProcessed = await idempotencyCheck(eventId);
            if (alreadyProcessed) {
              this.logger.log(`[${this.serviceName}] Duplicate event '${eventId}' acknowledged idempotently.`);
              this.channel.ack(msg);
              return;
            }
          }

          // Execute consumer handler
          await handler(payload, msg);

          // Mark processed
          if (markProcessed && eventId) {
            await markProcessed(eventId, payload.eventType || routingKey);
          }

          this.channel.ack(msg);
        } catch (err) {
          this.logger.error(`[${this.serviceName}] Error processing message:`, err.message);
          // Reject with requeue=false to forward to DLQ
          this.channel.reject(msg, false);
        }
      });

      this.logger.log(`📥 [${this.serviceName}] Subscribed to queue '${queueName}' with pattern '${routingKey}'.`);
    } else {
      // Fallback polling for HTTP broker mode
      this.logger.log(`📥 [${this.serviceName}] Fallback polling active for queue '${queueName}'.`);
      try {
        await fetch(`${this.httpBrokerUrl}/api/queues/declare`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ queueName, options: { durable: true } })
        });
        await fetch(`${this.httpBrokerUrl}/api/bindings/declare`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ queueName, exchange: this.exchange, pattern: routingKey })
        });
      } catch (e) {
        this.logger.warn(`[${this.serviceName}] Warning auto-declaring HTTP fallback queue:`, e.message);
      }
      this._startHttpPolling(queueName, handler, options);
    }
  }

  _startHttpPolling(queueName, handler, options) {
    const poll = async () => {
      try {
        const res = await fetch(`${this.httpBrokerUrl}/api/consume?queue=${queueName}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.message) {
            const payload = data.message;
            const eventId = payload.eventId;
            if (options.idempotencyCheck && eventId) {
              const done = await options.idempotencyCheck(eventId);
              if (done) return;
            }
            await handler(payload);
            if (options.markProcessed && eventId) {
              await options.markProcessed(eventId, payload.eventType);
            }
          }
        }
      } catch (_) {}
      setTimeout(poll, 400);
    };
    poll();
  }
}

export function createEventBus(config) {
  return new EcosystemEventBus(config);
}
