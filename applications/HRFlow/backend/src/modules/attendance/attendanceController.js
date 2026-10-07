const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/apiResponse');

const getAttendance = async (req, res) => {
  try {
    const { role, branchId: userBranchId, employeeId: userEmpId, tenantId } = req.user;
    const { date, employeeId } = req.query;

    const where = {};

    if (role !== 'PLATFORM_ADMIN') {
      where.tenantId = tenantId;
    }

    if (role === 'EMPLOYEE') {
      where.employeeId = userEmpId;
    } else if (role === 'BM') {
      where.employee = { branchId: userBranchId };
      if (employeeId) where.employeeId = employeeId;
    } else if (employeeId) {
      where.employeeId = employeeId;
    }

    if (date) {
      where.date = new Date(date);
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            designation: true,
            branch: { select: { name: true } },
          },
        },
        corrections: true,
      },
      orderBy: { date: 'desc' },
      take: 100,
    });

    return successResponse(res, attendances);
  } catch (err) {
    console.error('Error fetching attendance:', err);
    return errorResponse(res, 'Failed to fetch attendance records', 500);
  }
};

const punchAttendance = async (req, res) => {
  try {
    const { employeeId, tenantId } = req.user;
    if (!employeeId) return errorResponse(res, 'Only employees can record punches', 403);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    let attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: today,
        },
      },
    });

    if (!attendance) {
      // Clock IN
      attendance = await prisma.attendance.create({
        data: {
          tenantId,
          employeeId,
          date: today,
          inTime: timeString,
          status: 'PRESENT',
        },
      });
      return successResponse(res, attendance, `Clocked in successfully at ${timeString}`);
    } else {
      // Clock OUT
      const updated = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          outTime: timeString,
          totalHours: 8.5,
        },
      });
      return successResponse(res, updated, `Clocked out successfully at ${timeString}`);
    }
  } catch (err) {
    console.error('Punch error:', err);
    return errorResponse(res, 'Failed to record punch', 500);
  }
};

const requestCorrection = async (req, res) => {
  try {
    const { employeeId, tenantId } = req.user;
    const { requestedDate, punchIn, punchOut, reason, attendanceId } = req.body;

    if (!requestedDate || !punchIn || !punchOut || !reason) {
      return errorResponse(res, 'Date, Punch In, Punch Out, and Reason are required', 400);
    }

    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) return errorResponse(res, 'Employee not found', 404);

    const targetTenantId = employee.tenantId || tenantId;

    const correction = await prisma.attendanceCorrection.create({
      data: {
        tenantId: targetTenantId,
        attendanceId: attendanceId || null,
        employeeId,
        requestedDate: new Date(requestedDate),
        punchIn,
        punchOut,
        reason,
        status: 'PENDING',
      },
    });

    // Create BM approval task with tenantId
    await prisma.approval.create({
      data: {
        tenantId: targetTenantId,
        type: 'ATTENDANCE_CORRECTION',
        referenceId: correction.id,
        branchId: employee.branchId,
        requestedById: req.user.id,
        status: 'PENDING',
        remarks: `Attendance correction requested for ${new Date(requestedDate).toLocaleDateString()}: ${reason}`,
      },
    });

    return successResponse(res, correction, 'Attendance correction request submitted for BM approval', 201);
  } catch (err) {
    console.error('Correction request error:', err);
    return errorResponse(res, 'Failed to submit attendance correction request', 500);
  }
};

const getCorrections = async (req, res) => {
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

    const corrections = await prisma.attendanceCorrection.findMany({
      where,
      include: {
        employee: {
          select: {
            employeeCode: true,
            firstName: true,
            lastName: true,
            designation: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, corrections);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch attendance corrections', 500);
  }
};

module.exports = {
  getAttendance,
  punchAttendance,
  requestCorrection,
  getCorrections,
};
