const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('./auditController');
const authenticate = require('../../middleware/auth');
const requireRole = require('../../middleware/rbac');
const { enforceTenantScope } = require('../../middleware/tenantAuth');

router.use(authenticate);
router.use(enforceTenantScope);
router.use(requireRole(['HR', 'PLATFORM_ADMIN']));

router.get('/', getAuditLogs);

module.exports = router;
