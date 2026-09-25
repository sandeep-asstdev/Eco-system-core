import prisma from '../../config/db.js';
import { WorkflowEngine } from './workflow.service.js';

/**
 * Lists workflow definitions (global or tenant-specific).
 */
export async function getDefinitions(req, res, next) {
  try {
    const tenantId = req.query.tenantId || req.tenantId;
    const where = tenantId ? {
      OR: [{ tenantId }, { tenantId: null }]
    } : {};

    const definitions = await prisma.workflowDefinition.findMany({
      where,
      orderBy: [{ code: 'asc' }, { version: 'desc' }]
    });

    res.json({ success: true, data: definitions });
  } catch (error) {
    next(error);
  }
}

/**
 * Creates or versions a workflow definition.
 */
export async function createDefinition(req, res, next) {
  try {
    const { code, name, triggerEvent, conditions, stages, tenantId, status } = req.body;
    const targetTenantId = tenantId || (req.isPlatformAdmin ? null : req.tenantId);

    if (!code || !name || !triggerEvent || !stages || !Array.isArray(stages)) {
      return res.status(400).json({
        success: false,
        error: { message: 'code, name, triggerEvent, and stages array are required.' }
      });
    }

    // Determine next version number
    const latest = await prisma.workflowDefinition.findFirst({
      where: {
        tenantId: targetTenantId,
        code: code.toUpperCase()
      },
      orderBy: { version: 'desc' }
    });

    const nextVersion = latest ? latest.version + 1 : 1;

    const def = await prisma.workflowDefinition.create({
      data: {
        tenantId: targetTenantId,
        code: code.toUpperCase(),
        name,
        version: nextVersion,
        triggerEvent,
        conditions: conditions || {},
        stages,
        status: status || 'ACTIVE'
      }
    });

    res.status(201).json({ success: true, data: def });
  } catch (error) {
    next(error);
  }
}

/**
 * Triggers a workflow instance.
 */
export async function triggerWorkflow(req, res, next) {
  try {
    const { triggerEvent, entityType, entityId, contextData } = req.body;
    const tenantId = req.body.tenantId || req.tenantId;

    if (!triggerEvent || !entityType || !entityId || !tenantId) {
      return res.status(400).json({
        success: false,
        error: { message: 'triggerEvent, entityType, entityId, and tenantId are required.' }
      });
    }

    const result = await WorkflowEngine.startWorkflow({
      tenantId,
      triggerEvent,
      entityType,
      entityId,
      contextData: contextData || {},
      initiatedBy: req.user?.id || 'system'
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * Lists workflow instances for a tenant.
 */
export async function getInstances(req, res, next) {
  try {
    const tenantId = req.query.tenantId || req.tenantId;
    const { status, entityType } = req.query;

    const where = {};
    if (tenantId) where.tenantId = tenantId;
    if (status) where.status = status.toUpperCase();
    if (entityType) where.entityType = entityType;

    const instances = await prisma.workflowInstance.findMany({
      where,
      include: {
        definition: { select: { code: true, name: true, version: true } },
        stageExecutions: { orderBy: { stageIndex: 'asc' } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ success: true, data: instances });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieves details of a specific workflow instance.
 */
export async function getInstanceById(req, res, next) {
  try {
    const { id } = req.params;
    const instance = await prisma.workflowInstance.findUnique({
      where: { id },
      include: {
        definition: true,
        stageExecutions: { orderBy: { stageIndex: 'asc' } }
      }
    });

    if (!instance) {
      return res.status(404).json({ success: false, error: { message: 'Workflow instance not found.' } });
    }

    res.json({ success: true, data: instance });
  } catch (error) {
    next(error);
  }
}

/**
 * Submits an approval or rejection action on the current stage.
 */
export async function processAction(req, res, next) {
  try {
    const { id } = req.params;
    const { decision, comments } = req.body;

    if (!decision) {
      return res.status(400).json({ success: false, error: { message: 'decision (APPROVED or REJECTED) is required.' } });
    }

    const userRoles = [
      ...(req.isPlatformAdmin ? ['PLATFORM_ADMIN'] : []),
      ...(req.user?.roles || []),
      ...(req.userRoleAssignments?.map(ura => ura.role?.code) || [])
    ];

    const result = await WorkflowEngine.processStageAction({
      instanceId: id,
      decision,
      comments,
      decidedBy: req.user?.id || 'user',
      userEmail: req.user?.email || null,
      userRoles
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
