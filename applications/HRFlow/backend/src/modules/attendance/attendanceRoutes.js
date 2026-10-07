const express = require('express');
const router = express.Router();
const {
  getAttendance,
  punchAttendance,
  requestCorrection,
  getCorrections,
} = require('./attendanceController');
const authenticate = require('../../middleware/auth');
const requireRole = require('../../middleware/rbac');
const { enforceTenantScope, requireFeature } = require('../../middleware/tenantAuth');

router.use(authenticate);
router.use(enforceTenantScope);
router.use(requireFeature('attendance'));

router.get('/', getAttendance);
router.post('/punch', requireRole(['EMPLOYEE', 'BM', 'HR']), punchAttendance);
router.post('/correction', requireRole(['EMPLOYEE', 'BM', 'HR']), requestCorrection);
router.get('/corrections', getCorrections);

module.exports = router;
