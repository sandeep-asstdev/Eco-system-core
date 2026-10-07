import prisma from '../../config/db.js';
import { getPrimaryStage, getHumanReadableStatus } from '../maintenance/workflow.service.js';

export async function getDashboardData(req, res, next) {
  try {
    const { branchId, startDate, endDate } = req.query;
    const now = new Date();

    const baseWhere = {
      tenantId: req.tenantId
    };

    // Branch scoping
    if (['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER'].includes(req.user.role)) {
      if (branchId) baseWhere.branchId = branchId;
    } else {
      if (branchId) {
        if (!req.branchIds || !req.branchIds.includes(branchId)) {
          return res.status(403).json({ success: false, message: 'Access denied for requested branch.' });
        }
        baseWhere.branchId = branchId;
      } else if (req.branchIds && req.branchIds.length > 0) {
        baseWhere.branchId = { in: req.branchIds };
      }
    }

    if (startDate || endDate) {
      baseWhere.createdAt = {};
      if (startDate) baseWhere.createdAt.gte = new Date(startDate);
      if (endDate) baseWhere.createdAt.lte = new Date(endDate);
    }

    // Parallel execution of accurate database counts
    const [
      totalRequests,
      newRequests,
      waitingApproval,
      inProgress,
      forPurchase,
      rejections,
      highPriority,
      overdue,
      lowPriority,
      dissatisfied,
      completed,
      mediumPriority,
      closed,
      byTypeRaw,
      byBranchRaw,
      byPriorityRaw,
      byStatusRaw,
      costAgg,
      completedRequests,
      // Personal Action Queue counts
      myPendingApprovals,
      myAssignedTasks,
      myOverdueTasks,
      myPendingPurchases,
      myAwaitingVerification
    ] = await Promise.all([
      // 13 Views counts
      prisma.maintenanceRequest.count({ where: baseWhere }), // All Data
      prisma.maintenanceRequest.count({ where: { ...baseWhere, workStatus: { in: ['NEW', 'DRAFT', 'SUBMITTED'] } } }), // 1. New Requests
      prisma.maintenanceRequest.count({ where: { ...baseWhere, workStatus: { in: ['WAITING_FOR_APPROVAL', 'PENDING_APPROVAL'] } } }), // 2. Waiting for Approval
      prisma.maintenanceRequest.count({ where: { ...baseWhere, workStatus: { in: ['ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_VENDOR', 'PURCHASE_COMPLETED', 'CORRECTION_DONE'] } } }), // 3. Work in Progress
      prisma.maintenanceRequest.count({ where: { ...baseWhere, workStatus: 'WAITING_FOR_PURCHASE' } }), // 4. For Purchase Team
      prisma.maintenanceRequest.count({ where: { ...baseWhere, workStatus: 'REJECTED' } }), // 5. Request Rejections
      prisma.maintenanceRequest.count({ where: { ...baseWhere, priority: 'HIGH', workStatus: { notIn: ['CLOSED', 'REJECTED', 'CANCELLED'] } } }), // 6. High Priority
      prisma.maintenanceRequest.count({
        where: {
          ...baseWhere,
          deadline: { lt: now },
          workStatus: { notIn: ['COMPLETED', 'CLOSED', 'REJECTED', 'CANCELLED'] }
        }
      }), // 7. Overdue
      prisma.maintenanceRequest.count({ where: { ...baseWhere, priority: 'LOW', workStatus: { notIn: ['CLOSED', 'REJECTED', 'CANCELLED'] } } }), // 8. Low Priority
      prisma.maintenanceRequest.count({
        where: {
          ...baseWhere,
          OR: [{ isDissatisfied: true }, { workStatus: 'NOT_SATISFACTORY' }, { workStatus: 'REOPENED' }]
        }
      }), // 9. Dissatisfied Tasks
      prisma.maintenanceRequest.count({ where: { ...baseWhere, workStatus: 'COMPLETED' } }), // 10. Work Done / Completed
      prisma.maintenanceRequest.count({ where: { ...baseWhere, priority: 'MEDIUM', workStatus: { notIn: ['CLOSED', 'REJECTED', 'CANCELLED'] } } }), // 11. Medium Priority
      prisma.maintenanceRequest.count({ where: { ...baseWhere, workStatus: 'CLOSED' } }), // 12. All Closed Tasks

      // Breakdown queries
      prisma.maintenanceRequest.groupBy({
        by: ['maintenanceTypeId'],
        where: baseWhere,
        _count: { id: true }
      }),
      prisma.maintenanceRequest.groupBy({
        by: ['branchId'],
        where: baseWhere,
        _count: { id: true }
      }),
      prisma.maintenanceRequest.groupBy({
        by: ['priority'],
        where: baseWhere,
        _count: { id: true }
      }),
      prisma.maintenanceRequest.groupBy({
        by: ['workStatus'],
        where: baseWhere,
        _count: { id: true }
      }),
      prisma.maintenanceRequest.aggregate({
        where: baseWhere,
        _sum: { estimatedCost: true, actualCost: true }
      }),
      prisma.maintenanceRequest.findMany({
        where: {
          ...baseWhere,
          workStatus: { in: ['COMPLETED', 'CLOSED'] },
          completedAt: { not: null }
        },
        select: { createdAt: true, completedAt: true }
      }),

      // Personal Action queries for logged-in user
      prisma.maintenanceRequest.count({
        where: {
          tenantId: req.tenantId,
          workStatus: { in: ['WAITING_FOR_APPROVAL', 'PENDING_APPROVAL'] }
        }
      }),
      prisma.maintenanceRequest.count({
        where: {
          tenantId: req.tenantId,
          assignedToId: req.user.id,
          workStatus: { in: ['ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_PURCHASE', 'WAITING_FOR_VENDOR', 'REOPENED'] }
        }
      }),
      prisma.maintenanceRequest.count({
        where: {
          tenantId: req.tenantId,
          assignedToId: req.user.id,
          deadline: { lt: now },
          workStatus: { notIn: ['COMPLETED', 'CLOSED', 'REJECTED', 'CANCELLED'] }
        }
      }),
      prisma.purchaseRequest.count({
        where: {
          tenantId: req.tenantId,
          status: { in: ['REQUESTED', 'QUOTED', 'QUOTATION_PENDING', 'APPROVAL_PENDING'] }
        }
      }),
      prisma.maintenanceRequest.count({
        where: {
          tenantId: req.tenantId,
          requesterId: req.user.id,
          workStatus: 'COMPLETED'
        }
      })
    ]);

    // Role-specific datasets
    let roleData = { role: req.user.role };

    if (req.user.role === 'EMPLOYEE') {
      const [employeeRequests, empAwaitingCount, empCompletedCount] = await Promise.all([
        prisma.maintenanceRequest.findMany({
          where: { tenantId: req.tenantId, requesterId: req.user.id },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            maintenanceType: true,
            branch: true,
            assignedTo: { select: { firstName: true, lastName: true, phone: true } }
          }
        }),
        prisma.maintenanceRequest.count({
          where: { tenantId: req.tenantId, requesterId: req.user.id, workStatus: 'COMPLETED' }
        }),
        prisma.maintenanceRequest.count({
          where: { tenantId: req.tenantId, requesterId: req.user.id, workStatus: 'CLOSED' }
        })
      ]);

      roleData = {
        role: 'EMPLOYEE',
        myRequests: employeeRequests.map(r => ({
          ...r,
          primaryStage: getPrimaryStage(r.workStatus),
          humanStatus: getHumanReadableStatus(r, 'EMPLOYEE')
        })),
        awaitingVerificationCount: empAwaitingCount,
        closedCount: empCompletedCount,
        activeCount: employeeRequests.filter(r => !['CLOSED', 'CANCELLED'].includes(r.workStatus)).length
      };
    } else if (req.user.role === 'MAINTENANCE_USER') {
      const [assignedTasks, inProgressTasks, correctionTasks] = await Promise.all([
        prisma.maintenanceRequest.findMany({
          where: { tenantId: req.tenantId, assignedToId: req.user.id, workStatus: 'ASSIGNED' },
          orderBy: { createdAt: 'desc' },
          include: { maintenanceType: true, branch: true, requester: true }
        }),
        prisma.maintenanceRequest.findMany({
          where: {
            tenantId: req.tenantId,
            assignedToId: req.user.id,
            workStatus: { in: ['IN_PROGRESS', 'WAITING_FOR_PURCHASE', 'WAITING_FOR_VENDOR', 'PURCHASE_COMPLETED'] }
          },
          orderBy: { createdAt: 'desc' },
          include: { maintenanceType: true, branch: true, requester: true }
        }),
        prisma.maintenanceRequest.findMany({
          where: {
            tenantId: req.tenantId,
            assignedToId: req.user.id,
            workStatus: { in: ['NOT_SATISFACTORY', 'REOPENED', 'CORRECTION_DONE'] }
          },
          orderBy: { createdAt: 'desc' },
          include: { maintenanceType: true, branch: true, requester: true }
        })
      ]);

      roleData = {
        role: 'MAINTENANCE_USER',
        assignedTasks: assignedTasks.map(r => ({
          ...r,
          primaryStage: getPrimaryStage(r.workStatus),
          humanStatus: getHumanReadableStatus(r, req.user.role)
        })),
        inProgressTasks: inProgressTasks.map(r => ({
          ...r,
          primaryStage: getPrimaryStage(r.workStatus),
          humanStatus: getHumanReadableStatus(r, req.user.role)
        })),
        correctionTasks: correctionTasks.map(r => ({
          ...r,
          primaryStage: getPrimaryStage(r.workStatus),
          humanStatus: getHumanReadableStatus(r, req.user.role)
        }))
      };
    } else if (req.user.role === 'APPROVER') {
      const [pendingApprovalRequests, pendingPurchaseApprovals] = await Promise.all([
        prisma.maintenanceRequest.findMany({
          where: { tenantId: req.tenantId, workStatus: { in: ['WAITING_FOR_APPROVAL', 'PENDING_APPROVAL'] } },
          orderBy: { createdAt: 'desc' },
          include: { maintenanceType: true, branch: true, requester: true, brand: true, department: true }
        }),
        prisma.purchaseRequest.findMany({
          where: { tenantId: req.tenantId, status: { in: ['REQUESTED', 'QUOTED'] } },
          orderBy: { createdAt: 'desc' },
          include: { maintenanceRequest: true, requestedBy: true, vendor: true }
        })
      ]);

      roleData = {
        role: 'APPROVER',
        pendingApprovals: pendingApprovalRequests.map(r => ({
          ...r,
          primaryStage: getPrimaryStage(r.workStatus),
          humanStatus: getHumanReadableStatus(r, req.user.role)
        })),
        pendingPurchases: pendingPurchaseApprovals
      };
    } else {
      // MANAGER & ADMINS
      const [needingAssignmentCount, waitingVendorCount] = await Promise.all([
        prisma.maintenanceRequest.count({
          where: { tenantId: req.tenantId, workStatus: { in: ['APPROVED', 'NEW'] }, assignedToId: null }
        }),
        prisma.maintenanceRequest.count({
          where: { tenantId: req.tenantId, workStatus: 'WAITING_FOR_VENDOR' }
        })
      ]);

      roleData = {
        role: req.user.role,
        managerActions: [
          { id: 'review', title: 'Requests Needing Review', count: waitingApproval, link: '/requests?view=waiting_approval', actionText: 'Review Requests', urgency: waitingApproval > 0 ? 'high' : 'normal' },
          { id: 'assign', title: 'Requests Needing Assignment', count: needingAssignmentCount, link: '/requests?view=new', actionText: 'Assign Technicians', urgency: needingAssignmentCount > 0 ? 'high' : 'normal' },
          { id: 'high_priority', title: 'High-Priority Active Work', count: highPriority, link: '/requests?view=high_priority', actionText: 'Monitor Active Work', urgency: highPriority > 0 ? 'critical' : 'normal' },
          { id: 'overdue', title: 'Overdue Work / Grace Risk', count: overdue, link: '/requests?view=overdue', actionText: 'Escalate & Expedite', urgency: overdue > 0 ? 'critical' : 'normal' },
          { id: 'purchase', title: 'Waiting for Purchase', count: forPurchase, link: '/requests?view=purchase', actionText: 'Track Procurement', urgency: 'normal' },
          { id: 'vendor', title: 'Waiting for Vendor', count: waitingVendorCount, link: '/requests?view=wip', actionText: 'Coordinate Contractor', urgency: 'normal' },
          { id: 'verification', title: 'Waiting Verification', count: completed, link: '/requests?view=completed', actionText: 'Verify Work Done', urgency: 'normal' }
        ]
      };
    }

    // Metadata lookups
    const [types, branches] = await Promise.all([
      prisma.maintenanceType.findMany({
        where: { id: { in: byTypeRaw.map(b => b.maintenanceTypeId) } },
        select: { id: true, name: true, color: true, icon: true }
      }),
      prisma.branch.findMany({
        where: { id: { in: byBranchRaw.map(b => b.branchId) } },
        select: { id: true, name: true, code: true }
      })
    ]);

    const typeMap = new Map(types.map(t => [t.id, t]));
    const branchMap = new Map(branches.map(b => [b.id, b]));

    const byType = byTypeRaw.map(item => {
      const meta = typeMap.get(item.maintenanceTypeId);
      return {
        id: item.maintenanceTypeId,
        name: meta?.name || 'Unknown',
        color: meta?.color || '#3b82f6',
        icon: meta?.icon || 'Wrench',
        count: item._count.id
      };
    });

    const byBranch = byBranchRaw.map(item => {
      const meta = branchMap.get(item.branchId);
      return {
        id: item.branchId,
        name: meta?.name || 'Unknown',
        code: meta?.code || '',
        count: item._count.id
      };
    });

    const byPriority = byPriorityRaw.map(item => ({
      priority: item.priority,
      count: item._count.id
    }));

    const byStatus = byStatusRaw.map(item => ({
      status: item.workStatus,
      count: item._count.id
    }));

    // Average resolution time in hours
    let avgResolutionHours = 0;
    if (completedRequests.length > 0) {
      const totalHours = completedRequests.reduce((sum, reqItem) => {
        const diff = (new Date(reqItem.completedAt).getTime() - new Date(reqItem.createdAt).getTime()) / (1000 * 60 * 60);
        return sum + Math.max(0, diff);
      }, 0);
      avgResolutionHours = Math.round((totalHours / completedRequests.length) * 10) / 10;
    }

    // Simplified dashboard counts & recent requests
    const [
      myRequestsCount,
      pendingApprovalCount,
      assignedToMeCount,
      inProgressCount,
      completedCount,
      paymentPendingCount,
      closedCount,
      invoicesPendingCount,
      recentRequests
    ] = await Promise.all([
      prisma.maintenanceRequest.count({ where: { ...baseWhere, requesterId: req.user.id } }),
      prisma.maintenanceRequest.count({ where: { ...baseWhere, workStatus: { in: ['WAITING_FOR_APPROVAL', 'PENDING_APPROVAL', 'NEW'] } } }),
      prisma.maintenanceRequest.count({ where: { ...baseWhere, assignedToId: req.user.id, workStatus: { in: ['ASSIGNED', 'IN_PROGRESS'] } } }),
      prisma.maintenanceRequest.count({ where: { ...baseWhere, workStatus: 'IN_PROGRESS' } }),
      prisma.maintenanceRequest.count({ where: { ...baseWhere, workStatus: 'COMPLETED' } }),
      prisma.maintenanceRequest.count({ where: { ...baseWhere, workStatus: 'COMPLETED', paymentStatus: { not: 'PAID' } } }),
      prisma.maintenanceRequest.count({ where: { ...baseWhere, workStatus: 'CLOSED' } }),
      prisma.maintenanceRequest.count({ where: { ...baseWhere, workStatus: 'COMPLETED', invoiceUrl: null } }),
      prisma.maintenanceRequest.findMany({
        where: baseWhere,
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          requestNumber: true,
          subject: true,
          description: true,
          priority: true,
          workStatus: true,
          createdAt: true,
          maintenanceType: { select: { id: true, name: true, color: true, icon: true } },
          branch: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
          requester: { select: { id: true, firstName: true, lastName: true } }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        simpleSummary: {
          myRequests: myRequestsCount,
          pendingApproval: pendingApprovalCount,
          assignedToMe: assignedToMeCount,
          inProgress: inProgressCount,
          completed: completedCount,
          paymentPending: paymentPendingCount,
          closed: closedCount
        },
        pendingActionsSummary: [
          {
            id: 'approval',
            title: 'Waiting Approval',
            label: `${pendingApprovalCount} ${pendingApprovalCount === 1 ? 'request' : 'requests'} waiting for approval`,
            count: pendingApprovalCount,
            view: 'pending_approval'
          },
          {
            id: 'assigned',
            title: 'Assigned to Me',
            label: `${assignedToMeCount} ${assignedToMeCount === 1 ? 'request' : 'requests'} assigned to me`,
            count: assignedToMeCount,
            view: 'assigned_to_me'
          },
          {
            id: 'payment',
            title: 'Waiting Payment',
            label: `${paymentPendingCount} ${paymentPendingCount === 1 ? 'completed request' : 'completed requests'} waiting for payment`,
            count: paymentPendingCount,
            view: 'payment_pending'
          },
          {
            id: 'invoice',
            title: 'Processing Invoices',
            label: `${invoicesPendingCount} ${invoicesPendingCount === 1 ? 'invoice' : 'invoices'} waiting for processing`,
            count: invoicesPendingCount,
            view: 'completed'
          }
        ],
        recentRequests,
        roleData,
        summary: {
          totalRequests,
          newRequests,
          waitingApproval,
          inProgress,
          forPurchase,
          rejections,
          highPriority,
          overdue,
          lowPriority,
          dissatisfied,
          completed,
          mediumPriority,
          closed,
          totalEstimatedCost: costAgg._sum.estimatedCost || 0,
          totalActualCost: costAgg._sum.actualCost || 0,
          avgResolutionHours
        },
        myActions: [
          { id: 'approvals', label: 'Pending Approvals', count: myPendingApprovals, link: '/requests?view=waiting_approval', actionText: 'Review & Approve', badgeColor: 'bg-amber-100 text-amber-800' },
          { id: 'assigned', label: 'Tasks Assigned to Me', count: myAssignedTasks, link: '/requests?view=wip', actionText: 'Start Execution', badgeColor: 'bg-blue-100 text-blue-800' },
          { id: 'overdue', label: 'My Overdue Tasks', count: myOverdueTasks, link: '/requests?view=overdue', actionText: 'Expedite Work', badgeColor: 'bg-rose-100 text-rose-800', isCritical: true },
          { id: 'purchases', label: 'Purchase Approvals', count: myPendingPurchases, link: '/purchases', actionText: 'Open Queue', badgeColor: 'bg-purple-100 text-purple-800' },
          { id: 'verification', label: 'Awaiting Satisfaction Check', count: myAwaitingVerification, link: '/requests?view=completed', actionText: 'Inspect & Verify', badgeColor: 'bg-teal-100 text-teal-800' }
        ],
        operationalViews: [
          { id: 'new', title: 'New Requests', count: newRequests, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
          { id: 'waiting_approval', title: 'Waiting for Approval', count: waitingApproval, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
          { id: 'wip', title: 'Work in Progress', count: inProgress, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
          { id: 'purchase', title: 'For Purchase Team', count: forPurchase, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
          { id: 'rejections', title: 'Request Rejections', count: rejections, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
          { id: 'high_priority', title: 'High Priority', count: highPriority, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
          { id: 'overdue', title: 'Over Due', count: overdue, color: 'text-rose-700', bg: 'bg-rose-100', border: 'border-rose-300', isCritical: true },
          { id: 'low_priority', title: 'Low Priority', count: lowPriority, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { id: 'dissatisfied', title: 'Dissatisfied Tasks', count: dissatisfied, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
          { id: 'completed', title: 'Work Done Status', count: completed, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
          { id: 'medium_priority', title: 'Medium Priority', count: mediumPriority, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
          { id: 'closed', title: 'All Closed Tasks', count: closed, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
          { id: 'all', title: 'All Data', count: totalRequests, color: 'text-slate-900', bg: 'bg-slate-100', border: 'border-slate-300' }
        ],
        breakdowns: {
          byType,
          byBranch,
          byPriority,
          byStatus
        }
      }
    });
  } catch (error) {
    next(error);
  }
}
