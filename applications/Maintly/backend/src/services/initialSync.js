import http from 'http';
import prisma from '../config/db.js';

const HRFLOW_URL = process.env.HRFLOW_API_URL || 'http://localhost:5000';
const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY || 'ecosystem-internal-service-sync-key';

/**
 * Repeatable Initial Synchronization Service for MAINTLY.
 * Fetches existing employee references from HRFlow's authorized integration API,
 * maps them to local branches and tenants, and populates EmployeeReference records
 * without duplicates, data loss, or sensitive HR information exposure.
 */
class InitialSyncService {
  /**
   * Fetches employee reference records from HRFlow's integration API.
   */
  async fetchHRFlowEmployees(tenantId = null) {
    return new Promise((resolve, reject) => {
      const url = new URL('/api/v1/integrations/employees', HRFLOW_URL);
      if (tenantId) url.searchParams.set('tenantId', tenantId);

      const options = {
        hostname: url.hostname,
        port: url.port || 5000,
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Service-Key': INTERNAL_SERVICE_KEY,
        },
        timeout: 5000,
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(data.data || data);
            } else {
              reject(new Error(`HRFlow returned HTTP ${res.statusCode}: ${data.message || body}`));
            }
          } catch (e) {
            reject(new Error(`Failed to parse HRFlow response: ${e.message}`));
          }
        });
      });

      req.on('error', (err) => reject(new Error(`Cannot reach HRFlow on ${HRFLOW_URL}: ${err.message}`)));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('HRFlow integration API request timed out'));
      });
      req.end();
    });
  }

  /**
   * Performs complete synchronization and reconciliation across all or specified tenants.
   */
  async runSync({ tenantId = null, dryRun = false } = {}) {
    const startTime = Date.now();
    console.log(`🔄 [INITIAL_SYNC] Starting employee synchronization (dryRun: ${dryRun})...`);

    // 1. Fetch from HRFlow
    const hrEmployees = await this.fetchHRFlowEmployees(tenantId);
    if (!Array.isArray(hrEmployees)) {
      throw new Error('HRFlow integration API did not return an array of employees');
    }

    const reconciliation = {
      hrflowTotal: hrEmployees.length,
      matched: 0,
      created: 0,
      updated: 0,
      unmatchedTenants: 0,
      unmatchedEmployees: [],
      tenantsProcessed: new Set(),
      dryRun,
    };

    // 2. Cache local tenants and branches for fast lookups
    const localTenants = await prisma.tenant.findMany({
      include: {
        branches: true,
      },
    });

    const tenantByCentralId = new Map();
    for (const t of localTenants) {
      if (t.centralTenantId) {
        tenantByCentralId.set(t.centralTenantId, t);
      }
    }

    // 3. Process each employee safely
    for (const emp of hrEmployees) {
      const centralTenantId = emp.centralTenantId;
      if (!centralTenantId || !tenantByCentralId.has(centralTenantId)) {
        reconciliation.unmatchedTenants++;
        reconciliation.unmatchedEmployees.push({
          employeeCode: emp.employeeCode,
          name: emp.fullName || `${emp.firstName} ${emp.lastName}`,
          reason: `No matching MAINTLY tenant for centralTenantId '${centralTenantId}'`,
        });
        continue;
      }

      const targetTenant = tenantByCentralId.get(centralTenantId);
      reconciliation.tenantsProcessed.add(targetTenant.id);

      // Resolve branch within this tenant
      let resolvedBranchId = null;
      if (emp.centralBranchId) {
        const branch = targetTenant.branches.find(b => b.centralBranchId === emp.centralBranchId);
        if (branch) {
          resolvedBranchId = branch.id;
        }
      }

      const normalizedEmail = (emp.email || '').toLowerCase().trim();

      // Check if already exists in MAINTLY
      const existing = await prisma.employeeReference.findFirst({
        where: {
          tenantId: targetTenant.id,
          OR: [
            { hrEmployeeId: emp.id },
            { email: normalizedEmail },
          ],
        },
      });

      if (existing) {
        reconciliation.matched++;
        if (!dryRun) {
          await prisma.employeeReference.update({
            where: { id: existing.id },
            data: {
              hrEmployeeId: emp.id,
              centralTenantId: emp.centralTenantId,
              centralUserId: emp.centralUserId || existing.centralUserId,
              centralBranchId: emp.centralBranchId || existing.centralBranchId,
              employeeCode: emp.employeeCode || existing.employeeCode,
              firstName: emp.firstName || existing.firstName,
              lastName: emp.lastName || existing.lastName,
              email: normalizedEmail || existing.email,
              phone: emp.phone !== undefined ? emp.phone : existing.phone,
              branchId: resolvedBranchId !== null ? resolvedBranchId : existing.branchId,
              department: emp.department || existing.department,
              designation: emp.designation || existing.designation,
              status: emp.status || existing.status,
              syncedAt: new Date(),
            },
          });
          reconciliation.updated++;
        }
      } else {
        if (!dryRun) {
          await prisma.employeeReference.create({
            data: {
              tenantId: targetTenant.id,
              hrEmployeeId: emp.id,
              centralTenantId: emp.centralTenantId,
              centralUserId: emp.centralUserId || null,
              centralBranchId: emp.centralBranchId || null,
              employeeCode: emp.employeeCode || `EMP-${Date.now().toString().slice(-4)}`,
              firstName: emp.firstName || '',
              lastName: emp.lastName || '',
              email: normalizedEmail,
              phone: emp.phone || null,
              branchId: resolvedBranchId,
              department: emp.department || null,
              designation: emp.designation || null,
              status: emp.status || 'ACTIVE',
              syncedAt: new Date(),
            },
          });
          reconciliation.created++;
        }
      }
    }

    const totalInMaintlyAfter = await prisma.employeeReference.count();

    const report = {
      status: 'COMPLETED',
      durationMs: Date.now() - startTime,
      dryRun,
      reconciliation: {
        hrflowEmployeesFetched: reconciliation.hrflowTotal,
        matchedExistingCount: reconciliation.matched,
        newEmployeesImported: reconciliation.created,
        employeesUpdated: reconciliation.updated,
        unmatchedTenantCount: reconciliation.unmatchedTenants,
        unmatchedEmployees: reconciliation.unmatchedEmployees,
        tenantsProcessedCount: reconciliation.tenantsProcessed.size,
        totalMaintlyEmployeeReferences: totalInMaintlyAfter,
      },
    };

    console.log(`✔ [INITIAL_SYNC] Synchronization completed: ${reconciliation.created} imported, ${reconciliation.updated} updated, ${reconciliation.matched} matched.`);
    return report;
  }
}

export const initialSyncService = new InitialSyncService();
export default initialSyncService;
