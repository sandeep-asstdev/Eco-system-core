import prisma from '../../config/db.js';

/**
 * Resolves the Prisma where clause for tenant-scoped operations.
 * Platform admins can access all records or filter by specific tenant via query/header.
 * Regular users are strictly restricted to their own tenantId.
 */
function resolveTenantScope(req) {
  if (req.isPlatformAdmin) {
    const targetTenantId = req.headers['x-tenant-id'] || req.query?.tenantId || req.tenantId;
    return targetTenantId ? { tenantId: targetTenantId } : {};
  }
  if (!req.tenantId) {
    const error = new Error('Tenant context is required for this operation.');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }
  return { tenantId: req.tenantId };
}

// ==========================================
// FIRMS (LEGAL CORPORATE ENTITIES)
// ==========================================

export async function getFirms(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const where = { ...resolveTenantScope(req) };
    if (req.query.active !== undefined) {
      where.isActive = req.query.active === 'true';
    }

    const [total, firms] = await Promise.all([
      prisma.firm.count({ where }),
      prisma.firm.findMany({
        where,
        skip,
        take: limit,
        include: {
          branches: { select: { id: true, name: true, code: true, city: true, active: true } },
          firmBrands: {
            include: { brand: { select: { id: true, name: true, code: true, logoUrl: true } } }
          },
          _count: { select: { branches: true } }
        },
        orderBy: { name: 'asc' }
      })
    ]);

    res.json({
      success: true,
      data: firms,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 }
    });
  } catch (error) {
    next(error);
  }
}

export async function getFirmById(req, res, next) {
  try {
    const { id } = req.params;
    const firm = await prisma.firm.findFirst({
      where: { id, ...resolveTenantScope(req) },
      include: {
        branches: true,
        firmBrands: { include: { brand: true } }
      }
    });

    if (!firm) {
      return res.status(404).json({ success: false, error: { message: 'Firm not found.' } });
    }

    res.json({ success: true, data: firm });
  } catch (error) {
    next(error);
  }
}

export async function createFirm(req, res, next) {
  try {
    const { code, name, panNumber, gstin, cin, tanNumber, registeredAt } = req.body;
    if (!code || !name) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Firm code and name are required.' }
      });
    }

    const targetTenantId = req.tenantId || req.headers['x-tenant-id'] || req.body.tenantId;
    if (!targetTenantId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'tenantId is required to create a firm.' }
      });
    }

    const normalizedCode = code.toUpperCase().trim();

    // Check unique code per tenant
    const existing = await prisma.firm.findUnique({
      where: { tenantId_code: { tenantId: targetTenantId, code: normalizedCode } }
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: `Firm code '${normalizedCode}' already exists in your dealership.` }
      });
    }

    // Validate PAN if provided (10 characters alphanumeric)
    if (panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.toUpperCase().trim())) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid Indian PAN number format (e.g. AABCB1234F).' }
      });
    }

    // Validate GSTIN if provided (15 characters)
    if (gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin.toUpperCase().trim())) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid Indian GSTIN format (e.g. 29AABCB1234F1Z5).' }
      });
    }

    const firm = await prisma.firm.create({
      data: {
        tenantId: targetTenantId,
        code: normalizedCode,
        name: name.trim(),
        panNumber: panNumber ? panNumber.toUpperCase().trim() : null,
        gstin: gstin ? gstin.toUpperCase().trim() : null,
        cin: cin ? cin.toUpperCase().trim() : null,
        tanNumber: tanNumber ? tanNumber.toUpperCase().trim() : null,
        registeredAt: registeredAt ? registeredAt.trim() : null
      }
    });

    await prisma.auditLog.create({
      data: {
        tenantId: targetTenantId,
        userId: req.userId || null,
        action: 'FIRM_CREATED',
        entityType: 'Firm',
        entityId: firm.id,
        newValue: { code: firm.code, name: firm.name, gstin: firm.gstin }
      }
    });

    res.status(201).json({ success: true, data: firm });
  } catch (error) {
    next(error);
  }
}

