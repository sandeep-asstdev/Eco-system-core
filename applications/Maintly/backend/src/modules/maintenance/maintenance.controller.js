import prisma from '../../config/db.js';
import { logAudit } from '../../utils/audit.js';
import { notifyUsers } from '../../utils/notify.js';
import {
  calculateTargetHours,
  calculateDeadline,
  calculateTimeToAssign,
  evaluateSlaClassification,
  getLiveSlaStatus
} from './sla.service.js';
import { validateStatusTransition, getPrimaryStage, getHumanReadableStatus } from './workflow.service.js';
import { getRequestTimeline } from './timeline.service.js';

// ================= MAINTENANCE TYPES (MASTER DATA) =================
export async function getMaintenanceTypes(req, res, next) {
  try {
    const types = await prisma.maintenanceType.findMany({
      where: { tenantId: req.tenantId },
      orderBy: { sortOrder: 'asc' }
    });
    res.json({ success: true, data: types });
  } catch (error) {
    next(error);
  }
}

export async function createMaintenanceType(req, res, next) {
  try {
    const { name, code, icon, color, description, sortOrder } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Type name and code are required.' });
    }

    const count = await prisma.maintenanceType.count({ where: { tenantId: req.tenantId } });
    const maintenanceType = await prisma.maintenanceType.create({
      data: {
        tenantId: req.tenantId,
        name: name.trim(),
        code: code.toUpperCase().trim(),
        icon: icon || 'Wrench',
        color: color || '#2563eb',
        description,
        sortOrder: sortOrder !== undefined ? sortOrder : count
      }
    });

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'CREATE_MAINTENANCE_TYPE',
      entity: 'MaintenanceType',
      entityId: maintenanceType.id,
      details: { name, code },
      req
    });

    res.status(201).json({ success: true, data: maintenanceType });
  } catch (error) {
    next(error);
  }
}

export async function updateMaintenanceType(req, res, next) {
  try {
    const { id } = req.params;
    const { name, icon, color, description, sortOrder, isActive } = req.body;

    const updated = await prisma.maintenanceType.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(icon ? { icon } : {}),
        ...(color ? { color } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(sortOrder !== undefined ? { sortOrder } : {}),
        ...(isActive !== undefined ? { isActive } : {})
      }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function reorderMaintenanceTypes(req, res, next) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items array is required for reordering.' });
    }

    await prisma.$transaction(
      items.map(item =>
        prisma.maintenanceType.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder }
        })
      )
    );

    res.json({ success: true, message: 'Maintenance types reordered successfully.' });
  } catch (error) {
    next(error);
  }
}

