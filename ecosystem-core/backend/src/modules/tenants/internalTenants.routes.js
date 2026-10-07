import { Router } from 'express';
import { getInternalTenant, getInternalTenantSubscription } from './tenants.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireInternalOrPlatformAdmin } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);
router.use(requireInternalOrPlatformAdmin);

router.get('/:id/subscription', getInternalTenantSubscription);
router.get('/:id', getInternalTenant);

export default router;
