import { Router } from 'express';
import {
  getUsers, getUserById, createUser, updateUserStatus,
  addMembership, removeMembership,
  assignUserRole, revokeUserRole,
  getRoles, getPermissions
} from './users.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireTenant, checkPermission } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);

// Publicly available to authenticated users within tenant
router.get('/roles', getRoles);
router.get('/permissions', getPermissions);

// User Directory
router.get('/', requireTenant, getUsers);
router.get('/:id', requireTenant, getUserById);
router.post('/', requireTenant, checkPermission('org.user.manage'), createUser);
router.put('/:id/status', requireTenant, checkPermission('org.user.manage'), updateUserStatus);

// Multi-Branch Organization Memberships
router.post('/:userId/memberships', requireTenant, checkPermission('org.user.manage'), addMembership);
router.delete('/:userId/memberships/:membershipId', requireTenant, checkPermission('org.user.manage'), removeMembership);

// Scoped Roles
router.post('/:userId/roles', requireTenant, checkPermission('org.user.manage'), assignUserRole);
router.delete('/:userId/roles/:assignmentId', requireTenant, checkPermission('org.user.manage'), revokeUserRole);

export default router;
