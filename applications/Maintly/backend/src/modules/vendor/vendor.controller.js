import prisma from '../../config/db.js';
import { logAudit } from '../../utils/audit.js';

export async function getVendors(req, res, next) {
  try {
    const { search, category, isActive } = req.query;
    const where = {
      tenantId: req.tenantId,
      ...(category ? { category } : {}),
      ...(isActive !== undefined ? { isActive: isActive === 'true' } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { contactPerson: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { gstin: { contains: search, mode: 'insensitive' } }
        ]
      } : {})
    };

    const vendors = await prisma.vendor.findMany({
      where,
      include: {
        _count: {
          select: { purchaseRequests: true, quotations: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ success: true, data: vendors });
  } catch (error) {
    next(error);
  }
}

export async function getVendorById(req, res, next) {
  try {
    const { id } = req.params;
    const vendor = await prisma.vendor.findFirst({
      where: { id, tenantId: req.tenantId },
      include: {
        purchaseRequests: {
          include: {
            maintenanceRequest: { select: { id: true, requestNumber: true, subject: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        quotations: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found.' });
    }

    res.json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
}

export async function createVendor(req, res, next) {
  try {
    const { name, contactPerson, phone, email, address, gstin, category, notes } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Vendor name is required.' });
    }

    const vendor = await prisma.vendor.create({
      data: {
        tenantId: req.tenantId,
        name: name.trim(),
        contactPerson: contactPerson?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null,
        gstin: gstin?.trim() || null,
        category: category?.trim() || 'General',
        notes: notes?.trim() || null
      }
    });

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'CREATE_VENDOR',
      entity: 'Vendor',
      entityId: vendor.id,
      details: { name: vendor.name, category: vendor.category },
      req
    });

    res.status(201).json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
}

export async function updateVendor(req, res, next) {
  try {
    const { id } = req.params;
    const { name, contactPerson, phone, email, address, gstin, category, notes, isActive } = req.body;

    const existing = await prisma.vendor.findFirst({
      where: { id, tenantId: req.tenantId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Vendor not found.' });
    }

    const updated = await prisma.vendor.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(contactPerson !== undefined ? { contactPerson: contactPerson?.trim() || null } : {}),
        ...(phone !== undefined ? { phone: phone?.trim() || null } : {}),
        ...(email !== undefined ? { email: email?.trim() || null } : {}),
        ...(address !== undefined ? { address: address?.trim() || null } : {}),
        ...(gstin !== undefined ? { gstin: gstin?.trim() || null } : {}),
        ...(category !== undefined ? { category: category?.trim() || 'General' } : {}),
        ...(notes !== undefined ? { notes: notes?.trim() || null } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {})
      }
    });

    await logAudit({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'UPDATE_VENDOR',
      entity: 'Vendor',
      entityId: id,
      details: { name: updated.name },
      req
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}
