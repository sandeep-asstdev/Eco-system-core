const express = require('express');
const router = express.Router();
const { getDashboardStats, getManpowerReport, getDealershipAnalytics } = require('./reportController');
const authenticate = require('../../middleware/auth');
const requireRole = require('../../middleware/rbac');
const { enforceTenantScope } = require('../../middleware/tenantAuth');

router.use(authenticate);
router.use(enforceTenantScope);

router.get('/dashboard', getDashboardStats);
router.get('/manpower', requireRole(['HR', 'BM', 'PLATFORM_ADMIN']), getManpowerReport);
router.get('/analytics', requireRole(['HR', 'BM', 'PLATFORM_ADMIN']), getDealershipAnalytics);

module.exports = router;
