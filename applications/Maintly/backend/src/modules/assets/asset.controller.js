import prisma from '../../config/db.js';

/**
 * Lists assets scoped to tenant and authorized branches.
 */
export async function getAssets(req, res, next) {
  try {
    const { branchId, category, status, criticality, riskLevel, search } = req.query;

    const where = {
      tenantId: req.tenantId
    };

    // Branch scoping
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

    if (category) where.category = category;
    if (status) where.status = status;
    if (criticality) where.criticality = criticality;
    if (riskLevel) where.riskLevel = riskLevel;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { assetCode: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } }
      ];
    }

    const assets = await prisma.asset.findMany({
      where,
      include: {
        branch: { select: { id: true, name: true, code: true } },
        vendor: { select: { id: true, name: true, phone: true } },
        _count: {
          select: {
            requests: {
              where: { workStatus: { notIn: ['COMPLETED', 'CLOSED', 'REJECTED', 'CANCELLED'] } }
            },
            pmPlans: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: assets.map(a => ({
        ...a,
        openIssuesCount: a._count.requests,
        pmPlansCount: a._count.pmPlans
      }))
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Gets a single asset by ID with full history and maintenance analytics.
 */
export async function getAssetById(req, res, next) {
  try {
    const { id } = req.params;

    const asset = await prisma.asset.findFirst({
      where: { id, tenantId: req.tenantId },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        vendor: { select: { id: true, name: true, contactPerson: true, phone: true, email: true } },
        requests: {
          orderBy: { createdAt: 'desc' },
          include: {
            requester: { select: { id: true, firstName: true, lastName: true } },
            assignedTo: { select: { id: true, firstName: true, lastName: true } },
            maintenanceType: { select: { id: true, name: true, color: true } }
          }
        },
        pmPlans: {
          where: { isActive: true },
          include: {
            executions: {
              take: 5,
              orderBy: { scheduledDate: 'desc' }
            }
          }
        },
        rcas: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found.' });
    }

    // Branch authorization check
    if (!['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER'].includes(req.user.role)) {
      if (!req.branchIds || !req.branchIds.includes(asset.branchId)) {
        return res.status(403).json({ success: false, message: 'Unauthorized branch access.' });
      }
    }

    // Dynamic Risk calculation
    const totalRequests = asset.requests.length;
    const openRequests = asset.requests.filter(r => !['COMPLETED', 'CLOSED', 'REJECTED', 'CANCELLED'].includes(r.workStatus));
    const totalCost = asset.requests.reduce((sum, r) => sum + (r.actualCost || 0), 0);
    const repeatFailures = totalRequests >= 3;

    let computedRisk = 'LOW';
    const riskFactors = [];

    if (asset.criticality === 'CRITICAL' || asset.criticality === 'HIGH') {
      riskFactors.push(`High criticality asset (${asset.criticality})`);
    }
    if (openRequests.length > 0) {
      riskFactors.push(`${openRequests.length} active maintenance request(s)`);
      computedRisk = 'MEDIUM';
    }
    if (repeatFailures) {
      riskFactors.push(`Repeated breakdown history (${totalRequests} total incidents)`);
      computedRisk = 'HIGH';
    }
    if (asset.warrantyExpiry && new Date(asset.warrantyExpiry) < new Date()) {
      riskFactors.push('Warranty expired');
    }
    if (totalCost > 25000) {
      riskFactors.push(`High historical expenditure (₹${totalCost.toLocaleString('en-IN')})`);
      if (computedRisk === 'MEDIUM') computedRisk = 'HIGH';
    }

    res.json({
      success: true,
      data: {
        ...asset,
        totalHistoricalCost: totalCost,
        openRequestsCount: openRequests.length,
        computedRisk,
        riskFactors: riskFactors.length > 0 ? riskFactors : ['Asset operational and within normal parameters']
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Creates a new asset.
 */
export async function createAsset(req, res, next) {
  try {
    const {
      name, category, manufacturer, model, serialNumber, branchId,
      brandId, departmentId, branchAreaId, location, installationDate,
      warrantyExpiry, vendorId, criticality, maintenanceFrequencyDays, notes
    } = req.body;

    if (!name || !category || !branchId || !location) {
      return res.status(400).json({ success: false, message: 'Name, category, branch, and location are required.' });
    }

    // Branch authorization check
    if (!['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER'].includes(req.user.role)) {
      if (!req.branchIds || !req.branchIds.includes(branchId)) {
        return res.status(403).json({ success: false, message: 'Unauthorized branch.' });
      }
    }

    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    const count = await prisma.asset.count({ where: { tenantId: req.tenantId, branchId } });
    const prefix = category.replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase();
    const assetCode = `AST-${branch?.code || 'BR'}-${prefix}-${String(count + 1).padStart(4, '0')}`;
    const qrCodeData = `MAINTLY:${req.tenantId}:${assetCode}`;

    const asset = await prisma.asset.create({
      data: {
        tenantId: req.tenantId,
        assetCode,
        name,
        category,
        manufacturer,
        model,
        serialNumber,
        branchId,
        brandId,
        departmentId,
        branchAreaId,
        location,
        installationDate: installationDate ? new Date(installationDate) : null,
        warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
        vendorId,
        criticality: criticality || 'MEDIUM',
        maintenanceFrequencyDays: parseInt(maintenanceFrequencyDays) || 30,
        qrCodeData,
        notes,
        status: 'OPERATIONAL',
        riskLevel: criticality === 'CRITICAL' ? 'MEDIUM' : 'LOW'
      },
      include: {
        branch: { select: { id: true, name: true, code: true } }
      }
    });

    await prisma.auditLog.create({
      data: {
        tenantId: req.tenantId,
        userId: req.user.id,
        action: 'ASSET_CREATED',
        entity: 'Asset',
        entityId: asset.id,
        details: { assetCode, name, branchId, location }
      }
    });

    res.status(201).json({ success: true, data: asset });
  } catch (err) {
    next(err);
  }
}

/**
 * Updates an asset.
 */
export async function updateAsset(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name, category, manufacturer, model, serialNumber, location,
      status, criticality, maintenanceFrequencyDays, warrantyExpiry, vendorId, notes
    } = req.body;

    const existing = await prisma.asset.findFirst({
      where: { id, tenantId: req.tenantId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Asset not found.' });
    }

    const updated = await prisma.asset.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(manufacturer !== undefined && { manufacturer }),
        ...(model !== undefined && { model }),
        ...(serialNumber !== undefined && { serialNumber }),
        ...(location && { location }),
        ...(status && { status }),
        ...(criticality && { criticality }),
        ...(maintenanceFrequencyDays && { maintenanceFrequencyDays: parseInt(maintenanceFrequencyDays) }),
        ...(warrantyExpiry !== undefined && { warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null }),
        ...(vendorId !== undefined && { vendorId }),
        ...(notes !== undefined && { notes })
      }
    });

    await prisma.auditLog.create({
      data: {
        tenantId: req.tenantId,
        userId: req.user.id,
        action: 'ASSET_UPDATED',
        entity: 'Asset',
        entityId: updated.id,
        details: { changes: req.body }
      }
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * QR Code scanner lookup. Resolves asset from scanned code, serial number, or asset code.
 */
export async function scanAssetQR(req, res, next) {
  try {
    const { code } = req.params;
    const cleanCode = decodeURIComponent(code).trim();

    // Match by assetCode, serialNumber, or qrCodeData substring
    const asset = await prisma.asset.findFirst({
      where: {
        tenantId: req.tenantId,
        OR: [
          { assetCode: cleanCode },
          { serialNumber: cleanCode },
          { qrCodeData: cleanCode },
          { qrCodeData: { contains: cleanCode } }
        ]
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        vendor: { select: { id: true, name: true, phone: true } },
        requests: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            assignedTo: { select: { id: true, firstName: true, lastName: true } }
          }
        },
        pmPlans: {
          where: { isActive: true },
          take: 3
        }
      }
    });

    if (!asset) {
      return res.status(404).json({ success: false, message: `No asset found matching '${cleanCode}'.` });
    }

    const openIssues = asset.requests.filter(r => !['COMPLETED', 'CLOSED', 'REJECTED', 'CANCELLED'].includes(r.workStatus));

    res.json({
      success: true,
      data: {
        asset,
        currentStatus: asset.status,
        openIssuesCount: openIssues.length,
        openIssues,
        upcomingPM: asset.pmPlans.map(p => ({
          id: p.id,
          title: p.title,
          nextDueDate: p.nextDueDate
        })),
        isWarrantyValid: asset.warrantyExpiry ? new Date(asset.warrantyExpiry) > new Date() : null,
        quickActions: [
          { id: 'report_problem', label: 'Report Problem', action: 'CREATE_REQUEST' },
          { id: 'start_inspection', label: 'Start Inspection', action: 'START_PM' },
          { id: 'view_history', label: 'Full History', action: 'VIEW_HISTORY' }
        ]
      }
    });
  } catch (err) {
    next(err);
  }
}
