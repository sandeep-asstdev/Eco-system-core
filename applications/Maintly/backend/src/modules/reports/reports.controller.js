import prisma from '../../config/db.js';

export async function getReportsSummary(req, res, next) {
  try {
    const { branchId, startDate, endDate } = req.query;
    const where = { tenantId: req.tenantId };

    if (branchId) where.branchId = branchId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Branch isolation for non-admins
    if (req.user.role !== 'PLATFORM_ADMIN' && req.user.role !== 'TENANT_ADMIN') {
      where.branchId = { in: req.branchIds };
    }

    const [requests, technicians, purchases] = await Promise.all([
      prisma.maintenanceRequest.findMany({
        where,
        include: {
          maintenanceType: { select: { name: true } },
          branch: { select: { name: true } },
          assignedTo: { select: { id: true, firstName: true, lastName: true } }
        }
      }),
      prisma.user.findMany({
        where: {
          tenantId: req.tenantId,
          role: 'MAINTENANCE_USER',
          status: 'ACTIVE'
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          assignedRequests: {
            where: { tenantId: req.tenantId },
            select: { id: true, workStatus: true, createdAt: true, completedAt: true, actualCost: true }
          }
        }
      }),
      prisma.purchaseRequest.findMany({
        where: { tenantId: req.tenantId },
        include: {
          vendor: { select: { name: true } }
        }
      })
    ]);

    // Technician Workload & Performance
    const technicianWorkload = technicians.map(tech => {
      const assigned = tech.assignedRequests;
      const completed = assigned.filter(r => r.workStatus === 'COMPLETED' || r.workStatus === 'CLOSED');
      const inProgress = assigned.filter(r => ['ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_PURCHASE', 'WAITING_FOR_VENDOR'].includes(r.workStatus));
      
      let avgResolutionTimeHours = 0;
      if (completed.length > 0) {
        const totalTime = completed.reduce((sum, r) => {
          if (!r.completedAt) return sum;
          return sum + ((new Date(r.completedAt) - new Date(r.createdAt)) / (1000 * 60 * 60));
        }, 0);
        avgResolutionTimeHours = Math.round((totalTime / completed.length) * 10) / 10;
      }

      const totalCostLogged = assigned.reduce((sum, r) => sum + (r.actualCost || 0), 0);

      return {
        id: tech.id,
        name: `${tech.firstName} ${tech.lastName}`,
        email: tech.email,
        totalAssigned: assigned.length,
        inProgressCount: inProgress.length,
        completedCount: completed.length,
        avgResolutionTimeHours,
        totalCostLogged
      };
    });

    // Cost Breakdown by Type
    const costByType = {};
    requests.forEach(r => {
      const typeName = r.maintenanceType?.name || 'Other';
      if (!costByType[typeName]) costByType[typeName] = { estimated: 0, actual: 0, count: 0 };
      costByType[typeName].estimated += r.estimatedCost || 0;
      costByType[typeName].actual += r.actualCost || 0;
      costByType[typeName].count += 1;
    });

    // Purchase Spend
    const totalPurchaseSpend = purchases.reduce((sum, p) => sum + (p.actualTotal || p.estimatedTotal || 0), 0);

    res.json({
      success: true,
      data: {
        totalRequests: requests.length,
        totalMaintenanceCost: requests.reduce((sum, r) => sum + (r.actualCost || 0), 0),
        totalPurchaseSpend,
        technicianWorkload,
        costByType: Object.entries(costByType).map(([name, data]) => ({ name, ...data }))
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function exportRequestsCSV(req, res, next) {
  try {
    const where = { tenantId: req.tenantId };
    if (req.user.role !== 'PLATFORM_ADMIN' && req.user.role !== 'TENANT_ADMIN') {
      where.branchId = { in: req.branchIds };
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where,
      include: {
        maintenanceType: true,
        branch: true,
        department: true,
        requester: true,
        assignedTo: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const headers = [
      'Request Number',
      'Date',
      'Subject',
      'Type',
      'Branch',
      'Department',
      'Priority',
      'Status',
      'Requester',
      'Assigned To',
      'Required Date',
      'Completed Date',
      'Estimated Cost',
      'Actual Cost',
      'Dissatisfied'
    ];

    const rows = requests.map(r => [
      `"${r.requestNumber}"`,
      `"${new Date(r.createdAt).toLocaleDateString()}"`,
      `"${(r.subject || '').replace(/"/g, '""')}"`,
      `"${r.maintenanceType?.name || ''}"`,
      `"${r.branch?.name || ''}"`,
      `"${r.department?.name || ''}"`,
      `"${r.priority}"`,
      `"${r.workStatus}"`,
      `"${r.requester ? `${r.requester.firstName} ${r.requester.lastName}` : ''}"`,
      `"${r.assignedTo ? `${r.assignedTo.firstName} ${r.assignedTo.lastName}` : 'Unassigned'}"`,
      `"${new Date(r.requiredDate).toLocaleDateString()}"`,
      `"${r.completedAt ? new Date(r.completedAt).toLocaleDateString() : 'N/A'}"`,
      `"${r.estimatedCost}"`,
      `"${r.actualCost}"`,
      `"${r.isDissatisfied ? 'YES' : 'NO'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="maintly-requests-${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
}
