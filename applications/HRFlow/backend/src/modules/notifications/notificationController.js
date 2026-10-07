const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/apiResponse');

const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false },
    });

    return successResponse(res, { notifications, unreadCount });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch notifications', 500);
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== req.user.id) {
      return errorResponse(res, 'Notification not found or access denied', 404);
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return successResponse(res, notification, 'Notification marked as read');
  } catch (err) {
    return errorResponse(res, 'Failed to update notification', 500);
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });

    return successResponse(res, null, 'All notifications marked as read');
  } catch (err) {
    return errorResponse(res, 'Failed to update notifications', 500);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
