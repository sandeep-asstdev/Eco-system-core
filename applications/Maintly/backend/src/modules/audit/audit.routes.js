import { Router } from 'express';
import { getAuditLogs } from './audit.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole, requireTenant } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);
router.use(requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN'));

router.get('/', getAuditLogs);

export default router;