export async function updateFirm(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.firm.findFirst({ where: { id, ...resolveTenantScope(req) } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: 'Firm not found.' } });
    }

    const { name, panNumber, gstin, cin, tanNumber, registeredAt, isActive } = req.body;

    const updated = await prisma.firm.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        panNumber: panNumber !== undefined ? panNumber?.toUpperCase().trim() : undefined,
        gstin: gstin !== undefined ? gstin?.toUpperCase().trim() : undefined,
        cin: cin !== undefined ? cin?.toUpperCase().trim() : undefined,
        tanNumber: tanNumber !== undefined ? tanNumber?.toUpperCase().trim() : undefined,
        registeredAt: registeredAt !== undefined ? registeredAt : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined
      }
    });

    await prisma.auditLog.create({
      data: {
        tenantId: existing.tenantId,
        userId: req.userId || null,
        action: 'FIRM_UPDATED',
        entityType: 'Firm',
        entityId: id,
        oldValue: { name: existing.name, gstin: existing.gstin, isActive: existing.isActive },
        newValue: { name: updated.name, gstin: updated.gstin, isActive: updated.isActive }
      }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// BRANDS (OEM FRANCHISES)
// ==========================================

export async function getBrands(req, res, next) {
  try {
    const brands = await prisma.brand.findMany({
      where: { ...resolveTenantScope(req) },
      include: {
        firmBrands: {
          include: { firm: { select: { id: true, name: true, code: true } } }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: brands });
  } catch (error) {
    next(error);
  }
}

export async function getBrandById(req, res, next) {
  try {
    const { id } = req.params;
    const brand = await prisma.brand.findFirst({
      where: { id, ...resolveTenantScope(req) },
      include: {
        firmBrands: { include: { firm: true, branches: true } }
      }
    });

    if (!brand) {
      return res.status(404).json({ success: false, error: { message: 'Brand not found.' } });
    }

    res.json({ success: true, data: brand });
  } catch (error) {
    next(error);
  }
}

export async function createBrand(req, res, next) {
  try {
    const { code, name, logoUrl, description } = req.body;
    if (!code || !name) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Brand code and name are required.' }
      });
    }

    const targetTenantId = req.tenantId || req.headers['x-tenant-id'] || req.body.tenantId;
    if (!targetTenantId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'tenantId is required to create a brand.' }
      });
    }

    const normalizedCode = code.toUpperCase().trim();
    const existing = await prisma.brand.findUnique({
      where: { tenantId_code: { tenantId: targetTenantId, code: normalizedCode } }
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: `Brand with code '${normalizedCode}' already exists in your dealership.` }
      });
    }

    const brand = await prisma.brand.create({
      data: {
        tenantId: targetTenantId,
        code: normalizedCode,
        name: name.trim(),
        logoUrl,
        description
      }
    });

    await prisma.auditLog.create({
      data: {
        tenantId: targetTenantId,
        userId: req.userId || null,
        action: 'BRAND_CREATED',
        entityType: 'Brand',
        entityId: brand.id,
        newValue: { code: brand.code, name: brand.name }
      }
    });

    res.status(201).json({ success: true, data: brand });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// FIRM-BRAND JUNCTION (DEALER FRANCHISE)
// ==========================================

export async function getFirmBrands(req, res, next) {
  try {
    const firmBrands = await prisma.firmBrand.findMany({
      where: { ...resolveTenantScope(req) },
      include: {
        firm: true,
        brand: true,
        branches: { select: { id: true, name: true, code: true, city: true } }
      }
    });
    res.json({ success: true, data: firmBrands });
  } catch (error) {
    next(error);
  }
}

