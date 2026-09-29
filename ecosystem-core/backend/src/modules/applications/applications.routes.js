import { Router } from 'express';
import {
  getApplications,
  getApplication,
  registerApplication,
  updateApplication,
  deleteApplication,
  subscribeApplication,
  unsubscribeApplication,
  checkApplicationHealth,
  fetchManifestEndpoint,
  validateManifestEndpoint,
  getApplicationTenants,
  toggleTenantSubscription,
  getApplicationEvents,
  updateApplicationSubscriptions
} from './applications.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePlatformAdmin, requireTenant } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);

// Manifest Discovery & Validation (SSRF safe)
router.post('/manifest/fetch', requirePlatformAdmin, fetchManifestEndpoint);
router.post('/manifest/validate', requirePlatformAdmin, validateManifestEndpoint);

// Public / Authenticated read routes
router.get('/', getApplications);
router.get('/:id', getApplication);
router.get('/:id/health', checkApplicationHealth);
router.post('/:id/health-check', checkApplicationHealth);

// Dealership Tenant Management for an application
router.get('/:id/tenants', requirePlatformAdmin, getApplicationTenants);
router.post('/:id/tenants/:tenantId/toggle', requirePlatformAdmin, toggleTenantSubscription);

// Event Integration for an application
router.get('/:id/events', requirePlatformAdmin, getApplicationEvents);
router.post('/:id/events/subscriptions', requirePlatformAdmin, updateApplicationSubscriptions);

// Tenant self-subscription routes (legacy)
router.post('/subscribe', requireTenant, subscribeApplication);
router.post('/:id/subscribe', requireTenant, subscribeApplication);
router.post('/:id/unsubscribe', requireTenant, unsubscribeApplication);

// Administrative application lifecycle management
router.post('/', requirePlatformAdmin, registerApplication);
router.patch('/:id', requirePlatformAdmin, updateApplication);
router.delete('/:id', requirePlatformAdmin, deleteApplication);

export default router;
