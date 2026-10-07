import { Router } from 'express';
import { 
  getTenants, 
  getTenantById, 
  createTenant, 
  updateTenant, 
  updateTenantStatus,
  getInternalTenant,
  getInternalTenantSubscription
} from './tenants.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePlatformAdmin, requireInternalOrPlatformAdmin, checkPermission } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);

// Internal service-to-service endpoints (strictly restricted to internal service or platform admin)
router.get('/:id/subscription', requireInternalOrPlatformAdmin, getInternalTenantSubscription);
router.get('/internal/:id/subscription', requireInternalOrPlatformAdmin, getInternalTenantSubscription);
router.get('/internal/:id', requireInternalOrPlatformAdmin, getInternalTenant);

router.get('/', getTenants);
router.get('/:id', getTenantById);
router.post('/', requirePlatformAdmin, createTenant);
router.put('/:id', checkPermission('org.tenant.update'), updateTenant);
router.put('/:id/status', requirePlatformAdmin, updateTenantStatus);

export default router;

