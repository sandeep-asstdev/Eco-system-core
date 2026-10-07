import prisma from '../../config/db.js';
import bcrypt from 'bcryptjs';
import http from 'http';

/**
 * Propagates newly onboarded canonical tenant identity to subscribed applications
 */
async function propagateTenantSync(tenantPayload) {
  const internalKey = process.env.INTERNAL_SERVICE_KEY || 'ecosystem-internal-service-sync-key';
  const targets = [
    { name: 'HRFlow', port: 5000, path: '/api/internal/tenants/sync' },
    { name: 'MAINTLY', port: 5002, path: '/api/internal/tenants/sync' }
  ];

  for (const target of targets) {
    try {
      const dataStr = JSON.stringify(tenantPayload);
      const req = http.request({
        hostname: '127.0.0.1',
        port: target.port,
        path: target.path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(dataStr),
          'X-Internal-Service-Key': internalKey
        },
        timeout: 2000
      });
      req.on('error', () => {
        // Handled silently; JIT sync on first login ensures redundancy
      });
      req.write(dataStr);
      req.end();
    } catch (_) {}
  }
}


export async function getTenants(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    if (!req.isPlatformAdmin) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: req.tenantId },
        include: {
          firms: true,
          brands: true,
          branches: true,
          tenantApplications: { include: { application: true } }
        }
      });
      return res.json({
        success: true,
        data: tenant ? [tenant] : [],
        meta: { total: tenant ? 1 : 0, page: 1, limit, totalPages: 1 }
      });
    }

    const { status, subscriptionTier, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (subscriptionTier) where.subscriptionTier = subscriptionTier;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { legalName: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [total, tenants] = await Promise.all([
      prisma.tenant.count({ where }),
      prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: { firms: true, brands: true, branches: true, users: true }
          },
          tenantApplications: {
            include: { application: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    res.json({
      success: true,
      data: tenants,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getTenantById(req, res, next) {
  try {
    const { id } = req.params;
    if (!req.isPlatformAdmin && req.tenantId !== id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Unauthorized access to other tenant records.' }
      });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        firms: { include: { branches: true } },
        brands: true,
        firmBrands: { include: { firm: true, brand: true } },
        branches: { include: { firm: true, firmBrand: true, departments: true } },
        tenantApplications: { include: { application: true } }
      }
    });

    if (!tenant) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Tenant not found.' } });
    }

    res.json({ success: true, data: tenant });
  } catch (error) {
    next(error);
  }
}

export async function createTenant(req, res, next) {
  try {
    const {
      code, name, legalName, subscriptionTier, primaryContact, primaryEmail, primaryPhone,
      addressLine1, addressLine2, city, state, pincode, country
    } = req.body;

    const effectiveName = name?.trim();
    if (!effectiveName) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Tenant name is required.' }
      });
    }

    // If explicit tenant code is provided but legalName is missing, reject with validation error
    if (code && !legalName?.trim() && !req.body.legalEntityName?.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Tenant code, name, and legalName are required.' }
      });
    }

    const effectiveLegalName = (legalName || req.body.legalEntityName || effectiveName).trim();
    let normalizedCode = (code || req.body.tenantCode || '').toUpperCase().trim();
    if (!normalizedCode) {
      normalizedCode = effectiveName.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 16);
    }

    const effectiveTier = subscriptionTier || req.body.plan || 'ENTERPRISE';
    const effectiveEmail = primaryEmail !== undefined ? primaryEmail : (req.body.contactEmail || null);
    const effectivePhone = primaryPhone !== undefined ? primaryPhone : (req.body.contactPhone || null);

    if (effectiveEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(effectiveEmail)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid primaryEmail format.' }
      });
    }

    let existing = await prisma.tenant.findUnique({ where: { code: normalizedCode } });
    if (existing) {
      if (req.body.code) {
        return res.status(409).json({
          success: false,
          error: { code: 'CONFLICT', message: `Tenant with code '${normalizedCode}' already exists.` }
        });
      } else {
        normalizedCode = `${normalizedCode.slice(0, 12)}_${Math.floor(10 + Math.random() * 89)}`;
      }
    }

    const tenant = await prisma.tenant.create({
      data: {
        code: normalizedCode,
        name: effectiveName,
        legalName: effectiveLegalName,
        subscriptionTier: effectiveTier,
        primaryContact,
        primaryEmail: effectiveEmail,
        primaryPhone: effectivePhone,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        country: country || 'India'
      }
    });

    // Application Subscriptions (Dynamic with central governance)
    const activeApps = await prisma.application.findMany({ where: { isActive: true } });
    const requestedApps = Array.isArray(req.body.subscribedApps)
      ? req.body.subscribedApps.map((a) => a.toLowerCase().trim())
      : null;

    for (const app of activeApps) {
      const appKey = (app.appKey || app.code || '').toLowerCase();
      const shouldEnable = requestedApps ? requestedApps.includes(appKey) : true;
      await prisma.tenantApplication.create({
        data: {
          tenantId: tenant.id,
          applicationId: app.id,
          status: shouldEnable ? 'ACTIVE' : 'SUSPENDED',
          planName: effectiveTier
        }
      });
    }

    // Provision Firms if provided
    if (Array.isArray(req.body.firms)) {
      for (const f of req.body.firms) {
        if (f.code && f.name) {
          await prisma.firm.create({
            data: {
              tenantId: tenant.id,
              code: f.code.toUpperCase().trim(),
              name: f.name.trim(),
              panNumber: f.panNumber || null,
              gstin: f.gstin || null
            }
          }).catch(() => null);
        }
      }
    }

    // Provision Brands if provided
    if (Array.isArray(req.body.brands)) {
      for (const b of req.body.brands) {
        if (b.code && b.name) {
          await prisma.brand.create({
            data: {
              tenantId: tenant.id,
              code: b.code.toUpperCase().trim(),
              name: b.name.trim(),
              description: b.description || null
            }
          }).catch(() => null);
        }
      }
    }

    // Provision Branches if provided
    if (Array.isArray(req.body.branches)) {
      for (const br of req.body.branches) {
        if (br.code && br.name) {
          let firm = null;
          if (br.firmCode) {
            firm = await prisma.firm.findFirst({ where: { tenantId: tenant.id, code: br.firmCode.toUpperCase().trim() } });
          }
          if (!firm) {
            firm = await prisma.firm.findFirst({ where: { tenantId: tenant.id } });
          }
          if (!firm) {
            firm = await prisma.firm.create({
              data: {
                tenantId: tenant.id,
                code: `${tenant.code}_MAIN`,
                name: `${tenant.name} Main Firm`
              }
            });
          }

          await prisma.branch.create({
            data: {
              tenantId: tenant.id,
              firmId: firm.id,
              code: br.code.toUpperCase().trim(),
              name: br.name.trim(),
              city: br.city || city || 'Hubballi',
              state: br.state || state || 'Karnataka',
              outletType: br.outletType || br.type || '3S_FACILITY',
              active: true
            }
          }).catch((err) => console.error('[BRANCH_CREATE_ERR]', err));
        }
      }
    }

    // Seed Standard 3S Business Units
    const standardUnits = [
      { code: 'SALES', name: 'New Vehicle Sales', type: '3S_CORE', icon: 'Car' },
      { code: 'SERVICE', name: 'Mechanical Workshop & Service', type: '3S_CORE', icon: 'Wrench' },
      { code: 'SPARES', name: 'Genuine Spares & Parts Depot', type: '3S_CORE', icon: 'Boxes' },
      { code: 'BODYSHOP', name: 'Accidental Repair & Paint Booth', type: 'VALUE_ADDED_SERVICE', icon: 'Paintbrush' },
      { code: 'PDI', name: 'Pre-Delivery Inspection & Fitment', type: 'SUPPORT', icon: 'ClipboardCheck' },
      { code: 'USED_CARS', name: 'Pre-Owned Vehicle Exchange', type: 'VALUE_ADDED_SERVICE', icon: 'RefreshCw' },
      { code: 'ACCESSORIES', name: 'Accessories & Lifestyle Store', type: 'VALUE_ADDED_SERVICE', icon: 'Sparkles' },
      { code: 'INSURANCE_FINANCE', name: 'Insurance & Finance Desk', type: 'SUPPORT', icon: 'ShieldCheck' },
      { code: 'CUSTOMER_RELATIONS', name: 'Customer Experience & CRM', type: 'SUPPORT', icon: 'Users' }
    ];

    for (const u of standardUnits) {
      await prisma.businessUnit.create({
        data: {
          tenantId: tenant.id,
          code: u.code,
          name: u.name,
          type: u.type,
          icon: u.icon,
          isSystem: true,
          isActive: true
        }
      }).catch(() => null);
    }

    // Provision Initial Tenant Administrator if contact email or admin email provided
    const targetAdminEmail = (req.body.adminEmail || effectiveEmail)?.toLowerCase()?.trim();
    if (targetAdminEmail) {
      const existingUser = await prisma.user.findUnique({ where: { email: targetAdminEmail } });
      if (!existingUser) {
        const passwordToHash = req.body.adminPassword || 'Admin@123';
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(passwordToHash, salt);
        const tenantAdminRole = await prisma.role.findFirst({ where: { code: 'TENANT_ADMIN' } });

        let baseUsername = targetAdminEmail.split('@')[0];
        const existingUsername = await prisma.user.findUnique({ where: { username: baseUsername } });
        if (existingUsername) {
          baseUsername = `${baseUsername}_${normalizedCode.toLowerCase()}`;
          const existingUsername2 = await prisma.user.findUnique({ where: { username: baseUsername } });
          if (existingUsername2) {
            baseUsername = `${baseUsername}_${Math.floor(100 + Math.random() * 899)}`;
          }
        }

        const adminUser = await prisma.user.create({
          data: {
            tenantId: tenant.id,
            email: targetAdminEmail,
            username: baseUsername,
            passwordHash,
            firstName: req.body.adminName ? req.body.adminName.split(' ')[0] : (name.split(' ')[0] || 'Dealership'),
            lastName: req.body.adminName ? (req.body.adminName.split(' ').slice(1).join(' ') || 'Admin') : 'Admin',
            phone: effectivePhone,
            status: 'ACTIVE'
          }
        });

        if (tenantAdminRole) {
          await prisma.userRoleAssignment.create({
            data: {
              userId: adminUser.id,
              roleId: tenantAdminRole.id,
              tenantId: tenant.id,
              scopeType: 'TENANT'
            }
          });
        }
      }
    }

    // Propagate canonical tenant identity to subscribed applications
    await propagateTenantSync({
      id: tenant.id,
      code: tenant.code,
      name: tenant.name,
      legalName: tenant.legalName,
      status: tenant.status,
      contactEmail: effectiveEmail,
      contactPhone: effectivePhone,
      address: addressLine1 || ''
    });

    // Log in audit trail
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: req.userId || null,
        action: 'TENANT_CREATED',
        entityType: 'Tenant',
        entityId: tenant.id,
        newValue: { code: tenant.code, name: tenant.name, tier: tenant.subscriptionTier }
      }
    });

    res.status(201).json({ success: true, data: tenant });
  } catch (error) {
    next(error);
  }
}

