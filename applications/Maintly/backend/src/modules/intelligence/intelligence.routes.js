import { Router } from 'express';
import {
  getHealthScore,
  getRepeatedFailures,
  createOrUpdateRCA,
  getRCAByRequest,
  getSimilarityFingerprint,
  getBranchComparison,
  getMaintenanceHeatmap,
  globalSearch
} from './intelligence.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireTenant } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.get('/health-score', getHealthScore);
router.get('/repeat-failures', getRepeatedFailures);
router.post('/rca', createOrUpdateRCA);
router.get('/rca/:requestId', getRCAByRequest);
router.get('/similarity', getSimilarityFingerprint);
router.get('/branch-comparison', getBranchComparison);
router.get('/heatmap', getMaintenanceHeatmap);
router.get('/search', globalSearch);

export default router;