export async function linkFirmBrand(req, res, next) {
  try {
    const { firmId, brandId, dealerAgreementNo, agreementExpiry } = req.body;
    if (!firmId || !brandId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'firmId and brandId are required.' }
      });
    }

    const tenantFilter = resolveTenantScope(req);
    // Verify firm and brand belong to this tenant
    const [firm, brand] = await Promise.all([
      prisma.firm.findFirst({ where: { id: firmId, ...tenantFilter } }),
      prisma.brand.findFirst({ where: { id: brandId, ...tenantFilter } })
    ]);

    if (!firm || !brand) {
      return res.status(404).json({
        success: false,
        error: { message: 'Firm or Brand not found under your dealership.' }
      });
    }

    const effectiveTenantId = firm.tenantId;

    const firmBrand = await prisma.firmBrand.upsert({
      where: { firmId_brandId: { firmId, brandId } },
      update: {
        dealerAgreementNo,
        agreementExpiry: agreementExpiry ? new Date(agreementExpiry) : undefined,
        isActive: true
      },
      create: {
        tenantId: effectiveTenantId,
        firmId,
        brandId,
        dealerAgreementNo,
        agreementExpiry: agreementExpiry ? new Date(agreementExpiry) : null
      },
      include: { firm: true, brand: true }
    });

    await prisma.auditLog.create({
      data: {
        tenantId: effectiveTenantId,
        userId: req.userId || null,
        action: 'FIRM_BRAND_LINKED',
        entityType: 'FirmBrand',
        entityId: firmBrand.id,
        newValue: { firm: firm.name, brand: brand.name, agreement: dealerAgreementNo }
      }
    });

    res.status(201).json({ success: true, data: firmBrand });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// BRANCHES (PHYSICAL SHOWROOMS & WORKSHOPS)
// ==========================================

export async function getBranches(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const { firmId, brandId, city, outletType, search } = req.query;
    const where = { ...resolveTenantScope(req) };

    if (req.query.active !== undefined) {
      where.active = req.query.active === 'true';
    }
    if (firmId) where.firmId = firmId;
    if (brandId) where.firmBrand = { brandId };
    if (outletType) where.outletType = outletType;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [total, branches] = await Promise.all([
      prisma.branch.count({ where }),
      prisma.branch.findMany({
        where,
        skip,
        take: limit,
        include: {
          firm: { select: { id: true, name: true, code: true } },
          firmBrand: {
            include: { brand: { select: { id: true, name: true, code: true, logoUrl: true } } }
          },
          location: { select: { id: true, name: true, code: true, city: true, state: true, addressLine1: true, type: true } },
          branchBrands: {
            include: { brand: { select: { id: true, name: true, code: true, logoUrl: true } } }
          },
          branchBusinessUnits: {
            include: { businessUnit: { select: { id: true, code: true, name: true, type: true, icon: true } } }
          },
          departments: { select: { id: true, code: true, name: true } },
          _count: { select: { memberships: true, departments: true, branchBrands: true, branchBusinessUnits: true } }
        },
        orderBy: { name: 'asc' }
      })
    ]);

    res.json({
      success: true,
      data: branches,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 }
    });
  } catch (error) {
    next(error);
  }
}

