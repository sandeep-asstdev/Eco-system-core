import prisma from '../../config/db.js';

/**
 * Safe Declarative Condition Evaluator (Strictly Zero-Eval)
 * Evaluates structured JSON rules against context data.
 */
export function evaluateCondition(condition, context = {}) {
  if (!condition || Object.keys(condition).length === 0) return true;

  // Single rule evaluation
  if (condition.field) {
    const { field, op, value } = condition;
    const actual = field.split('.').reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined), context);

    switch (op) {
      case '==':
      case 'EQUALS':
        return actual == value;
      case '===':
        return actual === value;
      case '!=':
      case 'NOT_EQUALS':
        return actual != value;
      case '>':
        return Number(actual) > Number(value);
      case '>=':
        return Number(actual) >= Number(value);
      case '<':
        return Number(actual) < Number(value);
      case '<=':
        return Number(actual) <= Number(value);
      case 'IN':
        return Array.isArray(value) && value.includes(actual);
      case 'NOT_IN':
        return Array.isArray(value) && !value.includes(actual);
      case 'CONTAINS':
        return String(actual || '').includes(String(value));
      case 'EXISTS':
        return actual !== undefined && actual !== null;
      default:
        return false;
    }
  }

  // Compound rules (AND / OR)
  if (condition.operator === 'AND' && Array.isArray(condition.rules)) {
    return condition.rules.every(r => evaluateCondition(r, context));
  }
  if (condition.operator === 'OR' && Array.isArray(condition.rules)) {
    return condition.rules.some(r => evaluateCondition(r, context));
  }
  if (condition.operator === 'NOT' && condition.rule) {
    return !evaluateCondition(condition.rule, context);
  }

  return true;
}

/**
 * Workflow Engine Service
 */
export class WorkflowEngine {
  /**
   * Finds matching workflow definition with dealership-specific override prioritization.
   */
  static async resolveDefinition(tenantId, triggerEvent, context = {}) {
    // 1. Try tenant-specific override first
    let def = null;
    if (tenantId) {
      def = await prisma.workflowDefinition.findFirst({
        where: {
          tenantId,
          triggerEvent,
          status: 'ACTIVE'
        },
        orderBy: { version: 'desc' }
      });
    }

    // 2. Fall back to global system default
    if (!def) {
      def = await prisma.workflowDefinition.findFirst({
        where: {
          tenantId: null,
          triggerEvent,
          status: 'ACTIVE'
        },
        orderBy: { version: 'desc' }
      });
    }

    if (def && evaluateCondition(def.conditions, context)) {
      return def;
    }

    return null;
  }

  /**
   * Triggers a new workflow instance.
   */
  static async startWorkflow({ tenantId, triggerEvent, entityType, entityId, contextData, initiatedBy }) {
    const def = await this.resolveDefinition(tenantId, triggerEvent, contextData);
    if (!def) {
      return { triggered: false, reason: 'No active matching workflow definition found.' };
    }

    const stages = Array.isArray(def.stages) ? def.stages : [];
    if (stages.length === 0) {
      return { triggered: false, reason: 'Workflow definition has no configured stages.' };
    }

    const instance = await prisma.workflowInstance.create({
      data: {
        tenantId,
        workflowDefinitionId: def.id,
        entityType,
        entityId,
        currentStageIndex: 0,
        status: 'PENDING',
        contextData,
        initiatedBy,
        stageExecutions: {
          create: {
            stageIndex: 0,
            requiredRole: stages[0].role,
            status: 'PENDING'
          }
        }
      },
      include: {
        definition: true,
        stageExecutions: true
      }
    });

    return {
      triggered: true,
      instanceId: instance.id,
      workflowCode: def.code,
      currentStage: stages[0],
      totalStages: stages.length
    };
  }

  /**
   * Processes an approval / rejection action on the active stage.
   */
  static async processStageAction({ instanceId, decision, comments, decidedBy, userRoles = [], userEmail = null }) {
    const instance = await prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      include: {
        definition: true,
        stageExecutions: { orderBy: { stageIndex: 'asc' } }
      }
    });

    if (!instance) {
      throw new Error(`Workflow instance '${instanceId}' not found.`);
    }

    if (instance.status !== 'PENDING') {
      throw new Error(`Cannot process action. Workflow instance status is '${instance.status}'.`);
    }

    const stages = Array.isArray(instance.definition.stages) ? instance.definition.stages : [];
    const currentStageConfig = stages[instance.currentStageIndex];
    const currentExecution = instance.stageExecutions.find(e => e.stageIndex === instance.currentStageIndex && e.status === 'PENDING');

    if (!currentExecution) {
      throw new Error(`No pending stage execution found for stage index ${instance.currentStageIndex}.`);
    }

    // Role verification
    const isAuthorized = userRoles.includes('PLATFORM_ADMIN') || userRoles.includes(currentStageConfig.role);
    if (!isAuthorized) {
      throw new Error(`Unauthorized. Role '${currentStageConfig.role}' is required to decide this stage.`);
    }

    const normalizedDecision = decision.toUpperCase();
    const isApproved = normalizedDecision === 'APPROVED' || normalizedDecision === 'APPROVE';

    // Update current stage execution
    await prisma.workflowStageExecution.update({
      where: { id: currentExecution.id },
      data: {
        status: isApproved ? 'APPROVED' : 'REJECTED',
        decision: isApproved ? 'APPROVED' : 'REJECTED',
        decidedBy,
        decidedByEmail: userEmail,
        comments: comments || null,
        decidedAt: new Date()
      }
    });

    if (!isApproved) {
      // Rejection halts workflow
      const updatedInstance = await prisma.workflowInstance.update({
        where: { id: instance.id },
        data: {
          status: 'REJECTED',
          completedAt: new Date()
        },
        include: { stageExecutions: true }
      });
      return { instance: updatedInstance, finalStatus: 'REJECTED' };
    }

    // If approved, check if next stage exists
    const nextStageIndex = instance.currentStageIndex + 1;
    if (nextStageIndex < stages.length) {
      // Advance to next stage
      const nextStageConfig = stages[nextStageIndex];
      const updatedInstance = await prisma.workflowInstance.update({
        where: { id: instance.id },
        data: {
          currentStageIndex: nextStageIndex,
          stageExecutions: {
            create: {
              stageIndex: nextStageIndex,
              requiredRole: nextStageConfig.role,
              status: 'PENDING'
            }
          }
        },
        include: { stageExecutions: true }
      });
      return {
        instance: updatedInstance,
        finalStatus: 'PENDING',
        nextStage: nextStageConfig
      };
    } else {
      // All stages completed
      const updatedInstance = await prisma.workflowInstance.update({
        where: { id: instance.id },
        data: {
          status: 'APPROVED',
          completedAt: new Date()
        },
        include: { stageExecutions: true }
      });
      return { instance: updatedInstance, finalStatus: 'APPROVED' };
    }
  }
}