// ================= MAINTENANCE REQUESTS =================
export async function getMaintenanceRequests(req, res, next) {
  try {
    const {
      search,
      branchId,
      brandId,
      departmentId,
      maintenanceTypeId,
      priority,
      workStatus,
      approvalStatus,
      assignedToId,
      requesterId,
      isOverdue,
      view,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const where = { tenantId: req.tenantId };

    // Employee role strictly scoped to their own requests
    if (req.user.role === 'EMPLOYEE') {
      where.requesterId = req.user.id;
    } else if (requesterId) {
      where.requesterId = requesterId;
    }

    // Branch isolation for non-supervisory roles
    if (!['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER'].includes(req.user.role)) {
      if (branchId) {
        if (!req.branchIds || !req.branchIds.includes(branchId)) {
          return res.status(403).json({ success: false, message: 'Access denied for requested branch.' });
        }
        where.branchId = branchId;
      } else if (req.branchIds && req.branchIds.length > 0) {
        where.branchId = { in: req.branchIds };
      }
    } else if (branchId) {
      where.branchId = branchId;
    }

    if (brandId) where.brandId = brandId;
    if (departmentId) where.departmentId = departmentId;
    if (maintenanceTypeId) where.maintenanceTypeId = maintenanceTypeId;
    if (priority) where.priority = priority;
    if (workStatus) where.workStatus = workStatus;
    if (approvalStatus) where.approvalStatus = approvalStatus;
    if (assignedToId) where.assignedToId = assignedToId;

    // View filter shortcuts
    const now = new Date();
    if (view === 'my_requests') {
      where.requesterId = req.user.id;
    } else if (view === 'assigned_to_me' || view === 'assigned') {
      if (view === 'assigned_to_me') {
        where.assignedToId = req.user.id;
      } else {
        where.workStatus = { in: ['ASSIGNED', 'IN_PROGRESS'] };
      }
    } else if (view === 'pending_approval' || view === 'waiting_approval') {
      where.workStatus = { in: ['WAITING_FOR_APPROVAL', 'PENDING_APPROVAL', 'NEW'] };
    } else if (view === 'assigned') {
      where.workStatus = 'ASSIGNED';
    } else if (view === 'in_progress') {
      where.workStatus = 'IN_PROGRESS';
    } else if (view === 'wip') {
      where.workStatus = { in: ['ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_VENDOR', 'PURCHASE_COMPLETED', 'CORRECTION_DONE'] };
    } else if (view === 'completed') {
      where.workStatus = 'COMPLETED';
    } else if (view === 'payment_pending') {
      where.workStatus = 'COMPLETED';
      where.paymentStatus = { not: 'PAID' };
    } else if (view === 'closed') {
      where.workStatus = 'CLOSED';
    } else if (view === 'rejected' || view === 'rejections') {
      where.workStatus = 'REJECTED';
    } else if (view === 'new') {
      where.workStatus = { in: ['NEW', 'DRAFT', 'SUBMITTED'] };
    } else if (view === 'purchase') {
      where.workStatus = 'WAITING_FOR_PURCHASE';
    } else if (view === 'high_priority') {
      where.priority = 'HIGH';
      where.workStatus = { notIn: ['CLOSED', 'REJECTED', 'CANCELLED'] };
    } else if (view === 'overdue' || isOverdue === 'true') {
      where.deadline = { lt: now };
      where.workStatus = { notIn: ['COMPLETED', 'CLOSED', 'REJECTED', 'CANCELLED'] };
    } else if (view === 'low_priority') {
      where.priority = 'LOW';
      where.workStatus = { notIn: ['CLOSED', 'REJECTED', 'CANCELLED'] };
    } else if (view === 'dissatisfied') {
      where.OR = [
        { isDissatisfied: true },
        { workStatus: 'NOT_SATISFACTORY' },
        { workStatus: 'REOPENED' }
      ];
    } else if (view === 'medium_priority') {
      where.priority = 'MEDIUM';
      where.workStatus = { notIn: ['CLOSED', 'REJECTED', 'CANCELLED'] };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { requestNumber: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [total, requests, tenant] = await Promise.all([
      prisma.maintenanceRequest.count({ where }),
      prisma.maintenanceRequest.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder.toLowerCase() },
        include: {
          maintenanceType: { select: { id: true, name: true, code: true, icon: true, color: true } },
          branch: { select: { id: true, name: true, code: true } },
          brand: { select: { id: true, name: true, code: true } },
          department: { select: { id: true, name: true, code: true } },
          branchArea: { select: { id: true, name: true, code: true } },
          requester: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          assignedTo: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          _count: {
            select: { comments: true, materials: true, attachments: true, purchaseRequests: true }
          }
        }
      }),
      prisma.tenant.findUnique({ where: { id: req.tenantId } })
    ]);

    const mappedRequests = requests.map(reqItem => {
      const liveSla = getLiveSlaStatus({
        raisedAt: reqItem.createdAt,
        deadline: reqItem.deadline,
        graceHours: reqItem.graceHours || tenant?.graceHours || 12.0,
        workStatus: reqItem.workStatus
      });

      const humanStatus = getHumanReadableStatus(reqItem, req.user.role);

      return {
        ...reqItem,
        primaryStage: getPrimaryStage(reqItem.workStatus),
        humanReadableStatus: humanStatus.label,
        humanReadableDescription: humanStatus.description,
        isOverdueComputed: liveSla.isLiveOverdue,
        liveSlaStatus: liveSla.statusLabel,
        remainingText: liveSla.remainingText
      };
    });

    res.json({
      success: true,
      data: {
        items: mappedRequests,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          pages: Math.ceil(total / take)
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getMaintenanceRequestById(req, res, next) {
  try {
    const { id } = req.params;

    const [request, tenant] = await Promise.all([
      prisma.maintenanceRequest.findFirst({
        where: { id, tenantId: req.tenantId },
        include: {
          maintenanceType: true,
          branch: true,
          brand: true,
          department: true,
          branchArea: true,
          requester: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true } },
          assignedTo: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          assignedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          rejectedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          dissatisfiedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          vendor: true,
          assignments: {
            include: {
              assignedTo: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
              assignedBy: { select: { id: true, firstName: true, lastName: true, email: true } }
            },
            orderBy: { assignedAt: 'desc' }
          },
          statusHistories: {
            include: {
              changedBy: { select: { id: true, firstName: true, lastName: true, role: true } }
            },
            orderBy: { createdAt: 'desc' }
          },
          comments: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } }
            },
            orderBy: { createdAt: 'asc' }
          },
          materials: {
            include: {
              addedBy: { select: { id: true, firstName: true, lastName: true } }
            },
            orderBy: { createdAt: 'asc' }
          },
          attachments: {
            include: {
              uploadedBy: { select: { id: true, firstName: true, lastName: true } }
            },
            orderBy: { createdAt: 'desc' }
          },
          purchaseRequests: {
            include: {
              requestedBy: { select: { id: true, firstName: true, lastName: true } },
              vendor: true,
              items: true,
              quotations: true
            },
            orderBy: { createdAt: 'desc' }
          },
          asset: {
            select: {
              id: true,
              assetCode: true,
              name: true,
              category: true,
              location: true,
              criticality: true,
              status: true
            }
          },
          evidenceItems: {
            include: {
              uploadedBy: { select: { id: true, firstName: true, lastName: true, role: true } }
            },
            orderBy: { uploadedAt: 'desc' }
          },
          followUps: {
            include: {
              assignedUser: { select: { id: true, firstName: true, lastName: true } },
              createdBy: { select: { id: true, firstName: true, lastName: true } }
            },
            orderBy: { nextFollowUpDate: 'asc' }
          },
          penalties: {
            include: {
              waivedBy: { select: { id: true, firstName: true, lastName: true } }
            },
            orderBy: { createdAt: 'desc' }
          },
          rca: true
        }
      }),
      prisma.tenant.findUnique({ where: { id: req.tenantId } })
    ]);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found.' });
    }

    // Role-specific viewing authorization
    if (req.user.role === 'EMPLOYEE' && request.requesterId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied: Employees can only view their own requests.' });
    }

    if (req.user.role !== 'PLATFORM_ADMIN' && req.user.role !== 'TENANT_ADMIN') {
      if (req.branchIds && req.branchIds.length > 0 && !req.branchIds.includes(request.branchId)) {
        return res.status(403).json({ success: false, message: 'Access denied: You cannot view requests outside your assigned branches.' });
      }
    }

    const [liveSla, timeline] = await Promise.all([
      getLiveSlaStatus({
        raisedAt: request.createdAt,
        deadline: request.deadline,
        graceHours: request.graceHours || tenant?.graceHours || 12.0,
        workStatus: request.workStatus
      }),
      getRequestTimeline(id, req.tenantId, req.user.role)
    ]);

    const humanStatus = getHumanReadableStatus(request, req.user.role);

    // Calculate dynamic SLA penalty for deadline breaches
    let dynamicPenalty = request.penaltyAmount || 0;
    let dynamicPenaltyStatus = request.penaltyStatus || 'NONE';
    const now = new Date();
    const graceHours = request.graceHours || tenant?.graceHours || 12.0;
    const deadlinePlusGrace = request.deadline ? new Date(new Date(request.deadline).getTime() + (graceHours * 3600 * 1000)) : null;

    if (deadlinePlusGrace && now > deadlinePlusGrace && !['COMPLETED', 'CLOSED', 'REJECTED', 'CANCELLED'].includes(request.workStatus)) {
      const breachHours = Math.max(0, Math.round(((now.getTime() - deadlinePlusGrace.getTime()) / 3600000) * 10) / 10);
      const hourlyRate = request.penaltyHourlyRate || (request.priority === 'HIGH' ? 500 : request.priority === 'MEDIUM' ? 250 : 100);
      dynamicPenalty = request.penaltyWaived ? 0 : Math.round(breachHours * hourlyRate);
      dynamicPenaltyStatus = request.penaltyWaived ? 'WAIVED' : 'ACCRUING';
    }

    // Check if asset or location has repeated failures within 90 days
    let repeatCount = 0;
    if (request.assetId || request.location) {
      repeatCount = await prisma.maintenanceRequest.count({
        where: {
          tenantId: req.tenantId,
          id: { not: request.id },
          OR: [
            ...(request.assetId ? [{ assetId: request.assetId }] : []),
            { branchId: request.branchId, location: { equals: request.location, mode: 'insensitive' } }
          ],
          createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
        }
      });
    }

    // Problem images: from attachments (INITIAL_PHOTO) and evidence (BEFORE)
    const problemImagesList = [
      ...(request.attachments || [])
        .filter(a => a.attachmentType === 'INITIAL_PHOTO' || a.attachmentType === 'DISSATISFACTION_PHOTO')
        .map(a => ({
          id: a.id,
          fileUrl: a.fileUrl,
          originalFilename: a.originalFilename,
          mimeType: a.mimeType,
          uploadedBy: a.uploadedBy,
          createdAt: a.createdAt,
          type: 'PROBLEM'
        })),
      ...(request.evidenceItems || [])
        .filter(e => e.stage === 'BEFORE')
        .map(e => ({
          id: e.id,
          fileUrl: e.fileUrl,
          originalFilename: e.filename,
          description: e.description,
          uploadedBy: e.uploadedBy,
          createdAt: e.uploadedAt,
          type: 'PROBLEM'
        }))
    ];

    // Completion images: from attachments (COMPLETION_PHOTO) and evidence (AFTER, DURING, VERIFICATION)
    const completionImagesList = [
      ...(request.attachments || [])
        .filter(a => a.attachmentType === 'COMPLETION_PHOTO' || a.attachmentType === 'WORK_PROGRESS')
        .map(a => ({
          id: a.id,
          fileUrl: a.fileUrl,
          originalFilename: a.originalFilename,
          mimeType: a.mimeType,
          uploadedBy: a.uploadedBy,
          createdAt: a.createdAt,
          type: 'COMPLETION'
        })),
      ...(request.evidenceItems || [])
        .filter(e => e.stage === 'AFTER' || e.stage === 'DURING' || e.stage === 'VERIFICATION')
        .map(e => ({
          id: e.id,
          fileUrl: e.fileUrl,
          originalFilename: e.filename,
          description: e.description,
          uploadedBy: e.uploadedBy,
          createdAt: e.uploadedAt,
          type: 'COMPLETION'
        }))
    ];

    // Deduplicate images by fileUrl
    const problemImages = Array.from(new Map(problemImagesList.map(item => [item.fileUrl, item])).values());
    const completionImages = Array.from(new Map(completionImagesList.map(item => [item.fileUrl, item])).values());

    res.json({
      success: true,
      data: {
        ...request,
        problemImages,
        completionImages,
        evidence: problemImages.concat(completionImages),
        evidenceItems: request.evidenceItems || [],
        invoice: {
          number: request.invoiceNumber,
          date: request.invoiceDate,
          amount: request.invoiceAmount,
          url: request.invoiceUrl,
          remarks: request.invoiceRemarks
        },
        payment: {
          status: request.paymentStatus || 'NOT_REQUIRED',
          date: request.paymentDate,
          amount: request.paymentAmount,
          method: request.paymentMethod,
          proofUrl: request.paymentProofUrl,
          remarks: request.paymentRemarks
        },
        primaryStage: getPrimaryStage(request.workStatus),
        humanReadableStatus: humanStatus.label,
        humanReadableDescription: humanStatus.description,
        timeline,
        isOverdueComputed: liveSla.isLiveOverdue,
        liveSlaStatus: liveSla.statusLabel,
        remainingText: liveSla.remainingText,
        dynamicPenalty,
        dynamicPenaltyStatus,
        repeatFailureDetected: repeatCount > 0,
        repeatFailureCount: repeatCount
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function createMaintenanceRequest(req, res, next) {
  try {
    const {
      brandId,
      branchId,
      departmentId,
      maintenanceTypeId,
      assetId,
      branchAreaId,
      areaInBranch,
      priority = 'MEDIUM',
      location,
      subject,
      description,
      requiredDate,
      estimatedCost = 0,
      requesterContact,
      approvalCopyUrl
    } = req.body;

    if (!branchId || !departmentId || !maintenanceTypeId || !location || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Branch, department, work type, location, subject, and description are required.'
      });
    }

    if (req.user.role !== 'PLATFORM_ADMIN' && req.user.role !== 'TENANT_ADMIN') {
      if (!req.branchIds.includes(branchId)) {
        return res.status(403).json({ success: false, message: 'You are not authorized to raise requests for this branch.' });
      }
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: req.tenantId } });

    // Calculate SLA target hours and deadline
    const targetHours = calculateTargetHours({ priority, tenant });
    const now = new Date();
    const explicitDeadline = requiredDate ? new Date(requiredDate) : calculateDeadline({ raisedAt: now, targetHours });

    // Format sequential collision-safe request number: PREFIX-YYYY-XXXXXX
    const currentYear = now.getFullYear();
    const count = await prisma.maintenanceRequest.count({ where: { tenantId: req.tenantId } });
    const prefix = tenant?.requestPrefix || 'MAIN';
    const requestNumber = `${prefix}-${currentYear}-${String(count + 1).padStart(6, '0')}`;

    // Workflow procedure check
    const approvalReq = tenant?.approvalRequired ?? true;
    const initialStatus = approvalReq ? 'WAITING_FOR_APPROVAL' : 'ASSIGNED';
    const initialApprovalStatus = approvalReq ? 'PENDING' : 'NOT_REQUIRED';

    const newRequest = await prisma.$transaction(async (tx) => {
      const created = await tx.maintenanceRequest.create({
        data: {
          requestNumber,
          tenantId: req.tenantId,
          brandId: brandId || null,
          branchId,
          departmentId,
          maintenanceTypeId,
          branchAreaId: branchAreaId || null,
          areaInBranch: areaInBranch || null,
          requesterId: req.user.id,
          requesterContact: requesterContact || req.user.phone || null,
          priority: ['HIGH', 'LOW'].includes(priority) ? priority : 'MEDIUM',
          location,
          subject,
          description,
          requiredDate: explicitDeadline,
          deadline: explicitDeadline,
          targetHours,
          graceHours: tenant?.graceHours || 12.0,
          approvalStatus: initialApprovalStatus,
          workStatus: initialStatus,
          currentStatus: initialStatus,
          approvalCopyUrl: approvalCopyUrl || null,
          approvalUploadedAt: approvalCopyUrl ? new Date() : null,
          estimatedCost: parseFloat(estimatedCost) || 0,
          checkedOff: true,
          branchStatus: 'OPEN',
          assetId: assetId || null
        }
      });

      await tx.maintenanceRequestStatusHistory.create({
        data: {
          tenantId: req.tenantId,
          requestId: created.id,
          fromStatus: null,
          toStatus: initialStatus,
          changedById: req.user.id,
          remarks: approvalReq ? 'Request created and submitted for approval.' : 'Request created and awaiting assignment.'
        }
      });

      // Save any problem images uploaded with request creation
      const uploadedFiles = req.files || (req.file ? [req.file] : []);
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          const fileUrl = `/uploads/${file.filename}`;
          await tx.maintenanceRequestAttachment.create({
            data: {
              tenantId: req.tenantId,
              requestId: created.id,
              originalFilename: file.originalname,
              storedFilename: file.filename,
              fileUrl,
              mimeType: file.mimetype,
              fileSize: file.size,
              attachmentType: 'INITIAL_PHOTO',
              uploadedById: req.user.id
            }
          });

          await tx.maintenanceEvidence.create({
            data: {
              tenantId: req.tenantId,
              requestId: created.id,
              stage: 'BEFORE',
              fileUrl,
              mediaType: file.mimetype.startsWith('video/') ? 'VIDEO' : 'PHOTO',
              filename: file.originalname,
              description: 'Initial Problem Photo',
              uploadedById: req.user.id
            }
          });
        }
      }

      return created;
    });

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'CREATE_REQUEST',
      entity: 'MaintenanceRequest',
      entityId: newRequest.id,
      details: { requestNumber, subject, priority, branchId },
      req
    });

    // Notify Branch Managers & Approvers
    const managers = await prisma.user.findMany({
      where: {
        tenantId: req.tenantId,
        status: 'ACTIVE',
        role: { in: ['MANAGER', 'APPROVER', 'TENANT_ADMIN'] },
        branchAccesses: { some: { branchId } }
      },
      select: { id: true }
    });

    await notifyUsers({
      tenantId: req.tenantId,
      userIds: managers.map(m => m.id),
      title: `New Maintenance Request: ${requestNumber}`,
      message: `${req.user.firstName} ${req.user.lastName} submitted request "${subject}" awaiting your action.`,
      type: approvalReq ? 'APPROVAL_REQUIRED' : 'NEW_REQUEST',
      entityType: 'MaintenanceRequest',
      entityId: newRequest.id
    });

    res.status(201).json({
      success: true,
      message: 'Maintenance request submitted successfully.',
      data: newRequest
    });
  } catch (error) {
    next(error);
  }
}

