import { Router } from 'express';
import { getVendors, getVendorById, createVendor, updateVendor } from './vendor.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole, requireTenant } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.get('/', getVendors);
router.get('/:id', getVendorById);
router.post('/', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN', 'PURCHASE_USER', 'MANAGER'), createVendor);
router.put('/:id', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN', 'PURCHASE_USER', 'MANAGER'), updateVendor);

export default router;
