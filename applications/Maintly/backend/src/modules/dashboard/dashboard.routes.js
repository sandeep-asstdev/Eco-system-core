import { Router } from 'express';
import { getDashboardData } from './dashboard.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireTenant } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.get('/metrics', getDashboardData);

export default router;