export async function approveMaintenanceRequest(req, res, next) {
  try {
    if (!['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to approve maintenance requests.' });
    }

    const { id } = req.params;
    const { remarks, approvalCopyUrl, assignedToId, assignedToContact, deadline, approvedCost } = req.body;

    const existing = await prisma.maintenanceRequest.findFirst({
      where: { id, tenantId: req.tenantId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found.' });
    }

    if (existing.approvalStatus === 'APPROVED' && !assignedToId) {
      return res.status(400).json({ success: false, message: 'Request is already approved.' });
    }

    const isAssigning = !!assignedToId;
    const targetWorkStatus = isAssigning ? 'ASSIGNED' : 'APPROVED';

    const updated = await prisma.$transaction(async (tx) => {
      const reqUpdated = await tx.maintenanceRequest.update({
        where: { id },
        data: {
          approvalStatus: 'APPROVED',
          workStatus: targetWorkStatus,
          currentStatus: targetWorkStatus,
          approvedById: req.user.id,
          approvedAt: new Date(),
          ...(approvalCopyUrl ? { approvalCopyUrl, approvalUploadedAt: new Date() } : {}),
          ...(assignedToId ? {
            assignedToId,
            assignedById: req.user.id,
            assignedAt: new Date(),
            assignedToContact: assignedToContact || null,
            deadline: deadline ? new Date(deadline) : undefined,
            approvedCost: approvedCost ? parseFloat(approvedCost) : undefined
          } : {})
        }
      });

      if (assignedToId) {
        await tx.maintenanceRequestAssignment.create({
          data: {
            tenantId: req.tenantId,
            requestId: id,
            assignedToId,
            assignedById: req.user.id,
            assignedAt: new Date(),
            notes: remarks || 'Assigned upon approval'
          }
        });
      }

      await tx.maintenanceRequestStatusHistory.create({
        data: {
          tenantId: req.tenantId,
          requestId: id,
          fromStatus: existing.workStatus,
          toStatus: targetWorkStatus,
          changedById: req.user.id,
          remarks: remarks || (isAssigning ? 'Request approved and assigned for execution.' : 'Request approved.')
        }
      });

      return reqUpdated;
    });

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'APPROVE_REQUEST',
      entity: 'MaintenanceRequest',
      entityId: id,
      details: { requestNumber: existing.requestNumber, remarks },
      req
    });

    await notifyUsers({
      tenantId: req.tenantId,
      userIds: [existing.requesterId],
      title: `Request Approved: ${existing.requestNumber}`,
      message: `Your maintenance request "${existing.subject}" was approved by ${req.user.firstName} ${req.user.lastName}.`,
      type: 'REQUEST_APPROVED',
      entityType: 'MaintenanceRequest',
      entityId: id
    });

    res.json({ success: true, message: 'Request approved successfully.', data: updated });
  } catch (error) {
    next(error);
  }
}

