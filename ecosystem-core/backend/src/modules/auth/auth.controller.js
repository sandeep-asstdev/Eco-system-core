import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env.js';
import prisma from '../../config/db.js';

export async function signup(req, res, next) {
  try {
    const {
      name,
      legalName,
      code,
      adminName,
      firstName,
      lastName,
      email,
      phone,
      password,
      subscriptionTier
    } = req.body;

    const trimmedName = name?.trim();
    const cleanEmail = email?.trim()?.toLowerCase();

    if (!trimmedName || !cleanEmail || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dealership group name, admin email, and password are required.'
        }
      });
    }

    const trimmedLegal = (legalName || req.body.legalEntityName || trimmedName).trim();
    let trimmedCode = (code || req.body.tenantCode || '').trim().toUpperCase();
    if (!trimmedCode) {
      trimmedCode = trimmedName.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 16);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid admin email address format.' }
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 6 characters long.' }
      });
    }

    const cleanPhone = phone ? phone.replace(/\D/g, '').slice(0, 10) : null;
    const effectiveTier = subscriptionTier || 'ENTERPRISE';

    let cleanFirst = (firstName || '').trim();
    let cleanLast = (lastName || '').trim();
    if (!cleanFirst && adminName) {
      const parts = adminName.trim().split(/\s+/);
      cleanFirst = parts[0] || 'Admin';
      cleanLast = parts.slice(1).join(' ') || 'User';
    }
    if (!cleanFirst) cleanFirst = 'Admin';
    if (!cleanLast) cleanLast = 'User';

    // Check if user email is already registered
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: `An account with email '${cleanEmail}' already exists. Please sign in instead.`
        }
      });
    }

    // Check tenant code
    let tenant = await prisma.tenant.findUnique({ where: { code: trimmedCode } });
    if (tenant) {
      const adminCount = await prisma.user.count({ where: { tenantId: tenant.id } });
      if (adminCount > 0) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'TENANT_EXISTS',
            message: `Dealership code '${trimmedCode}' is already registered with an existing administrator.`
          }
        });
      }
    } else {
      tenant = await prisma.tenant.create({
        data: {
          code: trimmedCode,
          name: trimmedName,
          legalName: trimmedLegal,
          subscriptionTier: effectiveTier,
          primaryEmail: cleanEmail,
          primaryPhone: cleanPhone,
          country: 'India',
          timezone: 'Asia/Kolkata',
          currency: 'INR'
        }
      });
    }

    // Seed standard 3S Business Units for this tenant
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
      const existingBU = await prisma.businessUnit.findFirst({
        where: { tenantId: tenant.id, code: u.code }
      });
      if (!existingBU) {
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
        });
      }
    }

    // Auto-subscribe to active ecosystem applications
    const activeApps = await prisma.application.findMany({ where: { isActive: true } });
    for (const app of activeApps) {
      const existingSub = await prisma.tenantApplication.findUnique({
        where: { tenantId_applicationId: { tenantId: tenant.id, applicationId: app.id } }
      });
      if (!existingSub) {
        await prisma.tenantApplication.create({
          data: {
            tenantId: tenant.id,
            applicationId: app.id,
            status: 'ACTIVE',
            planName: 'STANDARD'
          }
        });
      }
    }

    // Ensure TENANT_ADMIN role exists
    let tenantAdminRole = await prisma.role.findFirst({ where: { code: 'TENANT_ADMIN' } });
    if (!tenantAdminRole) {
      tenantAdminRole = await prisma.role.create({
        data: {
          code: 'TENANT_ADMIN',
          name: 'Tenant Administrator',
          scopeType: 'TENANT',
          isSystem: true
        }
      });
    }

    // Hash password and create admin user
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: cleanEmail,
        username: cleanEmail.split('@')[0],
        passwordHash,
        firstName: cleanFirst,
        lastName: cleanLast,
        phone: cleanPhone,
        status: 'ACTIVE',
        isPlatformAdmin: false,
        lastLoginAt: new Date()
      }
    });

    // Assign TENANT_ADMIN role
    await prisma.userRoleAssignment.create({
      data: {
        userId: user.id,
        roleId: tenantAdminRole.id,
        tenantId: tenant.id,
        scopeType: 'TENANT'
      }
    });

    // Collect permissions for JWT
    const roleWithPerms = await prisma.role.findUnique({
      where: { id: tenantAdminRole.id },
      include: { rolePermissions: { include: { permission: true } } }
    });
    const permissions = (roleWithPerms?.rolePermissions || [])
      .map(rp => rp.permission?.code)
      .filter(Boolean);

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      tenantId: tenant.id,
      isPlatformAdmin: false,
      roles: ['TENANT_ADMIN'],
      permissions
    };

    const token = jwt.sign(tokenPayload, ENV.JWT_SECRET, { expiresIn: '1d' });
    const refreshToken = jwt.sign({ userId: user.id, type: 'refresh' }, ENV.JWT_SECRET, { expiresIn: '7d' });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        action: 'TENANT_SIGNUP',
        entityType: 'Tenant',
        entityId: tenant.id,
        newValue: {
          tenantCode: tenant.code,
          tenantName: tenant.name,
          adminEmail: user.email,
          tier: tenant.subscriptionTier
        }
      }
    });

    return res.status(201).json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          isPlatformAdmin: false
        },
        tenant,
        memberships: [],
        roles: [{
          roleCode: 'TENANT_ADMIN',
          roleName: 'Tenant Administrator',
          scopeType: 'TENANT'
        }],
        permissions,
        applications: activeApps
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Email and password are required.' }
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        tenant: true,
        memberships: {
          include: { branch: true, department: true }
        },
        userRoleAssignments: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true }
                }
              }
            },
            firm: true,
            brand: true,
            branch: true,
            department: true
          }
        }
      }
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_SUSPENDED', message: 'User account is inactive or suspended.' }
      });
    }

    if (user.tenantId && user.tenant && user.tenant.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: { code: 'TENANT_SUSPENDED', message: `Dealership Group (${user.tenant.name}) is ${user.tenant.status.toLowerCase()}.` }
      });
    }

    // Compile user permissions
    const permissions = new Set();
    user.userRoleAssignments.forEach(ura => {
      ura.role?.rolePermissions?.forEach(rp => {
        if (rp.permission?.code) {
          permissions.add(rp.permission.code);
        }
      });
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      isPlatformAdmin: user.isPlatformAdmin,
      roles: user.userRoleAssignments.map(ura => ura.role?.code),
      permissions: Array.from(permissions)
    };

    const token = jwt.sign(tokenPayload, ENV.JWT_SECRET, { expiresIn: '1d' });
    const refreshToken = jwt.sign({ userId: user.id, type: 'refresh' }, ENV.JWT_SECRET, { expiresIn: '7d' });

    // Fetch tenant applications
    let applications = [];
    if (user.isPlatformAdmin) {
      applications = await prisma.application.findMany({ where: { isActive: true } });
    } else if (user.tenantId) {
      const subscriptions = await prisma.tenantApplication.findMany({
        where: { tenantId: user.tenantId, status: 'ACTIVE' },
        include: { application: true }
      });
      applications = subscriptions.map(s => s.application).filter(a => a.isActive);
    }

    res.json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          isPlatformAdmin: user.isPlatformAdmin
        },
        tenant: user.tenant,
        memberships: user.memberships,
        roles: user.userRoleAssignments.map(ura => ({
          roleCode: ura.role?.code,
          roleName: ura.role?.name,
          scopeType: ura.scopeType,
          firm: ura.firm?.name,
          brand: ura.brand?.name,
          branch: ura.branch?.name,
          department: ura.department?.name
        })),
        permissions: Array.from(permissions),
        applications
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req, res, next) {
  try {
    const token = req.body?.refreshToken || req.headers['x-refresh-token'];
    if (!token) {
      return res.status(400).json({
        success: false,
        error: { code: 'REFRESH_TOKEN_REQUIRED', message: 'refreshToken is required.' }
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, ENV.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_REFRESH_TOKEN', message: 'Session expired or refresh token invalid.' }
      });
    }

    if (decoded.type !== 'refresh' || !decoded.userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN_TYPE', message: 'Not a valid refresh token.' }
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        tenant: true,
        userRoleAssignments: {
          include: {
            role: {
              include: {
                rolePermissions: { include: { permission: true } }
              }
            }
          }
        }
      }
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        error: { code: 'ACCOUNT_INACTIVE', message: 'User account is inactive or not found.' }
      });
    }

    if (user.tenantId && user.tenant && user.tenant.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: { code: 'TENANT_SUSPENDED', message: 'Dealership group is inactive or suspended.' }
      });
    }

    const permissions = new Set();
    user.userRoleAssignments.forEach(ura => {
      ura.role?.rolePermissions?.forEach(rp => {
        if (rp.permission?.code) permissions.add(rp.permission.code);
      });
    });

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      isPlatformAdmin: user.isPlatformAdmin,
      roles: user.userRoleAssignments.map(ura => ura.role?.code),
      permissions: Array.from(permissions)
    };

    const newAccessToken = jwt.sign(tokenPayload, ENV.JWT_SECRET, { expiresIn: '1d' });
    const newRefreshToken = jwt.sign({ userId: user.id, type: 'refresh' }, ENV.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      data: {
        token: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = req.user;

    let applications = [];
    if (user.isPlatformAdmin) {
      applications = await prisma.application.findMany({ where: { isActive: true } });
    } else if (user.tenantId) {
      const subscriptions = await prisma.tenantApplication.findMany({
        where: { tenantId: user.tenantId, status: 'ACTIVE' },
        include: { application: true }
      });
      applications = subscriptions.map(s => s.application).filter(a => a.isActive);
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          isPlatformAdmin: user.isPlatformAdmin
        },
        tenant: user.tenant,
        memberships: user.memberships,
        roles: user.userRoleAssignments.map(ura => ({
          roleCode: ura.role?.code,
          roleName: ura.role?.name,
          scopeType: ura.scopeType,
          firm: ura.firm?.name,
          brand: ura.brand?.name,
          branch: ura.branch?.name,
          department: ura.department?.name
        })),
        permissions: req.permissions,
        applications
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function introspectToken(req, res, next) {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token required.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, ENV.JWT_SECRET);
    } catch (err) {
      return res.status(200).json({ active: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { tenant: true }
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(200).json({ active: false });
    }

    res.json({
      active: true,
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      isPlatformAdmin: user.isPlatformAdmin,
      roles: decoded.roles,
      permissions: decoded.permissions,
      exp: decoded.exp
    });
  } catch (error) {
    next(error);
  }
}
