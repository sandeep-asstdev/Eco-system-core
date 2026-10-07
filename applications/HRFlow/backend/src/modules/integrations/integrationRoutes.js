const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const { enforceTenantScope } = require('../../middleware/tenantAuth');
const {
  getIntegrationEmployees,
  getIntegrationEmployeeById,
  getOutboxStatus,
  getOutboxEvents,
  retryOutboxEvent,
  retryAllOutboxEvents,
} = require('./integrationController');

router.use(authenticate);
router.use(enforceTenantScope);

/**
 * Versioned REST endpoints for MAINTLY to retrieve authorized employee references
 * Allowed for users/services with hr.employee.read or maintenance.ticket.create or Platform Admin
 */
router.get(
  '/employees',
  (req, res, next) => {
    const perms = req.permissions || [];
    if (
      req.isPlatformAdmin ||
      perms.includes('*') ||
      perms.includes('hr.employee.read') ||
      perms.includes('maintenance.ticket.create') ||
      perms.includes('maintenance.ticket.assign') ||
      req.user.role === 'HR' ||
      req.user.role === 'PLATFORM_ADMIN' ||
      req.user.role === 'BM'
    ) {
      return next();
    }
    return requirePermission('hr.employee.read')(req, res, next);
  },
  getIntegrationEmployees
);

router.get(
  '/employees/:id',
  (req, res, next) => {
    const perms = req.permissions || [];
    if (
      req.isPlatformAdmin ||
      perms.includes('*') ||
      perms.includes('hr.employee.read') ||
      perms.includes('maintenance.ticket.create') ||
      perms.includes('maintenance.ticket.assign') ||
      req.user.role === 'HR' ||
      req.user.role === 'PLATFORM_ADMIN' ||
      req.user.role === 'BM'
    ) {
      return next();
    }
    return requirePermission('hr.employee.read')(req, res, next);
  },
  getIntegrationEmployeeById
);

// Outbox Monitoring & Administrative Retry Endpoints
router.get('/outbox/status', getOutboxStatus);
router.get('/outbox/events', getOutboxEvents);
router.post('/outbox/retry/:id', retryOutboxEvent);
router.post('/outbox/retry-all', retryAllOutboxEvents);

module.exports = router;