export async function rejectMaintenanceRequest(req, res, next) {
  try {
    if (!['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to reject maintenance requests.' });
    }

    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
    }

    const existing = await prisma.maintenanceRequest.findFirst({
      where: { id, tenantId: req.tenantId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found.' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const reqUpdated = await tx.maintenanceRequest.update({
        where: { id },
        data: {
          approvalStatus: 'REJECTED',
          workStatus: 'REJECTED',
          currentStatus: 'REJECTED',
          rejectedById: req.user.id,
          rejectedAt: new Date(),
          rejectionReason: rejectionReason.trim()
        }
      });

      await tx.maintenanceRequestStatusHistory.create({
        data: {
          tenantId: req.tenantId,
          requestId: id,
          fromStatus: existing.workStatus,
          toStatus: 'REJECTED',
          changedById: req.user.id,
          remarks: `Rejected: ${rejectionReason}`
        }
      });

      return reqUpdated;
    });

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'REJECT_REQUEST',
      entity: 'MaintenanceRequest',
      entityId: id,
      details: { requestNumber: existing.requestNumber, rejectionReason },
      req
    });

    await notifyUsers({
      tenantId: req.tenantId,
      userIds: [existing.requesterId],
      title: `Request Rejected: ${existing.requestNumber}`,
      message: `Your request "${existing.subject}" was rejected. Reason: ${rejectionReason}`,
      type: 'REQUEST_REJECTED',
      entityType: 'MaintenanceRequest',
      entityId: id
    });

    res.json({ success: true, message: 'Request rejected.', data: updated });
  } catch (error) {
    next(error);
  }
}

export async function assignMaintenanceRequest(req, res, next) {
  try {
    if (!['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to assign technicians.' });
    }

    const { id } = req.params;
    const { assignedToId, notes, actionPlan, executiveContact, managerContact, deadline } = req.body;

    if (!assignedToId) {
      return res.status(400).json({ success: false, message: 'Technician/User ID to assign is required.' });
    }

    const [existing, technician] = await Promise.all([
      prisma.maintenanceRequest.findFirst({ where: { id, tenantId: req.tenantId } }),
      prisma.user.findFirst({ where: { id: assignedToId, tenantId: req.tenantId, status: 'ACTIVE' } })
    ]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found.' });
    }
    if (!technician) {
      return res.status(404).json({ success: false, message: 'Assigned user does not exist or is inactive.' });
    }

    const assignedAt = new Date();
    const timeToAssignMinutes = calculateTimeToAssign({
      raisedAt: existing.createdAt,
      assignedAt
    });

    const updated = await prisma.$transaction(async (tx) => {
      // Inactivate previous active assignments
      await tx.maintenanceRequestAssignment.updateMany({
        where: { requestId: id, active: true },
        data: { active: false }
      });

      // Create new immutable assignment record
      await tx.maintenanceRequestAssignment.create({
        data: {
          tenantId: req.tenantId,
          requestId: id,
          assignedToId,
          assignedById: req.user.id,
          assignedAt,
          notes: notes || null,
          actionPlan: actionPlan || null,
          active: true
        }
      });

      const nextStatus = existing.workStatus === 'WAITING_FOR_APPROVAL' || existing.workStatus === 'APPROVED' ? 'ASSIGNED' : existing.workStatus;

      const reqUpdated = await tx.maintenanceRequest.update({
        where: { id },
        data: {
          assignedToId,
          assignedById: req.user.id,
          assignedAt,
          timeToAssignMinutes,
          assignedToContact: executiveContact || technician.phone || null,
          managerContact: managerContact || req.user.phone || null,
          actionPlan: actionPlan || existing.actionPlan,
          ...(deadline ? { deadline: new Date(deadline) } : {}),
          workStatus: nextStatus,
          currentStatus: nextStatus
        }
      });

      await tx.maintenanceRequestStatusHistory.create({
        data: {
          tenantId: req.tenantId,
          requestId: id,
          fromStatus: existing.workStatus,
          toStatus: nextStatus,
          changedById: req.user.id,
          remarks: `Assigned to ${technician.firstName} ${technician.lastName}.${notes ? ` Notes: ${notes}` : ''}`
        }
      });

      return reqUpdated;
    });

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'ASSIGN_REQUEST',
      entity: 'MaintenanceRequest',
      entityId: id,
      details: { assignedToId, technicianName: `${technician.firstName} ${technician.lastName}`, timeToAssignMinutes },
      req
    });

    await notifyUsers({
      tenantId: req.tenantId,
      userIds: [assignedToId],
      title: `Task Assigned: ${existing.requestNumber}`,
      message: `You have been assigned to maintenance request "${existing.subject}" at ${existing.location}.`,
      type: 'TASK_ASSIGNED',
      entityType: 'MaintenanceRequest',
      entityId: id
    });

    res.json({ success: true, message: 'Task assigned successfully.', data: updated });
  } catch (error) {
    next(error);
  }
}