export async function updateTenant(req, res, next) {
  try {
    const { id } = req.params;
    if (!req.isPlatformAdmin && req.tenantId !== id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Unauthorized tenant modification.' }
      });
    }

    const existing = await prisma.tenant.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Tenant not found.' } });
    }

    const {
      name, legalName, primaryContact, primaryEmail, primaryPhone,
      addressLine1, addressLine2, city, state, pincode, settings
    } = req.body;

    const updated = await prisma.tenant.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        legalName: legalName !== undefined ? legalName.trim() : undefined,
        primaryContact,
        primaryEmail,
        primaryPhone,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        settings: settings !== undefined ? settings : undefined
      }
    });

    await prisma.auditLog.create({
      data: {
        tenantId: id,
        userId: req.userId || null,
        action: 'TENANT_UPDATED',
        entityType: 'Tenant',
        entityId: id,
        oldValue: { name: existing.name, legalName: existing.legalName },
        newValue: { name: updated.name, legalName: updated.legalName }
      }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function updateTenantStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'SUSPENDED', 'INACTIVE', 'TRIAL'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Invalid tenant status. Allowed: ACTIVE, SUSPENDED, INACTIVE, TRIAL' }
      });
    }

    const existing = await prisma.tenant.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Tenant not found.' } });
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data: { status }
    });

    await prisma.auditLog.create({
      data: {
        tenantId: id,
        userId: req.userId || null,
        action: 'TENANT_STATUS_UPDATED',
        entityType: 'Tenant',
        entityId: id,
        oldValue: { status: existing.status },
        newValue: { status: updated.status }
      }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

/**
 * Internal Service Endpoint: Get Canonical Tenant by ID or Code
 */
export async function getInternalTenant(req, res, next) {
  try {
    const isInternal = req.authMethod === 'INTERNAL_SERVICE';
    const isPlatformAdmin = Boolean(req.isPlatformAdmin || req.user?.role === 'PLATFORM_ADMIN');
    if (!isInternal && !isPlatformAdmin) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access Denied: Internal service authentication or Platform Administrator privileges required.' }
      });
    }

    const { id } = req.params;
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { id },
          { code: id.toUpperCase() }
        ]
      },
      include: {
        firms: true,
        brands: true,
        branches: true,
        tenantApplications: { include: { application: true } }
      }
    });

    if (!tenant) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Tenant not found.' } });
    }

    res.json({ success: true, data: tenant });
  } catch (error) {
    next(error);
  }
}

