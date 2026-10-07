import { Router } from 'express';
import {
  getTenants, createTenant, syncTenantFromEcosystem, getTenantSettings, updateTenantSettings,
  getBrands, createBrand,
  getBranches, createBranch,
  getBranchDepartments, setBranchDepartments,
  getBranchAreas, createBranchArea,
  getDepartments, createDepartment,
  getUsers, createUser, updateUserRoleAndStatus
} from './org.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole, requireTenant, requireInternalOrPlatformAdmin } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);

// Tenants & Tenant Settings
router.get('/tenants', getTenants);
router.post('/tenants', requireRole('PLATFORM_ADMIN'), createTenant);
router.post('/sync', requireInternalOrPlatformAdmin, syncTenantFromEcosystem);
router.post('/internal-sync', requireInternalOrPlatformAdmin, syncTenantFromEcosystem);
router.post('/tenants/sync', requireInternalOrPlatformAdmin, syncTenantFromEcosystem);
router.post('/tenants/internal-sync', requireInternalOrPlatformAdmin, syncTenantFromEcosystem);
router.get('/tenant-settings', requireTenant, getTenantSettings);
router.put('/tenant-settings', requireTenant, requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN'), updateTenantSettings);

// Brands
router.get('/brands', requireTenant, getBrands);
router.post('/brands', requireTenant, requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN'), createBrand);

// Branches
router.get('/branches', requireTenant, getBranches);
router.post('/branches', requireTenant, requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN'), createBranch);

// Branch-Department Mappings
router.get('/branches/:branchId/departments', requireTenant, getBranchDepartments);
router.post('/branches/:branchId/departments', requireTenant, requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN'), setBranchDepartments);

// Branch Areas
router.get('/branches/:branchId/areas', requireTenant, getBranchAreas);
router.post('/branches/:branchId/areas', requireTenant, requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN'), createBranchArea);

// Departments
router.get('/departments', requireTenant, getDepartments);
router.post('/departments', requireTenant, requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN'), createDepartment);

// Users
router.get('/users', requireTenant, getUsers);
router.post('/users', requireTenant, requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN'), createUser);
router.put('/users/:id', requireTenant, requireRole('PLATFORM_ADMIN', 'TENANT_ADMIN'), updateUserRoleAndStatus);

export default router;