export async function getBranchById(req, res, next) {
  try {
    const { id } = req.params;
    const branch = await prisma.branch.findFirst({
      where: { id, ...resolveTenantScope(req) },
      include: {
        firm: true,
        firmBrand: { include: { brand: true } },
        location: true,
        branchBrands: { include: { brand: true } },
        branchBusinessUnits: { include: { businessUnit: true } },
        departments: true,
        memberships: {
          include: {
            user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
            department: true,
            businessUnit: true
          }
        }
      }
    });

    if (!branch) {
      return res.status(404).json({ success: false, error: { message: 'Branch not found.' } });
    }

    res.json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
}

export async function createBranch(req, res, next) {
  try {
    const {
      firmId, firmBrandId, code, name, outletType, address, city, state, pincode, phone, email, gstin
    } = req.body;

    if (!firmId || !code || !name || !city || !state) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'firmId, code, name, city, and state are required.' }
      });
    }

    const tenantFilter = resolveTenantScope(req);
    // Verify firm belongs to tenant
    const firm = await prisma.firm.findFirst({ where: { id: firmId, ...tenantFilter } });
    if (!firm) {
      return res.status(404).json({
        success: false,
        error: { message: 'Selected legal firm was not found under your dealership.' }
      });
    }

    const effectiveTenantId = firm.tenantId;
    const normalizedCode = code.toUpperCase().trim();
    const existing = await prisma.branch.findUnique({
      where: { tenantId_code: { tenantId: effectiveTenantId, code: normalizedCode } }
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: `Branch with code '${normalizedCode}' already exists.` }
      });
    }

    const branch = await prisma.branch.create({
      data: {
        tenantId: effectiveTenantId,
        firmId,
        firmBrandId: firmBrandId || null,
        code: normalizedCode,
        name: name.trim(),
        outletType: outletType || '3S_FACILITY',
        address,
        city: city.trim(),
        state: state.trim(),
        pincode,
        phone,
        email,
        gstin
      },
      include: { firm: true, firmBrand: { include: { brand: true } } }
    });

    // Auto-create standard departments for this branch
    const standardDepts = [
      { code: 'SALES', name: 'New Car Sales' },
      { code: 'SERVICE', name: 'Mechanical Service' },
      { code: 'BODYSHOP', name: 'Body & Paint Repair' },
      { code: 'SPARES', name: 'Parts & Accessories' },
      { code: 'ACCOUNTS', name: 'Finance & Cashier' }
    ];
    for (const d of standardDepts) {
      await prisma.department.create({
        data: {
          tenantId: effectiveTenantId,
          branchId: branch.id,
          code: d.code,
          name: d.name
        }
      });
    }

    await prisma.auditLog.create({
      data: {
        tenantId: effectiveTenantId,
        userId: req.userId || null,
        action: 'BRANCH_CREATED',
        entityType: 'Branch',
        entityId: branch.id,
        newValue: { code: branch.code, name: branch.name, city: branch.city }
      }
    });

    // Publish integration event
    await prisma.integrationEvent.create({
      data: {
        tenantId: effectiveTenantId,
        eventType: 'branch.created',
        aggregateId: branch.id,
        payload: {
          branchId: branch.id,
          code: branch.code,
          name: branch.name,
          city: branch.city,
          state: branch.state
        }
      }
    });

    res.status(201).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
}

