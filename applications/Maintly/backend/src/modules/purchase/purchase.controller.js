import prisma from '../../config/db.js';
import { logAudit } from '../../utils/audit.js';
import { notifyUsers } from '../../utils/notify.js';

export async function getPurchaseRequests(req, res, next) {
  try {
    const { status, maintenanceRequestId, vendorId } = req.query;
    const where = {
      tenantId: req.tenantId,
      ...(status ? { status } : {}),
      ...(maintenanceRequestId ? { maintenanceRequestId } : {}),
      ...(vendorId ? { vendorId } : {})
    };

    const purchases = await prisma.purchaseRequest.findMany({
      where,
      include: {
        maintenanceRequest: {
          select: { id: true, requestNumber: true, subject: true, branchId: true, priority: true }
        },
        requestedBy: { select: { id: true, firstName: true, lastName: true } },
        approvedBy: { select: { id: true, firstName: true, lastName: true } },
        vendor: { select: { id: true, name: true, phone: true, email: true } },
        items: true,
        quotations: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: purchases });
  } catch (error) {
    next(error);
  }
}

export async function getPurchaseRequestById(req, res, next) {
  try {
    const { id } = req.params;
    const purchase = await prisma.purchaseRequest.findFirst({
      where: { id, tenantId: req.tenantId },
      include: {
        maintenanceRequest: {
          include: {
            branch: true,
            department: true,
            requester: { select: { id: true, firstName: true, lastName: true, email: true } }
          }
        },
        requestedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        vendor: true,
        items: true,
        quotations: {
          include: {
            vendor: true
          }
        }
      }
    });

    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase request not found.' });
    }

    res.json({ success: true, data: purchase });
  } catch (error) {
    next(error);
  }
}

export async function createPurchaseRequest(req, res, next) {
  try {
    if (!['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'MAINTENANCE_USER', 'PURCHASE_USER'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to create purchase requests.' });
    }

    const {
      maintenanceRequestId,
      vendorId,
      poReference,
      notes,
      purchaseSource = 'APPROVED_VENDOR',
      orderUrl,
      expectedDeliveryDate,
      trackingNumber,
      carrier,
      items = []
    } = req.body;

    if (!maintenanceRequestId) {
      return res.status(400).json({ success: false, message: 'Linked maintenance request ID is required.' });
    }

    const maintenanceRequest = await prisma.maintenanceRequest.findFirst({
      where: { id: maintenanceRequestId, tenantId: req.tenantId }
    });

    if (!maintenanceRequest) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found.' });
    }

    const currentYear = new Date().getFullYear();
    const count = await prisma.purchaseRequest.count({ where: { tenantId: req.tenantId } });
    const prNumber = `PR-${currentYear}-${String(count + 1).padStart(4, '0')}`;

    const calculatedEstimated = items.reduce((sum, item) => sum + (parseFloat(item.quantity || 1) * parseFloat(item.estimatedPrice || 0)), 0);

    const purchase = await prisma.$transaction(async (tx) => {
      const pr = await tx.purchaseRequest.create({
        data: {
          tenantId: req.tenantId,
          maintenanceRequestId,
          prNumber,
          status: 'REQUESTED',
          requestedById: req.user.id,
          vendorId: vendorId || null,
          purchaseSource: purchaseSource || 'APPROVED_VENDOR',
          orderUrl: orderUrl || null,
          expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
          trackingNumber: trackingNumber || null,
          carrier: carrier || null,
          estimatedTotal: calculatedEstimated,
          poReference: poReference || null,
          notes: notes || null,
          items: items.length > 0 ? {
            create: items.map(item => ({
              itemName: item.itemName,
              quantity: parseFloat(item.quantity) || 1,
              unit: item.unit || 'pcs',
              estimatedPrice: parseFloat(item.estimatedPrice) || 0,
              quotedPrice: parseFloat(item.quotedPrice) || 0,
              actualPrice: parseFloat(item.actualPrice) || 0
            }))
          } : undefined
        },
        include: { items: true }
      });

      // Update maintenance request to WAITING_FOR_PURCHASE
      await tx.maintenanceRequest.update({
        where: { id: maintenanceRequestId },
        data: {
          workStatus: 'WAITING_FOR_PURCHASE',
          currentStatus: 'WAITING_FOR_PURCHASE',
          purchaseStatus: 'REQUIRED',
          purchaseStatusAt: new Date()
        }
      });

      await tx.maintenanceRequestStatusHistory.create({
        data: {
          tenantId: req.tenantId,
          requestId: maintenanceRequestId,
          fromStatus: maintenanceRequest.workStatus,
          toStatus: 'WAITING_FOR_PURCHASE',
          changedById: req.user.id,
          remarks: `Purchase Request ${prNumber} created for materials/services via ${purchaseSource.replace(/_/g, ' ')}.`
        }
      });

      return pr;
    });

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'CREATE_PURCHASE_REQUEST',
      entity: 'PurchaseRequest',
      entityId: purchase.id,
      details: { prNumber, maintenanceRequestId },
      req
    });

    // Notify Purchase team and managers
    const purchaseUsers = await prisma.user.findMany({
      where: {
        tenantId: req.tenantId,
        status: 'ACTIVE',
        role: { in: ['PURCHASE_USER', 'MANAGER', 'TENANT_ADMIN'] }
      },
      select: { id: true }
    });

    await notifyUsers({
      tenantId: req.tenantId,
      userIds: purchaseUsers.map(u => u.id),
      title: `New Purchase Request: ${prNumber}`,
      message: `Purchase request raised for maintenance request ${maintenanceRequest.requestNumber}.`,
      type: 'PURCHASE_REQUIRED',
      entityType: 'PurchaseRequest',
      entityId: purchase.id
    });

    res.status(201).json({ success: true, data: purchase });
  } catch (error) {
    next(error);
  }
}

