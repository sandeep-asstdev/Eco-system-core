import { Router } from 'express';
import {
  getProviders,
  getTenantIntegrations,
  configureTenantIntegration,
  triggerIntegrationSync,
  getSyncLogs,
  registerWebhook
} from './integrations.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireTenant, requirePermission } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);

// Provider catalog
router.get('/providers', getProviders);

// Tenant integration configuration
router.get('/configs', requireTenant, getTenantIntegrations);
router.post('/configs', requireTenant, configureTenantIntegration);
router.post('/configs/:id/sync', requireTenant, triggerIntegrationSync);
router.get('/configs/:id/logs', requireTenant, getSyncLogs);

// Webhook subscriptions
router.post('/webhooks', requireTenant, registerWebhook);

export default router;
