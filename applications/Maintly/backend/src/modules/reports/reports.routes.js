import { Router } from 'express';
import { getReportsSummary, exportRequestsCSV } from './reports.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireTenant } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.get('/summary', getReportsSummary);
router.get('/export/csv', exportRequestsCSV);

export default router;