export async function updateBranch(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.branch.findFirst({ where: { id, ...resolveTenantScope(req) } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: 'Branch not found.' } });
    }

    const { name, outletType, address, city, state, pincode, phone, email, gstin, active } = req.body;

    const updated = await prisma.branch.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        outletType: outletType !== undefined ? outletType : undefined,
        address: address !== undefined ? address : undefined,
        city: city !== undefined ? city.trim() : undefined,
        state: state !== undefined ? state.trim() : undefined,
        pincode: pincode !== undefined ? pincode : undefined,
        phone: phone !== undefined ? phone : undefined,
        email: email !== undefined ? email : undefined,
        gstin: gstin !== undefined ? gstin : undefined,
        active: active !== undefined ? Boolean(active) : undefined
      }
    });

    await prisma.auditLog.create({
      data: {
        tenantId: existing.tenantId,
        userId: req.userId || null,
        action: 'BRANCH_UPDATED',
        entityType: 'Branch',
        entityId: id,
        oldValue: { name: existing.name, active: existing.active },
        newValue: { name: updated.name, active: updated.active }
      }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// DEPARTMENTS (FUNCTIONAL TEAMS & BAYS)
// ==========================================

export async function getDepartments(req, res, next) {
  try {
    const { branchId } = req.query;
    const where = { ...resolveTenantScope(req), active: true };
    if (branchId) where.branchId = branchId;

    const departments = await prisma.department.findMany({
      where,
      include: {
        branch: { select: { id: true, name: true, code: true } },
        _count: { select: { memberships: true } }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
}

export async function createDepartment(req, res, next) {
  try {
    const { branchId, code, name, description } = req.body;
    if (!code || !name) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Department code and name are required.' }
      });
    }

    let effectiveTenantId = req.body.tenantId || req.headers['x-tenant-id'] || req.tenantId;
    if (branchId) {
      const branch = await prisma.branch.findFirst({
        where: { id: branchId, ...resolveTenantScope(req) }
      });
      if (!branch) {
        return res.status(404).json({ success: false, error: { message: 'Branch not found.' } });
      }
      effectiveTenantId = branch.tenantId;
    }

    if (!effectiveTenantId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'tenantId is required to create a department.' }
      });
    }

    const normalizedCode = code.toUpperCase().trim();

    // Check unique on tenant + code + branchId
    const existing = await prisma.department.findUnique({
      where: {
        tenantId_code_branchId: {
          tenantId: effectiveTenantId,
          code: normalizedCode,
          branchId: branchId || null
        }
      }
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { message: `Department '${normalizedCode}' already exists for this branch.` }
      });
    }

    const dept = await prisma.department.create({
      data: {
        tenantId: effectiveTenantId,
        branchId: branchId || null,
        code: normalizedCode,
        name: name.trim(),
        description
      },
      include: { branch: true }
    });

    await prisma.auditLog.create({
      data: {
        tenantId: effectiveTenantId,
        userId: req.userId || null,
        action: 'DEPARTMENT_CREATED',
        entityType: 'Department',
        entityId: dept.id,
        newValue: { code: dept.code, name: dept.name, branchId: dept.branchId }
      }
    });

    res.status(201).json({ success: true, data: dept });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// LOCATIONS (PHYSICAL REAL ESTATE / CAMPUSES)
// ==========================================

export async function getLocations(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const { city, type, active, search } = req.query;
    const where = { ...resolveTenantScope(req) };

    if (active !== undefined) {
      where.isActive = active === 'true';
    }
    if (type) where.type = type;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { addressLine1: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [total, locations] = await Promise.all([
      prisma.location.count({ where }),
      prisma.location.findMany({
        where,
        skip,
        take: limit,
        include: {
          branches: {
            select: {
              id: true,
              name: true,
              code: true,
              outletType: true,
              active: true,
              firm: { select: { id: true, name: true, code: true } },
              branchBrands: { include: { brand: { select: { id: true, name: true, code: true, logoUrl: true } } } }
            }
          },
          _count: { select: { branches: true } }
        },
        orderBy: { name: 'asc' }
      })
    ]);

    res.json({
      success: true,
      data: locations,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 }
    });
  } catch (error) {
    next(error);
  }
}

export async function getLocationById(req, res, next) {
  try {
    const { id } = req.params;
    const location = await prisma.location.findFirst({
      where: { id, ...resolveTenantScope(req) },
      include: {
        branches: {
          include: {
            firm: { select: { id: true, name: true, code: true } },
            branchBrands: { include: { brand: true } },
            branchBusinessUnits: { include: { businessUnit: true } },
            departments: true
          }
        }
      }
    });

    if (!location) {
      return res.status(404).json({ success: false, error: { message: 'Physical location facility not found.' } });
    }

    res.json({ success: true, data: location });
  } catch (error) {
    next(error);
  }
}

