import prisma from '../../config/db.js';

export async function getNotifications(req, res, next) {
  try {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: {
          tenantId: req.tenantId,
          userId: req.user.id
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      prisma.notification.count({
        where: {
          tenantId: req.tenantId,
          userId: req.user.id,
          isRead: false
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        items: notifications,
        unreadCount
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await prisma.notification.updateMany({
      where: {
        id,
        tenantId: req.tenantId,
        userId: req.user.id
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    await prisma.notification.updateMany({
      where: {
        tenantId: req.tenantId,
        userId: req.user.id,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
}
