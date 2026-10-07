import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/db.js';
import { ENV } from '../../config/env.js';
import { logAudit } from '../../utils/audit.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        tenant: true,
        branchAccesses: {
          include: {
            branch: {
              select: { id: true, name: true, code: true, brandId: true }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact your system administrator.'
      });
    }

    if (user.tenant && user.tenant.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Your organization account is inactive or suspended.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const tokenPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role
    };

    const token = jwt.sign(tokenPayload, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_EXPIRES_IN
    });

    await logAudit({
      tenantId: user.tenantId || 'PLATFORM',
      userId: user.id,
      action: 'LOGIN',
      entity: 'User',
      entityId: user.id,
      details: { email: user.email, role: user.role },
      req
    });

    let branches = [];
    if (user.tenantId) {
      if (['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER'].includes(user.role) || !user.branchAccesses || user.branchAccesses.length === 0) {
        branches = await prisma.branch.findMany({
          where: { tenantId: user.tenantId },
          select: { id: true, name: true, code: true }
        });
      } else {
        branches = user.branchAccesses.map(b => ({
          id: b.branch.id,
          name: b.branch.name,
          code: b.branch.code,
          isPrimary: b.isPrimary
        }));
      }
    }

    const sanitizedUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      role: user.role,
      phone: user.phone,
      tenantId: user.tenantId,
      tenant: user.tenant ? {
        id: user.tenant.id,
        name: user.tenant.name,
        code: user.tenant.code,
        slug: user.tenant.slug
      } : null,
      branches: branches.map((b, idx) => ({
        id: b.id,
        name: b.name,
        code: b.code,
        isPrimary: b.isPrimary !== undefined ? b.isPrimary : idx === 0
      }))
    };

    return res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: sanitizedUser
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = req.user;

    let branches = [];
    if (user.tenantId) {
      if (['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER'].includes(user.role)) {
        branches = await prisma.branch.findMany({
          where: { tenantId: user.tenantId },
          select: { id: true, name: true, code: true }
        });
      } else if (req.branchIds && req.branchIds.length > 0) {
        branches = await prisma.branch.findMany({
          where: { id: { in: req.branchIds } },
          select: { id: true, name: true, code: true }
        });
      } else {
        branches = await prisma.branch.findMany({
          where: { tenantId: user.tenantId },
          select: { id: true, name: true, code: true }
        });
      }
    }

    const sanitizedUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      role: user.role,
      phone: user.phone,
      tenantId: user.tenantId,
      tenant: user.tenant ? {
        id: user.tenant.id,
        name: user.tenant.name,
        code: user.tenant.code,
        slug: user.tenant.slug
      } : null,
      branches: branches.map((b, idx) => ({
        id: b.id,
        name: b.name,
        code: b.code,
        isPrimary: idx === 0
      }))
    };

    return res.json({
      success: true,
      data: {
        ...sanitizedUser,
        user: sanitizedUser
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, req.user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newHash }
    });

    await logAudit({
      tenantId: req.user.tenantId || 'PLATFORM',
      userId: req.user.id,
      action: 'CHANGE_PASSWORD',
      entity: 'User',
      entityId: req.user.id,
      req
    });

    return res.json({
      success: true,
      message: 'Password updated successfully.'
    });
  } catch (error) {
    next(error);
  }
}
