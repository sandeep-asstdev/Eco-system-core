const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead } = require('./notificationController');
const authenticate = require('../../middleware/auth');

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);

module.exports = router;
