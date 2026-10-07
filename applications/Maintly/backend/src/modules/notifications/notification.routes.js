import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from './notification.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireTenant } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

export default router;
