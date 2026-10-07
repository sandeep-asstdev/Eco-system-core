const express = require('express');
const router = express.Router();
const { getAllBranches, getBranchById, createBranch } = require('./branchController');
const authenticate = require('../../middleware/auth');
const requireRole = require('../../middleware/rbac');
const { enforceTenantScope } = require('../../middleware/tenantAuth');

router.use(authenticate);
router.use(enforceTenantScope);

router.get('/', getAllBranches);
router.get('/:id', getBranchById);
router.post('/', requireRole(['HR', 'PLATFORM_ADMIN']), createBranch);

module.exports = router;
