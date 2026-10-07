import prisma from '../config/db.js';

export async function logAudit({
  tenantId,
  userId = null,
  action,
  entity,
  entityId = null,
  details = null,
  req = null
}) {
  try {
    const ipAddress = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || null;
    const userAgent = req?.headers['user-agent'] || null;

    return await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action,
        entity,
        entityId,
        details: details ? details : undefined,
        ipAddress: typeof ipAddress === 'string' ? ipAddress.slice(0, 45) : null,
        userAgent: typeof userAgent === 'string' ? userAgent.slice(0, 255) : null
      }
    });
  } catch (error) {
    console.error('[AUDIT_LOG_ERROR]', error.message);
    // Audit log errors should never crash the main transaction
    return null;
  }
}
