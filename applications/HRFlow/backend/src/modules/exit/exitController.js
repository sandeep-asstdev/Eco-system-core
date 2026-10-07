const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/apiResponse');
const AutomationService = require('../../services/automationService');

const getResignations = async (req, res) => {
  try {
    const { role, branchId: userBranchId, employeeId: userEmpId, tenantId } = req.user;
    const where = {};

    if (role !== 'PLATFORM_ADMIN') {
      where.tenantId = tenantId;
    }

    if (role === 'EMPLOYEE') {
      where.employeeId = userEmpId;
    } else if (role === 'BM') {
      where.employee = { branchId: userBranchId };
    }

    const resignations = await prisma.resignation.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            designation: true,
            department: true,
            dateOfJoining: true,
            salary: true,
            branch: { select: { name: true, city: true } },
          },
        },
        nocRecords: true,
        fnfRecords: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, resignations);
  } catch (err) {
    console.error('Error fetching resignations:', err);
    return errorResponse(res, 'Failed to fetch resignations', 500);
  }
};

// Employee applies for resignation (triggers Rule 2)
const submitResignation = async (req, res) => {
  try {
    const { employeeId } = req.user;
    const { reason, noticePeriodDays, proposedLastWorkingDate } = req.body;

    if (!employeeId) {
      return errorResponse(res, 'User is not linked to an employee profile', 400);
    }

    if (!reason) {
      return errorResponse(res, 'Reason for resignation is required', 400);
    }

    const result = await AutomationService.onEmployeeResignation({
      employeeId,
      reason,
      noticePeriodDays: noticePeriodDays ? parseInt(noticePeriodDays) : 30,
      proposedLwd: proposedLastWorkingDate,
      requestedUserId: req.user.id,
      ipAddress: req.ip,
    });

    return successResponse(
      res,
      result,
      'Resignation submitted. Salary marked on hold and replacement vacancy opened.'
    );
  } catch (err) {
    console.error('Error submitting resignation:', err);
    return errorResponse(res, err.message || 'Failed to submit resignation', 500);
  }
};

// HR processes resignation (updates status, sets F&F date)
const processResignation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, fnfDate, hrRemarks, salaryHoldStatus } = req.body;
    const { role, tenantId } = req.user;

    const existing = await prisma.resignation.findUnique({ where: { id } });
    if (!existing) return errorResponse(res, 'Resignation not found', 404);

    if (role !== 'PLATFORM_ADMIN' && existing.tenantId !== tenantId) {
      return errorResponse(res, 'Access denied', 403);
    }

    const resignation = await prisma.resignation.update({
      where: { id },
      data: {
        status: status || undefined,
        fnfDate: fnfDate ? new Date(fnfDate) : undefined,
        hrRemarks: hrRemarks || undefined,
        salaryHoldStatus: salaryHoldStatus || undefined,
      },
      include: { employee: true },
    });

    return successResponse(res, resignation, 'Resignation processing status updated');
  } catch (err) {
    return errorResponse(res, 'Failed to update resignation', 500);
  }
};

// Mark Left Without Intimation (BM or HR) (triggers Rule 3)
const markLeftWithoutIntimation = async (req, res) => {
  try {
    const { employeeId, remarks } = req.body;
    const { role, branchId: userBranchId, tenantId } = req.user;

    if (!employeeId) {
      return errorResponse(res, 'Employee ID is required', 400);
    }

    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) return errorResponse(res, 'Employee not found', 404);

    if (role !== 'PLATFORM_ADMIN' && employee.tenantId !== tenantId) {
      return errorResponse(res, 'Access denied to employee of another dealer organization', 403);
    }

    if (role === 'BM' && employee.branchId !== userBranchId) {
      return errorResponse(res, 'Cannot mark employee from another branch as Left Without Intimation', 403);
    }

    const result = await AutomationService.onEmployeeLeftWithoutIntimation({
      employeeId,
      remarks,
      actionUserId: req.user.id,
      ipAddress: req.ip,
    });

    return successResponse(
      res,
      result,
      `Employee ${employee.firstName} marked as Left Without Intimation. Salary placed on hold and replacement position opened.`
    );
  } catch (err) {
    console.error('Error marking left without intimation:', err);
    return errorResponse(res, err.message || 'Failed to mark employee left without intimation', 500);
  }
};

