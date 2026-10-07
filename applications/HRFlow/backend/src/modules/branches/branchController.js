const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/apiResponse');

const getAllBranches = async (req, res) => {
  try {
    const { role, branchId, tenantId } = req.user;
    
    // Scoped strictly to the user's tenant
    const where = {};
    if (role !== 'PLATFORM_ADMIN') {
      where.tenantId = tenantId;
    } else if (req.query.tenantId) {
      where.tenantId = req.query.tenantId;
    }

    if (role === 'BM') {
      where.id = branchId;
    }

    const branches = await prisma.branch.findMany({
      where,
      include: {
        _count: {
          select: {
            employees: true,
            positions: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return successResponse(res, branches);
  } catch (err) {
    console.error('Error fetching branches:', err);
    return errorResponse(res, 'Failed to fetch branches', 500);
  }
};

const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, branchId, tenantId } = req.user;

    const branch = await prisma.branch.findUnique({
      where: { id },
      include: {
        employees: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            department: true,
            designation: true,
            status: true,
          },
        },
        positions: true,
        manpowerBudgets: true,
      },
    });

    if (!branch) {
      return errorResponse(res, 'Branch not found', 404);
    }

    // Cross-tenant isolation check
    if (role !== 'PLATFORM_ADMIN' && branch.tenantId !== tenantId) {
      return errorResponse(
        res,
        'Access Denied: You do not have permission to view branches of another dealer organization.',
        403
      );
    }

    // BM scoping check
    if (role === 'BM' && branchId !== id) {
      return errorResponse(res, 'Access denied: You can only view your assigned branch.', 403);
    }

    return successResponse(res, branch);
  } catch (err) {
    console.error('Error fetching branch:', err);
    return errorResponse(res, 'Failed to fetch branch', 500);
  }
};

const createBranch = async (req, res) => {
  try {
    const { role, tenantId: userTenantId } = req.user;
    const { code, name, city, state, address, phone, email, tenantId: bodyTenantId } = req.body;

    if (!code || !name || !city || !state) {
      return errorResponse(res, 'Code, name, city, and state are required', 400);
    }

    const targetTenantId = role === 'PLATFORM_ADMIN' ? (bodyTenantId || userTenantId) : userTenantId;
    if (!targetTenantId) {
      return errorResponse(res, 'Target dealership tenant must be specified', 400);
    }

    // Tenant-scoped uniqueness check
    const existing = await prisma.branch.findUnique({
      where: {
        tenantId_code: {
          tenantId: targetTenantId,
          code: code.trim().toUpperCase(),
        },
      },
    });

    if (existing) {
      return errorResponse(res, `Branch with code '${code}' already exists in this dealership`, 400);
    }

    const branch = await prisma.branch.create({
      data: {
        tenantId: targetTenantId,
        code: code.trim().toUpperCase(),
        name,
        city,
        state,
        address,
        phone,
        email,
      },
    });

    return successResponse(res, branch, 'Branch created successfully', 201);
  } catch (err) {
    console.error('Error creating branch:', err);
    return errorResponse(res, 'Failed to create branch', 500);
  }
};

module.exports = {
  getAllBranches,
  getBranchById,
  createBranch,
};
