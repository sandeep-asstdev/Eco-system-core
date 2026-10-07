// Legacy Data Import & Normalization Service for MAINTLY
import prisma from '../../config/db.js';
import { logAudit } from '../../utils/audit.js';

// Normalization dictionary for common legacy typographical inconsistencies
const NORMALIZATION_MAP = {
  branches: {
    'ather banglore': 'Ather Bangalore',
    'ather energy hubli': 'Ather Energy Hubli',
    'beltech benglore': 'Beltech Bangalore',
    'beltech goa': 'Beltech Goa',
    'tata motors bellary': 'Tata Motors Bellary',
    'used cars': 'Used Cars',
    'd7d': 'D7D'
  },
  brands: {
    'hero moro corp': 'Hero Moto Corp',
    'ballad used cars': 'Ballad Used Cars',
    'cnh': 'CNH Industrial India Pvt Ltd',
    'cnh industrial': 'CNH Industrial India Pvt Ltd'
  },
  departments: {
    'taxation': 'Taxation Department',
    'taxation department': 'Taxation Department',
    'workshop expense': 'Workshop Expense',
    'sale / service / spares': 'Sale / Service / Spares'
  }
};

export function normalizeName(type, name) {
  if (!name || typeof name !== 'string') return '';
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();
  if (NORMALIZATION_MAP[type] && NORMALIZATION_MAP[type][lower]) {
    return NORMALIZATION_MAP[type][lower];
  }
  return trimmed;
}

/**
 * Endpoint to import legacy maintenance requests in batch (JSON/CSV array).
 */
export async function importMaintenanceRequests(req, res, next) {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Rows array is required for import.' });
    }

    const tenantId = req.tenantId;
    const [branches, brands, depts, types, tenant] = await Promise.all([
      prisma.branch.findMany({ where: { tenantId } }),
      prisma.brand.findMany({ where: { tenantId } }),
      prisma.department.findMany({ where: { tenantId } }),
      prisma.maintenanceType.findMany({ where: { tenantId } }),
      prisma.tenant.findUnique({ where: { id: tenantId } })
    ]);

    const branchMap = new Map(branches.map(b => [b.name.toLowerCase(), b.id]));
    const brandMap = new Map(brands.map(b => [b.name.toLowerCase(), b.id]));
    const deptMap = new Map(depts.map(d => [d.name.toLowerCase(), d.id]));
    const typeMap = new Map(types.map(t => [t.name.toLowerCase(), t.id]));

    const imported = [];
    const errors = [];
    let count = await prisma.maintenanceRequest.count({ where: { tenantId } });

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;

      const normBranchName = normalizeName('branches', row.branch || row.branchName);
      const normBrandName = normalizeName('brands', row.brand || row.brandName);
      const normDeptName = normalizeName('departments', row.department || row.deptName);
      const normTypeName = (row.typeOfWork || row.maintenanceType || 'Other').trim().toLowerCase();

      const branchId = branchMap.get(normBranchName.toLowerCase());
      const brandId = brandMap.get(normBrandName.toLowerCase()) || null;
      const deptId = deptMap.get(normDeptName.toLowerCase());
      const typeId = typeMap.get(normTypeName) || types[0]?.id;

      if (!branchId) {
        errors.push({ row: rowNum, error: `Branch "${row.branch || normBranchName}" not found.` });
        continue;
      }
      if (!deptId) {
        errors.push({ row: rowNum, error: `Department "${row.department || normDeptName}" not found.` });
        continue;
      }

      count++;
      const currentYear = new Date().getFullYear();
      const prefix = tenant?.requestPrefix || 'MAIN';
      const requestNumber = row.uniqueId || `${prefix}-${currentYear}-${String(count).padStart(6, '0')}`;
      const createdAt = row.timestamp ? new Date(row.timestamp) : new Date();

      try {
        const created = await prisma.maintenanceRequest.create({
          data: {
            tenantId,
            requestNumber,
            branchId,
            brandId,
            departmentId: deptId,
            maintenanceTypeId: typeId,
            requesterId: req.user.id,
            requesterContact: row.contactNumber || null,
            location: row.location || normBranchName,
            subject: row.subject || `Maintenance Request (${normTypeName})`,
            description: row.description || 'Imported legacy maintenance request record.',
            priority: ['HIGH', 'LOW'].includes(String(row.priority).toUpperCase()) ? row.priority.toUpperCase() : 'MEDIUM',
            requiredDate: row.deadline ? new Date(row.deadline) : new Date(createdAt.getTime() + 48 * 3600000),
            deadline: row.deadline ? new Date(row.deadline) : null,
            workStatus: row.status || 'COMPLETED',
            currentStatus: row.status || 'COMPLETED',
            approvalStatus: 'APPROVED',
            checkedOff: row.checkedOff !== undefined ? Boolean(row.checkedOff) : true,
            branchStatus: row.branchStatus || 'CLOSED',
            actionPlan: row.actionPlan || null,
            correctionDone: row.correctionDone || 'COMPLETED',
            branchRemarks: row.branchRemarks || null,
            purchaseRemarks: row.purchaseRemarks || null,
            createdAt
          }
        });
        imported.push(created.requestNumber);
      } catch (err) {
        errors.push({ row: rowNum, error: err.message });
      }
    }

    await logAudit({
      tenantId,
      userId: req.user.id,
      action: 'DATA_IMPORT',
      entity: 'MaintenanceRequest',
      details: { importedCount: imported.length, errorCount: errors.length },
      req
    });

    res.json({
      success: true,
      message: `Data import processed: ${imported.length} rows imported, ${errors.length} failed.`,
      data: {
        importedCount: imported.length,
        errorCount: errors.length,
        errors
      }
    });
  } catch (error) {
    next(error);
  }
}
