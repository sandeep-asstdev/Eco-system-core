const crypto = require('crypto');
const prisma = require('../config/db');

/**
 * Standardized transactional outbox service for HRFlow employee lifecycle events.
 */
class OutboxService {
  /**
   * Constructs the canonical ecosystem event payload.
   */
  static buildEventPayload({ eventType, employee, metadata = {} }) {
    const centralTenantId = employee.centralTenantId || employee.tenant?.centralTenantId || employee.tenantId || null;
    const centralBranchId = employee.centralBranchId || employee.branch?.centralBranchId || employee.branchId || null;
    const eventId = crypto.randomUUID();
    const occurredAt = new Date().toISOString();
    const correlationId = metadata.correlationId || crypto.randomUUID();

    const normalizedEventType = eventType.endsWith('.v1') ? eventType : `${eventType}.v1`;
    const displayName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.displayName || 'Employee';

    return {
      // Standard Event Envelope Specification
      eventId,
      eventType: normalizedEventType,
      eventVersion: 1,
      sourceApp: 'hrflow',
      tenantId: centralTenantId,
      firmId: employee.firmId || null,
      branchId: centralBranchId,
      occurredAt,
      correlationId,
      data: {
        employeeId: employee.id,
        employeeCode: employee.employeeCode,
        displayName,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone || null,
        departmentId: employee.departmentId || null,
        departmentName: employee.department || null,
        designationId: employee.designationId || null,
        designationName: employee.designation || null,
        employmentStatus: employee.status || 'ACTIVE',
        branchId: centralBranchId,
        metadata
      },
      // Backward compatibility aliases for existing consumers
      version: '1.0.0',
      timestamp: occurredAt,
      centralTenantId,
      centralBranchId,
      hrEmployeeId: employee.id,
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      fullName: displayName,
      email: employee.email,
      phone: employee.phone || null,
      department: employee.department || null,
      designation: employee.designation || null,
      status: employee.status || 'ACTIVE',
      metadata
    };
  }

  /**
   * Writes the outbox event in the same database transaction as the business operation.
   *
   * @param {object} tx - Prisma transaction client
   * @param {object} params
   * @param {string} params.eventType - 'employee.created' | 'employee.updated' | 'employee.transferred' | 'employee.deactivated' | 'employee.reactivated'
   * @param {object} params.employee - Complete employee record
   * @param {object} [params.metadata] - Optional metadata (e.g., previous branch/dept)
   */
  static async recordEvent(tx, { eventType, employee, metadata = {} }) {
    if (!tx || !tx.outboxEvent) {
      throw new Error('OutboxService.recordEvent requires an active Prisma transaction client');
    }

    // Resolve centralTenantId if not already present
    let centralTenantId = employee.centralTenantId || employee.tenant?.centralTenantId || null;
    if (!centralTenantId && employee.tenantId) {
      const tenant = await tx.tenant.findUnique({
        where: { id: employee.tenantId },
        select: { centralTenantId: true },
      });
      if (tenant?.centralTenantId) centralTenantId = tenant.centralTenantId;
    }

    // Resolve centralBranchId if not already present
    let centralBranchId = employee.centralBranchId || employee.branch?.centralBranchId || null;
    if (!centralBranchId && employee.branchId) {
      const branch = await tx.branch.findUnique({
        where: { id: employee.branchId },
        select: { centralBranchId: true },
      });
      if (branch?.centralBranchId) centralBranchId = branch.centralBranchId;
    }

    const enrichedEmployee = {
      ...employee,
      centralTenantId,
      centralBranchId,
    };

    const payload = this.buildEventPayload({ eventType, employee: enrichedEmployee, metadata });

    const outboxRecord = await tx.outboxEvent.create({
      data: {
        id: payload.eventId,
        tenantId: employee.tenantId,
        centralTenantId,
        eventType,
        aggregateType: 'EMPLOYEE',
        aggregateId: employee.id,
        version: '1.0.0',
        payload,
        status: 'PENDING',
        retryCount: 0,
        maxRetries: 5,
        nextRetryAt: new Date(),
      },
    });

    return outboxRecord;
  }

  /**
   * Fetches pending or retry-eligible outbox events.
   */
  static async getPendingEvents({ limit = 50 } = {}) {
    const now = new Date();
    return await prisma.outboxEvent.findMany({
      where: {
        OR: [
          { status: 'PENDING' },
          {
            status: 'FAILED',
            nextRetryAt: { lte: now },
            retryCount: { lt: 5 },
          },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: { tenant: { select: { id: true, code: true, centralTenantId: true } } },
    });
  }

  /**
   * Marks an outbox event as successfully published.
   */
  static async markPublished(id) {
    return await prisma.outboxEvent.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        errorReason: null,
      },
    });
  }

  /**
   * Records a publish failure with exponential backoff calculation.
   */
  static async markFailed(id, error) {
    const event = await prisma.outboxEvent.findUnique({ where: { id } });
    if (!event) return null;

    const nextRetryCount = event.retryCount + 1;
    const isDeadLetter = nextRetryCount >= event.maxRetries;

    // Exponential backoff: 2s, 4s, 8s, 16s, 32s (capped at 60s)
    const backoffSeconds = Math.min(Math.pow(2, nextRetryCount), 60);
    const nextRetryAt = new Date(Date.now() + backoffSeconds * 1000);

    return await prisma.outboxEvent.update({
      where: { id },
      data: {
        status: isDeadLetter ? 'DEAD_LETTER' : 'FAILED',
        retryCount: nextRetryCount,
        nextRetryAt: isDeadLetter ? null : nextRetryAt,
        errorReason: error ? (error.message || String(error)).substring(0, 500) : 'Publish error',
      },
    });
  }

  /**
   * Manually resets a failed or dead-letter event for immediate reprocessing.
   */
  static async retryEvent(id) {
    return await prisma.outboxEvent.update({
      where: { id },
      data: {
        status: 'PENDING',
        retryCount: 0,
        nextRetryAt: new Date(),
        errorReason: null,
      },
    });
  }

  /**
   * Manually resets all failed / dead-letter events.
   */
  static async retryAllFailed(tenantId = null) {
    const where = { status: { in: ['FAILED', 'DEAD_LETTER'] } };
    if (tenantId) where.tenantId = tenantId;

    const result = await prisma.outboxEvent.updateMany({
      where,
      data: {
        status: 'PENDING',
        retryCount: 0,
        nextRetryAt: new Date(),
        errorReason: null,
      },
    });

    return result.count;
  }

  /**
   * Returns aggregated outbox statistics for administrative monitoring.
   */
  static async getStats(tenantId = null) {
    const where = tenantId ? { tenantId } : {};

    const [total, pending, publishing, published, failed, deadLetter] = await Promise.all([
      prisma.outboxEvent.count({ where }),
      prisma.outboxEvent.count({ where: { ...where, status: 'PENDING' } }),
      prisma.outboxEvent.count({ where: { ...where, status: 'PUBLISHING' } }),
      prisma.outboxEvent.count({ where: { ...where, status: 'PUBLISHED' } }),
      prisma.outboxEvent.count({ where: { ...where, status: 'FAILED' } }),
      prisma.outboxEvent.count({ where: { ...where, status: 'DEAD_LETTER' } }),
    ]);

    return {
      total,
      pending,
      publishing,
      published,
      failed,
      deadLetter,
    };
  }
}

module.exports = OutboxService;
