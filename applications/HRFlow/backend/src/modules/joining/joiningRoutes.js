const express = require('express');
const router = express.Router();
const {
  getJoiningRecords,
  createJoiningInvitation,
  getCandidateByToken,
  submitCandidateForm,
  completeJoining,
} = require('./joiningController');
const authenticate = require('../../middleware/auth');
const requireRole = require('../../middleware/rbac');
const { enforceTenantScope, requireFeature } = require('../../middleware/tenantAuth');

// Public endpoints for candidates
router.get('/public/candidate/:token', getCandidateByToken);
router.post('/public/submit/:token', submitCandidateForm);

// Protected endpoints for HR & BM
router.use(authenticate);
router.use(enforceTenantScope);
router.use(requireFeature('joining'));

router.get('/', getJoiningRecords);
router.post('/invite', requireRole(['HR', 'PLATFORM_ADMIN']), createJoiningInvitation);
router.post('/:id/complete', requireRole(['HR', 'PLATFORM_ADMIN']), completeJoining);

module.exports = router;
