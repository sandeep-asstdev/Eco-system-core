const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  transferEmployee,
  deactivateEmployee,
  reactivateEmployee,
  updateKYC,
  updateSalaryStructure,
  assignAsset,
  getDigitalIDCard,
  exportEmployees,
} = require('./employeeController');
const authenticate = require('../../middleware/auth');
const requireRole = require('../../middleware/rbac');
const { enforceTenantScope } = require('../../middleware/tenantAuth');

router.use(authenticate);
router.use(enforceTenantScope);

router.get('/export', requireRole(['HR', 'BM', 'PLATFORM_ADMIN']), exportEmployees);
router.get('/', getEmployees);
router.post('/', requireRole(['HR', 'PLATFORM_ADMIN']), createEmployee);
router.get('/:id', getEmployeeById);
router.put('/:id', updateEmployee);
router.patch('/:id', updateEmployee);
router.post('/:id/transfer', requireRole(['HR', 'BM', 'PLATFORM_ADMIN']), transferEmployee);
router.post('/:id/deactivate', requireRole(['HR', 'PLATFORM_ADMIN']), deactivateEmployee);
router.post('/:id/reactivate', requireRole(['HR', 'PLATFORM_ADMIN']), reactivateEmployee);
router.put('/:id/kyc', requireRole(['HR', 'BM', 'PLATFORM_ADMIN']), updateKYC);
router.put('/:id/salary', requireRole(['HR', 'PLATFORM_ADMIN']), updateSalaryStructure);
router.post('/:id/assets', requireRole(['HR', 'BM', 'PLATFORM_ADMIN']), assignAsset);
router.get('/:id/digital-id', getDigitalIDCard);

module.exports = router;
