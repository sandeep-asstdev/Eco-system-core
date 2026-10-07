const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/apiResponse');
const { logAudit } = require('../../middleware/audit');
const OutboxService = require('../../services/outboxService');

const getEmployees = async (req, res) => {
  try {
    const { role, branchId: userBranchId, employeeId: userEmpId, tenantId } = req.user;
    const { branchId, department, status, search, page = 1, limit = 20 } = req.query;

    const where = {};

    // 1. Strict Tenant Scoping
    if (role !== 'PLATFORM_ADMIN') {
      where.tenantId = tenantId;
    } else if (req.query.tenantId) {
      where.tenantId = req.query.tenantId;
    }

    // 2. Role and Branch Scoping
    if (role === 'BM') {
      where.branchId = userBranchId;
    } else if (role === 'EMPLOYEE') {
      where.id = userEmpId;
    } else if (branchId) {
      where.branchId = branchId;
    }

    if (department) where.department = department;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [total, employees] = await Promise.all([
      prisma.employee.count({ where }),
      prisma.employee.findMany({
        where,
        include: {
          branch: { select: { id: true, name: true, city: true, code: true } },
          level: { select: { id: true, levelNumber: true, name: true } },
          designationRel: { select: { id: true, name: true, code: true, levelId: true } },
          reportingManager: { select: { id: true, firstName: true, lastName: true, employeeCode: true, designation: true } },
          salary: true,
          kyc: { select: { verified: true, bankName: true } },
          _count: {
            select: { assets: true, documents: true },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return successResponse(res, {
      employees,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Error fetching employees:', err);
    return errorResponse(res, 'Failed to fetch employees', 500);
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, branchId: userBranchId, employeeId: userEmpId, tenantId } = req.user;

    if (role === 'EMPLOYEE' && userEmpId !== id) {
      return errorResponse(res, 'Access denied: You may only view your own employee profile', 403);
    }

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        branch: true,
        level: true,
        designationRel: true,
        reportingManager: {
          select: { id: true, firstName: true, lastName: true, employeeCode: true, designation: true },
        },
        directReports: {
          select: { id: true, firstName: true, lastName: true, employeeCode: true, designation: true },
        },
        kyc: true,
        statutory: true,
        salary: true,
        salaryHikes: { orderBy: { effectiveDate: 'desc' } },
        assets: { orderBy: { issueDate: 'desc' } },
        documents: { orderBy: { uploadedAt: 'desc' } },
        transfers: {
          include: { fromBranch: true, toBranch: true },
          orderBy: { transferDate: 'desc' },
        },
        salaryAdvances: { orderBy: { createdAt: 'desc' } },
        attendances: { take: 30, orderBy: { date: 'desc' } },
        resignations: {
          include: { nocRecords: true, fnfRecords: true },
          orderBy: { resignationDate: 'desc' },
        },
      },
    });

    if (!employee) {
      return errorResponse(res, 'Employee not found', 404);
    }

    // Strict cross-tenant isolation
    if (role !== 'PLATFORM_ADMIN' && employee.tenantId !== tenantId) {
      return errorResponse(
        res,
        'Access Denied: You cannot view employee records of another dealer organization.',
        403
      );
    }

    if (role === 'BM' && employee.branchId !== userBranchId) {
      return errorResponse(res, 'Access denied to employee of another branch', 403);
    }

    return successResponse(res, employee);
  } catch (err) {
    console.error('Error fetching employee detail:', err);
    return errorResponse(res, 'Failed to fetch employee details', 500);
  }
};

const detectCircularReporting = async (employeeId, managerId) => {
  let currentId = managerId;
  const visited = new Set();
  while (currentId) {
    if (currentId === employeeId) {
      return true;
    }
    if (visited.has(currentId)) {
      break;
    }
    visited.add(currentId);
    const mgr = await prisma.employee.findUnique({
      where: { id: currentId },
      select: { reportingManagerId: true },
    });
    currentId = mgr ? mgr.reportingManagerId : null;
  }
  return false;
};

const createEmployee = async (req, res) => {
  try {
    const { role, tenantId: userTenantId } = req.user;
    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
      dob,
      bloodGroup,
      maritalStatus,
      branchId,
      department,
      designation,
      levelId,
      designationId,
      reportingManagerId,
      dateOfJoining,
      employmentType,
      basic,
      hra,
      specialAllowance,
      tenantId: bodyTenantId,
    } = req.body;

    if (!firstName || !lastName || !email || !branchId || !department || (!designation && !designationId)) {
      return errorResponse(
        res,
        'Required fields missing: First Name, Last Name, Email, Branch, Department, Designation',
        400
      );
    }

    const targetTenantId = role === 'PLATFORM_ADMIN' ? (bodyTenantId || userTenantId) : userTenantId;
    if (!targetTenantId) {
      return errorResponse(res, 'Target dealership tenant must be specified', 400);
    }

    // Verify requested branchId belongs to this tenant
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch || branch.tenantId !== targetTenantId) {
      return errorResponse(res, 'Selected branch does not belong to this dealer organization', 403);
    }

    // Validate level and designation if provided
    let resolvedLevelId = levelId || null;
    let resolvedDesignationId = designationId || null;
    let resolvedDesignationName = designation || '';

    if (resolvedDesignationId) {
      const desig = await prisma.designation.findUnique({
        where: { id: resolvedDesignationId },
        include: { level: true },
      });
      if (!desig || desig.tenantId !== targetTenantId) {
        return errorResponse(res, 'Designation not found in this organization', 400);
      }
      if (!desig.isActive) {
        return errorResponse(res, 'Selected designation is inactive', 400);
      }
      if (resolvedLevelId && desig.levelId !== resolvedLevelId) {
        return errorResponse(
          res,
          `Designation '${desig.name}' does not belong to the selected level (expected Level ${desig.level.levelNumber} - ${desig.level.name})`,
          400
        );
      }
      resolvedLevelId = desig.levelId;
      resolvedDesignationName = desig.name;
    } else if (resolvedLevelId) {
      const lvl = await prisma.employeeLevel.findUnique({ where: { id: resolvedLevelId } });
      if (!lvl || lvl.tenantId !== targetTenantId) {
        return errorResponse(res, 'Employee level not found in this organization', 400);
      }
      if (!lvl.isActive) {
        return errorResponse(res, 'Selected employee level is inactive', 400);
      }
    }

    let resolvedReportingManagerId = reportingManagerId || null;
    if (resolvedReportingManagerId) {
      const manager = await prisma.employee.findUnique({ where: { id: resolvedReportingManagerId } });
      if (!manager || manager.tenantId !== targetTenantId) {
        return errorResponse(res, 'Reporting manager not found in this organization', 400);
      }
    }

    // Tenant-scoped unique check for email
    const existing = await prisma.employee.findUnique({
      where: {
        tenantId_email: {
          tenantId: targetTenantId,
          email: email.toLowerCase().trim(),
        },
      },
    });

    if (existing) {
      return errorResponse(res, 'An employee with this email already exists in this dealership', 400);
    }

    // Count employees in this tenant for code generation
    const count = await prisma.employee.count({ where: { tenantId: targetTenantId } });
    const employeeCode = `EMP-${1000 + count + 1}`;

    const employee = await prisma.$transaction(async (tx) => {
      const emp = await tx.employee.create({
        data: {
          tenantId: targetTenantId,
          employeeCode,
          firstName,
          lastName,
          email: email.toLowerCase().trim(),
          phone: phone || '',
          gender: gender || 'Other',
          dob: dob ? new Date(dob) : new Date('1995-01-01'),
          bloodGroup,
          maritalStatus,
          branchId,
          department,
          designation: resolvedDesignationName || designation,
          levelId: resolvedLevelId,
          designationId: resolvedDesignationId,
          reportingManagerId: resolvedReportingManagerId,
          dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : new Date(),
          employmentType: employmentType || 'FULL_TIME',
          status: 'ACTIVE',
        },
        include: {
          branch: true,
          level: true,
          designationRel: true,
          reportingManager: true,
        },
      });

      // Create default KYC record
      await tx.employeeKYC.create({
        data: {
          employeeId: emp.id,
          aadhaarNumber: 'Pending Verification',
          panNumber: 'Pending Verification',
          bankName: 'HDFC Bank',
          accountNumber: 'Pending',
          ifscCode: 'HDFC0000001',
          branchName: emp.branch.city,
        },
      });

      // Create Statutory record
      await tx.employeeStatutory.create({
        data: {
          employeeId: emp.id,
          pfApplicable: true,
          esiApplicable: true,
        },
      });

      // Create Salary record if basic is provided
      const basePay = parseFloat(basic) || 30000;
      const hraPay = parseFloat(hra) || basePay * 0.5;
      const specialPay = parseFloat(specialAllowance) || basePay * 0.3;
      const gross = basePay + hraPay + specialPay;

      await tx.employeeSalary.create({
        data: {
          employeeId: emp.id,
          basic: basePay,
          hra: hraPay,
          specialAllowance: specialPay,
          grossSalary: gross,
        },
      });

      // Transactional Outbox Event in same database transaction
      await OutboxService.recordEvent(tx, {
        eventType: 'employee.created',
        employee: emp,
        metadata: { source: 'MANUAL_CREATE' },
      });

      return emp;
    });

    await logAudit({
      tenantId: targetTenantId,
      userId: req.user.id,
      action: 'EMPLOYEE_CREATED',
      module: 'EMPLOYEE',
      recordId: employee.id,
      newValue: `Created employee ${firstName} ${lastName} (${employeeCode})`,
      ipAddress: req.ip,
    });

    return successResponse(res, employee, 'Employee created successfully', 201);
  } catch (err) {
    console.error('Error creating employee:', err);
    return errorResponse(res, 'Failed to create employee', 500);
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const { role, branchId: userBranchId, employeeId: userEmpId, tenantId } = req.user;

    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Employee not found', 404);
    }

    // Cross-tenant isolation check
    if (role !== 'PLATFORM_ADMIN' && existing.tenantId !== tenantId) {
      return errorResponse(res, 'Cannot update employee of another dealer organization', 403);
    }

    if (role === 'EMPLOYEE') {
      if (userEmpId !== id) {
        return errorResponse(res, 'Cannot update other employee records', 403);
      }
      const allowedKeys = ['phone', 'bloodGroup', 'maritalStatus'];
      const filtered = {};
      for (const k of allowedKeys) {
        if (updateData[k] !== undefined) filtered[k] = updateData[k];
      }
      const updated = await prisma.employee.update({
        where: { id },
        data: filtered,
      });
      return successResponse(res, updated, 'Profile updated successfully');
    }

    if (role === 'BM' && existing.branchId !== userBranchId) {
      return errorResponse(res, 'Cannot modify employee of another branch', 403);
    }

    // If branchId is being changed, verify target branch belongs to same tenant
    if (updateData.branchId && updateData.branchId !== existing.branchId) {
      const targetBranch = await prisma.branch.findUnique({ where: { id: updateData.branchId } });
      if (!targetBranch || targetBranch.tenantId !== existing.tenantId) {
        return errorResponse(res, 'Target branch must belong to the same dealer organization', 403);
      }
    }

    let resolvedLevelId = existing.levelId;
    let resolvedDesignationId = existing.designationId;
    let resolvedDesignationName = updateData.designation !== undefined ? updateData.designation : existing.designation;
    let resolvedReportingManagerId = existing.reportingManagerId;

    if (updateData.levelId !== undefined) {
      if (updateData.levelId === null || updateData.levelId === '') {
        resolvedLevelId = null;
      } else {
        const lvl = await prisma.employeeLevel.findUnique({ where: { id: updateData.levelId } });
        if (!lvl || lvl.tenantId !== existing.tenantId) {
          return errorResponse(res, 'Employee level not found in this organization', 400);
        }
        if (!lvl.isActive) {
          return errorResponse(res, 'Selected employee level is inactive', 400);
        }
        resolvedLevelId = lvl.id;
      }
    }

    if (updateData.designationId !== undefined) {
      if (updateData.designationId === null || updateData.designationId === '') {
        resolvedDesignationId = null;
      } else {
        const desig = await prisma.designation.findUnique({
          where: { id: updateData.designationId },
          include: { level: true },
        });
        if (!desig || desig.tenantId !== existing.tenantId) {
          return errorResponse(res, 'Designation not found in this organization', 400);
        }
        if (!desig.isActive) {
          return errorResponse(res, 'Selected designation is inactive', 400);
        }
        if (resolvedLevelId && desig.levelId !== resolvedLevelId) {
          return errorResponse(
            res,
            `Designation '${desig.name}' does not belong to the selected level (expected Level ${desig.level.levelNumber} - ${desig.level.name})`,
            400
          );
        }
        resolvedDesignationId = desig.id;
        resolvedLevelId = desig.levelId;
        resolvedDesignationName = desig.name;
      }
    }

    if (updateData.reportingManagerId !== undefined) {
      if (updateData.reportingManagerId === null || updateData.reportingManagerId === '') {
        resolvedReportingManagerId = null;
      } else {
        if (updateData.reportingManagerId === id) {
          return errorResponse(res, 'An employee cannot be their own reporting manager', 400);
        }
        const manager = await prisma.employee.findUnique({ where: { id: updateData.reportingManagerId } });
        if (!manager || manager.tenantId !== existing.tenantId) {
          return errorResponse(res, 'Reporting manager not found in this organization', 400);
        }
        const hasCycle = await detectCircularReporting(id, updateData.reportingManagerId);
        if (hasCycle) {
          return errorResponse(res, 'Circular reporting relationship detected: cannot assign direct or indirect report as manager', 400);
        }
        resolvedReportingManagerId = manager.id;
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const isTransfer = updateData.branchId && updateData.branchId !== existing.branchId;
      const statusChanged = updateData.status && updateData.status !== existing.status;
      const isDeactivation = statusChanged && ['RESIGNED', 'TERMINATED', 'LEFT_WITHOUT_INTIMATION', 'INACTIVE'].includes(updateData.status);
      const isReactivation = statusChanged && existing.status !== 'ACTIVE' && updateData.status === 'ACTIVE';

      if (isTransfer) {
        await tx.employeeTransfer.create({
          data: {
            tenantId: existing.tenantId,
            employeeId: id,
            fromBranchId: existing.branchId,
            toBranchId: updateData.branchId,
            effectiveDate: new Date(),
            reason: updateData.reason || 'Branch transfer via employee profile update',
            status: 'COMPLETED',
          },
        });
      }

      const up = await tx.employee.update({
        where: { id },
        data: {
          firstName: updateData.firstName,
          lastName: updateData.lastName,
          phone: updateData.phone,
          gender: updateData.gender,
          bloodGroup: updateData.bloodGroup,
          maritalStatus: updateData.maritalStatus,
          branchId: updateData.branchId,
          department: updateData.department,
          designation: resolvedDesignationName,
          levelId: resolvedLevelId,
          designationId: resolvedDesignationId,
          reportingManagerId: resolvedReportingManagerId,
          employmentType: updateData.employmentType,
          status: updateData.status,
        },
        include: {
          tenant: true,
          branch: true,
          level: true,
          designationRel: true,
          reportingManager: true,
        },
      });

      // Determine versioned eventType
      let eventType = 'employee.updated';
      if (isTransfer) {
        eventType = 'employee.transferred';
      } else if (isDeactivation) {
        eventType = 'employee.deactivated';
      } else if (isReactivation) {
        eventType = 'employee.reactivated';
      }

      await OutboxService.recordEvent(tx, {
        eventType,
        employee: up,
        metadata: {
          previousStatus: existing.status,
          previousBranchId: existing.branchId,
          source: 'PROFILE_UPDATE',
        },
      });

      return up;
    });

    await logAudit({
      tenantId: existing.tenantId,
      userId: req.user.id,
      action: 'EMPLOYEE_UPDATED',
      module: 'EMPLOYEE',
      recordId: id,
      previousValue: existing,
      newValue: updated,
      ipAddress: req.ip,
    });

    return successResponse(res, updated, 'Employee updated successfully');
  } catch (err) {
    console.error('Error updating employee:', err);
    return errorResponse(res, 'Failed to update employee', 500);
  }
};

const updateKYC = async (req, res) => {
  try {
    const { id } = req.params; // employeeId
    const { aadhaarNumber, panNumber, bankName, accountNumber, ifscCode, branchName, verified } = req.body;
    const { role, tenantId } = req.user;

    const emp = await prisma.employee.findUnique({ where: { id } });
    if (!emp) return errorResponse(res, 'Employee not found', 404);

    if (role !== 'PLATFORM_ADMIN' && emp.tenantId !== tenantId) {
      return errorResponse(res, 'Access denied', 403);
    }

    const kyc = await prisma.employeeKYC.upsert({
      where: { employeeId: id },
      update: {
        aadhaarNumber,
        panNumber,
        bankName,
        accountNumber,
        ifscCode,
        branchName,
        verified: req.user.role === 'HR' && verified !== undefined ? verified : undefined,
      },
      create: {
        employeeId: id,
        aadhaarNumber: aadhaarNumber || '',
        panNumber: panNumber || '',
        bankName: bankName || '',
        accountNumber: accountNumber || '',
        ifscCode: ifscCode || '',
        branchName: branchName || '',
        verified: req.user.role === 'HR' && verified !== undefined ? verified : false,
      },
    });

    return successResponse(res, kyc, 'KYC details updated');
  } catch (err) {
    return errorResponse(res, 'Failed to update KYC details', 500);
  }
};

const updateSalaryStructure = async (req, res) => {
  try {
    const { id } = req.params; // employeeId
    const { basic, hra, conveyance, specialAllowance, reason } = req.body;
    const { role, tenantId } = req.user;

    const emp = await prisma.employee.findUnique({ where: { id } });
    if (!emp) return errorResponse(res, 'Employee not found', 404);

    if (role !== 'PLATFORM_ADMIN' && emp.tenantId !== tenantId) {
      return errorResponse(res, 'Access denied', 403);
    }

    const b = parseFloat(basic) || 0;
    const h = parseFloat(hra) || 0;
    const c = parseFloat(conveyance) || 0;
    const s = parseFloat(specialAllowance) || 0;
    const gross = b + h + c + s;

    const existingSalary = await prisma.employeeSalary.findUnique({ where: { employeeId: id } });

    if (existingSalary && existingSalary.grossSalary !== gross) {
      const percentage = Math.round(((gross - existingSalary.grossSalary) / existingSalary.grossSalary) * 100);
      await prisma.salaryHike.create({
        data: {
          employeeId: id,
          previousSalary: existingSalary.grossSalary,
          newSalary: gross,
          percentage,
          reason: reason || 'Annual revision / Structure adjustment',
          effectiveDate: new Date(),
          approvedBy: req.user.email,
        },
      });
    }

    const salary = await prisma.employeeSalary.upsert({
      where: { employeeId: id },
      update: {
        basic: b,
        hra: h,
        conveyance: c,
        specialAllowance: s,
        grossSalary: gross,
      },
      create: {
        employeeId: id,
        basic: b,
        hra: h,
        conveyance: c,
        specialAllowance: s,
        grossSalary: gross,
      },
    });

    return successResponse(res, salary, 'Salary structure updated');
  } catch (err) {
    return errorResponse(res, 'Failed to update salary structure', 500);
  }
};

const assignAsset = async (req, res) => {
  try {
    const { id } = req.params; // employeeId
    const { assetType, assetName, serialNumber } = req.body;
    const { role, tenantId } = req.user;

    const emp = await prisma.employee.findUnique({ where: { id } });
    if (!emp) return errorResponse(res, 'Employee not found', 404);

    if (role !== 'PLATFORM_ADMIN' && emp.tenantId !== tenantId) {
      return errorResponse(res, 'Access denied', 403);
    }

    if (!assetType || !assetName || !serialNumber) {
      return errorResponse(res, 'Asset type, name, and serial number are required', 400);
    }

    const asset = await prisma.employeeAsset.create({
      data: {
        tenantId: emp.tenantId,
        employeeId: id,
        assetType,
        assetName,
        serialNumber,
        status: 'ASSIGNED',
        issueDate: new Date(),
      },
    });

    return successResponse(res, asset, 'Asset assigned successfully', 201);
  } catch (err) {
    return errorResponse(res, 'Failed to assign asset', 500);
  }
};

const getDigitalIDCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, tenantId } = req.user;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        branch: true,
        tenant: true,
      },
    });

    if (!employee) return errorResponse(res, 'Employee not found', 404);

    if (role !== 'PLATFORM_ADMIN' && employee.tenantId !== tenantId) {
      return errorResponse(res, 'Access denied', 403);
    }

    const digitalCard = {
      organizationName: employee.tenant?.organizationName || 'HRFlow',
      logoUrl: employee.tenant?.logoUrl || null,
      employeeCode: employee.employeeCode,
      fullName: `${employee.firstName} ${employee.lastName}`,
      designation: employee.designation,
      department: employee.department,
      branchName: employee.branch.name,
      bloodGroup: employee.bloodGroup || 'O+',
      emergencyPhone: employee.phone,
      dateOfJoining: employee.dateOfJoining,
      status: employee.status,
      photoUrl: employee.photoUrl || null,
      validUntil: 'December 2027',
    };

    return successResponse(res, digitalCard);
  } catch (err) {
    return errorResponse(res, 'Failed to generate digital ID', 500);
  }
};

