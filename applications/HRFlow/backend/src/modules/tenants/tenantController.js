const bcrypt = require('bcryptjs');
const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/apiResponse');
const { logAudit } = require('../../middleware/audit');

// Default feature flags for dealerships
const DEFAULT_FEATURES = {
  vacancies: true,
  joining: true,
  employees: true,
  payroll: true,
  advances: true,
  attendance: true,
  exit: true,
  approvals: true,
  reports: true,
  audit: true,
};

// Default dealership settings
const DEFAULT_SETTINGS = {
  workingDaysPerMonth: 30,
  salarySettings: {
    standardWorkingDays: 30,
    pfRate: 0.12,
    esiRate: 0.0075,
    esiThreshold: 21000,
  },
  attendanceRules: {
    gracePeriodMinutes: 15,
    halfDayHours: 4,
    fullDayHours: 8,
  },
  leavePolicies: {
    paidLeavesPerYear: 18,
    probationNoticeDays: 15,
    regularNoticeDays: 30,
  },
  codeFormats: {
    employeeCodePrefix: 'EMP-',
    positionCodePrefix: 'POS-',
  },
};

/**
 * Platform Admin: Get all dealerships
 */
const getTenants = async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { organizationName: { contains: search, mode: 'insensitive' } },
        { legalName: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const tenants = await prisma.tenant.findMany({
      where,
      include: {
        _count: {
          select: {
            branches: true,
            employees: true,
            users: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, tenants);
  } catch (err) {
    console.error('Error fetching tenants:', err);
    return errorResponse(res, 'Failed to fetch dealer organizations', 500);
  }
};

/**
 * Platform Admin: Get platform-wide SaaS health & metrics
 */
const getPlatformStats = async (req, res) => {
  try {
    const [
      totalTenants,
      activeTenants,
      suspendedTenants,
      totalBranches,
      totalEmployees,
      recentTenants,
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: 'ACTIVE' } }),
      prisma.tenant.count({ where: { status: 'SUSPENDED' } }),
      prisma.branch.count(),
      prisma.employee.count(),
      prisma.tenant.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { branches: true, employees: true } },
        },
      }),
    ]);

    return successResponse(res, {
      totalTenants,
      activeTenants,
      suspendedTenants,
      totalBranches,
      totalEmployees,
      summary: {
        totalTenants,
        activeTenants,
        suspendedTenants,
        totalBranches,
        totalEmployees,
      },
      recentTenants,
    });
  } catch (err) {
    console.error('Platform stats error:', err);
    return errorResponse(res, 'Failed to calculate platform statistics', 500);
  }
};

/**
 * Independent Dealership Onboarding is disabled in HRFlow.
 * Dealerships must be onboarded only via Ecosystem Core.
 */
const createTenant = async (req, res) => {
  return errorResponse(
    res,
    'Independent dealership onboarding in HRFlow is disabled. Dealership onboarding must be completed through Ecosystem Core (Central Portal).',
    403,
    'TENANT_ONBOARDING_CENTRALIZED'
  );
};

/**
 * Internal Service Endpoint: Sync / upsert canonical tenant from Ecosystem Core
 */
const syncTenantFromEcosystem = async (req, res) => {
  try {
    const isInternal = req.authType === 'INTERNAL_SERVICE';
    const isPlatformAdmin = Boolean(req.isPlatformAdmin || req.user?.role === 'PLATFORM_ADMIN');
    if (!isInternal && !isPlatformAdmin) {
      return errorResponse(
        res,
        'Access Denied: Action requires Internal Service authentication or Platform Administrator privileges.',
        403,
        'FORBIDDEN'
      );
    }

    const { id, code, name, legalName, status, contactEmail, contactPhone, address } = req.body;
    if (!id || !code) {
      return errorResponse(res, 'Canonical tenant id and code are required for sync.', 400);
    }
    const normalizedCode = code.toUpperCase().trim();

    let tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { centralTenantId: id },
          { code: normalizedCode }
        ]
      }
    });

    if (tenant) {
      tenant = await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          centralTenantId: id,
          organizationName: name || tenant.organizationName,
          legalName: legalName || tenant.legalName || name,
          status: status || tenant.status || 'ACTIVE'
        }
      });
    } else {
      tenant = await prisma.$transaction(async (tx) => {
        const newT = await tx.tenant.create({
          data: {
            centralTenantId: id,
            code: normalizedCode,
            organizationName: name || normalizedCode,
            legalName: legalName || name || normalizedCode,
            status: status || 'ACTIVE',
            contactEmail,
            contactPhone,
            address,
            subscriptionPlan: 'ENTERPRISE',
            features: DEFAULT_FEATURES,
            settings: DEFAULT_SETTINGS
          }
        });

        // Create Corporate HQ Branch for this dealership
        await tx.branch.create({
          data: {
            tenantId: newT.id,
            code: `${normalizedCode}-HQ`,
            name: `${name || normalizedCode} Corporate HQ`,
            city: 'Headquarters',
            state: 'Headquarters',
            address: address || 'Head Office',
            phone: contactPhone,
            email: contactEmail,
            active: true
          }
        });

        return newT;
      });
    }

    return successResponse(res, { tenant }, 'Canonical tenant synchronized successfully in HRFlow.');
  } catch (err) {
    console.error('HRFlow tenant sync error:', err);
    return errorResponse(res, 'Failed to synchronize canonical tenant: ' + err.message, 500);
  }
};

