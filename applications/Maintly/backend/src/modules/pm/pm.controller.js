import prisma from '../../config/db.js';

/**
 * Lists PM plans scoped to tenant and branch.
 */
export async function getPMPlans(req, res, next) {
  try {
    const { branchId, assetId, category, isActive } = req.query;

    const where = { tenantId: req.tenantId };

    if (['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER'].includes(req.user.role)) {
      if (branchId) where.branchId = branchId;
    } else {
      if (branchId) {
        if (!req.branchIds || !req.branchIds.includes(branchId)) {
          return res.status(403).json({ success: false, message: 'Access denied for branch.' });
        }
        where.branchId = branchId;
      } else if (req.branchIds && req.branchIds.length > 0) {
        where.branchId = { in: req.branchIds };
      }
    }

    if (assetId) where.assetId = assetId;
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const plans = await prisma.preventiveMaintenancePlan.findMany({
      where,
      include: {
        branch: { select: { id: true, name: true, code: true } },
        asset: { select: { id: true, assetCode: true, name: true, location: true, category: true } },
        executions: {
          take: 3,
          orderBy: { scheduledDate: 'desc' },
          include: { technician: { select: { id: true, firstName: true, lastName: true } } }
        }
      },
      orderBy: { nextDueDate: 'asc' }
    });

    const now = new Date();
    const enriched = plans.map(p => {
      const isOverdue = new Date(p.nextDueDate) < now;
      const daysUntilDue = Math.round((new Date(p.nextDueDate) - now) / (1000 * 60 * 60 * 24));
      return {
        ...p,
        isOverdue,
        daysUntilDue
      };
    });

    res.json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
}

/**
 * Creates a new PM Plan with checklist template.
 */
export async function createPMPlan(req, res, next) {
  try {
    const {
      branchId, assetId, title, description, category,
      triggerType, frequencyDays, meterInterval, nextDueDate,
      priority, checklistTemplate, assignedToRole
    } = req.body;

    if (!branchId || !title || !category || !nextDueDate) {
      return res.status(400).json({ success: false, message: 'Branch, title, category, and nextDueDate are required.' });
    }

    if (!['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER'].includes(req.user.role)) {
      if (!req.branchIds || !req.branchIds.includes(branchId)) {
        return res.status(403).json({ success: false, message: 'Access denied for branch.' });
      }
    }

    const defaultChecklist = checklistTemplate || [
      { id: 1, text: 'Visual inspection of physical structure and mounts', type: 'CHECKBOX' },
      { id: 2, text: 'Operating pressure / voltage reading', type: 'NUMERIC', unit: 'bar/V', min: 2.0, max: 4.5 },
      { id: 3, text: 'Lubrication and fluid level check', type: 'CHECKBOX' },
      { id: 4, text: 'Safety shut-off and emergency stop test', type: 'CHECKBOX' }
    ];

    const plan = await prisma.preventiveMaintenancePlan.create({
      data: {
        tenantId: req.tenantId,
        branchId,
        assetId: assetId || null,
        title,
        description,
        category,
        triggerType: triggerType || 'FREQUENCY',
        frequencyDays: parseInt(frequencyDays) || 30,
        meterInterval: meterInterval ? parseInt(meterInterval) : null,
        nextDueDate: new Date(nextDueDate),
        priority: priority || 'MEDIUM',
        checklistTemplate: defaultChecklist,
        assignedToRole: assignedToRole || 'MAINTENANCE_USER'
      },
      include: {
        branch: { select: { id: true, name: true } },
        asset: { select: { id: true, assetCode: true, name: true } }
      }
    });

    // Automatically schedule initial pending PM Execution
    await prisma.pMExecution.create({
      data: {
        tenantId: req.tenantId,
        planId: plan.id,
        assetId: plan.assetId,
        branchId: plan.branchId,
        scheduledDate: plan.nextDueDate,
        status: new Date(plan.nextDueDate) < new Date() ? 'OVERDUE' : 'PENDING'
      }
    });

    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
}

/**
 * Gets upcoming and overdue PM inspection schedules.
 */
export async function getUpcomingPMs(req, res, next) {
  try {
    const { branchId, days = 30 } = req.query;
    const now = new Date();
    const futureLimit = new Date(now.getTime() + parseInt(days) * 24 * 60 * 60 * 1000);

    const where = {
      tenantId: req.tenantId,
      scheduledDate: { lte: futureLimit },
      status: { in: ['PENDING', 'OVERDUE', 'IN_PROGRESS'] }
    };

    if (['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER'].includes(req.user.role)) {
      if (branchId) where.branchId = branchId;
    } else {
      if (branchId) {
        if (!req.branchIds || !req.branchIds.includes(branchId)) {
          return res.status(403).json({ success: false, message: 'Access denied for branch.' });
        }
        where.branchId = branchId;
      } else if (req.branchIds && req.branchIds.length > 0) {
        where.branchId = { in: req.branchIds };
      }
    }

    const executions = await prisma.pMExecution.findMany({
      where,
      include: {
        plan: true,
        asset: { select: { id: true, assetCode: true, name: true, location: true, category: true, criticality: true } },
        branch: { select: { id: true, name: true, code: true } },
        technician: { select: { id: true, firstName: true, lastName: true } }
      },
      orderBy: { scheduledDate: 'asc' }
    });

    const enriched = executions.map(e => {
      const isOverdue = new Date(e.scheduledDate) < now;
      const daysOverdue = isOverdue ? Math.round((now - new Date(e.scheduledDate)) / (1000 * 60 * 60 * 24)) : 0;
      return {
        ...e,
        computedStatus: isOverdue ? 'OVERDUE' : e.status,
        isOverdue,
        daysOverdue
      };
    });

    res.json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
}

/**
 * Executes/submits a PM inspection.
 */
export async function executePMInspection(req, res, next) {
  try {
    const { id } = req.params;
    const { checklistResults, remarks, signOffName, evidencePhotoUrl } = req.body;

    const execution = await prisma.pMExecution.findFirst({
      where: { id, tenantId: req.tenantId },
      include: { plan: true }
    });

    if (!execution) {
      return res.status(404).json({ success: false, message: 'Inspection not found.' });
    }

    const now = new Date();

    const updated = await prisma.pMExecution.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        executedDate: now,
        technicianId: req.user.id,
        checklistResults,
        remarks,
        signOffName: signOffName || `${req.user.firstName} ${req.user.lastName}`,
        evidencePhotoUrl
      }
    });

    // Advance nextDueDate on PM plan
    const frequency = execution.plan.frequencyDays || 30;
    const nextDue = new Date(now.getTime() + frequency * 24 * 60 * 60 * 1000);

    await prisma.preventiveMaintenancePlan.update({
      where: { id: execution.planId },
      data: {
        lastExecutedAt: now,
        nextDueDate: nextDue
      }
    });

    // Schedule next PM execution
    await prisma.pMExecution.create({
      data: {
        tenantId: req.tenantId,
        planId: execution.planId,
        assetId: execution.assetId,
        branchId: execution.branchId,
        scheduledDate: nextDue,
        status: 'PENDING'
      }
    });

    await prisma.auditLog.create({
      data: {
        tenantId: req.tenantId,
        userId: req.user.id,
        action: 'PM_INSPECTION_COMPLETED',
        entity: 'PMExecution',
        entityId: execution.id,
        details: { planTitle: execution.plan.title, remarks }
      }
    });

    res.json({ success: true, data: updated, nextDueDate: nextDue });
  } catch (err) {
    next(err);
  }
}
