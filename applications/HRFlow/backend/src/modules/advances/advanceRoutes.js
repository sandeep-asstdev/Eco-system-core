const express = require('express');
const router = express.Router();
const {
  getSalaryAdvances,
  applySalaryAdvance,
  reviewSalaryAdvance,
} = require('./advanceController');
const authenticate = require('../../middleware/auth');
const requireRole = require('../../middleware/rbac');
const { enforceTenantScope, requireFeature } = require('../../middleware/tenantAuth');

router.use(authenticate);
router.use(enforceTenantScope);
router.use(requireFeature('advances'));

router.get('/', getSalaryAdvances);
router.post('/apply', requireRole('EMPLOYEE'), applySalaryAdvance);
router.patch('/:id/review', requireRole(['HR', 'BM', 'PLATFORM_ADMIN']), reviewSalaryAdvance);

module.exports = router;
