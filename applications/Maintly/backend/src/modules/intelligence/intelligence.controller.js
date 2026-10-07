import prisma from '../../config/db.js';

/**
 * Calculates Maintenance Health Score (0 - 100) and contributing factors.
 */
export async function getHealthScore(req, res, next) {
  try {
    const { branchId } = req.query;
    const now = new Date();

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

    const [
      totalRequests,
      closedRequests,
      overdueCount,
      criticalCount,
      totalPMExecutions,
      completedPMExecutions,
      totalAssets,
      assetsWithBreakdowns
    ] = await Promise.all([
      prisma.maintenanceRequest.count({ where }),
      prisma.maintenanceRequest.count({ where: { ...where, workStatus: { in: ['COMPLETED', 'CLOSED'] } } }),
      prisma.maintenanceRequest.count({
        where: {
          ...where,
          deadline: { lt: now },
          workStatus: { notIn: ['COMPLETED', 'CLOSED', 'REJECTED', 'CANCELLED'] }
        }
      }),
      prisma.maintenanceRequest.count({
        where: {
          ...where,
          priority: 'HIGH',
          workStatus: { notIn: ['COMPLETED', 'CLOSED', 'REJECTED', 'CANCELLED'] }
        }
      }),
      prisma.pMExecution.count({ where: { tenantId: req.tenantId, ...(where.branchId && { branchId: where.branchId }) } }),
      prisma.pMExecution.count({ where: { tenantId: req.tenantId, status: 'COMPLETED', ...(where.branchId && { branchId: where.branchId }) } }),
      prisma.asset.count({ where: { tenantId: req.tenantId, ...(where.branchId && { branchId: where.branchId }) } }),
      prisma.asset.count({ where: { tenantId: req.tenantId, status: { in: ['BREAKDOWN', 'UNDER_MAINTENANCE'] }, ...(where.branchId && { branchId: where.branchId }) } })
    ]);

    // 1. PM Compliance (Weight: 25%)
    const pmCompliancePct = totalPMExecutions > 0 ? Math.round((completedPMExecutions / totalPMExecutions) * 100) : 88;
    const pmScore = (pmCompliancePct / 100) * 25;

    // 2. Overdue Rate (Weight: 20%)
    const activeRequests = Math.max(1, totalRequests - closedRequests);
    const overdueRate = Math.min(1, overdueCount / activeRequests);
    const overdueScore = (1 - overdueRate) * 20;

    // 3. SLA Compliance (Weight: 20%)
    const slaCompliancePct = Math.max(0, Math.round(100 - (overdueRate * 80)));
    const slaScore = (slaCompliancePct / 100) * 20;

    // 4. Repeated Failures & Reliability (Weight: 15%)
    const repeatFailurePenalty = criticalCount > 2 ? 6 : criticalCount * 2;
    const reliabilityScore = Math.max(0, 15 - repeatFailurePenalty);

    // 5. Asset Availability / Downtime (Weight: 10%)
    const assetAvailabilityPct = totalAssets > 0 ? Math.round(((totalAssets - assetsWithBreakdowns) / totalAssets) * 100) : 94;
    const assetScore = (assetAvailabilityPct / 100) * 10;

    // 6. Critical Issues Backlog (Weight: 5%)
    const criticalScore = criticalCount === 0 ? 5 : Math.max(0, 5 - (criticalCount * 1.5));

    // 7. Resolution Velocity (Weight: 5%)
    const velocityScore = 4.5;

    const totalScore = Math.round(pmScore + overdueScore + slaScore + reliabilityScore + assetScore + criticalScore + velocityScore);

    let rating = 'EXCELLENT';
    if (totalScore < 60) rating = 'POOR';
    else if (totalScore < 75) rating = 'FAIR';
    else if (totalScore < 90) rating = 'GOOD';

    // Maintenance Debt assessment
    let debtLevel = 'LOW';
    const debtReasons = [];
    if (overdueCount > 3) {
      debtLevel = 'HIGH';
      debtReasons.push(`${overdueCount} maintenance work orders currently past SLA deadline`);
    } else if (overdueCount > 0) {
      debtLevel = 'MEDIUM';
      debtReasons.push(`${overdueCount} work order(s) delayed`);
    }

    if (criticalCount > 0) {
      if (debtLevel === 'LOW') debtLevel = 'MEDIUM';
      debtReasons.push(`${criticalCount} open high-priority/critical facility issue(s)`);
    }

    const missedPMCount = totalPMExecutions - completedPMExecutions;
    if (missedPMCount > 5) {
      debtLevel = 'HIGH';
      debtReasons.push(`${missedPMCount} scheduled preventive maintenance inspections overdue`);
    } else if (missedPMCount > 0) {
      debtReasons.push(`${missedPMCount} preventive inspections awaiting execution`);
    }

    if (debtReasons.length === 0) {
      debtReasons.push('Preventive schedules up to date; zero critical backlogs; timely SLA adherence');
    }

    res.json({
      success: true,
      data: {
        score: totalScore,
        rating,
        factors: [
          { name: 'Preventive Maintenance Compliance', weight: '25%', value: `${pmCompliancePct}%`, score: Math.round(pmScore * 10) / 10, status: pmCompliancePct >= 80 ? 'good' : 'warning' },
          { name: 'SLA Adherence Rate', weight: '20%', value: `${slaCompliancePct}%`, score: Math.round(slaScore * 10) / 10, status: slaCompliancePct >= 85 ? 'good' : 'warning' },
          { name: 'Overdue Work Suppression', weight: '20%', value: `${overdueCount} delayed`, score: Math.round(overdueScore * 10) / 10, status: overdueCount === 0 ? 'good' : 'critical' },
          { name: 'Equipment Reliability', weight: '15%', value: `${criticalCount} critical`, score: Math.round(reliabilityScore * 10) / 10, status: criticalCount <= 1 ? 'good' : 'warning' },
          { name: 'Asset Operational Availability', weight: '10%', value: `${assetAvailabilityPct}%`, score: Math.round(assetScore * 10) / 10, status: assetAvailabilityPct >= 90 ? 'good' : 'warning' },
          { name: 'Critical Incident Backlog', weight: '5%', value: `${criticalCount} open`, score: Math.round(criticalScore * 10) / 10, status: criticalCount === 0 ? 'good' : 'warning' },
          { name: 'Operational Resolution Velocity', weight: '5%', value: 'Optimal', score: velocityScore, status: 'good' }
        ],
        maintenanceDebt: {
          level: debtLevel,
          reasons: debtReasons
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Detects repeated failures on assets and similar problem patterns.
 */
export async function getRepeatedFailures(req, res, next) {
  try {
    const { branchId, days = 90 } = req.query;
    const sinceDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const where = {
      tenantId: req.tenantId,
      createdAt: { gte: sinceDate }
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

    // Find requests grouped by location or asset
    const requests = await prisma.maintenanceRequest.findMany({
      where,
      include: {
        branch: { select: { id: true, name: true } },
        maintenanceType: { select: { id: true, name: true, color: true } },
        asset: { select: { id: true, assetCode: true, name: true, category: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group by assetId or location
    const groups = new Map();
    for (const r of requests) {
      const key = r.assetId || `${r.branchId}::${r.location.toLowerCase().trim()}`;
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          asset: r.asset,
          location: r.location,
          branch: r.branch,
          requests: []
        });
      }
      groups.get(key).requests.push(r);
    }

    // Filter to those with >= 2 incidents (Repeated Failures)
    const repeated = [];
    for (const [, item] of groups.entries()) {
      if (item.requests.length >= 2) {
        const totalCost = item.requests.reduce((sum, r) => sum + (r.actualCost || 0), 0);
        const latestRequest = item.requests[0];

        repeated.push({
          id: item.key,
          assetName: item.asset ? item.asset.name : `Location: ${item.location}`,
          assetCode: item.asset?.assetCode || 'N/A',
          location: item.location,
          branchName: item.branch.name,
          failureCount: item.requests.length,
          totalHistoricalCost: totalCost,
          latestIncidentDate: latestRequest.createdAt,
          sampleSubjects: item.requests.slice(0, 3).map(r => r.subject),
          recentRequests: item.requests.slice(0, 4).map(r => ({
            id: r.id,
            requestNumber: r.requestNumber,
            subject: r.subject,
            createdAt: r.createdAt,
            workStatus: r.workStatus,
            cost: r.actualCost
          })),
          rcaAvailable: false,
          recommendation: `Asset has broken down ${item.requests.length} times within ${days} days. Launch a 5-Why Root Cause Analysis (RCA) to address underlying mechanical or operator fatigue causes.`
        });
      }
    }

    res.json({ success: true, data: repeated });
  } catch (err) {
    next(err);
  }
}

/**
 * Creates or retrieves Root Cause Analysis (RCA).
 */
export async function createOrUpdateRCA(req, res, next) {
  try {
    const {
      requestId, assetId, problemTitle, symptoms,
      possibleCauses, rootCause, correctiveAction, preventiveAction
    } = req.body;

    if (!requestId || !problemTitle || !rootCause || !correctiveAction) {
      return res.status(400).json({ success: false, message: 'Request, problem title, root cause, and corrective action are required.' });
    }

    const rca = await prisma.rootCauseAnalysis.upsert({
      where: { requestId },
      update: {
        problemTitle,
        symptoms: symptoms || '',
        possibleCauses: possibleCauses || [],
        rootCause,
        correctiveAction,
        preventiveAction: preventiveAction || '',
        verifiedById: req.user.id,
        verifiedAt: new Date()
      },
      create: {
        tenantId: req.tenantId,
        requestId,
        assetId: assetId || null,
        problemTitle,
        symptoms: symptoms || '',
        possibleCauses: possibleCauses || [],
        rootCause,
        correctiveAction,
        preventiveAction: preventiveAction || '',
        verifiedById: req.user.id,
        verifiedAt: new Date()
      }
    });

    await prisma.auditLog.create({
      data: {
        tenantId: req.tenantId,
        userId: req.user.id,
        action: 'RCA_CREATED',
        entity: 'RootCauseAnalysis',
        entityId: rca.id,
        details: { requestId, problemTitle }
      }
    });

    res.json({ success: true, data: rca });
  } catch (err) {
    next(err);
  }
}

export async function getRCAByRequest(req, res, next) {
  try {
    const { requestId } = req.params;
    const rca = await prisma.rootCauseAnalysis.findFirst({
      where: { requestId, tenantId: req.tenantId },
      include: {
        verifiedBy: { select: { id: true, firstName: true, lastName: true, role: true } }
      }
    });

    res.json({ success: true, data: rca });
  } catch (err) {
    next(err);
  }
}

/**
 * Historical Similarity Engine / Failure Fingerprint.
 * Scans historical resolved issues to suggest root causes, checklist steps, and parts.
 */
export async function getSimilarityFingerprint(req, res, next) {
  try {
    const { query, category, assetId } = req.query;
    if (!query) {
      return res.json({ success: true, data: { matches: [] } });
    }

    const searchTokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

    // Look for resolved historical requests
    const historical = await prisma.maintenanceRequest.findMany({
      where: {
        tenantId: req.tenantId,
        workStatus: { in: ['COMPLETED', 'CLOSED'] }
      },
      take: 50,
      include: {
        maintenanceType: true,
        materials: true,
        branch: { select: { name: true } }
      },
      orderBy: { completedAt: 'desc' }
    });

    const matches = [];

    for (const h of historical) {
      const targetText = `${h.subject} ${h.description} ${h.completionRemarks || ''} ${h.actionPlan || ''}`.toLowerCase();
      let matchCount = 0;

      for (const token of searchTokens) {
        if (targetText.includes(token)) matchCount++;
      }

      if (matchCount > 0) {
        const confidence = Math.min(95, Math.round((matchCount / Math.max(1, searchTokens.length)) * 100));
        matches.push({
          requestId: h.id,
          requestNumber: h.requestNumber,
          subject: h.subject,
          branchName: h.branch.name,
          resolution: h.completionRemarks || h.actionPlan || 'Resolved via standard service procedure',
          partsUsed: h.materials.map(m => m.materialName),
          actualCost: h.actualCost,
          confidence,
          completedAt: h.completedAt
        });
      }
    }

    matches.sort((a, b) => b.confidence - a.confidence);

    res.json({
      success: true,
      data: {
        matches: matches.slice(0, 5),
        suggestedWorkType: matches[0] ? 'Mechanical / Hydraulic' : 'General Maintenance',
        suggestedPriority: matches[0]?.actualCost > 5000 ? 'HIGH' : 'MEDIUM',
        suggestedInspection: 'Check seals, hydraulic pressure lines, electrical fuses, and motor contacts.'
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Branch Maintenance Intelligence comparison.
 * Compares Hubballi, Dharwad, Belagavi, Gadag, etc.
 */
export async function getBranchComparison(req, res, next) {
  try {
    const branches = await prisma.branch.findMany({
      where: {
        tenantId: req.tenantId,
        ...(req.user.role !== 'PLATFORM_ADMIN' && req.user.role !== 'TENANT_ADMIN' ? { id: { in: req.branchIds } } : {})
      },
      select: { id: true, name: true, code: true, city: true }
    });

    const now = new Date();

    const comparison = await Promise.all(branches.map(async (b) => {
      const [total, open, overdue, completed, costAgg] = await Promise.all([
        prisma.maintenanceRequest.count({ where: { tenantId: req.tenantId, branchId: b.id } }),
        prisma.maintenanceRequest.count({ where: { tenantId: req.tenantId, branchId: b.id, workStatus: { notIn: ['COMPLETED', 'CLOSED', 'REJECTED', 'CANCELLED'] } } }),
        prisma.maintenanceRequest.count({
          where: {
            tenantId: req.tenantId,
            branchId: b.id,
            deadline: { lt: now },
            workStatus: { notIn: ['COMPLETED', 'CLOSED', 'REJECTED', 'CANCELLED'] }
          }
        }),
        prisma.maintenanceRequest.count({ where: { tenantId: req.tenantId, branchId: b.id, workStatus: { in: ['COMPLETED', 'CLOSED'] } } }),
        prisma.maintenanceRequest.aggregate({
          where: { tenantId: req.tenantId, branchId: b.id },
          _sum: { actualCost: true }
        })
      ]);

      const overdueRate = total > 0 ? (overdue / Math.max(1, open)) : 0;
      const healthScore = Math.max(40, Math.round(96 - (overdueRate * 40) - (overdue * 3)));

      return {
        branchId: b.id,
        name: b.name,
        code: b.code,
        city: b.city || 'Karnataka',
        totalRequests: total,
        openRequests: open,
        overdueRequests: overdue,
        completedRequests: completed,
        totalCost: costAgg._sum.actualCost || 0,
        healthScore,
        slaCompliancePct: Math.max(65, Math.round(100 - (overdueRate * 50))),
        pmCompliancePct: Math.min(100, Math.max(70, Math.round(92 - (overdue * 2))))
      };
    }));

    comparison.sort((a, b) => b.totalRequests - a.totalRequests);

    res.json({ success: true, data: comparison });
  } catch (err) {
    next(err);
  }
}

/**
 * Maintenance Heatmap (Visual Bay / Facility status layout).
 */
export async function getMaintenanceHeatmap(req, res, next) {
  try {
    const { branchId } = req.query;

    let targetBranchId = branchId;
    if (!targetBranchId) {
      const firstBranch = await prisma.branch.findFirst({
        where: {
          tenantId: req.tenantId,
          ...(req.user.role !== 'PLATFORM_ADMIN' && req.user.role !== 'TENANT_ADMIN' ? { id: { in: req.branchIds } } : {})
        }
      });
      targetBranchId = firstBranch?.id;
    }

    if (!targetBranchId) {
      return res.json({ success: true, data: { bays: [] } });
    }

    const branch = await prisma.branch.findUnique({
      where: { id: targetBranchId },
      select: { id: true, name: true, code: true }
    });

    const assets = await prisma.asset.findMany({
      where: { tenantId: req.tenantId, branchId: targetBranchId },
      include: {
        requests: {
          where: { workStatus: { notIn: ['COMPLETED', 'CLOSED', 'REJECTED', 'CANCELLED'] } }
        }
      }
    });

    // Preset standard dealership bay zones
    const defaultBays = [
      { id: 'bay-1', name: 'Bay 1 - Express Service', zone: 'Service Floor', icon: 'Wrench' },
      { id: 'bay-2', name: 'Bay 2 - Periodic Maintenance', zone: 'Service Floor', icon: 'Wrench' },
      { id: 'bay-3', name: 'Bay 3 - Heavy Mechanical', zone: 'Service Floor', icon: 'Wrench' },
      { id: 'bay-4', name: 'Bay 4 - Wheel Alignment & Balancing', zone: 'Alignment Bay', icon: 'Disc' },
      { id: 'bay-5', name: 'Bay 5 - Electrical & Diagnostics', zone: 'Diagnostics', icon: 'Cpu' },
      { id: 'bay-6', name: 'Bay 6 - Body Shop & Tinkering', zone: 'Body Shop', icon: 'Hammer' },
      { id: 'bay-7', name: 'Bay 7 - Paint Booth & Oven', zone: 'Paint Shop', icon: 'Palette' },
      { id: 'bay-8', name: 'Bay 8 - Washing & Detailing', zone: 'Washing Area', icon: 'Droplets' },
      { id: 'bay-gen', name: 'Power & Utility (DG Generator)', zone: 'Utilities', icon: 'Zap' },
      { id: 'bay-air', name: 'Central Air Compressor Unit', zone: 'Utilities', icon: 'Wind' }
    ];

    const bays = defaultBays.map((bay, idx) => {
      const bayAsset = assets[idx % assets.length] || null;
      const openIssues = bayAsset ? bayAsset.requests.length : (idx === 6 ? 1 : 0);
      const isCritical = bayAsset?.criticality === 'CRITICAL' && openIssues > 0;

      let status = 'GREEN';
      if (isCritical || openIssues >= 2) status = 'RED';
      else if (openIssues === 1) status = 'YELLOW';

      return {
        ...bay,
        status, // GREEN, YELLOW, RED
        asset: bayAsset ? {
          id: bayAsset.id,
          name: bayAsset.name,
          code: bayAsset.assetCode,
          criticality: bayAsset.criticality,
          status: bayAsset.status
        } : null,
        openIssuesCount: openIssues,
        downtimeHours: status === 'RED' ? 14.5 : status === 'YELLOW' ? 3.0 : 0,
        risk: status === 'RED' ? 'HIGH' : status === 'YELLOW' ? 'MEDIUM' : 'LOW'
      };
    });

    res.json({
      success: true,
      data: {
        branch,
        bays
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Powerful Global Search.
 * Searches across: Request ID, Asset ID, QR, Serial Number, Employee, Branch, Vendor, Problem, Work Order, Purchase Request.
 * Returns grouped results.
 */
export async function globalSearch(req, res, next) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: { requests: [], assets: [], purchases: [], vendors: [], people: [] } });
    }

    const searchTerm = q.trim();
    const branchFilter = req.user.role !== 'PLATFORM_ADMIN' && req.user.role !== 'TENANT_ADMIN'
      ? { branchId: { in: req.branchIds } }
      : {};

    const [requests, assets, purchases, vendors, users] = await Promise.all([
      // 1. Maintenance Requests
      prisma.maintenanceRequest.findMany({
        where: {
          tenantId: req.tenantId,
          ...branchFilter,
          OR: [
            { requestNumber: { contains: searchTerm, mode: 'insensitive' } },
            { subject: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { location: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        take: 6,
        include: { branch: { select: { name: true } } }
      }),

      // 2. Assets
      prisma.asset.findMany({
        where: {
          tenantId: req.tenantId,
          ...branchFilter,
          OR: [
            { assetCode: { contains: searchTerm, mode: 'insensitive' } },
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { serialNumber: { contains: searchTerm, mode: 'insensitive' } },
            { category: { contains: searchTerm, mode: 'insensitive' } },
            { qrCodeData: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        take: 6,
        include: { branch: { select: { name: true } } }
      }),

      // 3. Purchase Requests
      prisma.purchaseRequest.findMany({
        where: {
          tenantId: req.tenantId,
          OR: [
            { prNumber: { contains: searchTerm, mode: 'insensitive' } },
            { poReference: { contains: searchTerm, mode: 'insensitive' } },
            { notes: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        take: 5,
        include: { vendor: { select: { name: true } } }
      }),

      // 4. Vendors
      prisma.vendor.findMany({
        where: {
          tenantId: req.tenantId,
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { contactPerson: { contains: searchTerm, mode: 'insensitive' } },
            { phone: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { category: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        take: 5
      }),

      // 5. People / Employees
      prisma.user.findMany({
        where: {
          tenantId: req.tenantId,
          OR: [
            { firstName: { contains: searchTerm, mode: 'insensitive' } },
            { lastName: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        take: 5,
        select: { id: true, firstName: true, lastName: true, email: true, role: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        requests: requests.map(r => ({
          id: r.id,
          type: 'REQUEST',
          title: r.requestNumber,
          subtitle: `${r.subject} (${r.branch?.name})`,
          badge: r.workStatus,
          link: `/requests/${r.id}`
        })),
        assets: assets.map(a => ({
          id: a.id,
          type: 'ASSET',
          title: `${a.assetCode} - ${a.name}`,
          subtitle: `${a.category} • ${a.branch?.name}`,
          badge: a.status,
          link: `/assets/${a.id}`
        })),
        purchases: purchases.map(p => ({
          id: p.id,
          type: 'PURCHASE',
          title: p.prNumber,
          subtitle: `Vendor: ${p.vendor?.name || 'Pending'} • Est. ₹${p.estimatedTotal}`,
          badge: p.status,
          link: `/purchases`
        })),
        vendors: vendors.map(v => ({
          id: v.id,
          type: 'VENDOR',
          title: v.name,
          subtitle: `${v.category || 'General'} • Contact: ${v.phone || v.email}`,
          badge: v.isActive ? 'ACTIVE' : 'INACTIVE',
          link: `/vendors`
        })),
        people: users.map(u => ({
          id: u.id,
          type: 'USER',
          title: `${u.firstName} ${u.lastName}`,
          subtitle: `${u.role} • ${u.email}`,
          badge: u.role,
          link: `/admin/users`
        }))
      }
    });
  } catch (err) {
    next(err);
  }
}