export async function createLocation(req, res, next) {
  try {
    const {
      code, name, type, addressLine1, addressLine2, city, state, pincode, country,
      latitude, longitude, plotNumber, surveyNumber, totalAreaSqFt, metadata
    } = req.body;

    if (!code || !name || !city || !state) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'code, name, city, and state are required to create a physical location.' }
      });
    }

    const targetTenantId = req.tenantId || req.headers['x-tenant-id'] || req.body.tenantId;
    if (!targetTenantId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'tenantId is required.' }
      });
    }

    const normalizedCode = code.toUpperCase().trim();
    const existing = await prisma.location.findUnique({
      where: { tenantId_code: { tenantId: targetTenantId, code: normalizedCode } }
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: `Physical location with code '${normalizedCode}' already exists.` }
      });
    }

    const location = await prisma.location.create({
      data: {
        tenantId: targetTenantId,
        code: normalizedCode,
        name: name.trim(),
        type: type || 'DEALERSHIP_CAMPUS',
        addressLine1,
        addressLine2,
        city: city.trim(),
        state: state.trim(),
        pincode,
        country: country || 'India',
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        plotNumber,
        surveyNumber,
        totalAreaSqFt: totalAreaSqFt ? parseInt(totalAreaSqFt, 10) : null,
        metadata: metadata || {}
      }
    });

    await prisma.auditLog.create({
      data: {
        tenantId: targetTenantId,
        userId: req.userId || null,
        action: 'LOCATION_CREATED',
        entityType: 'Location',
        entityId: location.id,
        newValue: { code: location.code, name: location.name, city: location.city }
      }
    });

    res.status(201).json({ success: true, data: location });
  } catch (error) {
    next(error);
  }
}

export async function updateLocation(req, res, next) {
  try {
    const { id } = req.params;
    const tenantFilter = resolveTenantScope(req);
    const existing = await prisma.location.findFirst({ where: { id, ...tenantFilter } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: 'Location not found.' } });
    }

    const {
      name, type, addressLine1, addressLine2, city, state, pincode,
      latitude, longitude, plotNumber, surveyNumber, totalAreaSqFt, isActive, metadata
    } = req.body;

    const updated = await prisma.location.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        type: type !== undefined ? type : undefined,
        addressLine1: addressLine1 !== undefined ? addressLine1 : undefined,
        addressLine2: addressLine2 !== undefined ? addressLine2 : undefined,
        city: city !== undefined ? city.trim() : undefined,
        state: state !== undefined ? state.trim() : undefined,
        pincode: pincode !== undefined ? pincode : undefined,
        latitude: latitude !== undefined ? parseFloat(latitude) : undefined,
        longitude: longitude !== undefined ? parseFloat(longitude) : undefined,
        plotNumber: plotNumber !== undefined ? plotNumber : undefined,
        surveyNumber: surveyNumber !== undefined ? surveyNumber : undefined,
        totalAreaSqFt: totalAreaSqFt !== undefined ? parseInt(totalAreaSqFt, 10) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        metadata: metadata !== undefined ? metadata : undefined
      }
    });

    await prisma.auditLog.create({
      data: {
        tenantId: existing.tenantId,
        userId: req.userId || null,
        action: 'LOCATION_UPDATED',
        entityType: 'Location',
        entityId: updated.id,
        newValue: { name: updated.name, city: updated.city, isActive: updated.isActive }
      }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteLocation(req, res, next) {
  try {
    const { id } = req.params;
    const tenantFilter = resolveTenantScope(req);
    const location = await prisma.location.findFirst({
      where: { id, ...tenantFilter },
      include: { _count: { select: { branches: true } } }
    });

    if (!location) {
      return res.status(404).json({ success: false, error: { message: 'Location not found.' } });
    }

    if (location._count.branches > 0 && req.query.force !== 'true') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BRANCHES_ATTACHED',
          message: `Cannot delete location facility hosting ${location._count.branches} active dealership branch(es). Reassign branches first or set force=true to deactivate.`
        }
      });
    }

    // Soft delete
    const deactivated = await prisma.location.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({ success: true, message: 'Physical location facility deactivated successfully.', data: deactivated });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// BUSINESS UNITS (OPERATIONAL CAPABILITIES)
// ==========================================

