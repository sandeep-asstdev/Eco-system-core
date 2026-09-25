import prisma from '../../config/db.js';

/**
 * Retrieves audit logs with multi-tenant scoping and pagination.
 */
export async function getAuditLogs(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const where = {};

    // Multi-tenant scoping: platform admins can query all or specific tenants, regular users are bound to their tenant
    if (req.isPlatformAdmin) {
      if (req.query.tenantId) {
        where.tenantId = req.query.tenantId;
      }
    } else {
      if (!req.tenantId) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Tenant context is required to query audit logs.' }
        });
      }
      where.tenantId = req.tenantId;
    }

    if (req.query.action) {
      where.action = { contains: req.query.action, mode: 'insensitive' };
    }

    if (req.query.entityType) {
      where.entityType = { equals: req.query.entityType, mode: 'insensitive' };
    }

    if (req.query.userId) {
      where.userId = req.query.userId;
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Creates an immutable audit log entry.
 */
export async function createAuditLog(req, res, next) {
  try {
    const { action, entityType, entityId, oldValue, newValue } = req.body;

    if (!action || !entityType) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'action and entityType are required.' }
      });
    }

    const tenantId = req.tenantId || req.body.tenantId;
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'tenantId is required.' }
      });
    }

    const log = await prisma.auditLog.create({
      data: {
        tenantId,
        userId: req.userId || req.body.userId || null,
        action,
        entityType,
        entityId: entityId ? String(entityId) : null,
        oldValue: oldValue || null,
        newValue: newValue || null,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
        userAgent: req.headers['user-agent'] || null
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: log
    });
  } catch (error) {
    next(error);
  }
}
