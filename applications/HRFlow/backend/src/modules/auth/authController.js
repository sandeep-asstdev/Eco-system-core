const bcrypt = require('bcryptjs');
const prisma = require('../../config/db');
const { signToken } = require('../../config/jwt');
const { successResponse, errorResponse } = require('../../utils/apiResponse');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        tenant: true,
        branch: true,
        employee: true,
      },
    });

    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    if (user.status !== 'ACTIVE') {
      return errorResponse(res, 'User account is inactive. Contact platform support or HR.', 403);
    }

    // Check tenant status if user belongs to a tenant
    if (user.tenantId && user.tenant) {
      if (user.tenant.status !== 'ACTIVE') {
        return errorResponse(
          res,
          `Dealership account (${user.tenant.organizationName}) is currently ${user.tenant.status.toLowerCase()}. Contact platform support.`,
          403
        );
      }
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      branchId: user.branchId,
    });

    const safeUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      tenant: user.tenant,
      branchId: user.branchId,
      branch: user.branch,
      employeeId: user.employeeId,
      employee: user.employee,
    };

    return successResponse(res, { token, user: safeUser }, 'Login successful');
  } catch (err) {
    console.error('Login error:', err);
    return errorResponse(res, 'An error occurred while logging in', 500);
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        tenant: true,
        branch: true,
        employee: {
          include: {
            kyc: true,
            statutory: true,
            salary: true,
            assets: true,
          },
        },
      },
    });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: req.tenantId || user.tenantId,
      tenant: req.tenant || user.tenant,
      branchId: user.branchId,
      branch: user.branch,
      employeeId: user.employeeId,
      employee: user.employee,
    };

    return successResponse(res, { user: safeUser });
  } catch (err) {
    console.error('Error in getCurrentUser:', err);
    return errorResponse(res, 'Failed to fetch user profile', 500);
  }
};

const demoSwitch = async (req, res) => {
  try {
    const { demoRole } = req.body;
    let targetEmail;

    switch (demoRole) {
      case 'PLATFORM_ADMIN':
        targetEmail = 'admin@hrflow.com';
        break;
      case 'HR':
      case 'HR_APEX':
        targetEmail = 'hr@hrflow.com';
        break;
      case 'BM_MUMBAI':
        targetEmail = 'bm.mumbai@hrflow.com';
        break;
      case 'BM_BANGALORE':
        targetEmail = 'bm.bangalore@hrflow.com';
        break;
      case 'EMP_RAHUL':
        targetEmail = 'emp.rahul@hrflow.com';
        break;
      case 'EMP_PRIYA':
        targetEmail = 'emp.priya@hrflow.com';
        break;
      case 'HR_ZENITH':
        targetEmail = 'hr.zenith@hrflow.com';
        break;
      case 'BM_PUNE':
        targetEmail = 'bm.pune@hrflow.com';
        break;
      case 'EMP_ROHIT':
        targetEmail = 'emp.rohit@hrflow.com';
        break;
      case 'EMP_NEHA':
        targetEmail = 'emp.neha@hrflow.com';
        break;
      case 'HR_BELLAD':
        targetEmail = 'hr.bellad@hrflow.com';
        break;
      case 'BM_HUBLI':
        targetEmail = 'bm.hubli@hrflow.com';
        break;
      case 'MD_BELLAD':
      case 'EMP_BELLAD':
        targetEmail = 'md.bellad@hrflow.com';
        break;
      default:
        targetEmail = 'hr@hrflow.com';
    }

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        tenant: true,
        branch: true,
        employee: true,
      },
    });

    if (!user) {
      return errorResponse(res, `Demo account '${targetEmail}' not found. Please run seeder.`, 404);
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      branchId: user.branchId,
      isDemo: true,
    });

    const safeUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      tenant: user.tenant,
      branchId: user.branchId,
      branch: user.branch,
      employeeId: user.employeeId,
      employee: user.employee,
    };

    return successResponse(res, { token, user: safeUser }, `Switched to demo role: ${user.role} (${targetEmail})`);
  } catch (err) {
    console.error('Demo switch error:', err);
    return errorResponse(res, 'Failed to switch demo account', 500);
  }
};

/**
 * Direct dealership registration is disabled in HRFlow.
 * Dealerships must be registered and onboarded through Ecosystem Core.
 */
const register = async (req, res) => {
  return errorResponse(
    res,
    'Direct dealership registration in HRFlow is disabled. Dealership onboarding and platform provisioning must be completed through Ecosystem Core (Central Portal).',
    403,
    'CENTRAL_AUTHENTICATION_REQUIRED'
  );
};

module.exports = {
  login,
  getCurrentUser,
  demoSwitch,
  register,
};
