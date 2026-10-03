import { Router } from 'express';
import {
  getFirms, getFirmById, createFirm, updateFirm,
  getBrands, getBrandById, createBrand,
  getFirmBrands, linkFirmBrand,
  getBranches, getBranchById, createBranch, updateBranch,
  getDepartments, createDepartment,
  getLocations, getLocationById, createLocation, updateLocation, deleteLocation,
  getBusinessUnits, createBusinessUnit,
  getBranchBrands, addBranchBrand, removeBranchBrand,
  getBranchBusinessUnits, updateBranchBusinessUnits,
  getOrganizationTree
} from './org.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireTenant, checkPermission } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

// Organization Tree (Consolidated Real-World Hierarchy)
router.get('/tree', getOrganizationTree);
router.get('/organization-tree', getOrganizationTree);

// Physical Locations (Premises / Campuses)
router.get('/locations', getLocations);
router.get('/locations/:id', getLocationById);
router.post('/locations', checkPermission('org.branch.manage'), createLocation);
router.put('/locations/:id', checkPermission('org.branch.manage'), updateLocation);
router.delete('/locations/:id', checkPermission('org.branch.manage'), deleteLocation);

// Business Units Catalog (Operational Capabilities)
router.get('/business-units', getBusinessUnits);
router.post('/business-units', checkPermission('org.branch.manage'), createBusinessUnit);

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

// Branch Multi-Brand Associations
router.get('/branches/:branchId/brands', getBranchBrands);
router.post('/branches/:branchId/brands', checkPermission('org.branch.manage'), addBranchBrand);
router.delete('/branches/:branchId/brands/:brandId', checkPermission('org.branch.manage'), removeBranchBrand);

// Branch Business Units (Active Capabilities)
router.get('/branches/:branchId/business-units', getBranchBusinessUnits);
router.put('/branches/:branchId/business-units', checkPermission('org.branch.manage'), updateBranchBusinessUnits);

// Departments
router.get('/departments', getDepartments);
router.post('/departments', checkPermission('org.department.manage'), createDepartment);

export default router;
