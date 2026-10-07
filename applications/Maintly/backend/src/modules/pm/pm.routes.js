import { Router } from 'express';
import {
  getPMPlans,
  createPMPlan,
  getUpcomingPMs,
  executePMInspection
} from './pm.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole, requireTenant } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.get('/plans', getPMPlans);
router.post('/plans', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER'), createPMPlan);
router.get('/upcoming', getUpcomingPMs);
router.post('/inspections/:id/execute', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'MAINTENANCE_USER'), executePMInspection);

export default router;
