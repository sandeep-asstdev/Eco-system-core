export const DEFAULT_TRANSITION_MATRIX = {
  NEW: ['WAITING_FOR_APPROVAL', 'APPROVED', 'ASSIGNED', 'IN_PROGRESS', 'CANCELLED'],
  DRAFT: ['SUBMITTED', 'WAITING_FOR_APPROVAL', 'ASSIGNED', 'IN_PROGRESS', 'CANCELLED'],
  SUBMITTED: ['WAITING_FOR_APPROVAL', 'APPROVED', 'ASSIGNED', 'IN_PROGRESS', 'CANCELLED'],
  PENDING_APPROVAL: ['APPROVED', 'REJECTED', 'ASSIGNED', 'IN_PROGRESS', 'CANCELLED'],
  WAITING_FOR_APPROVAL: ['APPROVED', 'REJECTED', 'ASSIGNED', 'IN_PROGRESS', 'CANCELLED'],
  APPROVED: ['ASSIGNED', 'IN_PROGRESS', 'CANCELLED'],
  REJECTED: ['REOPENED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'WAITING_FOR_PURCHASE', 'WAITING_FOR_VENDOR', 'COMPLETED', 'CANCELLED'],
  IN_PROGRESS: ['WAITING_FOR_PURCHASE', 'WAITING_FOR_VENDOR', 'CORRECTION_DONE', 'WAITING_FOR_CHECK', 'COMPLETED', 'CANCELLED'],
  WAITING_FOR_PURCHASE: ['PURCHASE_COMPLETED', 'IN_PROGRESS', 'CANCELLED'],
  WAITING_FOR_VENDOR: ['IN_PROGRESS', 'CORRECTION_DONE', 'COMPLETED', 'CANCELLED'],
  PURCHASE_COMPLETED: ['IN_PROGRESS', 'CORRECTION_DONE', 'COMPLETED', 'CANCELLED'],
  CORRECTION_DONE: ['WAITING_FOR_CHECK', 'COMPLETED', 'NOT_SATISFACTORY'],
  WAITING_FOR_CHECK: ['COMPLETED', 'NOT_SATISFACTORY', 'CLOSED'],
  NOT_SATISFACTORY: ['REOPENED', 'IN_PROGRESS'],
  REOPENED: ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  COMPLETED: ['CLOSED', 'NOT_SATISFACTORY', 'REOPENED', 'IN_PROGRESS'],
  CLOSED: ['REOPENED'],
  CANCELLED: []
};

export const ROLE_TRANSITION_PERMISSIONS = {
  APPROVED: ['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER'],
  REJECTED: ['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER'],
  ASSIGNED: ['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER'],
  IN_PROGRESS: ['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER', 'MAINTENANCE_USER', 'EMPLOYEE', 'USER'],
  WAITING_FOR_PURCHASE: ['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER', 'MAINTENANCE_USER', 'PURCHASE_USER', 'EMPLOYEE'],
  PURCHASE_COMPLETED: ['PLATFORM_ADMIN', 'TENANT_ADMIN', 'PURCHASE_USER', 'MANAGER', 'APPROVER'],
  CORRECTION_DONE: ['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER', 'MAINTENANCE_USER', 'EMPLOYEE'],
  COMPLETED: ['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER', 'MAINTENANCE_USER', 'EMPLOYEE', 'USER'],
  CLOSED: ['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'EMPLOYEE', 'USER', 'APPROVER', 'FINANCE_USER', 'MAINTENANCE_USER'],
  NOT_SATISFACTORY: ['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER', 'EMPLOYEE', 'USER'],
  REOPENED: ['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER', 'EMPLOYEE', 'USER'],
  CANCELLED: ['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER']
};

/**
 * Validates whether a status transition is permitted for a tenant and user role.
 * Fully configurable per tenant workflow rules.
 */
export function validateStatusTransition({ currentStatus, targetStatus, role, tenantConfig, isAssignedUser = false }) {
  // Check if tenant has customized transition matrix
  const matrix = tenantConfig?.customTransitions || DEFAULT_TRANSITION_MATRIX;
  const allowedNext = matrix[currentStatus] || [];

  if (!allowedNext.includes(targetStatus)) {
    return {
      valid: false,
      code: 'INVALID_TRANSITION',
      message: `Invalid status transition from "${currentStatus}" to "${targetStatus}". Allowed next states: ${allowedNext.join(', ') || 'None'}`
    };
  }

  // If user is assigned to this request, they are authorized for working and completion transitions
  if (isAssignedUser && ['IN_PROGRESS', 'COMPLETED'].includes(targetStatus)) {
    return { valid: true };
  }

  // Check role authorization for the target status
  if (role !== 'PLATFORM_ADMIN' && role !== 'TENANT_ADMIN') {
    const allowedRoles = ROLE_TRANSITION_PERMISSIONS[targetStatus];
    if (allowedRoles && !allowedRoles.includes(role)) {
      return {
        valid: false,
        code: 'UNAUTHORIZED_TRANSITION',
        message: `Role "${role}" is not authorized to transition request to "${targetStatus}".`
      };
    }
  }

  return { valid: true };
}

/**
 * 6 Primary Human-Readable Stages
 */
export const PRIMARY_STAGES = [
  { key: 'REQUESTED', label: 'Requested', step: 1 },
  { key: 'REVIEW', label: 'Review', step: 2 },
  { key: 'ASSIGNED', label: 'Assigned', step: 3 },
  { key: 'WORKING', label: 'Working', step: 4 },
  { key: 'COMPLETED', label: 'Completed', step: 5 },
  { key: 'VERIFIED_CLOSED', label: 'Verified / Closed', step: 6 }
];

/**
 * Maps detailed internal WorkStatus to one of the 6 Primary Human-Readable Stages
 */
export function getPrimaryStage(workStatus) {
  if (!workStatus) return 'REQUESTED';

  switch (workStatus) {
    case 'NEW':
    case 'DRAFT':
    case 'SUBMITTED':
      return 'REQUESTED';

    case 'WAITING_FOR_APPROVAL':
    case 'PENDING_APPROVAL':
    case 'APPROVED':
    case 'REJECTED':
      return 'REVIEW';

    case 'ASSIGNED':
      return 'ASSIGNED';

    case 'IN_PROGRESS':
    case 'WAITING_FOR_PURCHASE':
    case 'WAITING_FOR_VENDOR':
    case 'PURCHASE_COMPLETED':
    case 'CORRECTION_DONE':
    case 'WAITING_FOR_CHECK':
      return 'WORKING';

    case 'COMPLETED':
      return 'COMPLETED';

    case 'CLOSED':
    case 'NOT_SATISFACTORY':
    case 'REOPENED':
    case 'CANCELLED':
      return 'VERIFIED_CLOSED';

    default:
      return 'WORKING';
  }
}

/**
 * Returns human-readable label and description tailored to the viewer's role
 */
export function getHumanReadableStatus(request, userRole) {
  if (!request) return { label: 'Unknown', description: '' };

  const { workStatus, assignedTo, vendor, purchaseRequests } = request;
  const isEmployee = userRole === 'EMPLOYEE';

  // Role: Employee experience (simple, reassuring, zero operational jargon)
  if (isEmployee) {
    if (workStatus === 'WAITING_FOR_VENDOR') {
      return {
        label: 'Waiting for External Service Provider',
        description: 'An external specialist vendor has been engaged and scheduled.'
      };
    }
    if (workStatus === 'WAITING_FOR_PURCHASE') {
      return {
        label: 'Waiting for Required Parts',
        description: 'Replacement parts or materials have been requested for this repair.'
      };
    }
    if (workStatus === 'PURCHASE_COMPLETED') {
      return {
        label: 'Parts Received — Work Resuming',
        description: 'Required materials arrived at the facility. Repair is resuming.'
      };
    }
    if (workStatus === 'COMPLETED') {
      return {
        label: 'Work Completed — Awaiting Your Verification',
        description: 'Please inspect the completed work and verify if satisfied.'
      };
    }
    if (workStatus === 'CLOSED') {
      return {
        label: 'Verified & Closed',
        description: 'Request successfully verified and closed.'
      };
    }
    if (workStatus === 'NOT_SATISFACTORY' || workStatus === 'REOPENED') {
      return {
        label: 'Rectification In Progress',
        description: 'You indicated dissatisfaction. The technician is addressing the issue.'
      };
    }
    if (workStatus === 'ASSIGNED') {
      const techName = assignedTo ? `${assignedTo.firstName} ${assignedTo.lastName}` : 'Technician';
      return {
        label: `Assigned to ${techName}`,
        description: `Your request has been dispatched to ${techName}.`
      };
    }
    if (workStatus === 'IN_PROGRESS') {
      const techName = assignedTo ? `${assignedTo.firstName} ${assignedTo.lastName}` : 'Technician';
      return {
        label: 'Working In Progress',
        description: `${techName} is actively working on your request.`
      };
    }
    if (workStatus === 'WAITING_FOR_APPROVAL' || workStatus === 'PENDING_APPROVAL') {
      return {
        label: 'Under Review',
        description: 'Request submitted and queued for operational management review.'
      };
    }
    if (workStatus === 'REJECTED') {
      return {
        label: 'Request Rejected',
        description: request.rejectionReason ? `Reason: ${request.rejectionReason}` : 'Not approved by management.'
      };
    }
  }

  // Internal Staff / Manager / Tech / Approver experience
  switch (workStatus) {
    case 'NEW':
    case 'SUBMITTED':
      return { label: 'New Request', description: 'Newly submitted, pending initial triage.' };
    case 'WAITING_FOR_APPROVAL':
    case 'PENDING_APPROVAL':
      return { label: 'Waiting for Approval', description: 'Requires managerial or budget approval.' };
    case 'APPROVED':
      return { label: 'Approved — Ready to Assign', description: 'Approval granted; ready for technician dispatch.' };
    case 'REJECTED':
      return { label: 'Rejected', description: request.rejectionReason || 'Rejected by approver.' };
    case 'ASSIGNED':
      return { label: 'Assigned', description: `Assigned to ${assignedTo?.firstName || 'technician'}.` };
    case 'IN_PROGRESS':
      return { label: 'In Progress', description: 'Work actively in execution.' };
    case 'WAITING_FOR_PURCHASE':
      return { label: 'Waiting for Purchase', description: 'Parts requisitioned; awaiting procurement.' };
    case 'WAITING_FOR_VENDOR':
      return { label: 'Waiting for Vendor', description: `External service requested from ${vendor?.name || 'contractor'}.` };
    case 'PURCHASE_COMPLETED':
      return { label: 'Parts Received', description: 'Procurement complete; technician ready to resume.' };
    case 'CORRECTION_DONE':
      return { label: 'Correction Done', description: 'Rework completed; ready for final check.' };
    case 'COMPLETED':
      return { label: 'Completed', description: 'Work completed; awaiting verification from requester.' };
    case 'CLOSED':
      return { label: 'Verified & Closed', description: 'Final verified closure.' };
    case 'NOT_SATISFACTORY':
      return { label: 'Not Satisfactory', description: 'Requester reported dissatisfaction; rectification required.' };
    case 'REOPENED':
      return { label: 'Reopened', description: 'Work reopened for rework.' };
    default:
      return { label: workStatus || 'Unknown', description: '' };
  }
}

