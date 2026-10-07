const { errorResponse } = require('../utils/apiResponse');

/**
 * Middleware ensuring non-platform users are strictly isolated to their own tenant.
 * - Any mismatched tenantId in params, query, or body triggers a 403 Forbidden.
 * - Automatically attaches req.tenantFilter = { tenantId: req.user.tenantId } for Prisma queries.
 */
const enforceTenantScope = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required.', 401);
  }

  // Platform Admin is not tenant-bound; can filter by tenantId if explicitly provided or scoped
  if (req.user.role === 'PLATFORM_ADMIN' || req.user.isPlatformAdmin || req.isPlatformAdmin) {
    const requestedTenantId = req.params?.tenantId || req.query?.tenantId || req.body?.tenantId || req.tenantId;
    req.tenantFilter = requestedTenantId ? { tenantId: requestedTenantId } : {};
    return next();
  }

  // All dealership users (HR, BM, EMPLOYEE) MUST have a tenantId
  const userTenantId = req.user.tenantId;
  if (!userTenantId) {
    return errorResponse(res, 'Access Denied: User is not associated with any dealer organization.', 403);
  }

  // Security Verification: Client must NEVER be able to spoof or override tenantId
  const requestedTenantId = req.params.tenantId || req.query.tenantId || req.body?.tenantId;
  if (requestedTenantId && requestedTenantId !== userTenantId) {
    return errorResponse(
      res,
      'Access Denied: Cross-tenant data access or tenant manipulation is strictly prohibited.',
      403
    );
  }

  // Enforce tenant filter on request context
  req.tenantFilter = { tenantId: userTenantId };
  next();
};

/**
 * Middleware verifying if a specific feature module is enabled for the tenant.
 */
const requireFeature = (featureName) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', 401);
    }

    if (req.user.role === 'PLATFORM_ADMIN') {
      return next();
    }

    const tenantFeatures = req.user.tenant?.features;
    if (tenantFeatures && tenantFeatures[featureName] === false) {
      return errorResponse(
        res,
        `The module '${featureName}' is not enabled for your dealership's subscription plan. Please contact your platform administrator to upgrade.`,
        403
      );
    }

    next();
  };
};

/**
 * Middleware strictly restricting route to Platform Administrators.
 */
const requirePlatformAdmin = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required.', 401);
  }

  if (req.user.role !== 'PLATFORM_ADMIN') {
    return errorResponse(
      res,
      'Access Denied: Platform Administrator privileges required for this action.',
      403
    );
  }

  next();
};

/**
 * Middleware strictly restricting route to authenticated internal services or Platform Administrators.
 */
const requireInternalOrPlatformAdmin = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required.', 401);
  }

  const isInternal = req.authType === 'INTERNAL_SERVICE';
  const isPlatformAdmin = Boolean(req.isPlatformAdmin || req.user.role === 'PLATFORM_ADMIN');

  if (!isInternal && !isPlatformAdmin) {
    return errorResponse(
      res,
      'Access Denied: Action requires Internal Service authentication or Platform Administrator privileges.',
      403,
      'FORBIDDEN'
    );
  }

  next();
};

module.exports = {
  enforceTenantScope,
  requireFeature,
  requirePlatformAdmin,
  requireInternalOrPlatformAdmin,
};
