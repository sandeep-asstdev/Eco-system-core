import prisma from '../../config/db.js';

/**
 * Gets configured approval matrix rules for the tenant.
 */
export async function getApprovalRules(req, res, next) {
  try {
    let rules = await prisma.approvalMatrixRule.findMany({
      where: { tenantId: req.tenantId },
      orderBy: { orderIndex: 'asc' }
    });

    // If no rules exist for tenant, seed default standard dealership rules
    if (rules.length === 0) {
      const defaults = [
        {
          tenantId: req.tenantId,
          name: 'Standard Operational Repair (Cost < ₹5,000)',
          ruleType: 'COST_THRESHOLD',
          minAmount: 0,
          maxAmount: 5000,
          approverRole: 'MAINTENANCE_MANAGER',
          priorityEscalation: false,
          orderIndex: 1,
          isActive: true
        },
        {
          tenantId: req.tenantId,
          name: 'Mid-Tier Repair & Spares (Cost ₹5,000 - ₹25,000)',
          ruleType: 'COST_THRESHOLD',
          minAmount: 5000,
          maxAmount: 25000,
          approverRole: 'BRANCH_MANAGER',
          priorityEscalation: false,
          orderIndex: 2,
          isActive: true
        },
        {
          tenantId: req.tenantId,
          name: 'Major Overhaul or Replacement (Cost > ₹25,000)',
          ruleType: 'COST_THRESHOLD',
          minAmount: 25000,
          maxAmount: 9999999,
          approverRole: 'REGIONAL_MANAGER',
          priorityEscalation: true,
          orderIndex: 3,
          isActive: true
        },
        {
          tenantId: req.tenantId,
          name: 'Emergency Priority Breakdown',
          ruleType: 'EMERGENCY_REQUEST',
          minAmount: null,
          maxAmount: null,
          approverRole: 'BRANCH_MANAGER',
          priorityEscalation: true,
          orderIndex: 4,
          isActive: true
        },
        {
          tenantId: req.tenantId,
          name: 'Third-Party Contractor / Vendor Work',
          ruleType: 'VENDOR_WORK',
          minAmount: null,
          maxAmount: null,
          approverRole: 'PURCHASE_MANAGER',
          priorityEscalation: false,
          orderIndex: 5,
          isActive: true
        },
        {
          tenantId: req.tenantId,
          name: 'Capital Asset Replacement',
          ruleType: 'ASSET_REPLACEMENT',
          minAmount: 50000,
          maxAmount: null,
          approverRole: 'MANAGEMENT',
          priorityEscalation: true,
          orderIndex: 6,
          isActive: true
        }
      ];

      for (const d of defaults) {
        await prisma.approvalMatrixRule.create({ data: d });
      }

      rules = await prisma.approvalMatrixRule.findMany({
        where: { tenantId: req.tenantId },
        orderBy: { orderIndex: 'asc' }
      });
    }

    res.json({ success: true, data: rules });
  } catch (err) {
    next(err);
  }
}

/**
 * Creates or updates an approval matrix rule.
 */
export async function createApprovalRule(req, res, next) {
  try {
    const { name, ruleType, minAmount, maxAmount, approverRole, priorityEscalation, orderIndex } = req.body;

    if (!name || !ruleType || !approverRole) {
      return res.status(400).json({ success: false, message: 'Name, ruleType, and approverRole are required.' });
    }

    const rule = await prisma.approvalMatrixRule.create({
      data: {
        tenantId: req.tenantId,
        name,
        ruleType,
        minAmount: minAmount !== undefined && minAmount !== '' ? parseFloat(minAmount) : null,
        maxAmount: maxAmount !== undefined && maxAmount !== '' ? parseFloat(maxAmount) : null,
        approverRole,
        priorityEscalation: Boolean(priorityEscalation),
        orderIndex: parseInt(orderIndex) || 0,
        isActive: true
      }
    });

    await prisma.auditLog.create({
      data: {
        tenantId: req.tenantId,
        userId: req.user.id,
        action: 'APPROVAL_RULE_CREATED',
        entity: 'ApprovalMatrixRule',
        entityId: rule.id,
        details: { name, ruleType, approverRole }
      }
    });

    res.status(201).json({ success: true, data: rule });
  } catch (err) {
    next(err);
  }
}

export async function updateApprovalRule(req, res, next) {
  try {
    const { id } = req.params;
    const { name, ruleType, minAmount, maxAmount, approverRole, priorityEscalation, isActive } = req.body;

    const updated = await prisma.approvalMatrixRule.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(ruleType && { ruleType }),
        ...(minAmount !== undefined && { minAmount: minAmount !== '' ? parseFloat(minAmount) : null }),
        ...(maxAmount !== undefined && { maxAmount: maxAmount !== '' ? parseFloat(maxAmount) : null }),
        ...(approverRole && { approverRole }),
        ...(priorityEscalation !== undefined && { priorityEscalation: Boolean(priorityEscalation) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) })
      }
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteApprovalRule(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.approvalMatrixRule.delete({ where: { id } });
    res.json({ success: true, message: 'Approval rule deleted.' });
  } catch (err) {
    next(err);
  }
}

/**
 * Gets requests currently pending approval, evaluating matching rules.
 */
export async function getPendingApprovals(req, res, next) {
  try {
    const { branchId } = req.query;

    const where = {
      tenantId: req.tenantId,
      workStatus: { in: ['WAITING_FOR_APPROVAL', 'PENDING_APPROVAL'] }
    };

    if (req.user.role !== 'PLATFORM_ADMIN' && req.user.role !== 'TENANT_ADMIN') {
      if (branchId) {
        if (!req.branchIds.includes(branchId)) {
          return res.status(403).json({ success: false, message: 'Access denied for branch.' });
        }
        where.branchId = branchId;
      } else {
        where.branchId = { in: req.branchIds };
      }
    } else if (branchId) {
      where.branchId = branchId;
    }

    const [requests, rules] = await Promise.all([
      prisma.maintenanceRequest.findMany({
        where,
        include: {
          requester: { select: { id: true, firstName: true, lastName: true, role: true } },
          branch: { select: { id: true, name: true, code: true } },
          department: { select: { id: true, name: true } },
          maintenanceType: { select: { id: true, name: true, color: true } },
          asset: { select: { id: true, assetCode: true, name: true, criticality: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.approvalMatrixRule.findMany({
        where: { tenantId: req.tenantId, isActive: true },
        orderBy: { orderIndex: 'asc' }
      })
    ]);

    // Match each request to applicable approval rules
    const evaluated = requests.map(r => {
      const cost = r.estimatedCost || 0;
      const isEmergency = r.priority === 'HIGH';

      let matchedRule = rules.find(rule => {
        if (rule.ruleType === 'EMERGENCY_REQUEST' && isEmergency) return true;
        if (rule.ruleType === 'COST_THRESHOLD') {
          const minOk = rule.minAmount === null || cost >= rule.minAmount;
          const maxOk = rule.maxAmount === null || cost <= rule.maxAmount;
          return minOk && maxOk;
        }
        return false;
      });

      if (!matchedRule) {
        matchedRule = {
          name: 'Standard Operational Review',
          approverRole: 'MAINTENANCE_MANAGER'
        };
      }

      return {
        ...r,
        matchedApprovalRule: matchedRule,
        requiredApproverRole: matchedRule.approverRole
      };
    });

    res.json({ success: true, data: evaluated });
  } catch (err) {
    next(err);
  }
}
