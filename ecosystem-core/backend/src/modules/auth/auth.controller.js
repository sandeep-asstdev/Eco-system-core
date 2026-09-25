import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env.js';
import prisma from '../../config/db.js';

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
