import express from 'express';
import http from 'http';
import prisma from '../../config/db.js';
import initialSyncService from '../../services/initialSync.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);

/**
 * Returns overall synchronization status, employee reference counts,
 * processed event statistics, and broker queue metrics.
 */
router.get('/sync-status', requireRole(['ADMIN', 'TENANT_ADMIN', 'PLATFORM_ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const tenantId = req.user.role === 'PLATFORM_ADMIN' ? (req.query.tenantId || req.user.tenantId) : req.user.tenantId;
    const where = tenantId ? { tenantId } : {};

    const [totalEmployees, activeEmployees, inactiveEmployees, totalEvents, processedEvents] = await Promise.all([
      prisma.employeeReference.count({ where }),
      prisma.employeeReference.count({ where: { ...where, status: 'ACTIVE' } }),
      prisma.employeeReference.count({ where: { ...where, status: { not: 'ACTIVE' } } }),
      prisma.processedEvent.count(),
      prisma.processedEvent.findMany({
        take: 10,
        orderBy: { processedAt: 'desc' },
      }),
    ]);

    // Query broker overview
    let brokerMetrics = null;
    try {
      brokerMetrics = await new Promise((resolve) => {
        const r = http.get('http://localhost:15672/api/overview', { timeout: 1500 }, (resp) => {
          let data = '';
          resp.on('data', chunk => data += chunk);
          resp.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch {
              resolve(null);
            }
          });
        });
        r.on('error', () => resolve(null));
        r.on('timeout', () => { r.destroy(); resolve(null); });
      });
    } catch {
      brokerMetrics = null;
    }

    return res.json({
      success: true,
      data: {
        employeeReferences: {
          total: totalEmployees,
          active: activeEmployees,
          inactive: inactiveEmployees,
        },
        processedEvents: {
          total: totalEvents,
          recent: processedEvents,
        },
        broker: brokerMetrics?.metrics || { status: 'offline' },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Error fetching sync status in Maintly:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Triggers initial or on-demand synchronization with HRFlow.
 */
router.post('/sync-initial', requireRole(['ADMIN', 'TENANT_ADMIN', 'PLATFORM_ADMIN']), async (req, res) => {
  try {
    const { dryRun = false } = req.body;
    const tenantId = req.user.role === 'PLATFORM_ADMIN' ? (req.body.tenantId || null) : req.user.tenantId;

    const report = await initialSyncService.runSync({ tenantId, dryRun });

    // Record audit log
    if (req.user.tenantId) {
      await prisma.auditLog.create({
        data: {
          tenantId: req.user.tenantId,
          userId: req.user.id,
          action: 'EMPLOYEE_INITIAL_SYNC',
          entity: 'EmployeeReference',
          details: report.reconciliation,
        },
      });
    }

    return res.json({
      success: true,
      message: 'Initial synchronization completed successfully',
      data: report,
    });
  } catch (err) {
    console.error('Initial sync error in Maintly:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Replays dead-letter queue messages for safe recovery.
 */
router.post('/replay-dlq', requireRole(['ADMIN', 'TENANT_ADMIN', 'PLATFORM_ADMIN']), async (req, res) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const postData = JSON.stringify({ dlqQueueName: 'maintly.employee.sync.dlq' });
      const reqPost = http.request({
        hostname: 'localhost',
        port: 15672,
        path: '/api/replay-dlq',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
        timeout: 3000,
      }, (resp) => {
        let body = '';
        resp.on('data', chunk => body += chunk);
        resp.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve({ success: true, replayedCount: 0 });
          }
        });
      });
      reqPost.on('error', (e) => reject(e));
      reqPost.on('timeout', () => { reqPost.destroy(); reject(new Error('DLQ replay timed out')); });
      reqPost.write(postData);
      reqPost.end();
    });

    if (req.user.tenantId) {
      await prisma.auditLog.create({
        data: {
          tenantId: req.user.tenantId,
          userId: req.user.id,
          action: 'DLQ_MESSAGES_REPLAYED',
          entity: 'ProcessedEvent',
          details: result,
        },
      });
    }

    return res.json({
      success: true,
      message: `Replayed ${result.replayedCount || 0} messages from Dead Letter Queue`,
      data: result,
    });
  } catch (err) {
    console.error('DLQ replay error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Lists synchronized EmployeeReference records with tenant isolation.
 */
router.get('/employees', async (req, res) => {
  try {
    const { branchId, status, search, page = 1, limit = 50 } = req.query;
    const tenantId = req.user.role === 'PLATFORM_ADMIN' ? (req.query.tenantId || req.user.tenantId) : req.user.tenantId;

    const where = {};
    if (tenantId) where.tenantId = tenantId;
    if (branchId) where.branchId = branchId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [total, employees] = await Promise.all([
      prisma.employeeReference.count({ where }),
      prisma.employeeReference.findMany({
        where,
        include: {
          branch: { select: { id: true, code: true, name: true, city: true } },
        },
        skip,
        take: parseInt(limit),
        orderBy: { employeeCode: 'asc' },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        employees,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (err) {
    console.error('Error fetching employee references in Maintly:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
