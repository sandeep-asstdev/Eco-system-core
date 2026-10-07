const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/apiResponse');
const AutomationService = require('../../services/automationService');

const getJoiningRecords = async (req, res) => {
  try {
    const { role, branchId: userBranchId, tenantId } = req.user;
    const where = {};

    if (role !== 'PLATFORM_ADMIN') {
      where.tenantId = tenantId;
    }
    if (role === 'BM') {
      where.branchId = userBranchId;
    }

    const records = await prisma.joiningRecord.findMany({
      where,
      include: {
        branch: true,
        position: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, records);
  } catch (err) {
    console.error('Error fetching joining records:', err);
    return errorResponse(res, 'Failed to fetch joining records', 500);
  }
};

const createJoiningInvitation = async (req, res) => {
  try {
    const { role, tenantId: userTenantId } = req.user;
    const {
      candidateName,
      candidateEmail,
      candidatePhone,
      positionId,
      branchId,
      designation,
      department,
      joiningDate,
      tenantId: bodyTenantId,
    } = req.body;

    if (!candidateName || !candidateEmail || !branchId || !designation || !department || !joiningDate) {
      return errorResponse(
        res,
        'Candidate name, email, branch, designation, department, and joining date are required',
        400
      );
    }

    const targetTenantId = role === 'PLATFORM_ADMIN' ? (bodyTenantId || userTenantId) : userTenantId;

    // Validate that branch belongs to the tenant
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch || branch.tenantId !== targetTenantId) {
      return errorResponse(res, 'Branch does not belong to this dealer organization', 403);
    }

    // If positionId provided, validate it belongs to the tenant
    if (positionId) {
      const position = await prisma.position.findUnique({ where: { id: positionId } });
      if (!position || position.tenantId !== targetTenantId) {
        return errorResponse(res, 'Position does not belong to this dealer organization', 403);
      }
    }

    const token = `join_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const joining = await prisma.joiningRecord.create({
      data: {
        tenantId: targetTenantId,
        candidateName,
        candidateEmail,
        candidatePhone: candidatePhone || '',
        positionId: positionId || null,
        branchId,
        designation,
        department,
        joiningDate: new Date(joiningDate),
        token,
        status: 'PENDING',
      },
      include: { branch: true, position: true },
    });

    return successResponse(
      res,
      {
        ...joining,
        joiningLink: `/join/${token}`,
      },
      'Candidate onboarding invitation created',
      201
    );
  } catch (err) {
    console.error('Error creating joining invitation:', err);
    return errorResponse(res, 'Failed to create joining invitation', 500);
  }
};

// Public endpoint for candidate to fetch details using token
const getCandidateByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const joining = await prisma.joiningRecord.findUnique({
      where: { token },
      include: {
        tenant: {
          select: { organizationName: true, logoUrl: true },
        },
        branch: {
          select: { name: true, city: true, address: true },
        },
        position: {
          select: { title: true, positionCode: true },
        },
      },
    });

    if (!joining) {
      return errorResponse(res, 'Invalid or expired joining invitation link', 404);
    }

    return successResponse(res, joining);
  } catch (err) {
    return errorResponse(res, 'Failed to retrieve candidate information', 500);
  }
};

// Public endpoint for candidate to submit completed form
const submitCandidateForm = async (req, res) => {
  try {
    const { token } = req.params;
    const formData = req.body;

    const joining = await prisma.joiningRecord.findUnique({ where: { token } });
    if (!joining) {
      return errorResponse(res, 'Invalid joining token', 404);
    }

    if (joining.status === 'COMPLETED') {
      return errorResponse(res, 'This onboarding formality has already been completed and processed', 400);
    }

    const updated = await prisma.joiningRecord.update({
      where: { token },
      data: {
        status: 'FORM_SUBMITTED',
        formData: formData,
      },
    });

    return successResponse(
      res,
      updated,
      'Joining form submitted successfully. HR will review and finalize your onboarding.'
    );
  } catch (err) {
    console.error('Error submitting candidate form:', err);
    return errorResponse(res, 'Failed to submit candidate form', 500);
  }
};

// HR action to finalize onboarding (triggers Automation Rule 1)
const completeJoining = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeData } = req.body;
    const { role, tenantId } = req.user;

    const joining = await prisma.joiningRecord.findUnique({ where: { id } });
    if (!joining) {
      return errorResponse(res, 'Joining record not found', 404);
    }

    // Cross-tenant verification
    if (role !== 'PLATFORM_ADMIN' && joining.tenantId !== tenantId) {
      return errorResponse(
        res,
        'Access Denied: You cannot complete onboarding for a candidate belonging to another dealer organization.',
        403
      );
    }

    const result = await AutomationService.onJoiningCompleted({
      joiningRecordId: id,
      employeeData: employeeData || {},
      hrUserId: req.user.id,
      ipAddress: req.ip,
    });

    return successResponse(
      res,
      result,
      'Joining completed! Employee provisioned, position closed, and BM asset approvals triggered.'
    );
  } catch (err) {
    console.error('Error completing joining formalities:', err);
    return errorResponse(res, err.message || 'Failed to complete joining formalities', 500);
  }
};

module.exports = {
  getJoiningRecords,
  createJoiningInvitation,
  getCandidateByToken,
  submitCandidateForm,
  completeJoining,
};
