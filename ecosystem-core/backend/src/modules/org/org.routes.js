import { Router } from 'express';
import {
  getFirms, getFirmById, createFirm, updateFirm,
  getBrands, getBrandById, createBrand,
  getFirmBrands, linkFirmBrand,
  getBranches, getBranchById, createBranch, updateBranch,
  getDepartments, createDepartment
} from './org.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireTenant, checkPermission } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

// Firms
router.get('/firms', getFirms);
router.get('/firms/:id', getFirmById);
router.post('/firms', checkPermission('org.firm.manage'), createFirm);
router.put('/firms/:id', checkPermission('org.firm.manage'), updateFirm);

// Brands
router.get('/brands', getBrands);
router.get('/brands/:id', getBrandById);
router.post('/brands', checkPermission('org.brand.manage'), createBrand);

// Firm-Brand Franchises
router.get('/firm-brands', getFirmBrands);
router.post('/firm-brands', checkPermission('org.brand.manage'), linkFirmBrand);

// Branches (Physical Outlets)
router.get('/branches', getBranches);
router.get('/branches/:id', getBranchById);
router.post('/branches', checkPermission('org.branch.manage'), createBranch);
router.put('/branches/:id', checkPermission('org.branch.manage'), updateBranch);

// Departments
router.get('/departments', getDepartments);
router.post('/departments', checkPermission('org.department.manage'), createDepartment);

export default router;
