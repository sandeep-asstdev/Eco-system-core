const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/apiResponse');
const SalaryService = require('../../services/salaryService');
const { logAudit } = require('../../middleware/audit');

const getPayrolls = async (req, res) => {
  try {
    const { role, branchId: userBranchId, employeeId: userEmpId, tenantId } = req.user;
    const { month, year, branchId } = req.query;

    const where = {};

    if (role !== 'PLATFORM_ADMIN') {
      where.tenantId = tenantId;
    }

    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);

    if (role === 'EMPLOYEE') {
      where.employeeId = userEmpId;
    } else if (role === 'BM') {
      where.branchId = userBranchId;
    } else if (branchId) {
      where.branchId = branchId;
    }

    const payrolls = await prisma.payroll.findMany({
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
            status: true,
            level: { select: { levelNumber: true, name: true } },
            designationRel: { select: { name: true, code: true } },
            kyc: { select: { panNumber: true, bankName: true, accountNumber: true, ifscCode: true, branchName: true } },
            statutory: { select: { pfNumber: true, uanNumber: true, esiNumber: true } },
            salary: { select: { conveyance: true, specialAllowance: true } },
            payDays: month && year ? { where: { month: parseInt(month), year: parseInt(year) }, take: 1 } : { take: 1 },
          },
        },
        branch: {
          select: { id: true, name: true, city: true, code: true, address: true, state: true },
        },
        tenant: {
          select: { id: true, organizationName: true, legalName: true },
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { createdAt: 'desc' }],
    });

    return successResponse(res, payrolls);
  } catch (err) {
    console.error('Error fetching payroll records:', err);
    return errorResponse(res, 'Failed to fetch payroll records', 500);
  }
};

const runPayrollCalculation = async (req, res) => {
  try {
    const { month, year, branchId, tenantId: bodyTenantId } = req.body;
    const { role, tenantId: userTenantId } = req.user;

    if (!month || !year) {
      return errorResponse(res, 'Month and Year are required to execute payroll calculation', 400);
    }

    const targetTenantId = role === 'PLATFORM_ADMIN' ? (bodyTenantId || userTenantId) : userTenantId;

    const results = await SalaryService.processPayroll({
      tenantId: targetTenantId,
      month: parseInt(month),
      year: parseInt(year),
      branchId: branchId || null,
    });

    await logAudit({
      tenantId: targetTenantId,
      userId: req.user.id,
      action: 'PAYROLL_CALCULATED',
      module: 'PAYROLL',
      recordId: `${year}-${month}`,
      newValue: `Executed payroll calculation for ${results.length} employees (Month: ${month}/${year})`,
      ipAddress: req.ip,
    });

    return successResponse(
      res,
      { count: results.length, records: results },
      `Successfully calculated payroll for ${results.length} employees.`
    );
  } catch (err) {
    console.error('Payroll calculation error:', err);
    return errorResponse(res, 'Failed to execute payroll calculation', 500);
  }
};

const toggleSalaryHold = async (req, res) => {
  try {
    const { id } = req.params; // payroll record id
    const { isHold } = req.body;
    const { role, tenantId } = req.user;

    const payroll = await prisma.payroll.findUnique({ where: { id } });
    if (!payroll) return errorResponse(res, 'Payroll record not found', 404);

    if (role !== 'PLATFORM_ADMIN' && payroll.tenantId !== tenantId) {
      return errorResponse(res, 'Access denied to payroll of another dealer organization', 403);
    }

    const updated = await prisma.payroll.update({
      where: { id },
      data: { isHold: Boolean(isHold) },
      include: { employee: true },
    });

    await logAudit({
      tenantId: payroll.tenantId,
      userId: req.user.id,
      action: isHold ? 'SALARY_HELD' : 'SALARY_RELEASED',
      module: 'PAYROLL',
      recordId: id,
      previousValue: payroll.isHold,
      newValue: isHold,
      ipAddress: req.ip,
    });

    return successResponse(
      res,
      updated,
      `Salary payment for ${updated.employee.firstName} ${updated.employee.lastName} is now ${isHold ? 'HELD' : 'RELEASED'}.`
    );
  } catch (err) {
    return errorResponse(res, 'Failed to update salary hold status', 500);
  }
};

