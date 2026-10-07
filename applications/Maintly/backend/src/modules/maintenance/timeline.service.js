import prisma from '../../config/db.js';

/**
 * Builds a unified, sorted chronological event timeline for a maintenance request.
 * Combines request lifecycle milestones, status history, assignments,
 * procurement updates, vendor visits, and satisfaction feedback.
 */
export async function getRequestTimeline(requestId, tenantId, userRole = 'EMPLOYEE') {
  const isEmployee = userRole === 'EMPLOYEE';

  const request = await prisma.maintenanceRequest.findFirst({
    where: { id: requestId, tenantId },
    include: {
      requester: { select: { id: true, firstName: true, lastName: true, role: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true, role: true } },
      assignedBy: { select: { id: true, firstName: true, lastName: true, role: true } },
      approvedBy: { select: { id: true, firstName: true, lastName: true, role: true } },
      rejectedBy: { select: { id: true, firstName: true, lastName: true, role: true } },
      dissatisfiedBy: { select: { id: true, firstName: true, lastName: true, role: true } },
      vendor: { select: { id: true, name: true, phone: true, contactPerson: true } },
      statusHistories: {
        include: { changedBy: { select: { id: true, firstName: true, lastName: true, role: true } } },
        orderBy: { createdAt: 'asc' }
      },
      assignments: {
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
          assignedBy: { select: { id: true, firstName: true, lastName: true } }
        },
        orderBy: { assignedAt: 'asc' }
      },
      purchaseRequests: {
        include: {
          requestedBy: { select: { id: true, firstName: true, lastName: true } },
          approvedBy: { select: { id: true, firstName: true, lastName: true } },
          vendor: { select: { id: true, name: true } },
          items: true
        },
        orderBy: { createdAt: 'asc' }
      },
      comments: {
        include: { user: { select: { id: true, firstName: true, lastName: true, role: true } } },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!request) return [];

  const events = [];

  // 1. Request Created
  events.push({
    id: `evt-created-${request.id}`,
    type: 'REQUEST_CREATED',
    title: 'Request Raised',
    actor: request.requester ? `${request.requester.firstName} ${request.requester.lastName}` : 'Requester',
    role: 'EMPLOYEE',
    timestamp: request.createdAt,
    icon: 'PlusCircle',
    badgeColor: 'indigo',
    description: `Request "${request.subject}" submitted at ${request.location}. Priority: ${request.priority}.`
  });

  // 2. Approval Chain Events
  if (request.approvedAt) {
    events.push({
      id: `evt-approved-${request.id}`,
      type: 'APPROVED',
      title: 'Request Approved',
      actor: request.approvedBy ? `${request.approvedBy.firstName} ${request.approvedBy.lastName}` : 'Approver',
      role: 'APPROVER',
      timestamp: request.approvedAt,
      icon: 'CheckCircle2',
      badgeColor: 'emerald',
      description: 'Operations review passed and request approved for assignment.'
    });
  } else if (request.rejectedAt) {
    events.push({
      id: `evt-rejected-${request.id}`,
      type: 'REJECTED',
      title: 'Request Rejected',
      actor: request.rejectedBy ? `${request.rejectedBy.firstName} ${request.rejectedBy.lastName}` : 'Approver',
      role: 'APPROVER',
      timestamp: request.rejectedAt,
      icon: 'XCircle',
      badgeColor: 'rose',
      description: `Request was rejected. Reason: ${request.rejectionReason || 'No reason provided.'}`
    });
  }

  // 3. Assignments
  if (request.assignments && request.assignments.length > 0) {
    for (const a of request.assignments) {
      events.push({
        id: `evt-assign-${a.id}`,
        type: 'ASSIGNED',
        title: `Assigned to ${a.assignedTo.firstName} ${a.assignedTo.lastName}`,
        actor: `${a.assignedBy.firstName} ${a.assignedBy.lastName}`,
        role: 'MANAGER',
        timestamp: a.assignedAt,
        icon: 'UserCheck',
        badgeColor: 'blue',
        description: a.actionPlan
          ? `Action Plan: ${a.actionPlan}`
          : `Assigned technician dispatched to evaluate and execute repair.`
      });
    }
  } else if (request.assignedAt && request.assignedTo) {
    events.push({
      id: `evt-assign-direct-${request.id}`,
      type: 'ASSIGNED',
      title: `Assigned to ${request.assignedTo.firstName} ${request.assignedTo.lastName}`,
      actor: request.assignedBy ? `${request.assignedBy.firstName} ${request.assignedBy.lastName}` : 'Manager',
      role: 'MANAGER',
      timestamp: request.assignedAt,
      icon: 'UserCheck',
      badgeColor: 'blue',
      description: request.actionPlan ? `Action Plan: ${request.actionPlan}` : 'Assigned to maintenance technician.'
    });
  }

  // 4. Work Started
  if (request.startedAt) {
    events.push({
      id: `evt-started-${request.id}`,
      type: 'WORK_STARTED',
      title: 'Work Started',
      actor: request.assignedTo ? `${request.assignedTo.firstName} ${request.assignedTo.lastName}` : 'Technician',
      role: 'MAINTENANCE_USER',
      timestamp: request.startedAt,
      icon: 'Wrench',
      badgeColor: 'blue',
      description: 'Technician commenced physical execution on site.'
    });
  }

  // 5. Vendor Activity (if assigned)
  if (request.vendorId && request.vendor) {
    const vDate = request.vendorServiceDate || request.updatedAt;
    events.push({
      id: `evt-vendor-${request.id}`,
      type: 'VENDOR_ASSIGNED',
      title: isEmployee ? 'External Service Provider Engaged' : `Vendor Engaged: ${request.vendor.name}`,
      actor: 'Operations Team',
      role: 'MANAGER',
      timestamp: vDate,
      icon: 'Building2',
      badgeColor: 'purple',
      description: isEmployee
        ? 'Specialist external service scheduled for on-site maintenance.'
        : `Work Scope: ${request.vendorScope || 'Specialist maintenance service'}. Status: ${request.vendorStatus || 'SCHEDULED'}.`
    });
  }

  // 6. Procurement & Purchase Activity
  if (request.purchaseRequests && request.purchaseRequests.length > 0) {
    for (const pr of request.purchaseRequests) {
      events.push({
        id: `evt-pr-req-${pr.id}`,
        type: 'PURCHASE_REQUIRED',
        title: isEmployee ? 'Replacement Parts Requested' : `Purchase Requisition ${pr.prNumber}`,
        actor: pr.requestedBy ? `${pr.requestedBy.firstName} ${pr.requestedBy.lastName}` : 'Technician',
        role: 'PURCHASE_USER',
        timestamp: pr.requestedAt,
        icon: 'ShoppingCart',
        badgeColor: 'amber',
        description: isEmployee
          ? 'Required repair parts have been requisitioned.'
          : `Requisition for ${pr.items?.length || 1} item(s) totaling est. ₹${pr.estimatedTotal || 0}.`
      });

      if (pr.orderedAt) {
        const sourceLabel = pr.purchaseSource ? pr.purchaseSource.replace(/_/g, ' ') : 'Approved Vendor';
        events.push({
          id: `evt-pr-ord-${pr.id}`,
          type: 'ORDER_PLACED',
          title: isEmployee ? 'Parts Ordered' : `Order Placed via ${sourceLabel}`,
          actor: 'Purchase Team',
          role: 'PURCHASE_USER',
          timestamp: pr.orderedAt,
          icon: 'Package',
          badgeColor: 'indigo',
          description: isEmployee
            ? 'Parts have been ordered and are in transit.'
            : `Ref: ${pr.poReference || 'N/A'}. Provider: ${sourceLabel}.${pr.trackingNumber ? ` Tracking: ${pr.trackingNumber}` : ''}`
        });
      }

      if (pr.receivedAt) {
        events.push({
          id: `evt-pr-rec-${pr.id}`,
          type: 'ITEM_RECEIVED',
          title: 'Parts Received at Facility',
          actor: 'Purchase Team',
          role: 'PURCHASE_USER',
          timestamp: pr.receivedAt,
          icon: 'CheckSquare',
          badgeColor: 'teal',
          description: 'Materials successfully delivered and verified. Maintenance work resumed.'
        });
      }
    }
  }

  // 7. Work Completed
  if (request.completedAt) {
    events.push({
      id: `evt-completed-${request.id}`,
      type: 'WORK_COMPLETED',
      title: 'Work Completed',
      actor: request.assignedTo ? `${request.assignedTo.firstName} ${request.assignedTo.lastName}` : 'Technician',
      role: 'MAINTENANCE_USER',
      timestamp: request.completedAt,
      icon: 'CheckCircle2',
      badgeColor: 'emerald',
      description: request.completionRemarks || 'Repairs completed and operational tests performed.'
    });
  }

  // 8. Verification: Satisfied or Dissatisfied
  if (request.closedAt) {
    events.push({
      id: `evt-closed-${request.id}`,
      type: 'SATISFACTORY',
      title: 'Verified & Confirmed Satisfactory',
      actor: request.requester ? `${request.requester.firstName} ${request.requester.lastName}` : 'Requester',
      role: 'EMPLOYEE',
      timestamp: request.closedAt,
      icon: 'ShieldCheck',
      badgeColor: 'emerald',
      description: 'Requester inspected the repairs and confirmed full operational satisfaction. Request closed.'
    });
  } else if (request.dissatisfiedAt) {
    events.push({
      id: `evt-dissatisfied-${request.id}`,
      type: 'NOT_SATISFACTORY',
      title: 'Not Satisfactory — Rework Requested',
      actor: request.dissatisfiedBy ? `${request.dissatisfiedBy.firstName} ${request.dissatisfiedBy.lastName}` : 'Requester',
      role: 'EMPLOYEE',
      timestamp: request.dissatisfiedAt,
      icon: 'RotateCcw',
      badgeColor: 'orange',
      description: `Dissatisfaction reported: "${request.dissatisfactionReason || 'Issue persists'}". Ticket reopened for rectification.`
    });
  }

  // 9. Comments (filter internal comments for employees)
  if (request.comments && request.comments.length > 0) {
    for (const c of request.comments) {
      if (isEmployee && c.isInternal) continue;
      events.push({
        id: `evt-comm-${c.id}`,
        type: 'COMMENT',
        title: c.isInternal ? 'Internal Technical Note' : 'Progress Note',
        actor: `${c.user.firstName} ${c.user.lastName}`,
        role: c.user.role,
        timestamp: c.createdAt,
        icon: 'MessageSquare',
        badgeColor: 'slate',
        description: c.comment
      });
    }
  }

  // Sort strictly chronological (oldest to newest)
  events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return events;
}
