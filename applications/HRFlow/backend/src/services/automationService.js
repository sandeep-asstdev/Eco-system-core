const prisma = require('../config/db');
const { logAudit } = require('../middleware/audit');
const OutboxService = require('./outboxService');

class AutomationService {
  /**
   * Rule 1: When joining formalities are completed
   * - Employee is marked/created as ACTIVE with tenantId
   * - Position is marked FILLED and CLOSED
   * - BM SIM & Laptop approval tasks created with tenantId
   * - Notification dispatched strictly to BM of that tenant & branch
   */
  static async onJoiningCompleted({ joiningRecordId, employeeData, hrUserId, ipAddress }) {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch joining record
      const joining = await tx.joiningRecord.findUnique({
        where: { id: joiningRecordId },
        include: { position: true, branch: true, tenant: true },
      });

      if (!joining) {
        throw new Error('Joining record not found');
      }

      const tenantId = joining.tenantId;

      // Generate tenant-scoped employee code (e.g. prefix from settings or default)
      const prefix = joining.tenant?.settings?.codeFormats?.employeeCodePrefix || 'EMP-';
      const empCount = await tx.employee.count({ where: { tenantId } });
      const employeeCode = `${prefix}${1000 + empCount + 1}`;

      // 2. Create official Employee record
      const employee = await tx.employee.create({
        data: {
          tenantId,
          employeeCode,
          firstName: employeeData.firstName || joining.candidateName.split(' ')[0],
          lastName: employeeData.lastName || joining.candidateName.split(' ').slice(1).join(' ') || 'Employee',
          email: employeeData.email || joining.candidateEmail,
          phone: employeeData.phone || joining.candidatePhone,
          gender: employeeData.gender || 'Male',
          dob: employeeData.dob ? new Date(employeeData.dob) : new Date('1995-01-01'),
          branchId: joining.branchId,
          department: joining.department,
          designation: joining.designation,
          dateOfJoining: joining.joiningDate,
          employmentType: 'FULL_TIME',
          status: 'ACTIVE',
        },
        include: { branch: true },
      });

      // Record Transactional Outbox Event
      await OutboxService.recordEvent(tx, {
        eventType: 'employee.created',
        employee,
        metadata: { source: 'JOINING_ONBOARDING', joiningRecordId },
      });

      // Create KYC
      if (employeeData.pan || employeeData.aadhaar) {
        await tx.employeeKYC.create({
          data: {
            employeeId: employee.id,
            aadhaarNumber: employeeData.aadhaar || 'Pending',
            panNumber: employeeData.pan || 'Pending',
            bankName: employeeData.bankName || 'HDFC Bank',
            accountNumber: employeeData.accountNumber || 'Pending',
            ifscCode: employeeData.ifsc || 'HDFC0000001',
            branchName: joining.branch.city,
            verified: true,
          },
        });
      }

      // Create Statutory
      await tx.employeeStatutory.create({
        data: {
          employeeId: employee.id,
          pfApplicable: true,
          esiApplicable: true,
        },
      });

      // Create base Salary
      const basic = employeeData.basic || 30000;
      const hra = basic * 0.5;
      const special = basic * 0.3;
      const gross = basic + hra + special;

      await tx.employeeSalary.create({
        data: {
          employeeId: employee.id,
          basic,
          hra,
          specialAllowance: special,
          grossSalary: gross,
          effectiveDate: joining.joiningDate,
        },
      });

      // 3. Mark Joining Record COMPLETED
      await tx.joiningRecord.update({
        where: { id: joiningRecordId },
        data: {
          status: 'COMPLETED',
        },
      });

      // 4. Update Position to FILLED/CLOSED
      if (joining.positionId) {
        await tx.position.update({
          where: { id: joining.positionId },
          data: {
            status: 'CLOSED',
          },
        });
      }

      // 5. Create BM Approval Tasks for SIM & Laptop (strictly tenant-scoped)
      await tx.approval.create({
        data: {
          tenantId,
          type: 'SIM_REQUEST',
          referenceId: employee.id,
          branchId: joining.branchId,
          requestedById: hrUserId,
          status: 'PENDING',
          remarks: `New Joiner SIM allocation for ${employee.firstName} ${employee.lastName} (${employeeCode})`,
        },
      });

      await tx.approval.create({
        data: {
          tenantId,
          type: 'LAPTOP_REQUEST',
          referenceId: employee.id,
          branchId: joining.branchId,
          requestedById: hrUserId,
          status: 'PENDING',
          remarks: `New Joiner Laptop allocation for ${employee.firstName} ${employee.lastName} (${employeeCode})`,
        },
      });

      // 6. Notify Branch Manager(s) of this specific tenant & branch
      const bmUsers = await tx.user.findMany({
        where: { tenantId, branchId: joining.branchId, role: 'BM' },
      });

      for (const bm of bmUsers) {
        await tx.notification.create({
          data: {
            tenantId,
            userId: bm.id,
            title: 'New Joiner Ready for Asset Approval',
            message: `${employee.firstName} ${employee.lastName} has joined ${joining.branch.name}. Please approve SIM & Laptop allocation.`,
            type: 'ACTION_REQUIRED',
            link: '/approvals',
          },
        });
      }

      // 7. Audit Log
      await tx.auditLog.create({
        data: {
          tenantId,
          userId: hrUserId,
          action: 'JOINING_COMPLETED',
          module: 'JOINING',
          recordId: employee.id,
          newValue: `Onboarding completed for ${employee.firstName} ${employee.lastName}. Position closed. Asset approvals triggered.`,
          ipAddress,
        },
      });

      return { employee, joining };
    });
  }

  /**
   * Rule 2: When an employee resigns
   * - Employee status -> RESIGNED
   * - Salary status -> ON_HOLD
   * - Automatic replacement position created with status OPEN and tenantId
   * - Create Resignation & NOC tracking records with tenantId
   * - Notify HR users of the same tenant
   */
  static async onEmployeeResignation({ employeeId, reason, noticePeriodDays, proposedLwd, requestedUserId, ipAddress }) {
    return await prisma.$transaction(async (tx) => {
      const employee = await tx.employee.findUnique({
        where: { id: employeeId },
        include: { branch: true },
      });

      if (!employee) throw new Error('Employee not found');
      const tenantId = employee.tenantId;

      // 1. Create Resignation record with ON_HOLD salary status
      const resignation = await tx.resignation.create({
        data: {
          tenantId,
          employeeId,
          resignationDate: new Date(),
          noticePeriodDays: noticePeriodDays || 30,
          proposedLastWorkingDate: proposedLwd ? new Date(proposedLwd) : new Date(Date.now() + 30 * 86400000),
          reason: reason || 'Personal reasons',
          status: 'SUBMITTED',
          salaryHoldStatus: 'ON_HOLD',
        },
      });

      // 2. Update employee status to RESIGNED
      const updatedEmp = await tx.employee.update({
        where: { id: employeeId },
        data: {
          status: 'RESIGNED',
        },
        include: { branch: true },
      });

      // Record Transactional Outbox Event for Deactivation
      await OutboxService.recordEvent(tx, {
        eventType: 'employee.deactivated',
        employee: updatedEmp,
        metadata: { source: 'RESIGNATION', resignationId: resignation.id, reason },
      });

      // 3. Mark existing payroll/salary holds
      await tx.payroll.updateMany({
        where: {
          tenantId,
          employeeId,
          status: 'PROCESSED',
        },
        data: {
          isHold: true,
        },
      });

      // 4. Auto-create replacement position in Vacancy Master
      const positionCode = `POS-REP-${employee.employeeCode}-${Date.now().toString().slice(-4)}`;
      const replacementPosition = await tx.position.create({
        data: {
          tenantId,
          positionCode,
          title: `${employee.designation} (Replacement for ${employee.employeeCode})`,
          department: employee.department,
          branchId: employee.branchId,
          requiredCount: 1,
          status: 'OPEN',
          reasonForOpening: `Automatic replacement vacancy created due to resignation of ${employee.firstName} ${employee.lastName} (${employee.employeeCode}).`,
          sourceResignationId: resignation.id,
        },
      });

      // 5. Initialize NOC record
      await tx.nocRecord.create({
        data: {
          tenantId,
          employeeId,
          resignationId: resignation.id,
          departmentClearance: false,
          assetClearance: false,
          financeClearance: false,
          status: 'PENDING',
          remarks: 'Awaiting Department, IT/Asset, and Finance clearance.',
        },
      });

      // 6. Notify only HR users of THIS tenant
      const hrUsers = await tx.user.findMany({ where: { tenantId, role: 'HR' } });
      for (const hr of hrUsers) {
        await tx.notification.create({
          data: {
            tenantId,
            userId: hr.id,
            title: 'New Resignation Submitted',
            message: `${employee.firstName} ${employee.lastName} (${employee.employeeCode}) submitted resignation. Salary placed on hold. Replacement position ${positionCode} opened.`,
            type: 'ALERT',
            link: '/exit',
          },
        });
      }

      // 7. Audit Log
      await tx.auditLog.create({
        data: {
          tenantId,
          userId: requestedUserId,
          action: 'EMPLOYEE_RESIGNED',
          module: 'EXIT',
          recordId: resignation.id,
          previousValue: 'ACTIVE',
          newValue: 'RESIGNED_SALARY_ON_HOLD_POSITION_OPENED',
          ipAddress,
        },
      });

      return { resignation, replacementPosition };
    });
  }

  /**
   * Rule 3: When employee is marked LEFT_WITHOUT_INTIMATION
   * - Employee status -> LEFT_WITHOUT_INTIMATION
   * - Salary placed ON_HOLD
   * - Automatic replacement position created with status OPEN and tenantId
   * - Audit log created with tenantId
   * - Alerts dispatched to HR of that tenant
   */
  static async onEmployeeLeftWithoutIntimation({ employeeId, remarks, actionUserId, ipAddress }) {
    return await prisma.$transaction(async (tx) => {
      const employee = await tx.employee.findUnique({
        where: { id: employeeId },
        include: { branch: true },
      });

      if (!employee) throw new Error('Employee not found');
      const tenantId = employee.tenantId;

      // 1. Update Employee status
      const updatedEmployee = await tx.employee.update({
        where: { id: employeeId },
        data: {
          status: 'LEFT_WITHOUT_INTIMATION',
        },
      });

      // 2. Put payroll on HOLD
      await tx.payroll.updateMany({
        where: {
          tenantId,
          employeeId,
          status: 'PROCESSED',
        },
        data: {
          isHold: true,
        },
      });

      // 3. Auto-create replacement position in Vacancy Master
      const positionCode = `POS-LWI-${employee.employeeCode}-${Date.now().toString().slice(-4)}`;
      const replacementPosition = await tx.position.create({
        data: {
          tenantId,
          positionCode,
          title: `${employee.designation} (Urgent Replacement - LWI)`,
          department: employee.department,
          branchId: employee.branchId,
          requiredCount: 1,
          status: 'OPEN',
          reasonForOpening: `Automatic replacement vacancy created because ${employee.firstName} ${employee.lastName} (${employee.employeeCode}) was marked Left Without Intimation.`,
        },
      });

      // 4. Notify HR of this tenant
      const hrUsers = await tx.user.findMany({ where: { tenantId, role: 'HR' } });
      for (const hr of hrUsers) {
        await tx.notification.create({
          data: {
            tenantId,
            userId: hr.id,
            title: 'Employee Marked Left Without Intimation',
            message: `${employee.firstName} ${employee.lastName} (${employee.employeeCode}) was marked Left Without Intimation by ${remarks || 'management'}. Replacement position opened.`,
            type: 'ALERT',
            link: '/vacancies',
          },
        });
      }

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          tenantId,
          userId: actionUserId,
          action: 'LEFT_WITHOUT_INTIMATION',
          module: 'EMPLOYEE',
          recordId: employee.id,
          previousValue: employee.status,
          newValue: 'LEFT_WITHOUT_INTIMATION',
          ipAddress,
        },
      });

      return { employee: updatedEmployee, replacementPosition };
    });
  }

  /**
   * Rule 4: When BM approves SIM/Laptop
   * - Approval status updated to APPROVED
   * - HR notification dispatched strictly to HR of that tenant
   */
  static async onBmAssetApproval({ approvalId, approverUserId, status, remarks, ipAddress }) {
    return await prisma.$transaction(async (tx) => {
      const approval = await tx.approval.update({
        where: { id: approvalId },
        data: {
          status,
          remarks,
          approverId: approverUserId,
        },
        include: { branch: true },
      });

      const tenantId = approval.tenantId;

      if (status === 'APPROVED') {
        // Dispatches notification strictly to HR users of this tenant
        const hrUsers = await tx.user.findMany({ where: { tenantId, role: 'HR' } });
        for (const hr of hrUsers) {
          await tx.notification.create({
            data: {
              tenantId,
              userId: hr.id,
              title: `BM Approved ${approval.type === 'SIM_REQUEST' ? 'SIM' : 'Laptop'} Allocation`,
              message: `Branch Manager at ${approval.branch.name} approved ${approval.type} (${approval.remarks || 'Standard asset allocation'}). Ready for HR dispatch.`,
              type: 'ACTION_REQUIRED',
              link: '/approvals',
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          tenantId,
          userId: approverUserId,
          action: `BM_${status}_${approval.type}`,
          module: 'APPROVALS',
          recordId: approval.id,
          newValue: status,
          ipAddress,
        },
      });

      return approval;
    });
  }
}

module.exports = AutomationService;
