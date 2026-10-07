import { Router } from 'express';
import {
  getPurchaseRequests,
  getPurchaseRequestById,
  createPurchaseRequest,
  addQuotation,
  updatePurchaseStatus
} from './purchase.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole, requireTenant } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.get('/', getPurchaseRequests);
router.get('/:id', getPurchaseRequestById);
router.post('/', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'MAINTENANCE_USER', 'PURCHASE_USER'), createPurchaseRequest);
router.post('/:id/quotations', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN', 'PURCHASE_USER', 'MANAGER'), addQuotation);
router.put('/:id/status', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN', 'PURCHASE_USER', 'MANAGER', 'APPROVER'), updatePurchaseStatus);

export default router;