export async function addQuotation(req, res, next) {
  try {
    const { id } = req.params; // purchaseRequestId
    const { vendorId, quoteNumber, amount, validUntil, notes } = req.body;

    if (!vendorId || !quoteNumber || amount === undefined) {
      return res.status(400).json({ success: false, message: 'Vendor, quotation number, and amount are required.' });
    }

    const pr = await prisma.purchaseRequest.findFirst({
      where: { id, tenantId: req.tenantId }
    });

    if (!pr) {
      return res.status(404).json({ success: false, message: 'Purchase request not found.' });
    }

    const quotation = await prisma.quotation.create({
      data: {
        tenantId: req.tenantId,
        purchaseRequestId: id,
        vendorId,
        quoteNumber: quoteNumber.trim(),
        amount: parseFloat(amount),
        validUntil: validUntil ? new Date(validUntil) : null,
        notes: notes || null,
        status: 'PENDING'
      },
      include: { vendor: true }
    });

    // Update PR status to QUOTED if still REQUESTED
    if (pr.status === 'REQUESTED') {
      await prisma.purchaseRequest.update({
        where: { id },
        data: { status: 'QUOTED', vendorId }
      });
    }

    res.status(201).json({ success: true, data: quotation });
  } catch (error) {
    next(error);
  }
}

