const express = require('express');
const router = express.Router();
const {
  getPositions,
  createPosition,
  updatePositionStatus,
  getManpowerBudgets,
  uploadManpowerBudget,
} = require('./vacancyController');
const authenticate = require('../../middleware/auth');
const requireRole = require('../../middleware/rbac');
const { enforceTenantScope, requireFeature } = require('../../middleware/tenantAuth');

router.use(authenticate);
router.use(enforceTenantScope);
router.use(requireFeature('vacancies'));

router.get('/positions', getPositions);
router.post('/positions', requireRole(['HR', 'BM', 'PLATFORM_ADMIN']), createPosition);
router.patch('/positions/:id/status', requireRole(['HR', 'BM', 'PLATFORM_ADMIN']), updatePositionStatus);

router.get('/budgets', getManpowerBudgets);
router.post('/budgets', requireRole(['HR', 'PLATFORM_ADMIN']), uploadManpowerBudget);

module.exports = router;
