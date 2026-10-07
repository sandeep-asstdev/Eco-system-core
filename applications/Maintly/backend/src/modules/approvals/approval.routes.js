import { Router } from 'express';
import {
  getApprovalRules,
  createApprovalRule,
  updateApprovalRule,
  deleteApprovalRule,
  getPendingApprovals
} from './approval.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole, requireTenant } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.get('/rules', getApprovalRules);
router.post('/rules', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN'), createApprovalRule);
router.put('/rules/:id', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN'), updateApprovalRule);
router.delete('/rules/:id', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN'), deleteApprovalRule);
router.get('/pending', getPendingApprovals);

export default router;