// Update NOC Clearance
const updateNoc = async (req, res) => {
  try {
    const { id } = req.params; // nocRecord id
    const { departmentClearance, assetClearance, financeClearance, remarks } = req.body;
    const { role, tenantId } = req.user;

    const currentNoc = await prisma.nocRecord.findUnique({ where: { id } });
    if (!currentNoc) return errorResponse(res, 'NOC record not found', 404);

    if (role !== 'PLATFORM_ADMIN' && currentNoc.tenantId !== tenantId) {
      return errorResponse(res, 'Access denied', 403);
    }

    const dep = departmentClearance !== undefined ? departmentClearance : currentNoc.departmentClearance;
    const ass = assetClearance !== undefined ? assetClearance : currentNoc.assetClearance;
    const fin = financeClearance !== undefined ? financeClearance : currentNoc.financeClearance;
    const allCleared = dep && ass && fin;

    const updated = await prisma.nocRecord.update({
      where: { id },
      data: {
        departmentClearance: dep,
        assetClearance: ass,
        financeClearance: fin,
        status: allCleared ? 'CLEARED' : 'PENDING',
        remarks: remarks || currentNoc.remarks,
      },
    });

    return successResponse(res, updated, `NOC clearances updated. Status: ${updated.status}`);
  } catch (err) {
    return errorResponse(res, 'Failed to update NOC record', 500);
  }
};

// Create / Update F&F Settlement Record
const calculateFnf = async (req, res) => {
  try {
    const {
      resignationId,
      employeeId,
      settlementDate,
      unpaidDays,
      encashmentAmount,
      gratuityAmount,
      deductions,
    } = req.body;
    const { role, tenantId } = req.user;

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { salary: true },
    });
    if (!employee) return errorResponse(res, 'Employee not found', 404);

    if (role !== 'PLATFORM_ADMIN' && employee.tenantId !== tenantId) {
      return errorResponse(res, 'Access denied', 403);
    }

    const perDayBasic = (employee.salary ? employee.salary.basic : 30000) / 30;
    const unpaidPay = Math.round((parseFloat(unpaidDays) || 0) * perDayBasic);
    const encash = parseFloat(encashmentAmount) || 0;
    const gratuity = parseFloat(gratuityAmount) || 0;
    const ded = parseFloat(deductions) || 0;

    const netPayable = unpaidPay + encash + gratuity - ded;

    let activeResignationId = resignationId;
    if (!activeResignationId) {
      const existingRes = await prisma.resignation.findFirst({
        where: { employeeId: employee.id },
        orderBy: { createdAt: 'desc' },
      });
      if (existingRes) {
        activeResignationId = existingRes.id;
      } else {
        const newRes = await prisma.resignation.create({
          data: {
            tenantId: employee.tenantId,
            employeeId: employee.id,
            reason: 'Full & Final Settlement processing',
            status: 'SUBMITTED',
            noticePeriodDays: 30,
            proposedLastWorkingDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
          },
        });
        activeResignationId = newRes.id;
      }
    }

    const fnf = await prisma.fnfRecord.create({
      data: {
        tenant: { connect: { id: employee.tenantId } },
        employee: { connect: { id: employee.id } },
        resignation: { connect: { id: activeResignationId } },
        settlementDate: settlementDate ? new Date(settlementDate) : new Date(),
        unpaidDays: parseFloat(unpaidDays) || 0,
        encashmentAmount: encash,
        gratuityAmount: gratuity,
        deductions: ded,
        netPayable: Math.max(0, netPayable),
        status: 'PENDING',
      },
    });

    return successResponse(res, fnf, 'F&F settlement calculated successfully', 201);
  } catch (err) {
    console.error('FnF calculation error:', err);
    return errorResponse(res, 'Failed to calculate F&F settlement', 500);
  }
};

module.exports = {
  getResignations,
  submitResignation,
  processResignation,
  markLeftWithoutIntimation,
  updateNoc,
  calculateFnf,
};
