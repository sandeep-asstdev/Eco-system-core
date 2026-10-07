const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/apiResponse');
const AutomationService = require('../../services/automationService');

const getApprovals = async (req, res) => {
  try {
    const { role, branchId: userBranchId, tenantId } = req.user;
    const { status, type } = req.query;

    const where = {};

    if (role !== 'PLATFORM_ADMIN') {
      where.tenantId = tenantId;
    }

    if (role === 'BM') {
      where.branchId = userBranchId;
    }
    if (status) where.status = status;
    if (type) where.type = type;

    const approvals = await prisma.approval.findMany({
      where,
      include: {
        branch: { select: { name: true, city: true, code: true } },
        requestedBy: { select: { email: true, role: true } },
        approver: { select: { email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, approvals);
  } catch (err) {
    console.error('Error fetching approvals:', err);
    return errorResponse(res, 'Failed to fetch approvals', 500);
  }
};

const handleApprovalAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body; // status: 'APPROVED' | 'REJECTED'
    const { role, branchId: userBranchId, id: userId, tenantId } = req.user;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return errorResponse(res, 'Status must be APPROVED or REJECTED', 400);
    }

    const approval = await prisma.approval.findUnique({ where: { id } });
    if (!approval) {
      return errorResponse(res, 'Approval record not found', 404);
    }

    if (role !== 'PLATFORM_ADMIN' && approval.tenantId !== tenantId) {
      return errorResponse(res, 'Access denied to approval request of another dealer organization', 403);
    }

    if (role === 'BM' && approval.branchId !== userBranchId) {
      return errorResponse(res, 'Cannot act on approvals for another branch', 403);
    }

    let result;

    if (approval.type === 'SIM_REQUEST' || approval.type === 'LAPTOP_REQUEST') {
      // Rule 4 automation
      result = await AutomationService.onBmAssetApproval({
        approvalId: id,
        approverUserId: userId,
        status,
        remarks: remarks || `BM marked as ${status}`,
        ipAddress: req.ip,
      });

      // If approved, create the actual EmployeeAsset record with tenantId
      if (status === 'APPROVED' && approval.referenceId) {
        const assetType = approval.type === 'SIM_REQUEST' ? 'SIM' : 'LAPTOP';
        const assetName = approval.type === 'SIM_REQUEST' ? 'Corporate 5G SIM' : 'Enterprise Laptop';
        const serialNumber = `SN-${assetType}-${Date.now().toString().slice(-6)}`;

        await prisma.employeeAsset.create({
          data: {
            tenantId: approval.tenantId,
            employeeId: approval.referenceId,
            assetType,
            assetName,
            serialNumber,
            status: 'ASSIGNED',
            issueDate: new Date(),
          },
        });
      }
    } else if (approval.type === 'SALARY_ADVANCE') {
      // Update salary advance status
      result = await prisma.approval.update({
        where: { id },
        data: {
          status,
          remarks,
          approverId: userId,
        },
      });

      if (approval.referenceId) {
        await prisma.salaryAdvance.update({
          where: { id: approval.referenceId },
          data: {
            status: status === 'APPROVED' ? (role === 'BM' ? 'PENDING_HR' : 'APPROVED') : 'REJECTED',
            bmRemarks: role === 'BM' ? remarks : undefined,
            hrRemarks: role === 'HR' ? remarks : undefined,
          },
        });
      }
    } else if (approval.type === 'ATTENDANCE_CORRECTION') {
      result = await prisma.approval.update({
        where: { id },
        data: { status, remarks, approverId: userId },
      });

      if (approval.referenceId) {
        await prisma.attendanceCorrection.update({
          where: { id: approval.referenceId },
          data: {
            status,
            reviewedBy: req.user.email,
          },
        });
      }
    } else {
      result = await prisma.approval.update({
        where: { id },
        data: { status, remarks, approverId: userId },
      });
    }

    return successResponse(res, result, `Approval request has been ${status.toLowerCase()}`);
  } catch (err) {
    console.error('Error handling approval action:', err);
    return errorResponse(res, 'Failed to process approval action', 500);
  }
};

module.exports = {
  getApprovals,
  handleApprovalAction,
};
