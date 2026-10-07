const express = require('express');
const router = express.Router();
const { getApprovals, handleApprovalAction } = require('./approvalController');
const authenticate = require('../../middleware/auth');
const requireRole = require('../../middleware/rbac');
const { enforceTenantScope, requireFeature } = require('../../middleware/tenantAuth');

router.use(authenticate);
router.use(enforceTenantScope);
router.use(requireFeature('approvals'));

router.get('/', requireRole(['HR', 'BM', 'PLATFORM_ADMIN']), getApprovals);
router.patch('/:id/action', requireRole(['HR', 'BM', 'PLATFORM_ADMIN']), handleApprovalAction);

module.exports = router;
