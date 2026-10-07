const crypto = require('crypto');
const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/apiResponse');

/**
 * Generates canonical employee.created integration event payload according to ecosystem contract.
 */
function createEmployeeCreatedEvent(employee) {
  return {
    eventId: crypto.randomUUID(),
    version: '1.0.0',
    eventType: 'employee.created',
    centralTenantId: employee.centralTenantId || employee.tenant?.centralTenantId,
    hrEmployeeId: employee.id,
    centralUserId: employee.centralUserId || null,
    centralBranchId: employee.centralBranchId || employee.branch?.centralBranchId,
    employeeStatus: employee.status,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Versioned endpoint for MAINTLY to retrieve authorized employee references.
 * Filtered strictly by tenant boundary and optional branch parameters.
 */
const getIntegrationEmployees = async (req, res) => {
  try {
    const { branchId, centralBranchId, status, search } = req.query;
    const targetTenantId = req.tenantId;

    const where = {};

    // Enforce tenant boundary
    if (!req.isPlatformAdmin && targetTenantId) {
      where.tenantId = targetTenantId;
    }

    if (status) {
      where.status = status;
    } else {
      where.status = 'ACTIVE'; // default to active staff for maintenance ticketing
    }

    if (branchId) {
      where.branchId = branchId;
    }
    if (centralBranchId) {
      where.centralBranchId = centralBranchId;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        branch: { select: { id: true, code: true, name: true, centralBranchId: true } },
        tenant: { select: { id: true, code: true, centralTenantId: true } },
      },
      orderBy: { employeeCode: 'asc' },
    });

    const formatted = employees.map((emp) => ({
      id: emp.id,
      employeeCode: emp.employeeCode,
      firstName: emp.firstName,
      lastName: emp.lastName,
      fullName: `${emp.firstName} ${emp.lastName}`.trim(),
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      designation: emp.designation,
      status: emp.status,
      centralTenantId: emp.centralTenantId || emp.tenant?.centralTenantId,
      centralBranchId: emp.centralBranchId || emp.branch?.centralBranchId,
      centralUserId: emp.centralUserId || null,
      branch: {
        id: emp.branch.id,
        code: emp.branch.code,
        name: emp.branch.name,
        centralBranchId: emp.branch.centralBranchId,
      },
    }));

    return successResponse(res, formatted, 'Authorized employee references retrieved successfully');
  } catch (err) {
    console.error('Integration employees query error:', err);
    return errorResponse(res, 'Failed to retrieve employee references for maintenance integration', 500);
  }
};

/**
 * Retrieve single employee reference by ID for MAINTLY.
 */
const getIntegrationEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const targetTenantId = req.tenantId;

    const employee = await prisma.employee.findFirst({
      where: {
        OR: [
          { id },
          { centralUserId: id },
          { employeeCode: id },
        ],
      },
      include: {
        branch: { select: { id: true, code: true, name: true, centralBranchId: true } },
        tenant: { select: { id: true, code: true, centralTenantId: true } },
      },
    });

    if (!employee) {
      return errorResponse(res, 'Employee reference not found', 404);
    }

    // Tenant check
    if (!req.isPlatformAdmin && targetTenantId && employee.tenantId !== targetTenantId) {
      return errorResponse(res, 'Access denied: Cross-tenant reference forbidden', 403);
    }

    const formatted = {
      id: employee.id,
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      fullName: `${employee.firstName} ${employee.lastName}`.trim(),
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      designation: employee.designation,
      status: employee.status,
      centralTenantId: employee.centralTenantId || employee.tenant?.centralTenantId,
      centralBranchId: employee.centralBranchId || employee.branch?.centralBranchId,
      centralUserId: employee.centralUserId || null,
      branch: {
        id: employee.branch.id,
        code: employee.branch.code,
        name: employee.branch.name,
        centralBranchId: employee.branch.centralBranchId,
      },
    };

    return successResponse(res, formatted, 'Employee reference retrieved successfully');
  } catch (err) {
    console.error('Integration employee detail query error:', err);
    return errorResponse(res, 'Failed to retrieve employee reference detail', 500);
  }
};