export async function updatePurchaseStatus(req, res, next) {
  try {
    if (!['PLATFORM_ADMIN', 'TENANT_ADMIN', 'PURCHASE_USER', 'MANAGER', 'APPROVER'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to update purchase status.' });
    }

    const { id } = req.params;
    const {
      status,
      poReference,
      actualTotal,
      remarks,
      purchaseSource,
      orderUrl,
      expectedDeliveryDate,
      trackingNumber,
      carrier
    } = req.body;

    const allowed = ['APPROVED', 'ORDERED', 'RECEIVED', 'CANCELLED'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` });
    }

    const pr = await prisma.purchaseRequest.findFirst({
      where: { id, tenantId: req.tenantId },
      include: { maintenanceRequest: true }
    });

    if (!pr) {
      return res.status(404).json({ success: false, message: 'Purchase request not found.' });
    }

    const updatePayload = {
      status,
      ...(poReference ? { poReference } : {}),
      ...(purchaseSource ? { purchaseSource } : {}),
      ...(orderUrl ? { orderUrl } : {}),
      ...(expectedDeliveryDate ? { expectedDeliveryDate: new Date(expectedDeliveryDate) } : {}),
      ...(trackingNumber ? { trackingNumber } : {}),
      ...(carrier ? { carrier } : {}),
      ...(actualTotal !== undefined ? { actualTotal: parseFloat(actualTotal) } : {})
    };

    if (status === 'APPROVED') {
      updatePayload.approvedById = req.user.id;
      updatePayload.approvedAt = new Date();
    } else if (status === 'ORDERED') {
      updatePayload.orderedAt = new Date();
    } else if (status === 'RECEIVED') {
      updatePayload.receivedAt = new Date();
    }

    const updated = await prisma.$transaction(async (tx) => {
      const prUpdated = await tx.purchaseRequest.update({
        where: { id },
        data: updatePayload
      });

      // If ORDERED, update parent request currentStatus to PARTS_ORDERED
      if (status === 'ORDERED' && pr.maintenanceRequest) {
        await tx.maintenanceRequest.update({
          where: { id: pr.maintenanceRequestId },
          data: {
            currentStatus: 'PARTS_ORDERED',
            purchaseStatus: 'ORDERED'
          }
        });

        await tx.maintenanceRequestStatusHistory.create({
          data: {
            tenantId: req.tenantId,
            requestId: pr.maintenanceRequestId,
            fromStatus: pr.maintenanceRequest.workStatus,
            toStatus: pr.maintenanceRequest.workStatus,
            changedById: req.user.id,
            remarks: `Parts ordered via ${purchaseSource || pr.purchaseSource || 'vendor'}. Order Ref: ${poReference || pr.poReference || 'N/A'}`
          }
        });
      }

      // If RECEIVED, materials have arrived: move maintenance request back to IN_PROGRESS so work can resume!
      if (status === 'RECEIVED' && pr.maintenanceRequest) {
        await tx.maintenanceRequest.update({
          where: { id: pr.maintenanceRequestId },
          data: {
            workStatus: 'IN_PROGRESS',
            currentStatus: 'IN_PROGRESS',
            purchaseStatus: 'COMPLETED',
            actualCost: { increment: parseFloat(actualTotal || pr.estimatedTotal || 0) }
          }
        });

        await tx.maintenanceRequestStatusHistory.create({
          data: {
            tenantId: req.tenantId,
            requestId: pr.maintenanceRequestId,
            fromStatus: 'WAITING_FOR_PURCHASE',
            toStatus: 'IN_PROGRESS',
            changedById: req.user.id,
            remarks: `Materials received via PR ${pr.prNumber}. Maintenance work resumed.`
          }
        });
      }

      return prUpdated;
    });

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'UPDATE_PURCHASE_STATUS',
      entity: 'PurchaseRequest',
      entityId: id,
      details: { status, remarks, poReference, purchaseSource },
      req
    });

    // Notify assigned technician when parts arrive
    if (status === 'RECEIVED' && pr.maintenanceRequest?.assignedToId) {
      await notifyUsers({
        tenantId: req.tenantId,
        userIds: [pr.maintenanceRequest.assignedToId],
        title: `Parts Received: ${pr.maintenanceRequest.requestNumber}`,
        message: `Materials for maintenance request "${pr.maintenanceRequest.subject}" have arrived at the facility. You can resume work.`,
        type: 'PARTS_RECEIVED',
        entityType: 'MaintenanceRequest',
        entityId: pr.maintenanceRequestId
      });
    }

    res.json({ success: true, message: `Purchase request marked as ${status}`, data: updated });
  } catch (error) {
    next(error);
  }
}

