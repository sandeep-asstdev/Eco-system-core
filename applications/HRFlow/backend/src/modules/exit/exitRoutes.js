const express = require('express');
const router = express.Router();
const {
  getResignations,
  submitResignation,
  processResignation,
  markLeftWithoutIntimation,
  updateNoc,
  calculateFnf,
} = require('./exitController');
const authenticate = require('../../middleware/auth');
const requireRole = require('../../middleware/rbac');
const { enforceTenantScope, requireFeature } = require('../../middleware/tenantAuth');

router.use(authenticate);
router.use(enforceTenantScope);
router.use(requireFeature('exit'));

router.get('/resignations', getResignations);
router.post('/resignations', requireRole('EMPLOYEE'), submitResignation);
router.patch('/resignations/:id/process', requireRole(['HR', 'PLATFORM_ADMIN']), processResignation);
router.post('/left-without-intimation', requireRole(['HR', 'BM', 'PLATFORM_ADMIN']), markLeftWithoutIntimation);
router.patch('/noc/:id', requireRole(['HR', 'BM', 'PLATFORM_ADMIN']), updateNoc);
router.post('/fnf', requireRole(['HR', 'PLATFORM_ADMIN']), calculateFnf);

module.exports = router;
