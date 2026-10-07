const express = require('express');
const router = express.Router();
const {
  getTenants,
  getPlatformStats,
  createTenant,
  syncTenantFromEcosystem,
  updateTenantStatus,
  updateTenantPlan,
  getCurrentTenant,
  updateCurrentTenantSettings,
} = require('./tenantController');
const authenticate = require('../../middleware/auth');
const requireRole = require('../../middleware/rbac');
const { requirePlatformAdmin, requireInternalOrPlatformAdmin } = require('../../middleware/tenantAuth');

router.use(authenticate);

// Internal Ecosystem Core sync routes (strictly restricted to internal service or platform admin)
router.post('/sync', requireInternalOrPlatformAdmin, syncTenantFromEcosystem);
router.post('/internal-sync', requireInternalOrPlatformAdmin, syncTenantFromEcosystem);

// Dealership HR / Platform Admin: Organization profile & configuration
router.get('/settings', getCurrentTenant);
router.put('/settings', requireRole(['HR', 'PLATFORM_ADMIN']), updateCurrentTenantSettings);
router.patch('/settings', requireRole(['HR', 'PLATFORM_ADMIN']), updateCurrentTenantSettings);

router.get('/current', getCurrentTenant);
router.patch('/current/settings', requireRole(['HR', 'PLATFORM_ADMIN']), updateCurrentTenantSettings);
router.put('/current/settings', requireRole(['HR', 'PLATFORM_ADMIN']), updateCurrentTenantSettings);

// Platform Admin stats (supports both /stats and /platform-stats)
router.get('/stats', requirePlatformAdmin, getPlatformStats);
router.get('/platform-stats', requirePlatformAdmin, getPlatformStats);

// Platform Admin: SaaS level dealership management
router.get('/', requirePlatformAdmin, getTenants);
router.post('/', requirePlatformAdmin, createTenant);
router.patch('/:id/status', requirePlatformAdmin, updateTenantStatus);
router.patch('/:id/plan', requirePlatformAdmin, updateTenantPlan);

module.exports = router;
