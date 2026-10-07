import bcrypt from 'bcryptjs';
import prisma from '../../config/db.js';
import { logAudit } from '../../utils/audit.js';

// ================= TENANTS =================
export async function getTenants(req, res, next) {
  try {
    const where = req.user.role === 'PLATFORM_ADMIN' ? {} : { id: req.tenantId };
    const tenants = await prisma.tenant.findMany({
      where,
      include: {
        _count: {
          select: { branches: true, users: true, maintenanceRequests: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: tenants });
  } catch (error) {
    next(error);
  }
}

export async function createTenant(req, res, next) {
  return res.status(403).json({
    success: false,
    error: {
      code: 'TENANT_ONBOARDING_CENTRALIZED',
      message: 'Independent dealership onboarding in MAINTLY is disabled. Dealership onboarding must be completed through Ecosystem Core.'
    }
  });
}

export async function syncTenantFromEcosystem(req, res, next) {
  try {
    const isInternal = req.authMethod === 'INTERNAL_SERVICE';
    const isPlatformAdmin = Boolean(req.user?.role === 'PLATFORM_ADMIN' || req.isPlatformAdmin);
    if (!isInternal && !isPlatformAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Action requires Internal Service authentication or Platform Administrator privileges.'
      });
    }

    const { id, code, name, slug, status } = req.body;
    if (!id || !code) {
      return res.status(400).json({ success: false, message: 'Canonical tenant id and code are required.' });
    }
    const normalizedCode = code.toUpperCase().trim();
    const effectiveSlug = (slug || normalizedCode.toLowerCase()).trim();

    let tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { centralTenantId: id },
          { code: normalizedCode },
          { slug: effectiveSlug }
        ]
      }
    });

    if (tenant) {
      tenant = await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          centralTenantId: id,
          name: name || tenant.name,
          code: normalizedCode,
          slug: effectiveSlug,
          status: status || tenant.status || 'ACTIVE'
        }
      });
    } else {
      tenant = await prisma.tenant.create({
        data: {
          centralTenantId: id,
          name: name || normalizedCode,
          code: normalizedCode,
          slug: effectiveSlug,
          status: status || 'ACTIVE',
          requestPrefix: `${normalizedCode.slice(0, 4)}-MAIN`,
          timezone: 'Asia/Kolkata',
          graceHours: 12.0,
          targetHoursHigh: 24.0,
          targetHoursMedium: 48.0,
          targetHoursLow: 72.0,
          approvalRequired: true
        }
      });
    }

    res.json({ success: true, data: tenant, message: 'Canonical tenant synchronized successfully in MAINTLY.' });
  } catch (error) {
    next(error);
  }
}

export async function getTenantSettings(req, res, next) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.tenantId }
    });
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found.' });
    }
    res.json({ success: true, data: tenant });
  } catch (error) {
    next(error);
  }
}

export async function updateTenantSettings(req, res, next) {
  try {
    const {
      name, timezone, requestPrefix, graceHours,
      targetHoursHigh, targetHoursMedium, targetHoursLow,
      approvalRequired, logoUrl, workflowConfig
    } = req.body;

    const updated = await prisma.tenant.update({
      where: { id: req.tenantId },
      data: {
        ...(name ? { name } : {}),
        ...(timezone ? { timezone } : {}),
        ...(requestPrefix ? { requestPrefix: requestPrefix.toUpperCase().trim() } : {}),
        ...(graceHours !== undefined ? { graceHours: parseFloat(graceHours) } : {}),
        ...(targetHoursHigh !== undefined ? { targetHoursHigh: parseFloat(targetHoursHigh) } : {}),
        ...(targetHoursMedium !== undefined ? { targetHoursMedium: parseFloat(targetHoursMedium) } : {}),
        ...(targetHoursLow !== undefined ? { targetHoursLow: parseFloat(targetHoursLow) } : {}),
        ...(approvalRequired !== undefined ? { approvalRequired: Boolean(approvalRequired) } : {}),
        ...(logoUrl !== undefined ? { logoUrl } : {}),
        ...(workflowConfig !== undefined ? { workflowConfig } : {})
      }
    });

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'UPDATE_TENANT_SETTINGS',
      entity: 'Tenant',
      entityId: req.tenantId,
      details: req.body,
      req
    });

    res.json({ success: true, message: 'Tenant settings updated successfully.', data: updated });
  } catch (error) {
    next(error);
  }
}

// ================= BRANDS =================
export async function getBrands(req, res, next) {
  try {
    const brands = await prisma.brand.findMany({
      where: { tenantId: req.tenantId, isActive: true },
      include: { _count: { select: { branches: true } } },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: brands });
  } catch (error) {
    next(error);
  }
}

export async function createBrand(req, res, next) {
  try {
    const { name, code, description } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Brand name and code are required.' });
    }

    const brand = await prisma.brand.create({
      data: {
        tenantId: req.tenantId,
        name,
        code: code.toUpperCase().trim(),
        description
      }
    });

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'CREATE_BRAND',
      entity: 'Brand',
      entityId: brand.id,
      details: { name, code },
      req
    });

    res.status(201).json({ success: true, data: brand });
  } catch (error) {
    next(error);
  }
}

