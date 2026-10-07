const prisma = require('../config/db');

/**
 * Audit log helper with multi-tenant isolation support
 */
const logAudit = async ({
  tenantId,
  userId,
  action,
  module,
  recordId,
  previousValue,
  newValue,
  ipAddress,
}) => {
  try {
    let validUserId = userId || null;
    if (validUserId) {
      const u = await prisma.user.findUnique({ where: { id: validUserId }, select: { id: true } });
      if (!u) validUserId = null;
    }

    await prisma.auditLog.create({
      data: {
        tenantId: tenantId || null,
        userId: validUserId,
        action,
        module,
        recordId: recordId ? String(recordId) : null,
        previousValue:
          previousValue != null
            ? typeof previousValue === 'object'
              ? JSON.stringify(previousValue)
              : String(previousValue)
            : null,
        newValue:
          newValue != null
            ? typeof newValue === 'object'
              ? JSON.stringify(newValue)
              : String(newValue)
            : null,
        ipAddress: ipAddress || null,
      },
    });
  } catch (err) {
    console.error('Audit logging failed:', err.message);
  }
};

module.exports = {
  logAudit,
};