/**
 * Tenant-scoped Employee CSV export
 */
const exportEmployees = async (req, res) => {
  try {
    const { role, tenantId, branchId: userBranchId } = req.user;
    const where = {};

    if (role !== 'PLATFORM_ADMIN') {
      where.tenantId = tenantId;
    }
    if (role === 'BM') {
      where.branchId = userBranchId;
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        branch: { select: { name: true, city: true, code: true } },
        salary: true,
      },
      orderBy: { employeeCode: 'asc' },
    });

    // Format as CSV data rows
    const headers = [
      'Employee Code',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Branch',
      'Department',
      'Designation',
      'Status',
      'Gross Salary',
    ];

    const rows = employees.map((e) => [
      `"${e.employeeCode}"`,
      `"${e.firstName}"`,
      `"${e.lastName}"`,
      `"${e.email}"`,
      `"${e.phone || ''}"`,
      `"${e.branch?.name || ''}"`,
      `"${e.department}"`,
      `"${e.designation}"`,
      `"${e.status}"`,
      e.salary?.grossSalary || 0,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=employees_export_${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (err) {
    console.error('Export error:', err);
    return errorResponse(res, 'Failed to export employees', 500);
  }
};

const transferEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { toBranchId, effectiveDate, reason } = req.body;
    const { role, tenantId } = req.user;

    if (!toBranchId) {
      return errorResponse(res, 'Target branch ID is required', 400);
    }

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { branch: true },
    });
    if (!employee) {
      return errorResponse(res, 'Employee not found', 404);
    }

    if (role !== 'PLATFORM_ADMIN' && employee.tenantId !== tenantId) {
      return errorResponse(res, 'Cannot transfer employee of another dealer organization', 403);
    }

    if (employee.branchId === toBranchId) {
      return errorResponse(res, 'Employee is already assigned to this branch', 400);
    }

    const targetBranch = await prisma.branch.findUnique({ where: { id: toBranchId } });
    if (!targetBranch || targetBranch.tenantId !== employee.tenantId) {
      return errorResponse(res, 'Target branch not found in this organization', 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.employeeTransfer.create({
        data: {
          tenantId: employee.tenantId,
          employeeId: id,
          fromBranchId: employee.branchId,
          toBranchId,
          effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
          reason: reason || 'Departmental operational transfer',
          status: 'COMPLETED',
        },
      });

      const up = await tx.employee.update({
        where: { id },
        data: {
          branchId: toBranchId,
          centralBranchId: targetBranch.centralBranchId || null,
        },
        include: { branch: true, tenant: true, level: true, designationRel: true },
      });

      await OutboxService.recordEvent(tx, {
        eventType: 'employee.transferred',
        employee: up,
        metadata: {
          fromBranchId: employee.branchId,
          toBranchId,
          centralBranchId: targetBranch.centralBranchId,
          reason,
        },
      });

      return up;
    });

    await logAudit({
      tenantId: employee.tenantId,
      userId: req.user.id,
      action: 'EMPLOYEE_TRANSFERRED',
      module: 'EMPLOYEE',
      recordId: id,
      previousValue: { branchId: employee.branchId },
      newValue: { branchId: toBranchId },
      ipAddress: req.ip,
    });

    return successResponse(res, updated, 'Employee transferred successfully');
  } catch (err) {
    console.error('Error transferring employee:', err);
    return errorResponse(res, 'Failed to transfer employee', 500);
  }
};

const deactivateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, status = 'RESIGNED' } = req.body;
    const { role, tenantId } = req.user;

    const employee = await prisma.employee.findUnique({ where: { id }, include: { branch: true } });
    if (!employee) return errorResponse(res, 'Employee not found', 404);

    if (role !== 'PLATFORM_ADMIN' && employee.tenantId !== tenantId) {
      return errorResponse(res, 'Access denied: Cross-tenant modification forbidden', 403);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const up = await tx.employee.update({
        where: { id },
        data: { status },
        include: { branch: true, tenant: true },
      });

      await OutboxService.recordEvent(tx, {
        eventType: 'employee.deactivated',
        employee: up,
        metadata: { reason, previousStatus: employee.status },
      });

      return up;
    });

    await logAudit({
      tenantId: employee.tenantId,
      userId: req.user.id,
      action: 'EMPLOYEE_DEACTIVATED',
      module: 'EMPLOYEE',
      recordId: id,
      newValue: `Status changed to ${status}`,
      ipAddress: req.ip,
    });

    return successResponse(res, updated, 'Employee deactivated successfully');
  } catch (err) {
    console.error('Error deactivating employee:', err);
    return errorResponse(res, 'Failed to deactivate employee', 500);
  }
};

const reactivateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, tenantId } = req.user;

    const employee = await prisma.employee.findUnique({ where: { id }, include: { branch: true } });
    if (!employee) return errorResponse(res, 'Employee not found', 404);

    if (role !== 'PLATFORM_ADMIN' && employee.tenantId !== tenantId) {
      return errorResponse(res, 'Access denied: Cross-tenant modification forbidden', 403);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const up = await tx.employee.update({
        where: { id },
        data: { status: 'ACTIVE' },
        include: { branch: true, tenant: true },
      });

      await OutboxService.recordEvent(tx, {
        eventType: 'employee.reactivated',
        employee: up,
        metadata: { previousStatus: employee.status },
      });

      return up;
    });

    await logAudit({
      tenantId: employee.tenantId,
      userId: req.user.id,
      action: 'EMPLOYEE_REACTIVATED',
      module: 'EMPLOYEE',
      recordId: id,
      newValue: 'Status changed to ACTIVE',
      ipAddress: req.ip,
    });

    return successResponse(res, updated, 'Employee reactivated successfully');
  } catch (err) {
    console.error('Error reactivating employee:', err);
    return errorResponse(res, 'Failed to reactivate employee', 500);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  transferEmployee,
  deactivateEmployee,
  reactivateEmployee,
  updateKYC,
  updateSalaryStructure,
  assignAsset,
  getDigitalIDCard,
  exportEmployees,
};
