import { Router } from 'express';
import { getTenants, getTenantById, createTenant, updateTenant, updateTenantStatus } from './tenants.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePlatformAdmin, checkPermission } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.get('/', getTenants);
router.get('/:id', getTenantById);
router.post('/', requirePlatformAdmin, createTenant);
router.put('/:id', checkPermission('org.tenant.update'), updateTenant);
router.put('/:id/status', requirePlatformAdmin, updateTenantStatus);

export default router;
