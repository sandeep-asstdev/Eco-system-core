export function requireRole(...allowedRoles) {
  const roles = allowedRoles.flat();
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // PLATFORM_ADMIN has superuser rights
    if (req.user.role === 'PLATFORM_ADMIN') {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Action requires one of [${roles.join(', ')}]. Your role is ${req.user.role}.`
      });
    }

    next();
  };
}

export function requirePermission(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (req.user.role === 'PLATFORM_ADMIN' || req.user.role === 'TENANT_ADMIN') {
      return next();
    }

    // Check OIDC permissions claim
    if (Array.isArray(req.permissions) && req.permissions.length > 0) {
      const hasPermission = requiredPermissions.some(p => req.permissions.includes(p));
      if (hasPermission) return next();
    }

    // Role-based capability fallback
    const rolePermissionsMap = {
      MANAGER: ['maintenance.ticket.create', 'maintenance.ticket.read', 'maintenance.ticket.assign', 'maintenance.ticket.approve'],
      APPROVER: ['maintenance.ticket.read', 'maintenance.ticket.approve', 'maintenance.purchase.approve'],
      MAINTENANCE_USER: ['maintenance.ticket.read', 'maintenance.ticket.execute'],
      PURCHASE_USER: ['maintenance.purchase.request', 'maintenance.purchase.manage'],
      EMPLOYEE: ['maintenance.ticket.create', 'maintenance.ticket.read']
    };

    const userPerms = rolePermissionsMap[req.user.role] || [];
    const hasRolePerm = requiredPermissions.some(p => userPerms.includes(p));
    if (hasRolePerm) return next();

    return res.status(403).json({
      success: false,
      message: `Forbidden: Action requires one of permissions [${requiredPermissions.join(', ')}].`
    });
  };
}

export function requireTenant(req, res, next) {
  if (req.user?.role === 'PLATFORM_ADMIN') {
    // If platform admin passed a query or header tenantId, allow scoping
    if (req.query.tenantId) {
      req.tenantId = req.query.tenantId;
    }
    return next();
  }

  if (!req.tenantId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Valid tenant identity required.'
    });
  }

  next();
}

export function requireBranchAccess(getBranchId = (req) => req.body?.branchId || req.params?.branchId || req.query?.branchId) {
  return (req, res, next) => {
    // Platform and Tenant admins have tenant-wide branch access
    if (req.user.role === 'PLATFORM_ADMIN' || req.user.role === 'TENANT_ADMIN') {
      return next();
    }

    const branchId = getBranchId(req);
    if (!branchId) {
      return next(); // Branch check not applicable or to be validated by controller
    }

    if (!req.branchIds || !req.branchIds.includes(branchId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission for this specific branch.'
      });
    }

    next();
  };
}

export function requireInternalOrPlatformAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const isInternal = req.authMethod === 'INTERNAL_SERVICE';
  const isPlatformAdmin = Boolean(req.user.role === 'PLATFORM_ADMIN' || req.isPlatformAdmin);

  if (!isInternal && !isPlatformAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Action requires Internal Service authentication or Platform Administrator privileges.'
    });
  }

  next();
}