/**
 * Internal Service Endpoint: Verify application subscription for a tenant
 */
export async function getInternalTenantSubscription(req, res, next) {
  try {
    const isInternal = req.authMethod === 'INTERNAL_SERVICE';
    const isPlatformAdmin = Boolean(req.isPlatformAdmin || req.user?.role === 'PLATFORM_ADMIN');
    if (!isInternal && !isPlatformAdmin) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access Denied: Internal service authentication or Platform Administrator privileges required.' }
      });
    }

    const { id } = req.params;
    const { appKey } = req.query;
    if (!appKey) {
      return res.status(400).json({ success: false, error: { message: 'appKey parameter is required.' } });
    }

    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { id },
          { code: id.toUpperCase() }
        ]
      }
    });

    if (!tenant) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Tenant not found.' } });
    }

    const targetKey = appKey.toLowerCase().trim();
    const app = await prisma.application.findFirst({
      where: {
        OR: [
          { appKey: { equals: targetKey, mode: 'insensitive' } },
          { code: { equals: targetKey, mode: 'insensitive' } }
        ]
      }
    });

    if (!app) {
      return res.status(404).json({ success: false, error: { code: 'APP_NOT_FOUND', message: `Application '${appKey}' not found.` } });
    }

    const subscription = await prisma.tenantApplication.findUnique({
      where: {
        tenantId_applicationId: {
          tenantId: tenant.id,
          applicationId: app.id
        }
      }
    });

    const isSubscribed = Boolean(subscription && subscription.status === 'ACTIVE' && tenant.status === 'ACTIVE');

    res.json({
      success: true,
      isSubscribed,
      status: subscription ? subscription.status : 'NOT_SUBSCRIBED',
      tenant: {
        id: tenant.id,
        code: tenant.code,
        name: tenant.name,
        legalName: tenant.legalName,
        status: tenant.status
      }
    });
  } catch (error) {
    next(error);
  }
}

