import { Router } from 'express';
import {
  getMaintenanceTypes, createMaintenanceType, updateMaintenanceType, reorderMaintenanceTypes,
  getMaintenanceRequests, getMaintenanceRequestById, createMaintenanceRequest,
  approveMaintenanceRequest, rejectMaintenanceRequest, assignMaintenanceRequest, assignVendorToRequest,
  updateWorkStatus, updateCorrectionDone, toggleCheckedOff,
  addComment, addMaterial, uploadAttachment, submitSatisfaction,
  uploadEvidence, createFollowUp, updateFollowUpStatus, getDueFollowUps,
  updateLabourAndCosts, waivePenalty,
  uploadRequestImages, recordInvoice, recordPayment, closeRequest
} from './maintenance.controller.js';
import { importMaintenanceRequests } from './import.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole, requireTenant } from '../../middleware/rbac.js';
import { upload } from '../../middleware/upload.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

// Master Data: Maintenance Types
router.get('/types', getMaintenanceTypes);
router.post('/types', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN'), createMaintenanceType);
router.put('/types/reorder', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN'), reorderMaintenanceTypes);
router.put('/types/:id', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN'), updateMaintenanceType);

// Follow-ups
router.get('/follow-ups/due', getDueFollowUps);
router.put('/follow-ups/:id/status', updateFollowUpStatus);

// Maintenance Requests CRUD & Batch Import
router.get('/requests', getMaintenanceRequests);
router.get('/requests/:id', getMaintenanceRequestById);
router.post('/requests', upload.array('problemImages', 10), createMaintenanceRequest);
router.post('/requests/import', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN'), importMaintenanceRequests);

// Lifecycle Operations
router.put('/requests/:id/approve', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER'), approveMaintenanceRequest);
router.put('/requests/:id/reject', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER'), rejectMaintenanceRequest);
router.put('/requests/:id/assign', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER'), assignMaintenanceRequest);
router.put('/requests/:id/vendor', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER', 'MAINTENANCE_USER'), assignVendorToRequest);
router.put('/requests/:id/status', updateWorkStatus);
router.put('/requests/:id/correction', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER', 'MAINTENANCE_USER'), updateCorrectionDone);
router.put('/requests/:id/checked-off', toggleCheckedOff);
router.put('/requests/:id/satisfaction', submitSatisfaction);

// Image Uploads, Invoicing, Payment, Closure
router.post('/requests/:id/images', upload.array('images', 10), uploadRequestImages);
router.put('/requests/:id/invoice', upload.single('invoiceFile'), recordInvoice);
router.put('/requests/:id/payment', upload.single('paymentProofFile'), recordPayment);
router.put('/requests/:id/close', closeRequest);

// Enterprise Extensions: Evidence, Costs, Penalties, Follow-ups
router.post('/requests/:id/evidence', upload.single('file'), uploadEvidence);
router.post('/requests/:id/follow-ups', createFollowUp);
router.put('/requests/:id/costs', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER', 'MAINTENANCE_USER'), updateLabourAndCosts);
router.put('/requests/:id/waive-penalty', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER'), waivePenalty);

// Collaboration & Details
router.post('/requests/:id/comments', addComment);
router.post('/requests/:id/materials', requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER', 'MAINTENANCE_USER'), addMaterial);
router.post('/requests/:id/attachments', upload.single('file'), uploadAttachment);

export default router;
