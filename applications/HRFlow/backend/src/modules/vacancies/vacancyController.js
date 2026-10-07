const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/apiResponse');
const { logAudit } = require('../../middleware/audit');

const getPositions = async (req, res) => {
  try {
    const { role, branchId: userBranchId, tenantId } = req.user;
    const { status, department, search, branchIdQuery } = req.query;

    const where = {};

    if (role !== 'PLATFORM_ADMIN') {
      where.tenantId = tenantId;
    } else if (req.query.tenantId) {
      where.tenantId = req.query.tenantId;
    }

    if (role === 'BM') {
      where.branchId = userBranchId;
    } else if (branchIdQuery) {
      where.branchId = branchIdQuery;
    }

    if (status) where.status = status;
    if (department) where.department = department;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { positionCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const positions = await prisma.position.findMany({
      where,
      include: {
        branch: {
          select: { id: true, name: true, city: true, code: true },
        },
        joiningRecords: {
          select: { id: true, candidateName: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, positions);
  } catch (err) {
    console.error('Error fetching positions:', err);
    return errorResponse(res, 'Failed to fetch positions', 500);
  }
};

const createPosition = async (req, res) => {
  try {
    const { role, branchId: userBranchId, id: userId, tenantId: userTenantId } = req.user;
    const { title, department, branchId: reqBranchId, requiredCount, reasonForOpening, tenantId: bodyTenantId } = req.body;

    if (!title || !department) {
      return errorResponse(res, 'Title and department are required', 400);
    }

    const targetBranchId = role === 'BM' ? userBranchId : reqBranchId || userBranchId;
    if (!targetBranchId) {
      return errorResponse(res, 'Branch must be specified', 400);
    }

    const targetTenantId = role === 'PLATFORM_ADMIN' ? (bodyTenantId || userTenantId) : userTenantId;

    // Verify branch belongs to this tenant
    const branch = await prisma.branch.findUnique({ where: { id: targetBranchId } });
    if (!branch || branch.tenantId !== targetTenantId) {
      return errorResponse(res, 'Branch does not belong to this dealer organization', 403);
    }

    const count = await prisma.position.count({ where: { tenantId: targetTenantId } });
    const positionCode = `POS-${Date.now().toString().slice(-4)}-${count + 1}`;

    const position = await prisma.position.create({
      data: {
        tenantId: targetTenantId,
        positionCode,
        title,
        department,
        branchId: targetBranchId,
        requiredCount: requiredCount ? parseInt(requiredCount) : 1,
        status: 'OPEN',
        reasonForOpening: reasonForOpening || 'New position requirement',
      },
      include: { branch: true },
    });

    await logAudit({
      tenantId: targetTenantId,
      userId,
      action: 'POSITION_CREATED',
      module: 'VACANCY',
      recordId: position.id,
      newValue: `Created ${title} (${positionCode}) for ${position.branch.name}`,
      ipAddress: req.ip,
    });

    return successResponse(res, position, 'Position created successfully', 201);
  } catch (err) {
    console.error('Error creating position:', err);
    return errorResponse(res, 'Failed to create position', 500);
  }
};

const updatePositionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const { role, branchId: userBranchId, id: userId, tenantId } = req.user;

    const existing = await prisma.position.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Position not found', 404);
    }

    // Cross-tenant isolation check
    if (role !== 'PLATFORM_ADMIN' && existing.tenantId !== tenantId) {
      return errorResponse(res, 'Cannot modify position belonging to another dealer organization', 403);
    }

    if (role === 'BM' && existing.branchId !== userBranchId) {
      return errorResponse(res, 'Cannot modify position of another branch', 403);
    }

    // BM can toggle OPEN and ON_HOLD. HR can set any status (OPEN, FILLED, ON_HOLD, CLOSED)
    if (role === 'BM' && !['OPEN', 'ON_HOLD'].includes(status)) {
      return errorResponse(res, 'BM can only toggle position between OPEN and ON_HOLD', 403);
    }

    const updated = await prisma.position.update({
      where: { id },
      data: {
        status,
        reasonForOpening: reason ? `${existing.reasonForOpening || ''} | Status note: ${reason}` : existing.reasonForOpening,
      },
      include: { branch: true },
    });

    await logAudit({
      tenantId: existing.tenantId,
      userId,
      action: 'POSITION_STATUS_UPDATED',
      module: 'VACANCY',
      recordId: updated.id,
      previousValue: existing.status,
      newValue: status,
      ipAddress: req.ip,
    });

    return successResponse(res, updated, `Position status updated to ${status}`);
  } catch (err) {
    return errorResponse(res, 'Failed to update position status', 500);
  }
};

const getManpowerBudgets = async (req, res) => {
  try {
    const { role, branchId: userBranchId, tenantId } = req.user;
    const where = {};

    if (role !== 'PLATFORM_ADMIN') {
      where.tenantId = tenantId;
    }
    if (role === 'BM') {
      where.branchId = userBranchId;
    }

    const budgets = await prisma.manpowerBudget.findMany({
      where,
      include: {
        branch: {
          select: { id: true, name: true, city: true },
        },
      },
      orderBy: [{ financialYear: 'desc' }, { department: 'asc' }],
    });

    // Compute actual headcount for comparison
    const budgetsWithActuals = await Promise.all(
      budgets.map(async (b) => {
        const activeEmployees = await prisma.employee.count({
          where: {
            tenantId: b.tenantId,
            branchId: b.branchId,
            department: b.department,
            status: 'ACTIVE',
          },
        });
        const openPositions = await prisma.position.count({
          where: {
            tenantId: b.tenantId,
            branchId: b.branchId,
            department: b.department,
            status: 'OPEN',
          },
        });
        return {
          ...b,
          activeEmployees,
          openPositions,
          utilizationPercent: Math.round((activeEmployees / b.sanctionedPositions) * 100),
        };
      })
    );

    return successResponse(res, budgetsWithActuals);
  } catch (err) {
    console.error('Error fetching budgets:', err);
    return errorResponse(res, 'Failed to fetch manpower budgets', 500);
  }
};

const uploadManpowerBudget = async (req, res) => {
  try {
    const { role, tenantId: userTenantId } = req.user;
    const { branchId, department, financialYear, sanctionedPositions, budgetAmount, tenantId: bodyTenantId } = req.body;

    if (!branchId || !department || !financialYear || !sanctionedPositions) {
      return errorResponse(res, 'Branch, department, financial year, and sanctioned positions are required', 400);
    }

    const targetTenantId = role === 'PLATFORM_ADMIN' ? (bodyTenantId || userTenantId) : userTenantId;

    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch || branch.tenantId !== targetTenantId) {
      return errorResponse(res, 'Branch does not belong to this dealer organization', 403);
    }

    const budget = await prisma.manpowerBudget.upsert({
      where: {
        tenantId_branchId_department_financialYear: {
          tenantId: targetTenantId,
          branchId,
          department,
          financialYear,
        },
      },
      update: {
        sanctionedPositions: parseInt(sanctionedPositions),
        budgetAmount: budgetAmount ? parseFloat(budgetAmount) : 0,
      },
      create: {
        tenantId: targetTenantId,
        branchId,
        department,
        financialYear,
        sanctionedPositions: parseInt(sanctionedPositions),
        budgetAmount: budgetAmount ? parseFloat(budgetAmount) : 0,
      },
      include: { branch: true },
    });

    return successResponse(res, budget, 'Manpower budget saved successfully');
  } catch (err) {
    console.error('Upload budget error:', err);
    return errorResponse(res, 'Failed to upload manpower budget', 500);
  }
};

module.exports = {
  getPositions,
  createPosition,
  updatePositionStatus,
  getManpowerBudgets,
  uploadManpowerBudget,
};
