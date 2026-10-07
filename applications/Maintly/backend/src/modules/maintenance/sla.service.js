// SLA & 12-Hour Grace Period Engine for MAINTLY

/**
 * Calculates deadline and snapshot SLA metrics for a maintenance request.
 */
export function calculateTargetHours({ priority, tenant }) {
  const p = (priority || 'MEDIUM').toUpperCase();
  if (p === 'HIGH') return tenant?.targetHoursHigh || 24.0;
  if (p === 'LOW') return tenant?.targetHoursLow || 72.0;
  return tenant?.targetHoursMedium || 48.0;
}

export function calculateDeadline({ raisedAt, targetHours }) {
  const base = raisedAt ? new Date(raisedAt) : new Date();
  return new Date(base.getTime() + targetHours * 3600 * 1000);
}

/**
 * Calculates assignment latency.
 */
export function calculateTimeToAssign({ raisedAt, assignedAt }) {
  if (!raisedAt || !assignedAt) return null;
  const diffMs = new Date(assignedAt).getTime() - new Date(raisedAt).getTime();
  return Math.max(0, Math.round(diffMs / 60000)); // Minutes
}

/**
 * Calculates completion latency, difference from target, and grace classification.
 * Formula:
 * - Actual <= Target: ON_TIME
 * - Actual > Target && Actual <= Target + Grace: WITHIN_GRACE
 * - Actual > Target + Grace: OVERDUE
 */
export function evaluateSlaClassification({ raisedAt, completedAt, targetHours = 48.0, graceHours = 12.0 }) {
  if (!raisedAt || !completedAt) return { actualTimeHours: null, differenceHours: null, classification: null };

  const raised = new Date(raisedAt).getTime();
  const completed = new Date(completedAt).getTime();
  const diffMs = completed - raised;
  const actualTimeHours = parseFloat((diffMs / 3600000).toFixed(2));
  const differenceHours = parseFloat((actualTimeHours - targetHours).toFixed(2));

  let classification = 'ON_TIME';
  if (actualTimeHours > targetHours + graceHours) {
    classification = 'OVERDUE';
  } else if (actualTimeHours > targetHours) {
    classification = 'WITHIN_GRACE';
  }

  return {
    actualTimeHours,
    differenceHours,
    classification
  };
}

/**
 * Evaluates live SLA status for an ongoing request relative to current time.
 */
export function getLiveSlaStatus({ raisedAt, deadline, graceHours = 12.0, workStatus }) {
  const closedStatuses = ['COMPLETED', 'CLOSED', 'REJECTED', 'CANCELLED'];
  if (closedStatuses.includes(workStatus)) {
    return { isLiveOverdue: false, statusLabel: 'FINISHED', remainingText: '' };
  }

  if (!deadline) {
    return { isLiveOverdue: false, statusLabel: 'PENDING_SLA', remainingText: 'Target Pending' };
  }

  const now = Date.now();
  const deadlineMs = new Date(deadline).getTime();
  const graceMs = deadlineMs + (graceHours * 3600 * 1000);

  if (now <= deadlineMs) {
    const diffMin = Math.round((deadlineMs - now) / 60000);
    const hrs = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    return {
      isLiveOverdue: false,
      statusLabel: 'ON_TIME',
      remainingText: `Due in ${hrs}h ${mins}m`
    };
  } else if (now <= graceMs) {
    const remainingGraceMin = Math.round((graceMs - now) / 60000);
    const hrs = Math.floor(remainingGraceMin / 60);
    const mins = remainingGraceMin % 60;
    return {
      isLiveOverdue: false,
      statusLabel: 'WITHIN_GRACE',
      remainingText: `12h Grace: ${hrs}h ${mins}m left`
    };
  } else {
    const overdueMin = Math.round((now - graceMs) / 60000);
    const hrs = Math.floor(overdueMin / 60);
    const mins = overdueMin % 60;
    return {
      isLiveOverdue: true,
      statusLabel: 'OVERDUE',
      remainingText: `Overdue by ${hrs}h ${mins}m`
    };
  }
}
