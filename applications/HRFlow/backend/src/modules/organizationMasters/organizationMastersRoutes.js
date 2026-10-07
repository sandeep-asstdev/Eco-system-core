const express = require('express');
const router = express.Router();
const {
  getLevels,
  getLevelById,
  createLevel,
  updateLevel,
  getDesignations,
  getDesignationById,
  createDesignation,
  updateDesignation,
  deleteDesignation,
} = require('./organizationMastersController');
const authenticate = require('../../middleware/auth');
const requireRole = require('../../middleware/rbac');
const { enforceTenantScope } = require('../../middleware/tenantAuth');

router.use(authenticate);
router.use(enforceTenantScope);

// Levels Routes
router.get('/levels', getLevels);
router.get('/levels/:id', getLevelById);
router.post('/levels', requireRole(['HR', 'PLATFORM_ADMIN']), createLevel);
router.put('/levels/:id', requireRole(['HR', 'PLATFORM_ADMIN']), updateLevel);

// Designations Routes
router.get('/designations', getDesignations);
router.get('/designations/:id', getDesignationById);
router.post('/designations', requireRole(['HR', 'PLATFORM_ADMIN']), createDesignation);
router.put('/designations/:id', requireRole(['HR', 'PLATFORM_ADMIN']), updateDesignation);
router.delete('/designations/:id', requireRole(['HR', 'PLATFORM_ADMIN']), deleteDesignation);

module.exports = router;
