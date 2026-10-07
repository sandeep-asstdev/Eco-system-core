export function requirePlatformAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
  }

  if (!req.isPlatformAdmin) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Action requires Platform Administrator privileges.' }
    });
  }

  next();
}

export function requireInternalOrPlatformAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
  }

  const isInternal = req.authMethod === 'INTERNAL_SERVICE';
  const isPlatformAdmin = Boolean(req.isPlatformAdmin || req.user?.role === 'PLATFORM_ADMIN');

  if (!isInternal && !isPlatformAdmin) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Access Denied: Action requires Internal Service authentication or Platform Administrator privileges.' }
    });
  }

  next();
}

export function requireTenant(req, res, next) {
  if (req.isPlatformAdmin) {
    const targetTenantId = req.headers['x-tenant-id'] || req.query.tenantId;
    if (targetTenantId) {
      req.tenantId = targetTenantId;
    }
    return next();
  }

  if (!req.tenantId) {
    return res.status(403).json({
      success: false,
      error: { code: 'TENANT_REQUIRED', message: 'Valid tenant context required for this operation.' }
    });
  }

  next();
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    if (req.isPlatformAdmin) {
      return next();
    }

    const userRoles = req.userRoleAssignments?.map(ura => ura.role?.code) || [];
    const hasRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Action requires one of the following roles: [${allowedRoles.join(', ')}]`
        }
      });
    }

    next();
  };
}

export function checkPermission(requiredPermission, getScope = (req) => ({})) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    if (req.isPlatformAdmin) {
      return next();
    }

    const { targetFirmId, targetBrandId, targetLocationId, targetBranchId, targetBusinessUnitId, targetDeptId } = getScope(req);
    const assignments = req.userRoleAssignments || [];

    const hasAccess = assignments.some(assignment => {
      // Must match tenant
      if (assignment.tenantId !== req.tenantId) return false;

      // Check if role has the requested permission
      const hasPerm = assignment.role?.rolePermissions?.some(
        rp => rp.permission?.code === requiredPermission
      );
      if (!hasPerm) return false;

      // Scope verification
      switch (assignment.scopeType) {
        case 'GLOBAL':
        case 'TENANT':
          return true;
        case 'FIRM':
          return !targetFirmId || assignment.firmId === targetFirmId;
        case 'BRAND':
          return !targetBrandId || assignment.brandId === targetBrandId;
        case 'LOCATION':
          return !targetLocationId || assignment.locationId === targetLocationId;
        case 'BRANCH':
          return !targetBranchId || assignment.branchId === targetBranchId;
        case 'BUSINESS_UNIT':
          return (!targetBranchId || assignment.branchId === targetBranchId) &&
                 (!targetBusinessUnitId || assignment.businessUnitId === targetBusinessUnitId);
        case 'DEPARTMENT':
          return (!targetBranchId || assignment.branchId === targetBranchId) &&
                 (!targetDeptId || assignment.departmentId === targetDeptId);
        default:
          return false;
      }
    });

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSION',
          message: `Access denied. Missing scoped permission '${requiredPermission}'`
        }
      });
    }

    next();
  };
}

export const requirePermission = checkPermission;