export async function assignVendorToRequest(req, res, next) {
  try {
    if (!['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER', 'MAINTENANCE_USER'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to assign vendors.' });
    }

    const { id } = req.params;
    const { vendorId, vendorScope, vendorQuotationRef, vendorServiceDate } = req.body;

    if (!vendorId) {
      return res.status(400).json({ success: false, message: 'Vendor selection is required.' });
    }

    const [existing, vendor] = await Promise.all([
      prisma.maintenanceRequest.findFirst({ where: { id, tenantId: req.tenantId } }),
      prisma.vendor.findFirst({ where: { id: vendorId, tenantId: req.tenantId, isActive: true } })
    ]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found.' });
    }
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found or inactive.' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const reqUpdated = await tx.maintenanceRequest.update({
        where: { id },
        data: {
          vendorId,
          vendorScope: vendorScope || 'External specialized maintenance contractor',
          vendorQuotationRef: vendorQuotationRef || null,
          vendorServiceDate: vendorServiceDate ? new Date(vendorServiceDate) : null,
          vendorStatus: 'SCHEDULED',
          workStatus: 'WAITING_FOR_VENDOR',
          currentStatus: 'WAITING_FOR_VENDOR'
        }
      });

      await tx.maintenanceRequestStatusHistory.create({
        data: {
          tenantId: req.tenantId,
          requestId: id,
          fromStatus: existing.workStatus,
          toStatus: 'WAITING_FOR_VENDOR',
          changedById: req.user.id,
          remarks: `Third-party vendor assigned: ${vendor.name}. Work Scope: ${vendorScope || 'Specialized service'}.`
        }
      });

      return reqUpdated;
    });

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'ASSIGN_VENDOR',
      entity: 'MaintenanceRequest',
      entityId: id,
      details: { vendorId, vendorName: vendor.name },
      req
    });

    res.json({ success: true, message: `Vendor ${vendor.name} assigned to request.`, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function updateWorkStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { workStatus, remarks, completionRemarks, actualCost, correctionDone, branchRemarks, purchaseRemarks } = req.body;

    const existing = await prisma.maintenanceRequest.findFirst({
      where: { id, tenantId: req.tenantId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found.' });
    }

    const isAssigned = existing.assignedToId === req.user.id;
    const isManagerOrAdmin = ['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER', 'MAINTENANCE_USER'].includes(req.user.role);

    if (!isAssigned && !isManagerOrAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to update work status for this request.' });
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: req.tenantId } });

    // Validate transition with tenant-specific custom workflow matrix if configured
    const validation = validateStatusTransition({
      currentStatus: existing.workStatus,
      targetStatus: workStatus,
      role: req.user.role,
      tenantConfig: tenant?.workflowConfig || tenant?.features || null,
      isAssignedUser: isAssigned
    });

    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    const now = new Date();
    const updatePayload = {
      workStatus,
      currentStatus: workStatus,
      statusUpdatedById: req.user.id,
      statusUpdatedAt: now
    };

    if (workStatus === 'IN_PROGRESS') {
      if (!existing.startedAt) {
        updatePayload.startedAt = now;
      }
      if (!existing.assignedToId) {
        updatePayload.assignedToId = req.user.id;
        updatePayload.assignedAt = now;
      }
    }
    if (workStatus === 'COMPLETED') {
      updatePayload.completedAt = now;
      if (completionRemarks) updatePayload.completionRemarks = completionRemarks;
      if (actualCost !== undefined) updatePayload.actualCost = parseFloat(actualCost);
      updatePayload.correctionDone = 'COMPLETED';
      updatePayload.correctionAt = now;

      // SLA evaluation upon completion
      const slaResult = evaluateSlaClassification({
        raisedAt: existing.createdAt,
        completedAt: now,
        targetHours: existing.targetHours || 48.0,
        graceHours: existing.graceHours || 12.0
      });
      updatePayload.actualTimeHours = slaResult.actualTimeHours;
      updatePayload.differenceHours = slaResult.differenceHours;
      updatePayload.slaClassification = slaResult.classification;
    }

    if (correctionDone) {
      updatePayload.correctionDone = correctionDone;
      if (correctionDone === 'COMPLETED') updatePayload.correctionAt = now;
    }
    if (branchRemarks) updatePayload.branchRemarks = branchRemarks;
    if (purchaseRemarks) updatePayload.purchaseRemarks = purchaseRemarks;

    const updated = await prisma.$transaction(async (tx) => {
      const reqUpdated = await tx.maintenanceRequest.update({
        where: { id },
        data: updatePayload
      });

      await tx.maintenanceRequestStatusHistory.create({
        data: {
          tenantId: req.tenantId,
          requestId: id,
          fromStatus: existing.workStatus,
          toStatus: workStatus,
          changedById: req.user.id,
          remarks: remarks || completionRemarks || `Status updated to ${workStatus}`
        }
      });

      return reqUpdated;
    });

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'UPDATE_STATUS',
      entity: 'MaintenanceRequest',
      entityId: id,
      details: { fromStatus: existing.workStatus, toStatus: workStatus, remarks },
      req
    });

    if (workStatus === 'COMPLETED') {
      await notifyUsers({
        tenantId: req.tenantId,
        userIds: [existing.requesterId],
        title: `Work Completed: ${existing.requestNumber}`,
        message: `Your maintenance request "${existing.subject}" has been completed. Please inspect and confirm satisfaction.`,
        type: 'WORK_COMPLETED',
        entityType: 'MaintenanceRequest',
        entityId: id
      });
    }

    res.json({ success: true, message: `Status updated to ${workStatus}`, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function updateCorrectionDone(req, res, next) {
  try {
    const { id } = req.params;
    const { correctionDone } = req.body;

    const allowed = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'NOT_REQUIRED'];
    if (!allowed.includes(correctionDone)) {
      return res.status(400).json({ success: false, message: `Invalid correction state. Allowed: ${allowed.join(', ')}` });
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        correctionDone,
        correctionAt: correctionDone === 'COMPLETED' ? new Date() : undefined
      }
    });

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'UPDATE_CORRECTION_STATE',
      entity: 'MaintenanceRequest',
      entityId: id,
      details: { correctionDone },
      req
    });

    res.json({ success: true, message: `Correction state updated to ${correctionDone}`, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function toggleCheckedOff(req, res, next) {
  try {
    const { id } = req.params;
    const { checkedOff } = req.body;

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: { checkedOff: Boolean(checkedOff) }
    });

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'TOGGLE_CHECKED_OFF',
      entity: 'MaintenanceRequest',
      entityId: id,
      details: { checkedOff: Boolean(checkedOff) },
      req
    });

    res.json({ success: true, message: `Checked off updated to ${Boolean(checkedOff)}`, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function submitSatisfaction(req, res, next) {
  try {
    const { id } = req.params;
    const { satisfaction, reason, comment } = req.body;

    if (!['SATISFIED', 'DISSATISFIED'].includes(satisfaction)) {
      return res.status(400).json({
        success: false,
        message: 'Satisfaction must be either SATISFIED or DISSATISFIED.'
      });
    }

    const existing = await prisma.maintenanceRequest.findFirst({
      where: { id, tenantId: req.tenantId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found.' });
    }

    const isRequester = existing.requesterId === req.user.id;
    const isManagerOrAdmin = ['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER'].includes(req.user.role);

    if (!isRequester && !isManagerOrAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden: Only the original requester or a manager can verify satisfaction.' });
    }

    const now = new Date();

    if (satisfaction === 'SATISFIED') {
      const updated = await prisma.$transaction(async (tx) => {
        const reqUpdated = await tx.maintenanceRequest.update({
          where: { id },
          data: {
            workStatus: 'CLOSED',
            currentStatus: 'CLOSED',
            closedAt: now,
            isDissatisfied: false
          }
        });

        await tx.maintenanceRequestStatusHistory.create({
          data: {
            tenantId: req.tenantId,
            requestId: id,
            fromStatus: existing.workStatus,
            toStatus: 'CLOSED',
            changedById: req.user.id,
            remarks: comment || 'Verified and confirmed satisfied by requester.'
          }
        });

        return reqUpdated;
      });

      await logAudit({
        tenantId: req.tenantId,
        userId: req.user.id,
        action: 'CLOSE_REQUEST',
        entity: 'MaintenanceRequest',
        entityId: id,
        details: { satisfaction: 'SATISFIED' },
        req
      });

      return res.json({ success: true, message: 'Request verified and closed successfully.', data: updated });
    } else {
      // DISSATISFIED -> REOPEN
      if (!reason || !reason.trim()) {
        return res.status(400).json({ success: false, message: 'Reason for dissatisfaction is required.' });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const reqUpdated = await tx.maintenanceRequest.update({
          where: { id },
          data: {
            workStatus: 'REOPENED',
            currentStatus: 'REOPENED',
            isDissatisfied: true,
            dissatisfactionReason: reason.trim(),
            dissatisfiedAt: now,
            dissatisfiedById: req.user.id
          }
        });

        await tx.maintenanceRequestStatusHistory.create({
          data: {
            tenantId: req.tenantId,
            requestId: id,
            fromStatus: existing.workStatus,
            toStatus: 'REOPENED',
            changedById: req.user.id,
            remarks: `Dissatisfied task reopened. Reason: ${reason}. Notes: ${comment || 'None'}`
          }
        });

        return reqUpdated;
      });

      await logAudit({
        tenantId: req.tenantId,
        userId: req.user.id,
        action: 'REOPEN_REQUEST',
        entity: 'MaintenanceRequest',
        entityId: id,
        details: { reason, comment },
        req
      });

      const notifyIds = [existing.assignedToId, existing.assignedById].filter(Boolean);
      await notifyUsers({
        tenantId: req.tenantId,
        userIds: notifyIds,
        title: `Task Reopened (Dissatisfied): ${existing.requestNumber}`,
        message: `Task "${existing.subject}" was marked dissatisfied: ${reason}. Work reopened for rectification.`,
        type: 'TASK_REOPENED',
        entityType: 'MaintenanceRequest',
        entityId: id
      });

      return res.json({ success: true, message: 'Request marked dissatisfied and reopened for rectification.', data: updated });
    }
  } catch (error) {
    next(error);
  }
}

export async function addComment(req, res, next) {
  try {
    const { id } = req.params;
    const { comment, isInternal = false } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required.' });
    }

    const newComment = await prisma.maintenanceRequestComment.create({
      data: {
        tenantId: req.tenantId,
        requestId: id,
        userId: req.user.id,
        comment: comment.trim(),
        isInternal: Boolean(isInternal)
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, role: true } }
      }
    });

    res.status(201).json({ success: true, data: newComment });
  } catch (error) {
    next(error);
  }
}

