const prisma = require('../config/db');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Middleware ensuring:
 * 1. Branch requested belongs to the authenticated user's tenant.
 * 2. Branch Managers (BM) and multi-branch staff only access their assigned branches.
 * 3. Employees only access their own profile.
 * 4. HR users have cross-branch access strictly within their tenant.
 * 5. Platform Admin bypasses branch scoping.
 */
const enforceBranchScope = async (req, res, next) => {
  const { role, branchId, tenantId } = req.user;

  // Platform Admin bypasses branch scoping
  if (req.isPlatformAdmin || role === 'PLATFORM_ADMIN') {
    const requestedBranchId = req.params.branchId || req.body?.branchId || req.query?.branchId;
    req.branchFilter = requestedBranchId ? { branchId: requestedBranchId } : {};
    return next();
  }

  const requestedBranchId = req.params.branchId || req.body?.branchId || req.query?.branchId;

  // If a specific branch is requested, ensure it belongs to the user's tenant
  if (requestedBranchId) {
    try {
      const branchRecord = await prisma.branch.findFirst({
        where: {
          OR: [
            { id: requestedBranchId },
            { centralBranchId: requestedBranchId },
          ],
        },
        select: { id: true, tenantId: true, centralBranchId: true },
      });

      if (!branchRecord || branchRecord.tenantId !== tenantId) {
        return errorResponse(
          res,
          'Access Denied: The requested branch does not exist or does not belong to your dealer organization.',
          403
        );
      }
    } catch (err) {
      return errorResponse(res, 'Failed to validate branch access permissions.', 500);
    }
  }

  // HR has organization-wide visibility across all branches of their tenant
  if (role === 'HR' || (req.permissions && req.permissions.includes('hr.employee.manage'))) {
    req.branchFilter = requestedBranchId ? { branchId: requestedBranchId } : {};
    return next();
  }

  // Branch Manager & Floating Multi-Branch Staff
  if (role === 'BM' || (req.memberships && req.memberships.length > 0)) {
    const authorizedBranchIds = new Set();
    if (branchId) authorizedBranchIds.add(branchId);
    if (req.user.branch?.centralBranchId) authorizedBranchIds.add(req.user.branch.centralBranchId);

    // Add multi-branch memberships from Keycloak token
    (req.memberships || []).forEach((m) => {
      if (m.branchId) authorizedBranchIds.add(m.branchId);
    });

    if (authorizedBranchIds.size === 0) {
      return errorResponse(res, 'Branch Manager is not assigned to any authorized branch.', 403);
    }

    if (requestedBranchId) {
      // Find matching branch record to verify against either local or central id
      const branchRecord = await prisma.branch.findFirst({
        where: {
          OR: [
            { id: requestedBranchId },
            { centralBranchId: requestedBranchId },
          ],
        },
      });

      const isAuthorized =
        (branchRecord && (authorizedBranchIds.has(branchRecord.id) || authorizedBranchIds.has(branchRecord.centralBranchId))) ||
        authorizedBranchIds.has(requestedBranchId);

      if (!isAuthorized) {
        return errorResponse(
          res,
          "Access Denied: You do not have permission to view or manage another branch's resources.",
          403
        );
      }

      req.branchFilter = { branchId: branchRecord ? branchRecord.id : requestedBranchId };
      return next();
    }

    // Default filter to authorized branches
    req.branchFilter = {
      branchId: { in: Array.from(authorizedBranchIds) },
    };
    return next();
  }

  if (role === 'EMPLOYEE') {
    if (!req.user.employeeId) {
      return errorResponse(res, 'User is not linked to an employee profile.', 403);
    }
    req.employeeFilter = { id: req.user.employeeId };
    req.branchFilter = branchId ? { branchId } : {};
    return next();
  }

  return errorResponse(res, 'Forbidden', 403);
};

module.exports = enforceBranchScope;
