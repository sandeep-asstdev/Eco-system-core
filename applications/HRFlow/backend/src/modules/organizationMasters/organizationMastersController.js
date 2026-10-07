const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/apiResponse');
const { logAudit } = require('../../middleware/audit');

/**
 * =========================================================================
 * EMPLOYEE LEVELS CONTROLLERS
 * =========================================================================
 */

/**
 * Get all employee levels for the authenticated tenant
 */
const getLevels = async (req, res) => {
  try {
    const { role, tenantId: userTenantId } = req.user;
    const { isActive, tenantId: queryTenantId } = req.query;

    const targetTenantId = role === 'PLATFORM_ADMIN' ? (queryTenantId || userTenantId) : userTenantId;
    if (!targetTenantId) {
      return errorResponse(res, 'Tenant context is required', 400);
    }

    const where = { tenantId: targetTenantId };
    if (isActive !== undefined) {
      where.isActive = isActive === 'true' || isActive === true;
    }

    const levels = await prisma.employeeLevel.findMany({
      where,
      include: {
        _count: {
          select: {
            designations: true,
            employees: true,
          },
        },
      },
      orderBy: { levelNumber: 'asc' },
    });

    return successResponse(res, levels);
  } catch (err) {
    console.error('Error fetching employee levels:', err);
    return errorResponse(res, 'Failed to fetch employee levels', 500);
  }
};

/**
 * Get single employee level by ID with its designations
 */
const getLevelById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, tenantId: userTenantId } = req.user;

    const level = await prisma.employeeLevel.findUnique({
      where: { id },
      include: {
        designations: {
          orderBy: { name: 'asc' },
          include: {
            _count: { select: { employees: true } },
          },
        },
        _count: {
          select: { employees: true, designations: true },
        },
      },
    });

    if (!level) {
      return errorResponse(res, 'Employee level not found', 404);
    }

    if (role !== 'PLATFORM_ADMIN' && level.tenantId !== userTenantId) {
      return errorResponse(res, 'Access denied: Level belongs to another dealer organization', 403);
    }

    return successResponse(res, level);
  } catch (err) {
    console.error('Error fetching employee level:', err);
    return errorResponse(res, 'Failed to fetch employee level', 500);
  }
};

/**
 * Create a new employee level
 */
const createLevel = async (req, res) => {
  try {
    const { role, tenantId: userTenantId } = req.user;
    const { levelNumber, name, description, tenantId: bodyTenantId } = req.body;

    const targetTenantId = role === 'PLATFORM_ADMIN' ? (bodyTenantId || userTenantId) : userTenantId;
    if (!targetTenantId) {
      return errorResponse(res, 'Tenant context is required', 400);
    }

    if (levelNumber === undefined || !name) {
      return errorResponse(res, 'Level number and category name are required', 400);
    }

    const parsedLevelNumber = parseInt(levelNumber, 10);
    if (isNaN(parsedLevelNumber) || parsedLevelNumber < 1) {
      return errorResponse(res, 'Level number must be a positive integer', 400);
    }

    // Check unique constraint per tenant
    const existing = await prisma.employeeLevel.findUnique({
      where: {
        tenantId_levelNumber: {
          tenantId: targetTenantId,
          levelNumber: parsedLevelNumber,
        },
      },
    });

    if (existing) {
      return errorResponse(
        res,
        `Employee Level ${parsedLevelNumber} already exists in this dealership`,
        409
      );
    }

    const level = await prisma.employeeLevel.create({
      data: {
        tenantId: targetTenantId,
        levelNumber: parsedLevelNumber,
        name: name.trim(),
        description: description ? description.trim() : null,
        isActive: true,
      },
    });

    await logAudit({
      tenantId: targetTenantId,
      userId: req.user.id,
      action: 'LEVEL_CREATED',
      module: 'ORGANIZATION_MASTER',
      recordId: level.id,
      newValue: JSON.stringify({ levelNumber: parsedLevelNumber, name: level.name }),
      ipAddress: req.ip,
    });

    return successResponse(res, level, `Level ${parsedLevelNumber} created successfully`, 201);
  } catch (err) {
    console.error('Error creating employee level:', err);
    return errorResponse(res, 'Failed to create employee level', 500);
  }
};

/**
 * Update an employee level
 */
const updateLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, tenantId: userTenantId } = req.user;
    const { name, description, isActive } = req.body;

    const current = await prisma.employeeLevel.findUnique({ where: { id } });
    if (!current) {
      return errorResponse(res, 'Employee level not found', 404);
    }

    if (role !== 'PLATFORM_ADMIN' && current.tenantId !== userTenantId) {
      return errorResponse(res, 'Access denied: Level belongs to another dealer organization', 403);
    }

    const updated = await prisma.employeeLevel.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        description: description !== undefined ? (description ? description.trim() : null) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    await logAudit({
      tenantId: current.tenantId,
      userId: req.user.id,
      action: 'LEVEL_UPDATED',
      module: 'ORGANIZATION_MASTER',
      recordId: id,
      previousValue: JSON.stringify({ name: current.name, isActive: current.isActive }),
      newValue: JSON.stringify({ name: updated.name, isActive: updated.isActive }),
      ipAddress: req.ip,
    });

    return successResponse(res, updated, 'Employee level updated successfully');
  } catch (err) {
    console.error('Error updating employee level:', err);
    return errorResponse(res, 'Failed to update employee level', 500);
  }
};

/**
 * =========================================================================
 * DESIGNATION CONTROLLERS
 * =========================================================================
 */

/**
 * Get all designations for the authenticated tenant with filters
 */
const getDesignations = async (req, res) => {
  try {
    const { role, tenantId: userTenantId } = req.user;
    const { levelId, search, isActive, tenantId: queryTenantId } = req.query;

    const targetTenantId = role === 'PLATFORM_ADMIN' ? (queryTenantId || userTenantId) : userTenantId;
    if (!targetTenantId) {
      return errorResponse(res, 'Tenant context is required', 400);
    }

    const where = { tenantId: targetTenantId };

    if (levelId) {
      where.levelId = levelId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true' || isActive === true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const designations = await prisma.designation.findMany({
      where,
      include: {
        level: {
          select: {
            id: true,
            levelNumber: true,
            name: true,
          },
        },
        _count: {
          select: { employees: true },
        },
      },
      orderBy: [
        { level: { levelNumber: 'asc' } },
        { name: 'asc' },
      ],
    });

    return successResponse(res, designations);
  } catch (err) {
    console.error('Error fetching designations:', err);
    return errorResponse(res, 'Failed to fetch designations', 500);
  }
};

/**
 * Get single designation by ID
 */
const getDesignationById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, tenantId: userTenantId } = req.user;

    const designation = await prisma.designation.findUnique({
      where: { id },
      include: {
        level: true,
        _count: { select: { employees: true } },
      },
    });

    if (!designation) {
      return errorResponse(res, 'Designation not found', 404);
    }

    if (role !== 'PLATFORM_ADMIN' && designation.tenantId !== userTenantId) {
      return errorResponse(res, 'Access denied: Designation belongs to another dealer organization', 403);
    }

    return successResponse(res, designation);
  } catch (err) {
    console.error('Error fetching designation:', err);
    return errorResponse(res, 'Failed to fetch designation', 500);
  }
};

/**
 * Create a new designation
 */
const createDesignation = async (req, res) => {
  try {
    const { role, tenantId: userTenantId } = req.user;
    const { levelId, name, code, description, tenantId: bodyTenantId } = req.body;

    const targetTenantId = role === 'PLATFORM_ADMIN' ? (bodyTenantId || userTenantId) : userTenantId;
    if (!targetTenantId) {
      return errorResponse(res, 'Tenant context is required', 400);
    }

    if (!levelId || !name) {
      return errorResponse(res, 'Level selection and designation name are required', 400);
    }

    const trimmedName = name.trim();

    // 1. Verify level exists and belongs to target tenant
    const level = await prisma.employeeLevel.findUnique({ where: { id: levelId } });
    if (!level || level.tenantId !== targetTenantId) {
      return errorResponse(res, 'Selected employee level does not belong to this dealership', 403);
    }

    // 2. Enforce unique designation name per tenant
    const existing = await prisma.designation.findUnique({
      where: {
        tenantId_name: {
          tenantId: targetTenantId,
          name: trimmedName,
        },
      },
    });

    if (existing) {
      return errorResponse(
        res,
        `Designation '${trimmedName}' already exists in this dealership organization`,
        409
      );
    }

    const designation = await prisma.designation.create({
      data: {
        tenantId: targetTenantId,
        levelId,
        name: trimmedName,
        code: code ? code.trim().toUpperCase() : null,
        description: description ? description.trim() : null,
        isActive: true,
      },
      include: {
        level: {
          select: { id: true, levelNumber: true, name: true },
        },
      },
    });

    await logAudit({
      tenantId: targetTenantId,
      userId: req.user.id,
      action: 'DESIGNATION_CREATED',
      module: 'ORGANIZATION_MASTER',
      recordId: designation.id,
      newValue: JSON.stringify({ name: designation.name, levelId, levelNumber: level.levelNumber }),
      ipAddress: req.ip,
    });

    return successResponse(res, designation, `Designation '${trimmedName}' created successfully`, 201);
  } catch (err) {
    console.error('Error creating designation:', err);
    return errorResponse(res, 'Failed to create designation', 500);
  }
};

