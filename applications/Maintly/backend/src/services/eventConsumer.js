import prisma from '../config/db.js';
import maintlyEventBus from './eventBus.js';

/**
 * Enterprise Event Consumer for MAINTLY.
 * Synchronizes employee lifecycle events from HRFlow into EmployeeReference
 * with idempotency, tenant isolation, branch mapping, and historical data preservation.
 */
class EventConsumer {
  constructor() {
    this.isRunning = false;
    this.queueName = 'maintly.employee.sync';
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`📥 [MAINTLY_CONSUMER] Starting employee synchronization event consumer on queue '${this.queueName}'`);

    maintlyEventBus.subscribe(this.queueName, async (msg) => {
      await this.handleMessage(msg);
    });
  }

  async handleMessage(msg) {
    const rawContent = msg.content;
    const event = typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent;

    if (!event || !event.eventId) {
      console.warn('[MAINTLY_CONSUMER] Received invalid message without eventId. ACKing to discard.');
      msg.ack();
      return;
    }

    const payload = event.data || {};
    const eventId = event.eventId || msg.id;
    const rawEventType = event.eventType || '';
    const baseEventType = rawEventType.replace(/\.v\d+$/, '');
    const centralTenantId = event.centralTenantId || event.tenantId || payload.centralTenantId || payload.tenantId;
    const hrEmployeeId = event.hrEmployeeId || payload.employeeId || payload.hrEmployeeId || payload.id;
    const centralBranchId = event.centralBranchId || event.branchId || payload.centralBranchId || payload.branchId;

    try {
      // 1. Idempotency Check: Prevent duplicate processing on event replay
      const alreadyProcessed = await prisma.processedEvent.findUnique({
        where: { eventId },
      });

      if (alreadyProcessed) {
        console.log(`[MAINTLY_CONSUMER] Event '${eventId}' (${rawEventType}) already processed. Skipping duplicate (Idempotent).`);
        msg.ack();
        return;
      }

      // 2. Strict Tenant Isolation Boundary
      if (!centralTenantId) {
        console.warn(`[MAINTLY_CONSUMER] Event '${eventId}' missing centralTenantId. Skipping.`);
        await this.recordProcessed(eventId, rawEventType, hrEmployeeId, centralTenantId, 'FAILED_MISSING_TENANT');
        msg.ack();
        return;
      }

      const tenant = await prisma.tenant.findFirst({
        where: {
          OR: [
            { centralTenantId },
            { id: centralTenantId },
          ],
        },
      });

      if (!tenant) {
        console.warn(`[MAINTLY_CONSUMER] Tenant with centralTenantId '${centralTenantId}' not found in MAINTLY. Skipping to maintain tenant isolation.`);
        await this.recordProcessed(eventId, rawEventType, hrEmployeeId, centralTenantId, 'TENANT_NOT_FOUND');
        msg.ack();
        return;
      }

      // 3. Resolve Branch within the identified tenant boundary
      let resolvedBranchId = null;
      if (centralBranchId) {
        const branch = await prisma.branch.findFirst({
          where: {
            centralBranchId,
            tenantId: tenant.id,
          },
        });
        if (branch) {
          resolvedBranchId = branch.id;
        }
      }

      // 4. Process event based on eventType
      await this.processEventAction({
        eventType: baseEventType,
        rawEventType,
        event,
        tenantId: tenant.id,
        resolvedBranchId,
      });

      // 5. Record ProcessedEvent for Idempotency and Audit
      await this.recordProcessed(eventId, rawEventType, hrEmployeeId, centralTenantId, 'COMPLETED');

      // 6. Acknowledge successful processing to message broker
      msg.ack();
      console.log(`✔ [MAINTLY_CONSUMER] Successfully synchronized event '${eventId}' (${rawEventType}) for HR employee '${hrEmployeeId}'`);
    } catch (err) {
      console.error(`❌ [MAINTLY_CONSUMER] Error processing event '${eventId}':`, err);
      // NACK message for exponential backoff / dead-lettering
      msg.nack(false);
    }
  }

  async processEventAction({ eventType, rawEventType, event, tenantId, resolvedBranchId }) {
    const payload = event.data || {};
    const hrEmployeeId = event.hrEmployeeId || payload.employeeId || payload.hrEmployeeId || payload.id;
    const centralTenantId = event.centralTenantId || event.tenantId || payload.centralTenantId || payload.tenantId;
    const centralUserId = event.centralUserId || payload.centralUserId || payload.userId;
    const centralBranchId = event.centralBranchId || event.branchId || payload.centralBranchId || payload.branchId;
    const employeeCode = event.employeeCode || payload.employeeCode;
    const firstName = event.firstName !== undefined ? event.firstName : (payload.firstName || (payload.displayName ? payload.displayName.split(' ')[0] : ''));
    const lastName = event.lastName !== undefined ? event.lastName : (payload.lastName || (payload.displayName ? payload.displayName.split(' ').slice(1).join(' ') : ''));
    const email = event.email || payload.email;
    const phone = event.phone !== undefined ? event.phone : payload.phone;
    const department = event.department !== undefined ? event.department : (payload.department || payload.departmentId || null);
    const designation = event.designation !== undefined ? event.designation : (payload.designation || payload.designationId || null);
    const rawStatus = event.status || payload.employmentStatus || payload.status || 'ACTIVE';
    const status = (rawStatus === 'ACTIVE' || rawStatus === 'PROBATION' || rawStatus === 'CONFIRMED') ? 'ACTIVE' : (rawStatus === 'INACTIVE' || rawStatus === 'EXITED' || rawStatus === 'TERMINATED' || rawStatus === 'SUSPENDED') ? 'INACTIVE' : rawStatus;
    const timestamp = event.timestamp || event.occurredAt || payload.timestamp;

    const normalizedEmail = (email || '').toLowerCase().trim();

    // Check for existing EmployeeReference by hrEmployeeId or email within tenant
    const existing = await prisma.employeeReference.findFirst({
      where: {
        tenantId,
        OR: [
          { hrEmployeeId },
          { email: normalizedEmail },
        ],
      },
    });

    // Check out-of-order event timestamps if record already exists
    if (existing && timestamp) {
      const eventTime = new Date(timestamp).getTime();
      const existingTime = new Date(existing.syncedAt).getTime();
      if (eventTime < existingTime - 5000) {
        console.warn(`[MAINTLY_CONSUMER] Discarding older out-of-order event timestamp (${timestamp}) vs current sync (${existing.syncedAt})`);
        return;
      }
    }

    switch (eventType) {
      case 'employee.created': {
        if (existing) {
          // If already exists, update and link
          await prisma.employeeReference.update({
            where: { id: existing.id },
            data: {
              hrEmployeeId: hrEmployeeId || existing.hrEmployeeId,
              centralTenantId: centralTenantId || existing.centralTenantId,
              centralUserId: centralUserId || existing.centralUserId,
              centralBranchId: centralBranchId || existing.centralBranchId,
              employeeCode: employeeCode || existing.employeeCode,
              firstName: firstName || existing.firstName,
              lastName: lastName || existing.lastName,
              email: normalizedEmail || existing.email,
              phone: phone !== undefined ? phone : existing.phone,
              branchId: resolvedBranchId !== null ? resolvedBranchId : existing.branchId,
              department: department || existing.department,
              designation: designation || existing.designation,
              status: status || 'ACTIVE',
              syncedAt: new Date(),
            },
          });
        } else {
          // Double check to prevent race condition duplicates
          const recheck = await prisma.employeeReference.findFirst({
            where: {
              tenantId,
              OR: [
                ...(hrEmployeeId ? [{ hrEmployeeId }] : []),
                ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
              ],
            },
          });
          if (recheck) {
            await prisma.employeeReference.update({
              where: { id: recheck.id },
              data: {
                hrEmployeeId: hrEmployeeId || recheck.hrEmployeeId,
                centralTenantId: centralTenantId || recheck.centralTenantId,
                centralUserId: centralUserId || recheck.centralUserId,
                centralBranchId: centralBranchId || recheck.centralBranchId,
                employeeCode: employeeCode || recheck.employeeCode,
                firstName: firstName || recheck.firstName,
                lastName: lastName || recheck.lastName,
                email: normalizedEmail || recheck.email,
                phone: phone !== undefined ? phone : recheck.phone,
                branchId: resolvedBranchId !== null ? resolvedBranchId : recheck.branchId,
                department: department || recheck.department,
                designation: designation || recheck.designation,
                status: status || 'ACTIVE',
                syncedAt: new Date(),
              },
            });
          } else {
            // Create new EmployeeReference
            await prisma.employeeReference.create({
              data: {
                tenantId,
                hrEmployeeId,
                centralTenantId,
                centralUserId,
                centralBranchId,
                employeeCode: employeeCode || `EMP-${Date.now().toString().slice(-4)}`,
                firstName: firstName || '',
                lastName: lastName || '',
                email: normalizedEmail,
                phone: phone || null,
                branchId: resolvedBranchId,
                department: department || null,
                designation: designation || null,
                status: status || 'ACTIVE',
                syncedAt: new Date(),
              },
            });
          }
        }
        break;
      }

      case 'employee.updated': {
        if (existing) {
          await prisma.employeeReference.update({
            where: { id: existing.id },
            data: {
              firstName: firstName !== undefined ? firstName : existing.firstName,
              lastName: lastName !== undefined ? lastName : existing.lastName,
              phone: phone !== undefined ? phone : existing.phone,
              department: department !== undefined ? department : existing.department,
              designation: designation !== undefined ? designation : existing.designation,
              branchId: resolvedBranchId !== null ? resolvedBranchId : existing.branchId,
              centralBranchId: centralBranchId !== undefined ? centralBranchId : existing.centralBranchId,
              status: status !== undefined ? status : existing.status,
              syncedAt: new Date(),
            },
          });
        } else {
          // Create if not found
          await prisma.employeeReference.create({
            data: {
              tenantId,
              hrEmployeeId,
              centralTenantId,
              centralUserId,
              centralBranchId,
              employeeCode: employeeCode || `EMP-${Date.now().toString().slice(-4)}`,
              firstName: firstName || '',
              lastName: lastName || '',
              email: normalizedEmail,
              phone: phone || null,
              branchId: resolvedBranchId,
              department: department || null,
              designation: designation || null,
              status: status || 'ACTIVE',
              syncedAt: new Date(),
            },
          });
        }
        break;
      }

      case 'employee.transferred': {
        if (existing) {
          await prisma.employeeReference.update({
            where: { id: existing.id },
            data: {
              branchId: resolvedBranchId !== null ? resolvedBranchId : existing.branchId,
              centralBranchId: centralBranchId || existing.centralBranchId,
              department: department !== undefined ? department : existing.department,
              syncedAt: new Date(),
            },
          });
        }
        break;
      }

      case 'employee.deactivated': {
        // Crucial requirement: Update status to INACTIVE. Preserve existing maintenance requests and historical references!
        if (existing) {
          await prisma.employeeReference.update({
            where: { id: existing.id },
            data: {
              status: 'INACTIVE',
              syncedAt: new Date(),
            },
          });
        }
        break;
      }

      case 'employee.reactivated': {
        if (existing) {
          await prisma.employeeReference.update({
            where: { id: existing.id },
            data: {
              status: 'ACTIVE',
              syncedAt: new Date(),
            },
          });
        }
        break;
      }

      default:
        console.warn(`[MAINTLY_CONSUMER] Unknown eventType '${eventType}', ignoring.`);
        break;
    }
  }

  async recordProcessed(eventId, eventType, aggregateId, centralTenantId, status, errorReason = null) {
    try {
      await prisma.processedEvent.upsert({
        where: { eventId },
        update: {
          status,
          errorReason,
          processedAt: new Date(),
        },
        create: {
          eventId,
          eventType,
          aggregateId: aggregateId || null,
          centralTenantId: centralTenantId || null,
          status,
          errorReason,
          processedAt: new Date(),
        },
      });
    } catch (e) {
      console.warn(`[MAINTLY_CONSUMER] Warning recording processedEvent '${eventId}':`, e.message);
    }
  }
}

export const eventConsumer = new EventConsumer();
export default eventConsumer;
