const express = require('express');
const router = express.Router();
const {
  getPayrolls,
  runPayrollCalculation,
  toggleSalaryHold,
  uploadPayDays,
  uploadDeductions,
  generatePaymentAdvice,
  getPaymentAdvices,
} = require('./payrollController');
const authenticate = require('../../middleware/auth');
const requireRole = require('../../middleware/rbac');
const { enforceTenantScope, requireFeature } = require('../../middleware/tenantAuth');

router.use(authenticate);
router.use(enforceTenantScope);
router.use(requireFeature('payroll'));

router.get('/', getPayrolls);
router.post('/calculate', requireRole(['HR', 'PLATFORM_ADMIN']), runPayrollCalculation);
router.patch('/:id/hold', requireRole(['HR', 'PLATFORM_ADMIN']), toggleSalaryHold);
router.post('/pay-days', requireRole(['HR', 'BM', 'PLATFORM_ADMIN']), uploadPayDays);
router.post('/deductions', requireRole(['HR', 'PLATFORM_ADMIN']), uploadDeductions);
router.post('/payment-advice', requireRole(['HR', 'BM', 'PLATFORM_ADMIN']), generatePaymentAdvice);
router.get('/payment-advice', requireRole(['HR', 'BM', 'PLATFORM_ADMIN']), getPaymentAdvices);
router.post('/advice', requireRole(['HR', 'BM', 'PLATFORM_ADMIN']), generatePaymentAdvice);
router.get('/advice', requireRole(['HR', 'BM', 'PLATFORM_ADMIN']), getPaymentAdvices);

module.exports = router;