/**
 * Update an existing designation
 */
const updateDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, tenantId: userTenantId } = req.user;
    const { levelId, name, code, description, isActive } = req.body;

    const current = await prisma.designation.findUnique({ where: { id } });
    if (!current) {
      return errorResponse(res, 'Designation not found', 404);
    }

    if (role !== 'PLATFORM_ADMIN' && current.tenantId !== userTenantId) {
      return errorResponse(res, 'Access denied: Designation belongs to another dealer organization', 403);
    }

    // If levelId changed, verify it belongs to this tenant
    if (levelId && levelId !== current.levelId) {
      const newLevel = await prisma.employeeLevel.findUnique({ where: { id: levelId } });
      if (!newLevel || newLevel.tenantId !== current.tenantId) {
        return errorResponse(res, 'Target level does not belong to this dealer organization', 403);
      }
    }

    // If name changed, check uniqueness within tenant
    if (name && name.trim().toLowerCase() !== current.name.toLowerCase()) {
      const existing = await prisma.designation.findUnique({
        where: {
          tenantId_name: {
            tenantId: current.tenantId,
            name: name.trim(),
          },
        },
      });
      if (existing && existing.id !== id) {
        return errorResponse(res, `Designation '${name.trim()}' already exists in this dealership`, 409);
      }
    }

    const updated = await prisma.designation.update({
      where: { id },
      data: {
        levelId: levelId || undefined,
        name: name !== undefined ? name.trim() : undefined,
        code: code !== undefined ? (code ? code.trim().toUpperCase() : null) : undefined,
        description: description !== undefined ? (description ? description.trim() : null) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
      include: {
        level: {
          select: { id: true, levelNumber: true, name: true },
        },
      },
    });

    const isDeactivation = current.isActive && updated.isActive === false;
    await logAudit({
      tenantId: current.tenantId,
      userId: req.user.id,
      action: isDeactivation ? 'DESIGNATION_DEACTIVATED' : 'DESIGNATION_UPDATED',
      module: 'ORGANIZATION_MASTER',
      recordId: id,
      previousValue: JSON.stringify({ name: current.name, levelId: current.levelId, isActive: current.isActive }),
      newValue: JSON.stringify({ name: updated.name, levelId: updated.levelId, isActive: updated.isActive }),
      ipAddress: req.ip,
    });

    return successResponse(res, updated, 'Designation updated successfully');
  } catch (err) {
    console.error('Error updating designation:', err);
    return errorResponse(res, 'Failed to update designation', 500);
  }
};

/**
 * Delete a designation (only permitted if zero employees are assigned)
 */
const deleteDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, tenantId: userTenantId } = req.user;

    const current = await prisma.designation.findUnique({
      where: { id },
      include: {
        _count: { select: { employees: true } },
      },
    });

    if (!current) {
      return errorResponse(res, 'Designation not found', 404);
    }

    if (role !== 'PLATFORM_ADMIN' && current.tenantId !== userTenantId) {
      return errorResponse(res, 'Access denied: Designation belongs to another dealer organization', 403);
    }

    // Critical Requirement: Do not delete if assigned to employees; deactivate instead
    if (current._count.employees > 0) {
      return errorResponse(
        res,
        `Cannot delete designation '${current.name}': It is currently assigned to ${current._count.employees} employee record(s). Please deactivate it instead (set isActive: false) to preserve historical records.`,
        400
      );
    }

    await prisma.designation.delete({ where: { id } });

    await logAudit({
      tenantId: current.tenantId,
      userId: req.user.id,
      action: 'DESIGNATION_DELETED',
      module: 'ORGANIZATION_MASTER',
      recordId: id,
      previousValue: current.name,
      ipAddress: req.ip,
    });

    return successResponse(res, null, `Designation '${current.name}' deleted successfully`);
  } catch (err) {
    console.error('Error deleting designation:', err);
    return errorResponse(res, 'Failed to delete designation', 500);
  }
};

module.exports = {
  getLevels,
  getLevelById,
  createLevel,
  updateLevel,
  getDesignations,
  getDesignationById,
  createDesignation,
  updateDesignation,
  deleteDesignation,
};
