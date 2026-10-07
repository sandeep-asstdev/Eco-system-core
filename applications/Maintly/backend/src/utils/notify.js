import prisma from '../config/db.js';

export async function createNotification({
  tenantId,
  userId,
  title,
  message,
  type = 'INFO',
  entityType = null,
  entityId = null
}) {
  try {
    return await prisma.notification.create({
      data: {
        tenantId,
        userId,
        title,
        message,
        type,
        entityType,
        entityId
      }
    });
  } catch (error) {
    console.error('[NOTIFICATION_ERROR]', error.message);
    return null;
  }
}

export async function notifyUsers({
  tenantId,
  userIds = [],
  title,
  message,
  type = 'INFO',
  entityType = null,
  entityId = null
}) {
  if (!userIds || userIds.length === 0) return;
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];
  
  return Promise.all(
    uniqueUserIds.map(userId =>
      createNotification({
        tenantId,
        userId,
        title,
        message,
        type,
        entityType,
        entityId
      })
    )
  );
}
