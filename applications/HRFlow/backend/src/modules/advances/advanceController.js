const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/apiResponse');
const { logAudit } = require('../../middleware/audit');

const getSalaryAdvances = async (req, res) => {
  try {
    const { role, branchId: userBranchId, employeeId: userEmpId, tenantId } = req.user;
    const { status } = req.query;

    const where = {};

    if (role !== 'PLATFORM_ADMIN') {
      where.tenantId = tenantId;
    }

    if (role === 'EMPLOYEE') {
      where.employeeId = userEmpId;
    } else if (role === 'BM') {
      where.employee = { branchId: userBranchId };
    }
    if (status) where.status = status;

    const advances = await prisma.salaryAdvance.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            designation: true,
            branch: { select: { name: true, city: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, advances);
  } catch (err) {
    console.error('Error fetching advances:', err);
    return errorResponse(res, 'Failed to fetch salary advance requests', 500);
  }
};

const applySalaryAdvance = async (req, res) => {
  try {
    const { amount, purpose, monthlyDeduction } = req.body;
    const { employeeId, tenantId } = req.user;

    if (!employeeId) {
      return errorResponse(res, 'User is not linked to an employee profile', 400);
    }

    if (!amount || parseFloat(amount) <= 0) {
      return errorResponse(res, 'A valid advance amount is required', 400);
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { salary: true },
    });

    if (!employee) return errorResponse(res, 'Employee not found', 404);

    // Validate that advance doesn't exceed 3x basic salary
    const maxAllowed = (employee.salary ? employee.salary.basic : 30000) * 3;
    if (parseFloat(amount) > maxAllowed) {
      return errorResponse(res, `Advance cannot exceed 3 months basic salary (INR ${maxAllowed})`, 400);
    }

    const targetTenantId = employee.tenantId || tenantId;

    const advance = await prisma.salaryAdvance.create({
      data: {
        tenantId: targetTenantId,
        employeeId,
        amount: parseFloat(amount),
        purpose: purpose || 'General financial assistance',
        monthlyDeduction: monthlyDeduction ? parseFloat(monthlyDeduction) : Math.round(parseFloat(amount) / 3),
        status: 'PENDING_BM',
      },
      include: { employee: true },
    });

    // Create Approval record for BM with tenantId
    await prisma.approval.create({
      data: {
        tenantId: targetTenantId,
        type: 'SALARY_ADVANCE',
        referenceId: advance.id,
        branchId: employee.branchId,
        requestedById: req.user.id,
        status: 'PENDING',
        remarks: `Advance request of INR ${amount} applied by ${employee.firstName} ${employee.lastName}`,
      },
    });

    // Notify BM of this tenant & branch
    const bmUsers = await prisma.user.findMany({
      where: { tenantId: targetTenantId, branchId: employee.branchId, role: 'BM' },
    });
    for (const bm of bmUsers) {
      await prisma.notification.create({
        data: {
          tenantId: targetTenantId,
          userId: bm.id,
          title: 'New Salary Advance Request',
          message: `${employee.firstName} ${employee.lastName} requested an advance of INR ${amount}.`,
          type: 'APPROVAL',
          link: '/approvals',
        },
      });
    }

    await logAudit({
      tenantId: targetTenantId,
      userId: req.user.id,
      action: 'SALARY_ADVANCE_APPLIED',
      module: 'SALARY_ADVANCE',
      recordId: advance.id,
      newValue: `Applied for INR ${amount}`,
      ipAddress: req.ip,
    });

    return successResponse(res, advance, 'Salary advance request submitted for BM approval', 201);
  } catch (err) {
    console.error('Error applying salary advance:', err);
    return errorResponse(res, 'Failed to submit salary advance request', 500);
  }
};

const reviewSalaryAdvance = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, remarks } = req.body; // action: 'APPROVE' | 'REJECT'
    const { role, tenantId } = req.user;

    const advance = await prisma.salaryAdvance.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!advance) return errorResponse(res, 'Salary advance request not found', 404);

    if (role !== 'PLATFORM_ADMIN' && advance.tenantId !== tenantId) {
      return errorResponse(res, 'Access denied', 403);
    }

    let nextStatus;
    if (action === 'REJECT') {
      nextStatus = 'REJECTED';
    } else if (role === 'BM') {
      nextStatus = 'PENDING_HR'; // BM recommends to HR
    } else if (role === 'HR') {
      nextStatus = 'APPROVED'; // HR final approval
    }

    const updated = await prisma.salaryAdvance.update({
      where: { id },
      data: {
        status: nextStatus,
        bmRemarks: role === 'BM' ? remarks : advance.bmRemarks,
        hrRemarks: role === 'HR' ? remarks : advance.hrRemarks,
        disbursedDate: nextStatus === 'APPROVED' ? new Date() : undefined,
      },
    });

    // Notify employee of same tenant
    const empUser = await prisma.user.findFirst({ where: { employeeId: advance.employeeId } });
    if (empUser) {
      await prisma.notification.create({
        data: {
          tenantId: advance.tenantId,
          userId: empUser.id,
          title: `Salary Advance ${nextStatus === 'APPROVED' ? 'Approved' : nextStatus === 'REJECTED' ? 'Rejected' : 'Recommended by BM'}`,
          message: `Your advance request of INR ${advance.amount} is now ${nextStatus}. Remarks: ${remarks || 'None'}`,
          type: nextStatus === 'APPROVED' ? 'INFO' : 'ALERT',
          link: '/advances',
        },
      });
    }

    return successResponse(res, updated, `Advance request updated to ${nextStatus}`);
  } catch (err) {
    return errorResponse(res, 'Failed to review advance request', 500);
  }
};

module.exports = {
  getSalaryAdvances,
  applySalaryAdvance,
  reviewSalaryAdvance,
};
