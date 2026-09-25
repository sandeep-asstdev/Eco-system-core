import { Router } from 'express';
import {
  getApplications,
  getApplication,
  registerApplication,
  updateApplication,
  deleteApplication,
  subscribeApplication,
  unsubscribeApplication,
  checkApplicationHealth
} from './applications.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePlatformAdmin, requireTenant } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);

// Public/tenant read routes
router.get('/', getApplications);
router.get('/:id', getApplication);
router.get('/:id/health', checkApplicationHealth);
router.post('/:id/health-check', checkApplicationHealth);

// Tenant subscription routes
router.post('/subscribe', requireTenant, subscribeApplication);
router.post('/:id/subscribe', requireTenant, subscribeApplication);
router.post('/:id/unsubscribe', requireTenant, unsubscribeApplication);

// Administrative application management
router.post('/', requirePlatformAdmin, registerApplication);
router.patch('/:id', requirePlatformAdmin, updateApplication);
router.delete('/:id', requirePlatformAdmin, deleteApplication);

export default router;