export async function getBusinessUnits(req, res, next) {
  try {
    const where = { ...resolveTenantScope(req) };
    if (req.query.active !== undefined) {
      where.isActive = req.query.active === 'true';
    }

    const businessUnits = await prisma.businessUnit.findMany({
      where,
      include: {
        _count: { select: { branchBusinessUnits: true } }
      },
      orderBy: { code: 'asc' }
    });

    res.json({ success: true, data: businessUnits });
  } catch (error) {
    next(error);
  }
}

export async function createBusinessUnit(req, res, next) {
  try {
    const { code, name, type, description, icon } = req.body;
    if (!code || !name) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'code and name are required.' }
      });
    }

    const targetTenantId = req.tenantId || req.headers['x-tenant-id'] || req.body.tenantId;
    const normalizedCode = code.toUpperCase().trim();

    const existing = await prisma.businessUnit.findUnique({
      where: { tenantId_code: { tenantId: targetTenantId, code: normalizedCode } }
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: `Business unit with code '${normalizedCode}' already exists.` }
      });
    }

    const bu = await prisma.businessUnit.create({
      data: {
        tenantId: targetTenantId,
        code: normalizedCode,
        name: name.trim(),
        type: type || 'VALUE_ADDED_SERVICE',
        description,
        icon: icon || 'Wrench'
      }
    });

    res.status(201).json({ success: true, data: bu });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// BRANCH MULTI-BRAND & CAPABILITIES LINKING
// ==========================================

export async function getBranchBrands(req, res, next) {
  try {
    const { branchId } = req.params;
    const branchBrands = await prisma.branchBrand.findMany({
      where: { branchId, ...resolveTenantScope(req) },
      include: { brand: true }
    });
    res.json({ success: true, data: branchBrands });
  } catch (error) {
    next(error);
  }
}

export async function addBranchBrand(req, res, next) {
  try {
    const { branchId } = req.params;
    const { brandId, dealerCode, isPrimary } = req.body;

    if (!brandId) {
      return res.status(400).json({ success: false, error: { message: 'brandId is required.' } });
    }

    const tenantFilter = resolveTenantScope(req);
    const branch = await prisma.branch.findFirst({ where: { id: branchId, ...tenantFilter } });
    if (!branch) {
      return res.status(404).json({ success: false, error: { message: 'Branch not found.' } });
    }

    const branchBrand = await prisma.branchBrand.upsert({
      where: { branchId_brandId: { branchId, brandId } },
      update: {
        dealerCode: dealerCode || undefined,
        isPrimary: isPrimary !== undefined ? Boolean(isPrimary) : undefined,
        isActive: true
      },
      create: {
        tenantId: branch.tenantId,
        branchId,
        brandId,
        dealerCode: dealerCode || branch.code,
        isPrimary: isPrimary !== undefined ? Boolean(isPrimary) : false,
        isActive: true
      },
      include: { brand: true }
    });

    res.status(201).json({ success: true, data: branchBrand });
  } catch (error) {
    next(error);
  }
}