const uploadPayDays = async (req, res) => {
  try {
    const { records, month, year } = req.body;
    const { role, tenantId } = req.user;

    if (!records || !Array.isArray(records) || !month || !year) {
      return errorResponse(res, 'Month, year, and records array are required', 400);
    }

    const targetTenantId = tenantId;
    const saved = [];

    for (const r of records) {
      // Validate employee belongs to this tenant
      const emp = await prisma.employee.findUnique({ where: { id: r.employeeId } });
      if (!emp || (role !== 'PLATFORM_ADMIN' && emp.tenantId !== targetTenantId)) {
        continue;
      }

      const payableDays = Math.max(0, (r.presentDays || 0) + (r.paidLeaves || 0));
      const entry = await prisma.payDay.upsert({
        where: {
          month_year_employeeId: {
            month: parseInt(month),
            year: parseInt(year),
            employeeId: r.employeeId,
          },
        },
        update: {
          totalWorkingDays: r.totalWorkingDays || 30,
          presentDays: r.presentDays || 0,
          paidLeaves: r.paidLeaves || 0,
          lopDays: r.lopDays || 0,
          payableDays,
        },
        create: {
          tenantId: emp.tenantId,
          month: parseInt(month),
          year: parseInt(year),
          employeeId: r.employeeId,
          totalWorkingDays: r.totalWorkingDays || 30,
          presentDays: r.presentDays || 0,
          paidLeaves: r.paidLeaves || 0,
          lopDays: r.lopDays || 0,
          payableDays,
        },
      });
      saved.push(entry);
    }

    return successResponse(res, saved, `Uploaded pay-days for ${saved.length} employees`);
  } catch (err) {
    console.error('Error uploading pay days:', err);
    return errorResponse(res, 'Failed to upload pay days', 500);
  }
};

const uploadDeductions = async (req, res) => {
  try {
    const { records, month, year } = req.body;
    const { role, tenantId } = req.user;

    if (!records || !Array.isArray(records) || !month || !year) {
      return errorResponse(res, 'Month, year, and records array are required', 400);
    }

    const targetTenantId = tenantId;
    const saved = [];

    for (const r of records) {
      const emp = await prisma.employee.findUnique({ where: { id: r.employeeId } });
      if (!emp || (role !== 'PLATFORM_ADMIN' && emp.tenantId !== targetTenantId)) {
        continue;
      }

      const entry = await prisma.deduction.upsert({
        where: {
          month_year_employeeId: {
            month: parseInt(month),
            year: parseInt(year),
            employeeId: r.employeeId,
          },
        },
        update: {
          advanceRecovery: parseFloat(r.advanceRecovery) || 0,
          loanDeduction: parseFloat(r.loanDeduction) || 0,
          tds: parseFloat(r.tds) || 0,
          otherDeduction: parseFloat(r.otherDeduction) || 0,
          remarks: r.remarks || null,
        },
        create: {
          tenantId: emp.tenantId,
          month: parseInt(month),
          year: parseInt(year),
          employeeId: r.employeeId,
          advanceRecovery: parseFloat(r.advanceRecovery) || 0,
          loanDeduction: parseFloat(r.loanDeduction) || 0,
          tds: parseFloat(r.tds) || 0,
          otherDeduction: parseFloat(r.otherDeduction) || 0,
          remarks: r.remarks || null,
        },
      });
      saved.push(entry);
    }

    return successResponse(res, saved, `Uploaded deductions for ${saved.length} employees`);
  } catch (err) {
    console.error('Error uploading deductions:', err);
    return errorResponse(res, 'Failed to upload deductions', 500);
  }
};

const generatePaymentAdvice = async (req, res) => {
  try {
    const { month, year, branchId, bankName, tenantId: bodyTenantId } = req.body;
    const { role, tenantId: userTenantId } = req.user;

    if (!month || !year) {
      return errorResponse(res, 'Month and Year are required', 400);
    }

    const targetTenantId = role === 'PLATFORM_ADMIN' ? (bodyTenantId || userTenantId) : userTenantId;

    const advice = await SalaryService.generatePaymentAdvice({
      tenantId: targetTenantId,
      month: parseInt(month),
      year: parseInt(year),
      branchId: branchId || null,
      bankName: bankName || 'Corporate NetBanking',
    });

    await logAudit({
      tenantId: targetTenantId,
      userId: req.user.id,
      action: 'PAYMENT_ADVICE_GENERATED',
      module: 'PAYROLL',
      recordId: advice.advice.referenceNumber,
      newValue: `Generated payment advice for INR ${advice.advice.totalAmount} across ${advice.advice.totalEmployees} employees.`,
      ipAddress: req.ip,
    });

    return successResponse(res, advice, 'Payment advice generated successfully');
  } catch (err) {
    console.error('Error generating payment advice:', err);
    return errorResponse(res, 'Failed to generate payment advice', 500);
  }
};

const getPaymentAdvices = async (req, res) => {
  try {
    const { month, year } = req.query;
    const { role, tenantId } = req.user;

    const where = {};
    if (role !== 'PLATFORM_ADMIN') {
      where.tenantId = tenantId;
    }
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);

    const advices = await prisma.paymentAdvice.findMany({
      where,
      include: { branch: true },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, advices);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch payment advices', 500);
  }
};

module.exports = {
  getPayrolls,
  runPayrollCalculation,
  toggleSalaryHold,
  uploadPayDays,
  uploadDeductions,
  generatePaymentAdvice,
  getPaymentAdvices,
};