const OutboxService = require('../../services/outboxService');
const outboxPublisher = require('../../services/outboxPublisher');
const { logAudit } = require('../../middleware/audit');

/**
 * Returns outbox event statistics across statuses.
 */
const getOutboxStatus = async (req, res) => {
  try {
    const tenantId = req.isPlatformAdmin ? (req.query.tenantId || req.tenantId) : req.tenantId;
    const stats = await OutboxService.getStats(tenantId);
    return successResponse(res, { stats, isPublisherActive: true }, 'Outbox status retrieved');
  } catch (err) {
    console.error('Error fetching outbox status:', err);
    return errorResponse(res, 'Failed to fetch outbox status', 500);
  }
};

/**
 * Returns paginated list of outbox events with status filter.
 */
const getOutboxEvents = async (req, res) => {
  try {
    const { status, eventType, page = 1, limit = 20 } = req.query;
    const tenantId = req.isPlatformAdmin ? (req.query.tenantId || req.tenantId) : req.tenantId;

    const where = {};
    if (tenantId) where.tenantId = tenantId;
    if (status) where.status = status;
    if (eventType) where.eventType = eventType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [total, events] = await Promise.all([
      prisma.outboxEvent.count({ where }),
      prisma.outboxEvent.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return successResponse(res, {
      events,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Error fetching outbox events:', err);
    return errorResponse(res, 'Failed to fetch outbox events', 500);
  }
};

/**
 * Manually retries a specific failed or dead-letter outbox event.
 */
const retryOutboxEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await prisma.outboxEvent.findUnique({ where: { id } });
    if (!event) {
      return errorResponse(res, 'Outbox event not found', 404);
    }

    if (!req.isPlatformAdmin && req.tenantId && event.tenantId !== req.tenantId) {
      return errorResponse(res, 'Access denied', 403);
    }

    const updated = await OutboxService.retryEvent(id);

    // Trigger immediate publisher pass
    setImmediate(() => outboxPublisher.publishPending().catch(() => {}));

    if (req.user && req.user.id) {
      await logAudit({
        tenantId: event.tenantId,
        userId: req.user.id,
        action: 'OUTBOX_EVENT_RETRY',
        module: 'INTEGRATION',
        recordId: id,
        newValue: `Retrying event ${event.eventType} (${event.id})`,
        ipAddress: req.ip,
      });
    }

    return successResponse(res, updated, 'Outbox event queued for retry');
  } catch (err) {
    console.error('Error retrying outbox event:', err);
    return errorResponse(res, 'Failed to retry outbox event', 500);
  }
};

/**
 * Retries all failed or dead-letter outbox events.
 */
const retryAllOutboxEvents = async (req, res) => {
  try {
    const tenantId = req.isPlatformAdmin ? (req.query.tenantId || req.tenantId) : req.tenantId;
    const count = await OutboxService.retryAllFailed(tenantId);

    // Trigger immediate publisher pass
    setImmediate(() => outboxPublisher.publishPending().catch(() => {}));

    if (req.user && req.user.id && tenantId) {
      await logAudit({
        tenantId,
        userId: req.user.id,
        action: 'OUTBOX_ALL_RETRY',
        module: 'INTEGRATION',
        newValue: `Retried ${count} failed outbox events`,
        ipAddress: req.ip,
      });
    }

    return successResponse(res, { retriedCount: count }, `Queued ${count} events for retry`);
  } catch (err) {
    console.error('Error retrying all outbox events:', err);
    return errorResponse(res, 'Failed to retry all outbox events', 500);
  }
};

module.exports = {
  createEmployeeCreatedEvent,
  getIntegrationEmployees,
  getIntegrationEmployeeById,
  getOutboxStatus,
  getOutboxEvents,
  retryOutboxEvent,
  retryAllOutboxEvents,
};
