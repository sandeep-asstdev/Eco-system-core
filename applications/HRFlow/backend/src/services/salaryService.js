const prisma = require('../config/db');

class SalaryService {
  /**
   * Calculates monthly payroll for an employee based on pay days, deductions, and salary structure.
   */
  static calculateMonthlySalary({
    salaryStructure,
    payDay,
    deduction,
    statutory,
    employeeStatus,
  }) {
    const totalWorkingDays = payDay ? payDay.totalWorkingDays : 30;
    const payableDays = payDay ? payDay.payableDays : totalWorkingDays;
    const prorationRatio = Math.max(0, Math.min(1, payableDays / totalWorkingDays));

    // Base components
    const monthlyBasic = salaryStructure.basic || 0;
    const monthlyHra = salaryStructure.hra || 0;
    const monthlyAllowances = (salaryStructure.conveyance || 0) + (salaryStructure.specialAllowance || 0);

    // Prorated Gross components
    const earnedBasic = Math.round(monthlyBasic * prorationRatio);
    const earnedHra = Math.round(monthlyHra * prorationRatio);
    const earnedAllowances = Math.round(monthlyAllowances * prorationRatio);
    const grossPay = earnedBasic + earnedHra + earnedAllowances;

    // Statutory deductions
    let pfDeduction = 0;
    if (statutory && statutory.pfApplicable) {
      pfDeduction = Math.round(earnedBasic * 0.12);
    }

    // ESI: 0.75% of Gross pay if monthly gross <= 21,000
    let esiDeduction = 0;
    if (statutory && statutory.esiApplicable && salaryStructure.grossSalary <= 21000) {
      esiDeduction = Math.round(grossPay * 0.0075);
    }

    // Custom deductions
    const advanceDeduction = deduction ? deduction.advanceRecovery : 0;
    const loanDeduction = deduction ? deduction.loanDeduction : 0;
    const taxDeduction = deduction ? deduction.tds : 0;
    const otherDeduction = deduction ? deduction.otherDeduction : 0;

    const totalDeductions =
      pfDeduction +
      esiDeduction +
      advanceDeduction +
      loanDeduction +
      taxDeduction +
      otherDeduction;

    const netPay = Math.max(0, grossPay - totalDeductions);

    // If employee is RESIGNED, LEFT_WITHOUT_INTIMATION, or marked on hold, salary is held
    const isHold =
      employeeStatus === 'RESIGNED' ||
      employeeStatus === 'LEFT_WITHOUT_INTIMATION' ||
      employeeStatus === 'TERMINATED';

    return {
      basic: earnedBasic,
      hra: earnedHra,
      allowances: earnedAllowances,
      grossPay,
      pfDeduction,
      esiDeduction,
      advanceDeduction: advanceDeduction + loanDeduction,
      taxDeduction,
      totalDeductions,
      netPay,
      isHold,
    };
  }

  /**
   * Runs the full payroll process for a given month and year (strictly scoped by tenantId and optional branch).
   */
  static async processPayroll({ tenantId, month, year, branchId }) {
    const tenantFilter = tenantId ? { tenantId } : {};
    const branchFilter = branchId ? { branchId } : {};

    const employees = await prisma.employee.findMany({
      where: {
        ...tenantFilter,
        ...branchFilter,
        status: { in: ['ACTIVE', 'RESIGNED', 'LEFT_WITHOUT_INTIMATION'] },
      },
      include: {
        salary: true,
        statutory: true,
        payDays: {
          where: { month: Number(month), year: Number(year) },
        },
        deductions: {
          where: { month: Number(month), year: Number(year) },
        },
      },
    });

    const payrollResults = [];

    for (const emp of employees) {
      if (!emp.salary) continue; // Skip employees without configured salary structure

      const payDay = emp.payDays[0] || null;
      const deduction = emp.deductions[0] || null;

      const calc = this.calculateMonthlySalary({
        salaryStructure: emp.salary,
        payDay,
        deduction,
        statutory: emp.statutory,
        employeeStatus: emp.status,
      });

      // Upsert payroll entry with tenantId
      const record = await prisma.payroll.upsert({
        where: {
          month_year_employeeId: {
            month: Number(month),
            year: Number(year),
            employeeId: emp.id,
          },
        },
        update: {
          basic: calc.basic,
          hra: calc.hra,
          allowances: calc.allowances,
          grossPay: calc.grossPay,
          pfDeduction: calc.pfDeduction,
          esiDeduction: calc.esiDeduction,
          advanceDeduction: calc.advanceDeduction,
          taxDeduction: calc.taxDeduction,
          totalDeductions: calc.totalDeductions,
          netPay: calc.netPay,
          isHold: calc.isHold,
          status: 'PROCESSED',
        },
        create: {
          tenantId: emp.tenantId,
          month: Number(month),
          year: Number(year),
          employeeId: emp.id,
          branchId: emp.branchId,
          basic: calc.basic,
          hra: calc.hra,
          allowances: calc.allowances,
          grossPay: calc.grossPay,
          pfDeduction: calc.pfDeduction,
          esiDeduction: calc.esiDeduction,
          advanceDeduction: calc.advanceDeduction,
          taxDeduction: calc.taxDeduction,
          totalDeductions: calc.totalDeductions,
          netPay: calc.netPay,
          isHold: calc.isHold,
          status: 'PROCESSED',
        },
      });

      payrollResults.push(record);
    }

    return payrollResults;
  }

  /**
   * Generates bank-wise and branch-wise Payment Advice summary strictly scoped by tenant.
   */
  static async generatePaymentAdvice({ tenantId, month, year, branchId, bankName = 'All Primary Partner Banks' }) {
    const tenantFilter = tenantId ? { tenantId } : {};
    const branchFilter = branchId ? { branchId } : {};

    const payrolls = await prisma.payroll.findMany({
      where: {
        ...tenantFilter,
        month: Number(month),
        year: Number(year),
        ...branchFilter,
        isHold: false, // Exclude held salaries from disbursement advice
      },
      include: {
        employee: {
          include: {
            kyc: true,
            branch: true,
          },
        },
      },
    });

    const totalEmployees = payrolls.length;
    const totalAmount = payrolls.reduce((sum, p) => sum + p.netPay, 0);

    const refPrefix = tenantId ? `PA-${tenantId.slice(0, 4).toUpperCase()}` : 'PA';
    const refCode = `${refPrefix}-${year}${String(month).padStart(2, '0')}-${branchId ? 'BR' : 'ALL'}-${Date.now().toString().slice(-4)}`;

    const advice = await prisma.paymentAdvice.create({
      data: {
        tenantId: tenantId || payrolls[0]?.tenantId || '',
        month: Number(month),
        year: Number(year),
        branchId: branchId || null,
        bankName,
        totalEmployees,
        totalAmount,
        status: 'GENERATED',
        referenceNumber: refCode,
      },
      include: {
        branch: true,
      },
    });

    return {
      advice,
      details: payrolls.map((p) => ({
        employeeCode: p.employee.employeeCode,
        employeeName: `${p.employee.firstName} ${p.employee.lastName}`,
        branchName: p.employee.branch.name,
        bankName: p.employee.kyc ? p.employee.kyc.bankName : 'N/A',
        accountNumber: p.employee.kyc ? p.employee.kyc.accountNumber : 'N/A',
        ifsc: p.employee.kyc ? p.employee.kyc.ifscCode : 'N/A',
        netPay: p.netPay,
      })),
    };
  }
}

module.exports = SalaryService;
