import { Router } from 'express';
import {
  getDefinitions,
  createDefinition,
  triggerWorkflow,
  getInstances,
  getInstanceById,
  processAction
} from './workflow.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireTenant } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);

// Workflow definitions
router.get('/definitions', getDefinitions);
router.post('/definitions', createDefinition);

// Workflow execution
router.post('/trigger', requireTenant, triggerWorkflow);
router.get('/instances', requireTenant, getInstances);
router.get('/instances/:id', requireTenant, getInstanceById);
router.post('/instances/:id/action', requireTenant, processAction);

export default router;