/**
 * Platform Admin: Update tenant status (ACTIVE, INACTIVE, SUSPENDED)
 */
const updateTenantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
      return errorResponse(res, 'Status must be ACTIVE, INACTIVE, or SUSPENDED', 400);
    }

    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) return errorResponse(res, 'Tenant not found', 404);

    const updated = await prisma.tenant.update({
      where: { id },
      data: { status },
    });

    await logAudit({
      userId: req.user.id,
      action: `TENANT_STATUS_${status}`,
      module: 'PLATFORM',
      recordId: id,
      previousValue: tenant.status,
      newValue: status,
      ipAddress: req.ip,
    });

    return successResponse(res, updated, `Dealership status updated to ${status}`);
  } catch (err) {
    console.error('Error updating tenant status:', err);
    return errorResponse(res, 'Failed to update tenant status', 500);
  }
};

/**
 * Platform Admin: Update tenant plan & feature flags
 */
const updateTenantPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { subscriptionPlan, features } = req.body;

    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) return errorResponse(res, 'Tenant not found', 404);

    const updated = await prisma.tenant.update({
      where: { id },
      data: {
        subscriptionPlan: subscriptionPlan || undefined,
        features: features !== undefined ? features : undefined,
      },
    });

    await logAudit({
      userId: req.user.id,
      action: 'TENANT_PLAN_UPDATED',
      module: 'PLATFORM',
      recordId: id,
      newValue: JSON.stringify({ subscriptionPlan, features }),
      ipAddress: req.ip,
    });

    return successResponse(res, updated, 'Dealership subscription plan and features updated');
  } catch (err) {
    console.error('Error updating tenant plan:', err);
    return errorResponse(res, 'Failed to update subscription details', 500);
  }
};

/**
 * Tenant-scoped: Get current dealership profile & settings
 */
const getCurrentTenant = async (req, res) => {
  try {
    let { tenantId } = req.user;
    if (!tenantId && req.user.role === 'PLATFORM_ADMIN') {
      if (req.query.tenantId) {
        tenantId = req.query.tenantId;
      } else {
        const firstTenant = await prisma.tenant.findFirst({ where: { status: 'ACTIVE' } });
        if (firstTenant) tenantId = firstTenant.id;
      }
    }

    if (!tenantId) {
      return errorResponse(res, 'User does not belong to any dealership organization', 403);
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: {
            branches: true,
            employees: true,
            positions: true,
          },
        },
      },
    });

    if (!tenant) return errorResponse(res, 'Dealership organization not found', 404);

    return successResponse(res, tenant);
  } catch (err) {
    console.error('Error fetching current tenant:', err);
    return errorResponse(res, 'Failed to fetch dealership configuration', 500);
  }
};

/**
 * Tenant HR: Update current dealership settings & branding
 */
const updateCurrentTenantSettings = async (req, res) => {
  try {
    let { tenantId } = req.user;
    if (!tenantId && req.user.role === 'PLATFORM_ADMIN') {
      tenantId = req.query.tenantId || req.body.tenantId;
      if (!tenantId) {
        const firstTenant = await prisma.tenant.findFirst({ where: { status: 'ACTIVE' } });
        if (firstTenant) tenantId = firstTenant.id;
      }
    }

    if (!tenantId) {
      return errorResponse(res, 'User does not belong to any dealership organization', 403);
    }

    const { organizationName, legalName, logoUrl, contactPhone, contactEmail, address, settings } = req.body;

    const current = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!current) return errorResponse(res, 'Dealership not found', 404);

    const mergedSettings = settings ? { ...(current.settings || {}), ...settings } : current.settings;

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        organizationName: organizationName || undefined,
        legalName: legalName || undefined,
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
        contactPhone: contactPhone !== undefined ? contactPhone : undefined,
        contactEmail: contactEmail !== undefined ? contactEmail : undefined,
        address: address !== undefined ? address : undefined,
        settings: mergedSettings,
      },
    });

    await logAudit({
      tenantId,
      userId: req.user.id,
      action: 'TENANT_SETTINGS_UPDATED',
      module: 'SETTINGS',
      recordId: tenantId,
      newValue: JSON.stringify({ organizationName, settings }),
      ipAddress: req.ip,
    });

    return successResponse(res, updated, 'Dealership profile and settings successfully updated');
  } catch (err) {
    console.error('Error updating tenant settings:', err);
    return errorResponse(res, 'Failed to update dealership settings', 500);
  }
};

module.exports = {
  getTenants,
  getPlatformStats,
  createTenant,
  syncTenantFromEcosystem,
  updateTenantStatus,
  updateTenantPlan,
  getCurrentTenant,
  updateCurrentTenantSettings,
};
