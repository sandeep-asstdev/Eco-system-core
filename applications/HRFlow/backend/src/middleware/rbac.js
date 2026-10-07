const { errorResponse } = require('../utils/apiResponse');

/**
 * Validates that the authenticated user possesses one of the allowed legacy roles
 * OR possesses fine-grained permissions that grant equivalent authority.
 */
const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', 401);
    }

    if (req.isPlatformAdmin || req.user.role === 'PLATFORM_ADMIN') {
      return next();
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (roles.includes(req.user.role)) {
      return next();
    }

    // Check if user has central permissions matching role intent
    const permissions = req.permissions || req.user.permissions || [];
    if (permissions.includes('*')) {
      return next();
    }

    if (roles.includes('HR') && (permissions.includes('hr.employee.manage') || permissions.includes('org.audit.view') || permissions.includes('hr.payroll.manage'))) {
      return next();
    }

    if (roles.includes('BM') && (permissions.includes('hr.leave.approve') || permissions.includes('hr.attendance.manage'))) {
      return next();
    }

    return errorResponse(
      res,
      `Access denied. This action requires one of the following roles: ${roles.join(', ')}`,
      403
    );
  };
};

/**
 * Validates that the authenticated user possesses the specific fine-grained Central RBAC permission.
 * Supports exact permission match, domain wildcard (e.g. 'hr.*'), or superadmin '*'.
 */
const requirePermission = (permissionCode) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', 401);
    }

    if (req.isPlatformAdmin || req.user.role === 'PLATFORM_ADMIN') {
      return next();
    }

    const permissions = req.permissions || req.user.permissions || [];

    if (permissions.includes('*')) {
      return next();
    }

    if (permissions.includes(permissionCode)) {
      return next();
    }

    // Check domain prefix wildcard, e.g. 'hr.*' matches 'hr.employee.read'
    const domain = permissionCode.split('.')[0];
    if (permissions.includes(`${domain}.*`)) {
      return next();
    }

    return errorResponse(
      res,
      `Access denied. Required permission: '${permissionCode}' is missing from your active profile.`,
      403
    );
  };
};

module.exports = requireRole;
module.exports.requireRole = requireRole;
module.exports.requirePermission = requirePermission;
module.exports.checkPermission = requirePermission;
