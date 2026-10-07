const http = require('http');

let amqp = null;
try {
  amqp = require('amqplib');
} catch (e) {
  // amqplib not installed or optional
}

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const BROKER_HTTP_PORT = parseInt(process.env.RABBITMQ_PORT || '5672', 10);
const BROKER_HTTP_HOST = process.env.RABBITMQ_HOST || 'localhost';

class EventBus {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.isNativeConnected = false;
    this.connectionAttempted = false;
  }

  async initNative() {
    if (this.connectionAttempted) return this.isNativeConnected;
    this.connectionAttempted = true;

    if (!amqp) return false;

    try {
      this.connection = await amqp.connect(RABBITMQ_URL, { timeout: 1500 });
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange('automobile.events.topic', 'topic', { durable: true });
      this.isNativeConnected = true;
      console.log('🐰 [EVENT_BUS] Connected natively to RabbitMQ AMQP server');

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

  async publish(exchange, routingKey, payload, properties = {}) {
    // Attempt native AMQP first
    if (!this.connectionAttempted) {
      await this.initNative();
    }

    if (this.isNativeConnected && this.channel) {
      try {
        const buffer = Buffer.from(JSON.stringify(payload));
        const ok = this.channel.publish(exchange, routingKey, buffer, {
          persistent: true,
          contentType: 'application/json',
          ...properties,
        });
        return { success: ok, mode: 'amqp' };
      } catch (err) {
        console.warn('[EVENT_BUS] Native AMQP publish failed, falling back to HTTP broker:', err.message);
        this.isNativeConnected = false;
      }
    }

    // Fallback: Publish via Ecosystem Broker HTTP Endpoint
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        exchange,
        routingKey,
        payload,
        properties: {
          timestamp: Date.now(),
          persistent: true,
          ...properties,
        },
      });

      const options = {
        hostname: BROKER_HTTP_HOST,
        port: BROKER_HTTP_PORT,
        path: '/api/publish',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
        timeout: 4000,
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed = JSON.parse(body);
              resolve({ success: true, mode: 'http-broker', ...parsed });
            } catch (e) {
              resolve({ success: true, mode: 'http-broker' });
            }
          } else {
            reject(new Error(`Broker rejected publish with HTTP ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('error', (err) => {
        reject(new Error(`Failed to connect to message broker on ${BROKER_HTTP_HOST}:${BROKER_HTTP_PORT} (${err.message})`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Broker publish request timed out'));
      });

      req.write(postData);
      req.end();
    });
  }

  async close() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
    } catch (e) {
      // ignore close errors
    }
  }
}

module.exports = new EventBus();
