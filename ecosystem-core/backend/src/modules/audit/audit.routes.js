import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { getAuditLogs, createAuditLog } from './audit.controller.js';

const router = Router();

// Protect all audit routes
router.use(authenticate);

// List audit logs (supports both /logs and /)
router.get('/logs', getAuditLogs);
router.get('/', getAuditLogs);

// Create audit log
router.post('/logs', createAuditLog);
router.post('/', createAuditLog);

export default router;
