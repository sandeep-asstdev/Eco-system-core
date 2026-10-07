const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/apiResponse');

const getAuditLogs = async (req, res) => {
  try {
    const { module, action, search, page = 1, limit = 50, tenantId: queryTenantId } = req.query;
    const { role, tenantId: userTenantId } = req.user;

    const where = {};

    if (role !== 'PLATFORM_ADMIN') {
      where.tenantId = userTenantId;
    } else if (queryTenantId) {
      where.tenantId = queryTenantId;
    }

    if (module) where.module = module;
    if (action) where.action = action;
    if (search) {
      where.OR = [
        { recordId: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { newValue: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { email: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
    ]);

    return successResponse(res, {
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    return errorResponse(res, 'Failed to fetch audit logs', 500);
  }
};

module.exports = {
  getAuditLogs,
};
