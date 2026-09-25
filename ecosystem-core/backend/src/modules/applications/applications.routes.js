import { Router } from 'express';
import {
  getApplications, registerApplication, subscribeApplication
} from './applications.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePlatformAdmin, requireTenant } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.get('/', getApplications);
router.post('/', requirePlatformAdmin, registerApplication);
router.post('/subscribe', requireTenant, subscribeApplication);

export default router;