export async function removeBranchBrand(req, res, next) {
  try {
    const { branchId, brandId } = req.params;
    await prisma.branchBrand.deleteMany({
      where: { branchId, brandId, ...resolveTenantScope(req) }
    });
    res.json({ success: true, message: 'Brand unlinked from branch successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function getBranchBusinessUnits(req, res, next) {
  try {
    const { branchId } = req.params;
    const branchBUs = await prisma.branchBusinessUnit.findMany({
      where: { branchId, ...resolveTenantScope(req) },
      include: { businessUnit: true }
    });
    res.json({ success: true, data: branchBUs });
  } catch (error) {
    next(error);
  }
}

export async function updateBranchBusinessUnits(req, res, next) {
  try {
    const { branchId } = req.params;
    const { capabilities } = req.body; // array of { businessUnitId, operationalStatus, capacityUnits, workingHours }

    if (!Array.isArray(capabilities)) {
      return res.status(400).json({ success: false, error: { message: 'capabilities array is required.' } });
    }

    const tenantFilter = resolveTenantScope(req);
    const branch = await prisma.branch.findFirst({ where: { id: branchId, ...tenantFilter } });
    if (!branch) {
      return res.status(404).json({ success: false, error: { message: 'Branch not found.' } });
    }

    const results = [];
    for (const cap of capabilities) {
      const bbu = await prisma.branchBusinessUnit.upsert({
        where: { branchId_businessUnitId: { branchId, businessUnitId: cap.businessUnitId } },
        update: {
          operationalStatus: cap.operationalStatus || 'ACTIVE',
          capacityUnits: cap.capacityUnits !== undefined ? parseInt(cap.capacityUnits, 10) : undefined,
          workingHours: cap.workingHours || undefined
        },
        create: {
          tenantId: branch.tenantId,
          branchId,
          businessUnitId: cap.businessUnitId,
          operationalStatus: cap.operationalStatus || 'ACTIVE',
          capacityUnits: cap.capacityUnits !== undefined ? parseInt(cap.capacityUnits, 10) : 10,
          workingHours: cap.workingHours || { open: '09:00', close: '19:00', days: 'Mon-Sat' }
        },
        include: { businessUnit: true }
      });
      results.push(bbu);
    }

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// HIERARCHICAL ORGANIZATION TREE (REAL DATA)
// ==========================================

export async function getOrganizationTree(req, res, next) {
  try {
    const tenantFilter = resolveTenantScope(req);
    const tenant = await prisma.tenant.findFirst({
      where: tenantFilter.tenantId ? { id: tenantFilter.tenantId } : {},
      include: {
        firms: {
          where: { isActive: true },
          include: {
            firmBrands: { include: { brand: true } },
            branches: {
              where: { active: true },
              include: {
                location: true,
                branchBrands: { include: { brand: true } },
                branchBusinessUnits: { include: { businessUnit: true } },
                departments: { where: { active: true } },
                _count: { select: { memberships: true } }
              }
            }
          }
        },
        locations: {
          where: { isActive: true },
          include: {
            branches: {
              select: {
                id: true,
                name: true,
                code: true,
                outletType: true,
                firm: { select: { id: true, name: true, code: true } }
              }
            }
          }
        },
        brands: {
          where: { isActive: true },
          include: {
            branchBrands: {
              include: {
                branch: { select: { id: true, name: true, city: true } }
              }
            }
          }
        },
        businessUnits: {
          where: { isActive: true },
          include: {
            _count: { select: { branchBusinessUnits: true } }
          }
        }
      }
    });

    if (!tenant) {
      return res.status(404).json({ success: false, error: { message: 'Tenant organization not found.' } });
    }

    // Build synthesized metric aggregations
    let totalBranches = 0;
    let totalMemberships = 0;
    let totalCapabilities = 0;

    for (const firm of tenant.firms) {
      totalBranches += firm.branches.length;
      for (const branch of firm.branches) {
        totalMemberships += branch._count.memberships;
        totalCapabilities += branch.branchBusinessUnits.length;
      }
    }

    res.json({
      success: true,
      data: {
        tenant: {
          id: tenant.id,
          code: tenant.code,
          name: tenant.name,
          legalName: tenant.legalName,
          subscriptionTier: tenant.subscriptionTier,
          status: tenant.status
        },
        metrics: {
          totalFirms: tenant.firms.length,
          totalLocations: tenant.locations.length,
          totalBranches,
          totalBrands: tenant.brands.length,
          totalBusinessUnits: tenant.businessUnits.length,
          totalActiveCapabilities: totalCapabilities,
          totalStaff: totalMemberships
        },
        firms: tenant.firms,
        locations: tenant.locations,
        brands: tenant.brands,
        businessUnits: tenant.businessUnits
      }
    });
  } catch (error) {
    next(error);
  }
}

