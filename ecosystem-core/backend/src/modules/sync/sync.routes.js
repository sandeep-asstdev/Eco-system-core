import express from 'express';
import http from 'http';
import prisma from '../../config/db.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

const router = express.Router();
router.use(authenticate);

function httpJsonRequest(urlStr, method = 'GET', postData = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const options = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      timeout: 3000,
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => resolve({ error: err.message, status: 503 }));
    req.on('timeout', () => { req.destroy(); resolve({ error: 'Request timed out', status: 504 }); });

    if (postData) req.write(postData);
    req.end();
  });
}

/**
 * GET /api/v1/sync/overview
 * Comprehensive overview: HRFlow outbox, RabbitMQ broker queues, MAINTLY employee references.
 */
router.get('/overview', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN', 'BM'), async (req, res) => {
  try {
    const internalKey = process.env.INTERNAL_SERVICE_KEY || 'ecosystem-internal-service-sync-key';

    const [brokerRes, hrflowRes, maintlyRes, dlqRes, registeredApps, recentSyncLogs] = await Promise.all([
      httpJsonRequest('http://localhost:15672/api/overview'),
      httpJsonRequest('http://localhost:5000/api/v1/integrations/outbox/status', 'GET', null, {
        'X-Internal-Service-Key': internalKey,
      }),
      httpJsonRequest('http://localhost:15672/api/queues'),
      httpJsonRequest('http://localhost:15672/api/queues/maintly.employee.sync.dlq/messages'),
      prisma.application.findMany({
        select: {
          id: true,
          appKey: true,
          name: true,
          category: true,
          version: true,
          status: true,
          baseUrl: true,
          healthEndpoint: true,
          supportedEvents: true,
          settings: true,
        },
      }),
      prisma.auditLog.findMany({
        where: {
          action: { in: ['EMPLOYEE_SYNC_TRIGGERED', 'EMPLOYEE_INITIAL_SYNC', 'OUTBOX_RETRY_TRIGGERED', 'DLQ_REPLAY_TRIGGERED'] },
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Check live health of registered applications in parallel with short timeout
    const appHealthMap = {};
    await Promise.all(
      registeredApps.map(async (app) => {
        const healthUrl = app.baseUrl ? `${app.baseUrl.replace(/\/+$/, '')}${app.healthEndpoint || '/api/health'}` : null;
        if (!healthUrl) {
          appHealthMap[app.appKey] = { status: app.status === 'ACTIVE' ? 'HEALTHY' : 'SUSPENDED' };
          return;
        }
        try {
          const pingRes = await httpJsonRequest(healthUrl);
          appHealthMap[app.appKey] = {
            status: pingRes.status >= 200 && pingRes.status < 400 ? 'HEALTHY' : 'UNHEALTHY',
            statusCode: pingRes.status,
          };
        } catch {
          appHealthMap[app.appKey] = { status: 'OFFLINE' };
        }
      })
    );

    // Sanitize DLQ messages for security
    const rawDlqMessages = dlqRes.data?.messages || [];
    const sanitizedDlq = rawDlqMessages.map((m) => {
      const parsedContent = typeof m.content === 'string' ? JSON.parse(m.content) : (m.content || {});
      return {
        id: m.id,
        routingKey: m.routingKey,
        exchange: m.exchange,
        createdAt: m.createdAt,
        eventId: parsedContent.eventId,
        eventType: parsedContent.eventType,
        tenantId: parsedContent.tenantId || parsedContent.centralTenantId,
        sourceApp: parsedContent.sourceApp,
        error: m.properties?.deathReason || 'Dead-lettered from processing queue',
      };
    });

    const enrichedApps = registeredApps.map((app) => ({
      ...app,
      healthUrl: app.baseUrl ? `${app.baseUrl.replace(/\/+$/, '')}${app.healthEndpoint || '/api/health'}` : null,
      eventsPublished: app.supportedEvents || [],
      eventsSubscribed: app.settings?.subscribes || [],
      health: appHealthMap[app.appKey]?.status || 'UNKNOWN',
    }));

    return res.json({
      success: true,
      data: {
        broker: {
          status: brokerRes.status === 200 ? 'ONLINE' : 'OFFLINE',
          details: brokerRes.data?.metrics || null,
        },
        hrflowOutbox: {
          status: hrflowRes.status === 200 ? 'ONLINE' : 'OFFLINE',
          data: hrflowRes.data?.data || null,
        },
        queues: brokerRes.data?.metrics?.queues || {},
        dlqMessages: sanitizedDlq,
        dlqCount: sanitizedDlq.length,
        registeredApplications: enrichedApps,
        recentSyncLogs: recentSyncLogs.map(l => ({
          id: l.id,
          action: l.action,
          entity: l.entity,
          details: l.details,
          createdAt: l.createdAt,
        })),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Error fetching sync overview:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/sync/outbox/events
 * Lists HRFlow outbox events for monitoring.
 */
router.get('/outbox/events', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN'), async (req, res) => {
  try {
    const internalKey = process.env.INTERNAL_SERVICE_KEY || 'ecosystem-internal-service-sync-key';
    const query = new URLSearchParams(req.query).toString();
    const result = await httpJsonRequest(
      `http://localhost:5000/api/v1/integrations/outbox/events?${query}`,
      'GET',
      null,
      { 'X-Internal-Service-Key': internalKey }
    );

    return res.status(result.status || 200).json(result.data || { success: false });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/sync/initial-sync
 * Triggers initial employee synchronization.
 */
router.post('/initial-sync', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN'), async (req, res) => {
  try {
    const internalKey = process.env.INTERNAL_SERVICE_KEY || 'ecosystem-internal-service-sync-key';
    const result = await httpJsonRequest(
      'http://localhost:5002/api/integrations/sync-initial',
      'POST',
      JSON.stringify(req.body || {}),
      {
        'X-Internal-Service-Key': internalKey,
        'Authorization': req.headers.authorization || '',
      }
    );

    // Record central audit log
    if (req.user?.tenantId) {
      await prisma.auditLog.create({
        data: {
          tenantId: req.user.tenantId,
          userId: req.user.id,
          action: 'EMPLOYEE_SYNC_TRIGGERED',
          entity: 'EmployeeReference',
          entityId: 'ALL',
          details: result.data || {},
          ipAddress: req.ip,
        },
      });
    }

    return res.status(result.status || 200).json(result.data || { success: false });
  } catch (err) {
    console.error('Error triggering initial sync:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/sync/retry-failed
 * Retries all failed/dead-letter outbox events in HRFlow.
 */
router.post('/retry-failed', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN'), async (req, res) => {
  try {
    const internalKey = process.env.INTERNAL_SERVICE_KEY || 'ecosystem-internal-service-sync-key';
    const result = await httpJsonRequest(
      'http://localhost:5000/api/v1/integrations/outbox/retry-all',
      'POST',
      JSON.stringify(req.body || {}),
      { 'X-Internal-Service-Key': internalKey }
    );

    if (req.user?.tenantId) {
      await prisma.auditLog.create({
        data: {
          tenantId: req.user.tenantId,
          userId: req.user.id,
          action: 'OUTBOX_RETRY_TRIGGERED',
          entity: 'OutboxEvent',
          entityId: 'ALL_FAILED',
          details: result.data || {},
          ipAddress: req.ip,
        },
      });
    }

    return res.status(result.status || 200).json(result.data || { success: false });
  } catch (err) {
    console.error('Error retrying failed outbox events:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/sync/replay-dlq
 * Replays dead-letter messages from RabbitMQ DLQ.
 */
router.post('/replay-dlq', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN'), async (req, res) => {
  try {
    const result = await httpJsonRequest(
      'http://localhost:15672/api/replay-dlq',
      'POST',
      JSON.stringify({ dlqQueueName: 'maintly.employee.sync.dlq' })
    );

    if (req.user?.tenantId) {
      await prisma.auditLog.create({
        data: {
          tenantId: req.user.tenantId,
          userId: req.user.id,
          action: 'DLQ_REPLAY_TRIGGERED',
          entity: 'DeadLetterQueue',
          entityId: 'maintly.employee.sync.dlq',
          details: result.data || {},
          ipAddress: req.ip,
        },
      });
    }

    return res.status(result.status || 200).json(result.data || { success: false });
  } catch (err) {
    console.error('Error replaying DLQ:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/sync/outbox/retry/:id
 * Retries a specific failed outbox event by ID.
 */
router.post('/outbox/retry/:id', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN'), async (req, res) => {
  try {
    const internalKey = process.env.INTERNAL_SERVICE_KEY || 'ecosystem-internal-service-sync-key';
    const { id } = req.params;
    const result = await httpJsonRequest(
      `http://localhost:5000/api/v1/integrations/outbox/retry/${id}`,
      'POST',
      JSON.stringify(req.body || {}),
      { 'X-Internal-Service-Key': internalKey }
    );

    if (req.user?.tenantId) {
      await prisma.auditLog.create({
        data: {
          tenantId: req.user.tenantId,
          userId: req.user.id,
          action: 'OUTBOX_SINGLE_RETRY_TRIGGERED',
          entity: 'OutboxEvent',
          entityId: id,
          details: result.data || {},
          ipAddress: req.ip,
        },
      });
    }

    return res.status(result.status || 200).json(result.data || { success: false });
  } catch (err) {
    console.error(`Error retrying outbox event ${req.params.id}:`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