export async function addMaterial(req, res, next) {
  try {
    const { id } = req.params;
    const { materialName, quantity = 1, unit = 'pcs', unitCost = 0 } = req.body;

    if (!materialName || !materialName.trim()) {
      return res.status(400).json({ success: false, message: 'Material name is required.' });
    }

    const qty = parseFloat(quantity) || 1;
    const cost = parseFloat(unitCost) || 0;
    const totalCost = qty * cost;

    const material = await prisma.$transaction(async (tx) => {
      const created = await tx.maintenanceRequestMaterial.create({
        data: {
          tenantId: req.tenantId,
          requestId: id,
          materialName: materialName.trim(),
          quantity: qty,
          unit: unit.trim(),
          unitCost: cost,
          totalCost,
          addedById: req.user.id
        }
      });

      await tx.maintenanceRequest.update({
        where: { id },
        data: { actualCost: { increment: totalCost } }
      });

      return created;
    });

    res.status(201).json({ success: true, data: material });
  } catch (error) {
    next(error);
  }
}

export async function uploadAttachment(req, res, next) {
  try {
    const { id } = req.params;
    const { attachmentType = 'WORK_PROGRESS' } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const attachment = await prisma.maintenanceRequestAttachment.create({
      data: {
        tenantId: req.tenantId,
        requestId: id,
        originalFilename: req.file.originalname,
        storedFilename: req.file.filename,
        fileUrl,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        attachmentType,
        uploadedById: req.user.id
      }
    });

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'UPLOAD_ATTACHMENT',
      entity: 'MaintenanceRequestAttachment',
      entityId: attachment.id,
      details: { requestId: id, originalFilename: req.file.originalname },
      req
    });

    res.status(201).json({ success: true, data: attachment });
  } catch (error) {
    next(error);
  }
}

/**
 * Upload problem evidence across lifecycle stages: BEFORE, DURING, AFTER, VERIFICATION.
 * Supports Photos, Videos, Audio/Voice notes, and Attachments.
 */
export async function uploadEvidence(req, res, next) {
  try {
    const { id } = req.params;
    const { stage = 'BEFORE', mediaType = 'PHOTO', description } = req.body;

    let fileUrl = req.body.fileUrl;
    let filename = req.body.filename || 'evidence_file';

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      filename = req.file.originalname;
    }

    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'File or fileUrl is required.' });
    }

    const evidence = await prisma.maintenanceEvidence.create({
      data: {
        tenantId: req.tenantId,
        requestId: id,
        stage: ['BEFORE', 'DURING', 'AFTER', 'VERIFICATION'].includes(stage) ? stage : 'BEFORE',
        fileUrl,
        mediaType: ['PHOTO', 'VIDEO', 'AUDIO', 'ATTACHMENT'].includes(mediaType) ? mediaType : 'PHOTO',
        filename,
        description: description || null,
        uploadedById: req.user.id
      },
      include: {
        uploadedBy: { select: { id: true, firstName: true, lastName: true, role: true } }
      }
    });

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'EVIDENCE_UPLOADED',
      entity: 'MaintenanceEvidence',
      entityId: evidence.id,
      details: { requestId: id, stage, mediaType },
      req
    });

    res.status(201).json({ success: true, data: evidence });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a scheduled follow-up for a maintenance request.
 */
