import bcrypt from 'bcryptjs';
import prisma from '../../config/db.js';

// ==========================================
// CENTRAL USER DIRECTORY
// ==========================================

export async function getUsers(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const { branchId, role, status, search } = req.query;
    const where = {};
    if (!req.isPlatformAdmin) {
      where.tenantId = req.tenantId;
    }
    if (status) where.status = status;

    if (branchId) {
      where.memberships = { some: { branchId } };
    }

    if (role) {
      where.userRoleAssignments = { some: { role: { code: role } } };
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          status: true,
          isPlatformAdmin: true,
          lastLoginAt: true,
          createdAt: true,
          memberships: {
            include: {
              branch: { select: { id: true, name: true, code: true, city: true } },
              department: { select: { id: true, name: true, code: true } }
            }
          },
          userRoleAssignments: {
            include: {
              role: { select: { id: true, code: true, name: true } },
              firm: { select: { id: true, name: true, code: true } },
              brand: { select: { id: true, name: true, code: true } },
              branch: { select: { id: true, name: true, code: true } },
              department: { select: { id: true, name: true, code: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    res.json({
      success: true,
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 }
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    const where = { id };
    if (!req.isPlatformAdmin) {
      where.tenantId = req.tenantId;
    }

    const user = await prisma.user.findFirst({
      where,
      include: {
        tenant: true,
        memberships: {
          include: { branch: true, department: true }
        },
        userRoleAssignments: {
          include: {
            role: {
              include: {
                rolePermissions: { include: { permission: true } }
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

    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found.' } });
    }

    // Compile effective permissions
    const permissions = new Set();
    user.userRoleAssignments.forEach(ura => {
      ura.role?.rolePermissions?.forEach(rp => {
        if (rp.permission?.code) permissions.add(rp.permission.code);
      });
    });

    res.json({
      success: true,
      data: {
        ...user,
        passwordHash: undefined,
        permissions: Array.from(permissions)
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function createUser(req, res, next) {
  try {
    const {
      email, password, firstName, lastName, phone, branchId, departmentId, designation, employeeCode, roleCode, scopeType
    } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'email, password, firstName, and lastName are required.' }
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid email address format.' }
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: `User with email '${normalizedEmail}' already exists.` }
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const tenantId = req.isPlatformAdmin && req.body.tenantId ? req.body.tenantId : req.tenantId;

    const user = await prisma.user.create({
      data: {
        tenantId,
        email: normalizedEmail,
        username: normalizedEmail.split('@')[0],
        passwordHash,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone,
        status: 'ACTIVE'
      }
    });

    // Add branch membership if provided
    if (branchId) {
      await prisma.organizationMembership.create({
        data: {
          tenantId,
          userId: user.id,
          branchId,
          departmentId: departmentId || null,
          designation,
          employeeCode,
          isPrimary: true
        }
      });
    }

    // Assign initial role if provided
    if (roleCode) {
      const role = await prisma.role.findFirst({
        where: {
          code: roleCode,
          OR: [{ tenantId }, { tenantId: null }]
        }
      });

      if (role) {
        await prisma.userRoleAssignment.create({
          data: {
            userId: user.id,
            roleId: role.id,
            tenantId,
            branchId: branchId || null,
            departmentId: departmentId || null,
            scopeType: scopeType || 'BRANCH',
            assignedBy: req.userId || null
          }
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: req.userId || null,
        action: 'USER_CREATED',
        entityType: 'User',
        entityId: user.id,
        newValue: { email: user.email, firstName: user.firstName, lastName: user.lastName, branchId }
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Invalid status. Allowed: ACTIVE, INACTIVE, SUSPENDED' }
      });
    }

    const user = await prisma.user.findFirst({
      where: { id, tenantId: req.isPlatformAdmin ? undefined : req.tenantId }
    });
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found.' } });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status }
    });

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: req.userId || null,
        action: 'USER_STATUS_UPDATED',
        entityType: 'User',
        entityId: id,
        oldValue: { status: user.status },
        newValue: { status: updated.status }
      }
    });

    res.json({ success: true, data: { id: updated.id, email: updated.email, status: updated.status } });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// MULTI-BRANCH ORGANIZATION MEMBERSHIPS
// ==========================================

export async function addMembership(req, res, next) {
  try {
    const { userId } = req.params;
    const { branchId, departmentId, isPrimary, designation, employeeCode } = req.body;

    if (!branchId) {
      return res.status(400).json({ success: false, error: { message: 'branchId is required.' } });
    }

    // Verify branch belongs to tenant
    const branch = await prisma.branch.findFirst({ where: { id: branchId, tenantId: req.tenantId } });
    if (!branch) {
      return res.status(404).json({ success: false, error: { message: 'Branch not found under your dealership.' } });
    }

    // If setting as primary, demote any existing primary membership
    if (isPrimary) {
      await prisma.organizationMembership.updateMany({
        where: { userId },
        data: { isPrimary: false }
      });
    }

    const membership = await prisma.organizationMembership.create({
      data: {
        tenantId: req.tenantId,
        userId,
        branchId,
        departmentId: departmentId || null,
        isPrimary: Boolean(isPrimary),
        designation,
        employeeCode
      },
      include: { branch: true, department: true }
    });

    await prisma.auditLog.create({
      data: {
        tenantId: req.tenantId,
        userId: req.userId || null,
        action: 'USER_MEMBERSHIP_ADDED',
        entityType: 'OrganizationMembership',
        entityId: membership.id,
        newValue: { userId, branch: branch.name, isPrimary: membership.isPrimary }
      }
    });

    res.status(201).json({ success: true, data: membership });
  } catch (error) {
    next(error);
  }
}

export async function removeMembership(req, res, next) {
  try {
    const { userId, membershipId } = req.params;
    const membership = await prisma.organizationMembership.findFirst({
      where: { id: membershipId, userId, tenantId: req.tenantId }
    });

    if (!membership) {
      return res.status(404).json({ success: false, error: { message: 'Membership not found.' } });
    }

    await prisma.organizationMembership.delete({ where: { id: membershipId } });

    await prisma.auditLog.create({
      data: {
        tenantId: req.tenantId,
        userId: req.userId || null,
        action: 'USER_MEMBERSHIP_REMOVED',
        entityType: 'OrganizationMembership',
        entityId: membershipId,
        oldValue: { userId, branchId: membership.branchId }
      }
    });

    res.json({ success: true, message: 'Membership removed successfully.' });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// SCOPED ROLE ASSIGNMENTS & RBAC
// ==========================================

export async function assignUserRole(req, res, next) {
  try {
    const { userId } = req.params;
    const { roleId, firmId, brandId, branchId, departmentId, scopeType } = req.body;

    if (!roleId) {
      return res.status(400).json({ success: false, error: { message: 'roleId is required.' } });
    }

    const role = await prisma.role.findFirst({
      where: {
        id: roleId,
        OR: [{ tenantId: req.tenantId }, { tenantId: null }]
      }
    });

    if (!role) {
      return res.status(404).json({ success: false, error: { message: 'Role not found.' } });
    }

    const assignment = await prisma.userRoleAssignment.create({
      data: {
        userId,
        roleId,
        tenantId: req.tenantId,
        firmId: firmId || null,
        brandId: brandId || null,
        branchId: branchId || null,
        departmentId: departmentId || null,
        scopeType: scopeType || role.scopeType,
        assignedBy: req.userId || null
      },
      include: { role: true, firm: true, brand: true, branch: true, department: true }
    });

    await prisma.auditLog.create({
      data: {
        tenantId: req.tenantId,
        userId: req.userId || null,
        action: 'USER_ROLE_ASSIGNED',
        entityType: 'UserRoleAssignment',
        entityId: assignment.id,
        newValue: { userId, role: role.code, scopeType: assignment.scopeType, branchId }
      }
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
}

export async function revokeUserRole(req, res, next) {
  try {
    const { userId, assignmentId } = req.params;
    const assignment = await prisma.userRoleAssignment.findFirst({
      where: { id: assignmentId, userId, tenantId: req.tenantId },
      include: { role: true }
    });

    if (!assignment) {
      return res.status(404).json({ success: false, error: { message: 'Role assignment not found.' } });
    }

    await prisma.userRoleAssignment.delete({ where: { id: assignmentId } });

    await prisma.auditLog.create({
      data: {
        tenantId: req.tenantId,
        userId: req.userId || null,
        action: 'USER_ROLE_REVOKED',
        entityType: 'UserRoleAssignment',
        entityId: assignmentId,
        oldValue: { userId, role: assignment.role.code }
      }
    });

    res.json({ success: true, message: 'Role revoked successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function getRoles(req, res, next) {
  try {
    const roles = await prisma.role.findMany({
      where: {
        OR: [
          { tenantId: req.tenantId },
          { tenantId: null }
        ]
      },
      include: {
        rolePermissions: { include: { permission: true } }
      },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: roles });
  } catch (error) {
    next(error);
  }
}

export async function getPermissions(req, res, next) {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ domain: 'asc' }, { code: 'asc' }]
    });
    res.json({ success: true, data: permissions });
  } catch (error) {
    next(error);
  }
}
