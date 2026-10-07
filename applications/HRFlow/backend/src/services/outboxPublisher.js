const prisma = require('../config/db');
const OutboxService = require('./outboxService');
const eventBus = require('./eventBus');

/**
 * Background outbox publisher service for HRFlow.
 * Implements reliable asynchronous delivery with exponential backoff, retries,
 * and dead-letter handling.
 */
class OutboxPublisher {
  constructor() {
    this.timer = null;
    this.isProcessing = false;
    this.intervalMs = 2000;
  }

  /**
   * Starts the background outbox publisher loop.
   */
  start(intervalMs = 2000) {
    if (this.timer) return;
    this.intervalMs = intervalMs;
    console.log(`📤 [OUTBOX_PUBLISHER] Background publisher started (interval: ${this.intervalMs}ms)`);
    this.timer = setInterval(() => {
      this.publishPending().catch((err) => {
        console.error('[OUTBOX_PUBLISHER] Error in background publish cycle:', err.message);
      });
    }, this.intervalMs);

    // Initial immediate tick
    setImmediate(() => this.publishPending().catch(() => {}));
  }

  /**
   * Stops the background publisher loop.
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('📤 [OUTBOX_PUBLISHER] Background publisher stopped');
    }
  }

  /**
   * Processes a batch of pending or failed outbox events.
   */
  async publishPending({ limit = 25 } = {}) {
    if (this.isProcessing) return { processed: 0, published: 0, failed: 0 };
    this.isProcessing = true;

    let publishedCount = 0;
    let failedCount = 0;

    try {
      const pendingEvents = await OutboxService.getPendingEvents({ limit });
      if (!pendingEvents || pendingEvents.length === 0) {
        this.isProcessing = false;
        return { processed: 0, published: 0, failed: 0 };
      }

      for (const event of pendingEvents) {
        try {
          // 1. Mark as PUBLISHING to avoid race conditions
          await prisma.outboxEvent.update({
            where: { id: event.id },
            data: { status: 'PUBLISHING' },
          });

          // 2. Build routing keys
          const tenantCode = event.tenant?.code ? event.tenant.code.toLowerCase() : 'all';
          const versionedRoutingKey = event.eventType.endsWith('.v1') ? event.eventType : `${event.eventType}.v1`;
          const tenantRoutingKey = `employee.${tenantCode}.${event.eventType}`;

          // 3. Publish to topic exchange with canonical versioned key
          await eventBus.publish(
            'automobile.events.topic',
            versionedRoutingKey,
            event.payload,
            {
              messageId: event.id,
              type: versionedRoutingKey,
              timestamp: new Date(event.createdAt).getTime(),
              headers: {
                centralTenantId: event.centralTenantId,
                aggregateType: event.aggregateType,
                aggregateId: event.aggregateId,
                version: event.version,
              },
            }
          );

          // 4. Mark PUBLISHED
          await OutboxService.markPublished(event.id);
          publishedCount++;
        } catch (err) {
          console.error(`[OUTBOX_PUBLISHER] Failed to publish event '${event.id}' (${event.eventType}):`, err.message);
          await OutboxService.markFailed(event.id, err);
          failedCount++;
        }
      }
    } catch (err) {
      console.error('[OUTBOX_PUBLISHER] Error querying pending outbox events:', err.message);
    } finally {
      this.isProcessing = false;
    }

    return {
      processed: publishedCount + failedCount,
      published: publishedCount,
      failed: failedCount,
    };
  }
}

const outboxPublisher = new OutboxPublisher();

module.exports = outboxPublisher;