export async function createFollowUp(req, res, next) {
  try {
    const { id } = req.params;
    const { comment, assignedUserId, nextFollowUpDate, attachmentUrl } = req.body;

    if (!comment || !nextFollowUpDate) {
      return res.status(400).json({ success: false, message: 'Comment and nextFollowUpDate are required.' });
    }

    const followUp = await prisma.maintenanceRequestFollowUp.create({
      data: {
        tenantId: req.tenantId,
        requestId: id,
        comment,
        assignedUserId: assignedUserId || null,
        createdById: req.user.id,
        nextFollowUpDate: new Date(nextFollowUpDate),
        status: 'PENDING',
        attachmentUrl: attachmentUrl || null
      },
      include: {
        assignedUser: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    if (assignedUserId) {
      await notifyUsers({
        tenantId: req.tenantId,
        userIds: [assignedUserId],
        title: 'New Follow-Up Scheduled',
        message: `${req.user.firstName} assigned you a follow-up for request due on ${new Date(nextFollowUpDate).toLocaleDateString()}: "${comment}"`,
        type: 'FOLLOW_UP',
        entityType: 'MaintenanceRequest',
        entityId: id
      });
    }

    res.status(201).json({ success: true, data: followUp });
  } catch (error) {
    next(error);
  }
}

/**
 * Mark a follow-up as completed or cancelled.
 */
export async function updateFollowUpStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.maintenanceRequestFollowUp.update({
      where: { id },
      data: {
        status: status || 'COMPLETED',
        completedAt: status === 'COMPLETED' ? new Date() : null
      }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

/**
 * Get follow-ups due for the logged-in user or branch: due today, overdue, upcoming.
 */
export async function getDueFollowUps(req, res, next) {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const where = {
      tenantId: req.tenantId,
      status: 'PENDING',
      ...(req.user.role === 'MAINTENANCE_USER' ? { assignedUserId: req.user.id } : {})
    };

    const allPending = await prisma.maintenanceRequestFollowUp.findMany({
      where,
      include: {
        request: { select: { id: true, requestNumber: true, subject: true, branch: { select: { name: true } } } },
        assignedUser: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } }
      },
      orderBy: { nextFollowUpDate: 'asc' }
    });

    const overdue = allPending.filter(f => new Date(f.nextFollowUpDate) < startOfToday);
    const dueToday = allPending.filter(f => {
      const d = new Date(f.nextFollowUpDate);
      return d >= startOfToday && d <= endOfToday;
    });
    const upcoming = allPending.filter(f => new Date(f.nextFollowUpDate) > endOfToday);

    res.json({
      success: true,
      data: {
        overdue,
        dueToday,
        upcoming,
        totalPending: allPending.length
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update comprehensive labour and cost breakdown (Labour, Parts, Vendor, Other, Approved).
 */
export async function updateLabourAndCosts(req, res, next) {
  try {
    const { id } = req.params;
    const { labourHours, labourCost, partsCost, vendorCost, otherCost, approvedCost } = req.body;

    const lh = labourHours !== undefined ? parseFloat(labourHours) : 0;
    const lc = labourCost !== undefined ? parseFloat(labourCost) : 0;
    const pc = partsCost !== undefined ? parseFloat(partsCost) : 0;
    const vc = vendorCost !== undefined ? parseFloat(vendorCost) : 0;
    const oc = otherCost !== undefined ? parseFloat(otherCost) : 0;
    const totalActual = lc + pc + vc + oc;

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        ...(labourHours !== undefined && { labourHours: lh }),
        ...(labourCost !== undefined && { labourCost: lc }),
        ...(partsCost !== undefined && { partsCost: pc }),
        ...(vendorCost !== undefined && { vendorCost: vc }),
        ...(otherCost !== undefined && { otherCost: oc }),
        ...(approvedCost !== undefined && { approvedCost: parseFloat(approvedCost) }),
        actualCost: totalActual
      }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

/**
 * Waive deadline penalty with manager justification.
 */
export async function waivePenalty(req, res, next) {
  try {
    const { id } = req.params;
    const { waiverReason } = req.body;

    if (!waiverReason || waiverReason.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'A detailed waiver reason is mandatory to waive SLA penalties.' });
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        penaltyWaived: true,
        penaltyWaiverReason: waiverReason.trim(),
        penaltyStatus: 'WAIVED',
        penaltyAmount: 0
      }
    });

    await prisma.maintenancePenalty.create({
      data: {
        tenantId: req.tenantId,
        requestId: id,
        branchId: updated.branchId,
        deadline: updated.deadline || new Date(),
        status: 'WAIVED',
        waivedById: req.user.id,
        waiverReason: waiverReason.trim(),
        waivedAt: new Date()
      }
    });

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'PENALTY_WAIVED',
      entity: 'MaintenanceRequest',
      entityId: id,
      details: { waiverReason },
      req
    });

    res.json({ success: true, message: 'Penalty successfully waived with audit log.', data: updated });
  } catch (error) {
    next(error);
  }
}

/**
 * Direct upload of problem or completion images for an existing request.
 */
export async function uploadRequestImages(req, res, next) {
  try {
    const { id } = req.params;
    const { type = 'PROBLEM', description } = req.body;

    const existing = await prisma.maintenanceRequest.findFirst({
      where: { id, tenantId: req.tenantId }
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found.' });
    }

    const uploadedFiles = req.files || (req.file ? [req.file] : []);
    if (uploadedFiles.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded.' });
    }

    const isCompletion = type.toUpperCase() === 'COMPLETION';
    const attachmentType = isCompletion ? 'COMPLETION_PHOTO' : 'INITIAL_PHOTO';
    const evidenceStage = isCompletion ? 'AFTER' : 'BEFORE';

    const createdRecords = [];
    for (const file of uploadedFiles) {
      const fileUrl = `/uploads/${file.filename}`;
      const att = await prisma.maintenanceRequestAttachment.create({
        data: {
          tenantId: req.tenantId,
          requestId: id,
          originalFilename: file.originalname,
          storedFilename: file.filename,
          fileUrl,
          mimeType: file.mimetype,
          fileSize: file.size,
          attachmentType,
          uploadedById: req.user.id
        }
      });

      await prisma.maintenanceEvidence.create({
        data: {
          tenantId: req.tenantId,
          requestId: id,
          stage: evidenceStage,
          fileUrl,
          mediaType: file.mimetype.startsWith('video/') ? 'VIDEO' : 'PHOTO',
          filename: file.originalname,
          description: description || (isCompletion ? 'Completion Photo' : 'Problem Photo'),
          uploadedById: req.user.id
        }
      });

      createdRecords.push({
        id: att.id,
        fileUrl,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        type: isCompletion ? 'COMPLETION' : 'PROBLEM',
        createdAt: att.createdAt
      });
    }

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: isCompletion ? 'UPLOAD_COMPLETION_IMAGE' : 'UPLOAD_PROBLEM_IMAGE',
      entity: 'MaintenanceRequest',
      entityId: id,
      details: { count: uploadedFiles.length, type },
      req
    });

    res.json({
      success: true,
      message: `${uploadedFiles.length} ${isCompletion ? 'completion' : 'problem'} image(s) uploaded successfully.`,
      data: createdRecords
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Record or update invoice details for a maintenance request.
 */
export async function recordInvoice(req, res, next) {
  try {
    const { id } = req.params;
    const { invoiceNumber, invoiceDate, invoiceAmount, invoiceRemarks } = req.body;
    let { invoiceUrl } = req.body;

    const existing = await prisma.maintenanceRequest.findFirst({
      where: { id, tenantId: req.tenantId }
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found.' });
    }

    if (req.file) {
      invoiceUrl = `/uploads/${req.file.filename}`;
      await prisma.maintenanceRequestAttachment.create({
        data: {
          tenantId: req.tenantId,
          requestId: id,
          originalFilename: req.file.originalname,
          storedFilename: req.file.filename,
          fileUrl: invoiceUrl,
          mimeType: req.file.mimetype,
          fileSize: req.file.size,
          attachmentType: 'INVOICE_DOC',
          uploadedById: req.user.id
        }
      });
    }

    const parsedAmount = invoiceAmount !== undefined && invoiceAmount !== '' ? parseFloat(invoiceAmount) : existing.invoiceAmount;
    const parsedDate = invoiceDate ? new Date(invoiceDate) : existing.invoiceDate;

    const updated = await prisma.$transaction(async (tx) => {
      const reqUpdated = await tx.maintenanceRequest.update({
        where: { id },
        data: {
          ...(invoiceNumber !== undefined ? { invoiceNumber } : {}),
          ...(parsedDate ? { invoiceDate: parsedDate } : {}),
          ...(parsedAmount !== undefined && !isNaN(parsedAmount) ? { invoiceAmount: parsedAmount } : {}),
          ...(invoiceUrl ? { invoiceUrl } : {}),
          ...(invoiceRemarks !== undefined ? { invoiceRemarks } : {}),
          ...(existing.paymentStatus === 'NOT_REQUIRED' || !existing.paymentStatus ? { paymentStatus: 'PENDING' } : {})
        }
      });

      await tx.maintenanceRequestStatusHistory.create({
        data: {
          tenantId: req.tenantId,
          requestId: id,
          fromStatus: existing.workStatus,
          toStatus: existing.workStatus,
          changedById: req.user.id,
          remarks: `Invoice recorded: ${invoiceNumber || 'INV'} - Amount: ₹${parsedAmount || 0}`
        }
      });

      return reqUpdated;
    });

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'RECORD_INVOICE',
      entity: 'MaintenanceRequest',
      entityId: id,
      details: { invoiceNumber, invoiceAmount: parsedAmount },
      req
    });

    res.json({
      success: true,
      message: 'Invoice details saved successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Record or update payment details for a maintenance request.
 */
export async function recordPayment(req, res, next) {
  try {
    const { id } = req.params;
    const { paymentStatus = 'PAID', paymentDate, paymentAmount, paymentMethod, paymentRemarks } = req.body;
    let { paymentProofUrl } = req.body;

    const existing = await prisma.maintenanceRequest.findFirst({
      where: { id, tenantId: req.tenantId }
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found.' });
    }

    if (req.file) {
      paymentProofUrl = `/uploads/${req.file.filename}`;
      await prisma.maintenanceRequestAttachment.create({
        data: {
          tenantId: req.tenantId,
          requestId: id,
          originalFilename: req.file.originalname,
          storedFilename: req.file.filename,
          fileUrl: paymentProofUrl,
          mimeType: req.file.mimetype,
          fileSize: req.file.size,
          attachmentType: 'OTHER',
          uploadedById: req.user.id
        }
      });
    }

    const parsedAmount = paymentAmount !== undefined && paymentAmount !== '' ? parseFloat(paymentAmount) : existing.paymentAmount;
    const parsedDate = paymentDate ? new Date(paymentDate) : new Date();

    const updated = await prisma.$transaction(async (tx) => {
      const reqUpdated = await tx.maintenanceRequest.update({
        where: { id },
        data: {
          paymentStatus,
          paymentDate: parsedDate,
          ...(parsedAmount !== undefined && !isNaN(parsedAmount) ? { paymentAmount: parsedAmount } : {}),
          ...(paymentMethod !== undefined ? { paymentMethod } : {}),
          ...(paymentProofUrl ? { paymentProofUrl } : {}),
          ...(paymentRemarks !== undefined ? { paymentRemarks } : {})
        }
      });

      await tx.maintenanceRequestStatusHistory.create({
        data: {
          tenantId: req.tenantId,
          requestId: id,
          fromStatus: existing.workStatus,
          toStatus: existing.workStatus,
          changedById: req.user.id,
          remarks: `Payment status updated to ${paymentStatus} (${paymentMethod || 'Direct'}) - Amount: ₹${parsedAmount || 0}`
        }
      });

      return reqUpdated;
    });

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'RECORD_PAYMENT',
      entity: 'MaintenanceRequest',
      entityId: id,
      details: { paymentStatus, paymentAmount: parsedAmount, paymentMethod },
      req
    });

    res.json({
      success: true,
      message: 'Payment details saved successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Close maintenance request.
 */
export async function closeRequest(req, res, next) {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const existing = await prisma.maintenanceRequest.findFirst({
      where: { id, tenantId: req.tenantId }
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found.' });
    }

    const isRequester = existing.requesterId === req.user.id;
    const isAssigned = existing.assignedToId === req.user.id;
    const isManagerOrAdmin = ['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'APPROVER', 'FINANCE_USER', 'MAINTENANCE_USER'].includes(req.user.role);

    if (!isRequester && !isManagerOrAdmin && !isAssigned) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to close this maintenance request.' });
    }

    const now = new Date();
    const updated = await prisma.$transaction(async (tx) => {
      const reqUpdated = await tx.maintenanceRequest.update({
        where: { id },
        data: {
          workStatus: 'CLOSED',
          currentStatus: 'CLOSED',
          statusUpdatedById: req.user.id,
          statusUpdatedAt: now,
          branchStatus: 'CLOSED'
        }
      });

      await tx.maintenanceRequestStatusHistory.create({
        data: {
          tenantId: req.tenantId,
          requestId: id,
          fromStatus: existing.workStatus,
          toStatus: 'CLOSED',
          changedById: req.user.id,
          remarks: remarks || 'Request officially closed.'
        }
      });

      return reqUpdated;
    });

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'CLOSE_REQUEST',
      entity: 'MaintenanceRequest',
      entityId: id,
      details: { remarks },
      req
    });

    await notifyUsers({
      tenantId: req.tenantId,
      userIds: [existing.requesterId, existing.assignedToId].filter(Boolean),
      title: `Request Closed: ${existing.requestNumber}`,
      message: `Maintenance request "${existing.subject}" has been successfully closed.`,
      type: 'REQUEST_CLOSED',
      entityType: 'MaintenanceRequest',
      entityId: id
    });

    res.json({
      success: true,
      message: 'Request closed successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

