const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/apiResponse');

/**
 * Global search strictly scoped to the authenticated user's tenant (and branch for BM)
 */
const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return successResponse(res, { employees: [], positions: [], branches: [] });
    }

    const searchTerm = q.trim();
    const { role, tenantId, branchId: userBranchId } = req.user;

    // Platform Admin searching without tenant context returns empty or can pass ?tenantId
    const targetTenantId = tenantId || req.query.tenantId;
    if (!targetTenantId && role !== 'PLATFORM_ADMIN') {
      return errorResponse(res, 'Tenant context required for search', 403);
    }

    const tenantFilter = targetTenantId ? { tenantId: targetTenantId } : {};

    // Branch scoping for BM
    const empBranchFilter = role === 'BM' ? { branchId: userBranchId } : {};
    const posBranchFilter = role === 'BM' ? { branchId: userBranchId } : {};
    const branchFilter = role === 'BM' ? { id: userBranchId } : {};

    const [employees, positions, branches] = await Promise.all([
      prisma.employee.findMany({
        where: {
          ...tenantFilter,
          ...empBranchFilter,
          OR: [
            { firstName: { contains: searchTerm, mode: 'insensitive' } },
            { lastName: { contains: searchTerm, mode: 'insensitive' } },
            { employeeCode: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { designation: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
          department: true,
          designation: true,
          status: true,
          branch: { select: { name: true, city: true } },
        },
        take: 10,
      }),
      prisma.position.findMany({
        where: {
          ...tenantFilter,
          ...posBranchFilter,
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { positionCode: { contains: searchTerm, mode: 'insensitive' } },
            { department: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          positionCode: true,
          title: true,
          department: true,
          status: true,
          branch: { select: { name: true } },
        },
        take: 10,
      }),
      prisma.branch.findMany({
        where: {
          ...tenantFilter,
          ...branchFilter,
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { code: { contains: searchTerm, mode: 'insensitive' } },
            { city: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          code: true,
          name: true,
          city: true,
        },
        take: 5,
      }),
    ]);

    return successResponse(res, {
      employees,
      positions,
      branches,
    });
  } catch (err) {
    console.error('Search error:', err);
    return errorResponse(res, 'Failed to perform search', 500);
  }
};

module.exports = {
  globalSearch,
};