// ================= BRANCHES =================
export async function getBranches(req, res, next) {
  try {
    const { brandId } = req.query;
    const where = {
      tenantId: req.tenantId,
      isActive: true,
      ...(brandId ? { brandId } : {})
    };

    if (req.user.role !== 'PLATFORM_ADMIN' && req.user.role !== 'TENANT_ADMIN') {
      where.id = { in: req.branchIds };
    }

    const branches = await prisma.branch.findMany({
      where,
      include: {
        brand: { select: { id: true, name: true, code: true } },
        _count: { select: { requests: true, branchAreas: true } }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ success: true, data: branches });
  } catch (error) {
    next(error);
  }
}

export async function createBranch(req, res, next) {
  try {
    const { brandId, name, code, address, city, state, pincode } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Branch name and code are required.' });
    }

    const branch = await prisma.branch.create({
      data: {
        tenantId: req.tenantId,
        brandId: brandId || null,
        name,
        code: code.toUpperCase().trim(),
        address,
        city,
        state,
        pincode
      }
    });

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'CREATE_BRANCH',
      entity: 'Branch',
      entityId: branch.id,
      details: { name, code, brandId },
      req
    });

    res.status(201).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
}

// ================= BRANCH-DEPARTMENT MAPPINGS =================
export async function getBranchDepartments(req, res, next) {
  try {
    const { branchId } = req.params;
    
    // Find explicitly mapped departments
    const mappings = await prisma.branchDepartment.findMany({
      where: { branchId, tenantId: req.tenantId },
      include: { department: true }
    });

    if (mappings.length > 0) {
      const departments = mappings.map(m => m.department).filter(d => d.isActive);
      return res.json({ success: true, data: departments });
    }

    // Fallback: If no explicit mapping defined for branch, return all tenant departments
    const allDepts = await prisma.department.findMany({
      where: { tenantId: req.tenantId, isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: allDepts });
  } catch (error) {
    next(error);
  }
}

export async function setBranchDepartments(req, res, next) {
  try {
    const { branchId } = req.params;
    const { departmentIds } = req.body; // Array of department IDs

    if (!Array.isArray(departmentIds)) {
      return res.status(400).json({ success: false, message: 'departmentIds must be an array.' });
    }

    await prisma.$transaction(async (tx) => {
      // Remove current mappings
      await tx.branchDepartment.deleteMany({
        where: { branchId, tenantId: req.tenantId }
      });

      // Insert new mappings
      if (departmentIds.length > 0) {
        await tx.branchDepartment.createMany({
          data: departmentIds.map(deptId => ({
            tenantId: req.tenantId,
            branchId,
            departmentId: deptId
          }))
        });
      }
    });

    res.json({ success: true, message: 'Branch department mappings updated successfully.' });
  } catch (error) {
    next(error);
  }
}

// ================= BRANCH AREAS =================
export async function getBranchAreas(req, res, next) {
  try {
    const { branchId } = req.params;
    const areas = await prisma.branchArea.findMany({
      where: { branchId, tenantId: req.tenantId, isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: areas });
  } catch (error) {
    next(error);
  }
}

export async function createBranchArea(req, res, next) {
  try {
    const { branchId } = req.params;
    const { name, code, description } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Area name and code are required.' });
    }

    const area = await prisma.branchArea.create({
      data: {
        tenantId: req.tenantId,
        branchId,
        name: name.trim(),
        code: code.toUpperCase().trim(),
        description: description || null
      }
    });

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'CREATE_BRANCH_AREA',
      entity: 'BranchArea',
      entityId: area.id,
      details: { branchId, name, code },
      req
    });

    res.status(201).json({ success: true, data: area });
  } catch (error) {
    next(error);
  }
}

// ================= DEPARTMENTS =================
export async function getDepartments(req, res, next) {
  try {
    const departments = await prisma.department.findMany({
      where: { tenantId: req.tenantId, isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
}

export async function createDepartment(req, res, next) {
  try {
    const { name, code, description } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Department name and code are required.' });
    }

    const department = await prisma.department.create({
      data: {
        tenantId: req.tenantId,
        name,
        code: code.toUpperCase().trim(),
        description
      }
    });

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'CREATE_DEPARTMENT',
      entity: 'Department',
      entityId: department.id,
      details: { name, code },
      req
    });

    res.status(201).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
}

// ================= USERS =================
export async function getUsers(req, res, next) {
  try {
    const { role, branchId, search } = req.query;
    const where = {
      tenantId: req.tenantId,
      ...(role ? { role } : {}),
      ...(search ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      } : {})
    };

    if (branchId) {
      where.branchAccesses = { some: { branchId } };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        branchAccesses: {
          include: {
            branch: { select: { id: true, name: true, code: true } }
          }
        }
      },
      orderBy: { firstName: 'asc' }
    });

    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
}

export async function createUser(req, res, next) {
  try {
    const { email, password, firstName, lastName, phone, role = 'EMPLOYEE', branchIds = [] } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'Email, password, first name, and last name are required.' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          tenantId: req.tenantId,
          email,
          passwordHash,
          firstName,
          lastName,
          phone,
          role,
          status: 'ACTIVE'
        }
      });

      if (branchIds.length > 0) {
        await tx.userBranchAccess.createMany({
          data: branchIds.map((bId, idx) => ({
            userId: user.id,
            branchId: bId,
            isPrimary: idx === 0
          }))
        });
      }

      return user;
    });

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'CREATE_USER',
      entity: 'User',
      entityId: newUser.id,
      details: { email, role, firstName, lastName },
      req
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUserRoleAndStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { role, status, branchIds } = req.body;

    const updated = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: {
          ...(role ? { role } : {}),
          ...(status ? { status } : {})
        }
      });

      if (branchIds && Array.isArray(branchIds)) {
        await tx.userBranchAccess.deleteMany({ where: { userId: id } });
        if (branchIds.length > 0) {
          await tx.userBranchAccess.createMany({
            data: branchIds.map((bId, idx) => ({
              userId: id,
              branchId: bId,
              isPrimary: idx === 0
            }))
          });
        }
      }

      return user;
    });

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'UPDATE_USER_PERMISSIONS',
      entity: 'User',
      entityId: id,
      details: { role, status },
      req
    });

    res.json({ success: true, message: 'User updated successfully.', data: updated });
  } catch (error) {
    next(error);
  }
}
