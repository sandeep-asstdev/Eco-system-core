const http = require('http');
const { PrismaClient } = require('@prisma/client');
const { BELLAD_LEVELS, BELLAD_DESIGNATIONS } = require('../prisma/belladMastersData');
const { seedBelladGroupMasters } = require('../prisma/seed');

const prisma = new PrismaClient();
const API_HOST = '127.0.0.1';
const API_PORT = 5000;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
    };
    if (data) headers['Content-Length'] = Buffer.byteLength(data);
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        host: API_HOST,
        port: API_PORT,
        method,
        path,
        headers,
      },
      (res) => {
        let resBody = '';
        res.on('data', (chunk) => (resBody += chunk));
        res.on('end', () => {
          try {
            const parsed = resBody ? JSON.parse(resBody) : {};
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: resBody });
          }
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runLevelsDesignationsTests() {
  console.log('===============================================================');
  console.log('  HRFlow SaaS: Levels & Designations Master Test Suite');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${details ? '- ' + details : ''}`);
      failed++;
    }
  }

  try {
    // 1. Authenticate users
    console.log('Authenticating test personas...');
    const belladHRRes = await request('POST', '/api/auth/login', {
      email: 'hr.bellad@hrflow.com',
      password: 'hr123456',
    });
    const belladHRToken = belladHRRes.data?.data?.token;
    assert(belladHRRes.status === 200 && belladHRToken, 'Bellad HR Login successful');

    const apexHRRes = await request('POST', '/api/auth/login', {
      email: 'hr@hrflow.com',
      password: 'hr123456',
    });
    const apexHRToken = apexHRRes.data?.data?.token;
    assert(apexHRRes.status === 200 && apexHRToken, 'Apex Auto HR Login successful');

    const belladTenant = await prisma.tenant.findUnique({ where: { code: 'BELLAD' } });
    const apexTenant = await prisma.tenant.findUnique({ where: { code: 'APEX-AUTO' } });
    assert(belladTenant && apexTenant, 'Tenants Bellad and Apex Auto exist in DB');

    // -------------------------------------------------------------
    // Test 1: Verify 10 Bellad levels exist in order
    // -------------------------------------------------------------
    console.log('\n--- Test 1: Bellad Levels Structure ---');
    const levelsRes = await request('GET', '/api/organization-masters/levels', null, belladHRToken);
    assert(levelsRes.status === 200, 'GET /api/organization-masters/levels returns 200');
    const levels = levelsRes.data?.data || [];
    assert(levels.length === 10, `Bellad has exactly 10 levels (received: ${levels.length})`);
    const allSequential = levels.every((lvl, idx) => lvl.levelNumber === idx + 1);
    assert(allSequential, 'Levels are numbered 1 through 10 in strict ascending order');

    // -------------------------------------------------------------
    // Test 2: Verify all 101 Bellad designations exist and map to correct levels
    // -------------------------------------------------------------
    console.log('\n--- Test 2: Bellad Designations Master Count & Mapping ---');
    const desigsRes = await request('GET', '/api/organization-masters/designations?limit=200', null, belladHRToken);
    assert(desigsRes.status === 200, 'GET /api/organization-masters/designations returns 200');
    const desigs = desigsRes.data?.data || [];
    assert(desigs.length === 101, `Bellad has exactly 101 designations (received: ${desigs.length})`);

    const desigMapByName = new Map();
    desigs.forEach((d) => desigMapByName.set(d.name, d));

    let mappingMatches = true;
    for (const expected of BELLAD_DESIGNATIONS) {
      const found = desigMapByName.get(expected.name);
      if (!found || found.level.levelNumber !== expected.levelNumber) {
        mappingMatches = false;
        console.error(`Mismatch for designation: ${expected.name} (expected Level ${expected.levelNumber}, got ${found?.level?.levelNumber})`);
        break;
      }
    }
    assert(mappingMatches, 'All 101 designations match their exact assigned levelNumber from specification');

    // -------------------------------------------------------------
    // Test 3: Cross-level assignment rejection
    // -------------------------------------------------------------
    console.log('\n--- Test 3: Cross-Level Assignment Validation ---');
    const belladBranch = await prisma.branch.findFirst({ where: { tenantId: belladTenant.id } });
    const level1 = levels.find((l) => l.levelNumber === 1);
    const level5 = levels.find((l) => l.levelNumber === 5);
    const bmDesig = desigs.find((d) => d.name === 'Branch Manager'); // belongs to Level 5

    const crossLevelEmpRes = await request(
      'POST',
      '/api/employees',
      {
        firstName: 'Test',
        lastName: 'CrossLevel',
        email: 'test.crosslevel@belladgroup.com',
        branchId: belladBranch.id,
        department: 'Operations',
        levelId: level1.id, // Level 1 selected
        designationId: bmDesig.id, // Level 5 designation selected
      },
      belladHRToken
    );
    assert(
      crossLevelEmpRes.status === 400,
      'Assigning Level 5 designation with Level 1 must be rejected with 400 Bad Request',
      `Got status: ${crossLevelEmpRes.status}`
    );

    // -------------------------------------------------------------
    // Test 4: Tenant isolation for levels and designations
    // -------------------------------------------------------------
    console.log('\n--- Test 4: Tenant Isolation on Masters ---');
    const apexLevelsRes = await request('GET', '/api/organization-masters/levels', null, apexHRToken);
    const apexLevels = apexLevelsRes.data?.data || [];
    const belladLeakedInApex = apexLevels.some((l) => l.tenantId === belladTenant.id);
    assert(!belladLeakedInApex, 'Apex HR cannot see Bellad levels (tenant isolation enforced)');

    const apexDesigsRes = await request('GET', '/api/organization-masters/designations?limit=200', null, apexHRToken);
    const apexDesigs = apexDesigsRes.data?.data || [];
    const belladDesigLeakedInApex = apexDesigs.some((d) => d.tenantId === belladTenant.id);
    assert(!belladDesigLeakedInApex, 'Apex HR cannot see Bellad designations (tenant isolation enforced)');

    // -------------------------------------------------------------
    // Test 5: Cross-tenant designation assignment rejection
    // -------------------------------------------------------------
    console.log('\n--- Test 5: Cross-Tenant Designation Assignment Rejection ---');
    const apexBranch = await prisma.branch.findFirst({ where: { tenantId: apexTenant.id } });
    const crossTenantEmpRes = await request(
      'POST',
      '/api/employees',
      {
        firstName: 'Intruder',
        lastName: 'CrossTenant',
        email: 'intruder.crosstenant@apexauto.com',
        branchId: apexBranch.id,
        department: 'Service',
        designationId: bmDesig.id, // Bellad designation passed by Apex HR
      },
      apexHRToken
    );
    assert(
      crossTenantEmpRes.status === 400 || crossTenantEmpRes.status === 403,
      'Assigning Bellad designation to Apex employee must be rejected with 400/403',
      `Got status: ${crossTenantEmpRes.status}`
    );

    // -------------------------------------------------------------
    // Test 6: Inactive designation assignment rejection
    // -------------------------------------------------------------
    // -------------------------------------------------------------
    // Test 6: Inactive designation assignment rejection
    // -------------------------------------------------------------
    console.log('\n--- Test 6: Inactive Designation Blocking ---');
    // Create a temporary designation and deactivate it
    const testDesigRes = await request(
      'POST',
      '/api/organization-masters/designations',
      {
        levelId: level1.id,
        name: 'Temporary Trainee Spec',
        code: 'TEMP-TRAIN-01',
      },
      belladHRToken
    );
    const tempDesigId = testDesigRes.data?.data?.id;

    // Deactivate it
    await request(
      'PUT',
      `/api/organization-masters/designations/${tempDesigId}`,
      {
        isActive: false,
      },
      belladHRToken
    );

    // Attempt to assign to new employee
    const inactiveAssignRes = await request(
      'POST',
      '/api/employees',
      {
        firstName: 'Inactive',
        lastName: 'Assignee',
        email: `inactive.assignee.${Date.now()}@belladgroup.com`,
        branchId: belladBranch.id,
        department: 'Service',
        levelId: level1.id,
        designationId: tempDesigId,
      },
      belladHRToken
    );
    assert(
      inactiveAssignRes.status === 400,
      'Assigning inactive designation to new employee must be rejected with 400 Bad Request',
      `Got status: ${inactiveAssignRes.status}`
    );

    // -------------------------------------------------------------
    // Test 7: Existing employees retain inactive designations
    // -------------------------------------------------------------
    console.log('\n--- Test 7: Existing Employee Retains Inactive Designation ---');
    // Re-activate temporarily to create employee
    await request('PUT', `/api/organization-masters/designations/${tempDesigId}`, { isActive: true }, belladHRToken);
    const uniqueEmail = `legacy.holder.${Date.now()}@belladgroup.com`;
    const empCreatedRes = await request(
      'POST',
      '/api/employees',
      {
        firstName: 'Legacy',
        lastName: 'Holder',
        email: uniqueEmail,
        branchId: belladBranch.id,
        department: 'Service',
        levelId: level1.id,
        designationId: tempDesigId,
      },
      belladHRToken
    );
    const legacyEmpId = empCreatedRes.data?.data?.id;
    assert(empCreatedRes.status === 201 && legacyEmpId, 'Created employee with active designation', `status: ${empCreatedRes.status}, data: ${JSON.stringify(empCreatedRes.data)}`);

    // Deactivate designation
    await request('PUT', `/api/organization-masters/designations/${tempDesigId}`, { isActive: false }, belladHRToken);

    // Employee updating profile (e.g. phone number) should succeed and preserve inactive designation
    const empUpdateRes = await request(
      'PUT',
      `/api/employees/${legacyEmpId}`,
      {
        phone: '+91 99999 88888',
        maritalStatus: 'Married',
      },
      belladHRToken
    );
    assert(empUpdateRes.status === 200, 'Employee profile update succeeds without losing inactive designation', `status: ${empUpdateRes.status}, data: ${JSON.stringify(empUpdateRes.data)}`);
    const updatedEmp = empUpdateRes.data?.data;
    assert(updatedEmp && updatedEmp.designationId === tempDesigId, 'Employee retains historical inactive designationId');

    // Also verify deletion is blocked when employees are assigned
    const deleteBlockedRes = await request('DELETE', `/api/organization-masters/designations/${tempDesigId}`, null, belladHRToken);
    assert(
      deleteBlockedRes.status === 400,
      'Deletion of designation in-use by employees must be blocked with 400 (safe deactivation required)',
      `Got status: ${deleteBlockedRes.status}`
    );

    // Clean up test employee and designation
    await prisma.employeeKYC.deleteMany({ where: { employeeId: legacyEmpId } });
    await prisma.employeeStatutory.deleteMany({ where: { employeeId: legacyEmpId } });
    await prisma.employeeSalary.deleteMany({ where: { employeeId: legacyEmpId } });
    await prisma.employee.delete({ where: { id: legacyEmpId } });
    await prisma.designation.delete({ where: { id: tempDesigId } });

    // -------------------------------------------------------------
    // Test 8: Duplicate designation name in same tenant rejected
    // -------------------------------------------------------------
    console.log('\n--- Test 8: Duplicate Designation Name Constraint ---');
    const dupDesigRes = await request(
      'POST',
      '/api/organization-masters/designations',
      {
        levelId: level5.id,
        name: 'Branch Manager', // Already exists in Bellad
        code: 'DUP-BM-01',
      },
      belladHRToken
    );
    assert(
      dupDesigRes.status === 400 || dupDesigRes.status === 409,
      'Creating duplicate designation name in same tenant must be rejected with 400/409',
      `Got status: ${dupDesigRes.status}`
    );

    // -------------------------------------------------------------
    // Test 9: Same designation name in different tenants is allowed
    // -------------------------------------------------------------
    console.log('\n--- Test 9: Multi-Tenant Designation Coexistence ---');
    const apexL1 = apexLevels.find((l) => l.levelNumber === 1);
    const apexSameNameRes = await request(
      'POST',
      '/api/organization-masters/designations',
      {
        levelId: apexL1.id,
        name: 'Washers', // Exists in Bellad Level 1
        code: 'APEX-WASH-01',
      },
      apexHRToken
    );
    assert(
      apexSameNameRes.status === 201,
      'Same designation name ("Washers") can exist independently in another tenant',
      `Got status: ${apexSameNameRes.status}`
    );
    // Clean up created designation in Apex
    if (apexSameNameRes.data?.data?.id) {
      await prisma.designation.delete({ where: { id: apexSameNameRes.data.data.id } });
    }

    // -------------------------------------------------------------
    // Test 10: Seed idempotency
    // -------------------------------------------------------------
    console.log('\n--- Test 10: Seed Idempotency ---');
    await seedBelladGroupMasters(prisma, belladTenant.id);
    const postSeedLevels = await prisma.employeeLevel.count({ where: { tenantId: belladTenant.id } });
    const postSeedDesigs = await prisma.designation.count({ where: { tenantId: belladTenant.id } });
    assert(postSeedLevels === 10, `Post-reseed levels count remains 10 (got ${postSeedLevels})`);
    assert(postSeedDesigs === 101, `Post-reseed designations count remains 101 (got ${postSeedDesigs})`);

    // -------------------------------------------------------------
    // Test 11: Reporting manager tenant scoping & circular check
    // -------------------------------------------------------------
    console.log('\n--- Test 11: Reporting Hierarchy Validation ---');
    const apexEmp = await prisma.employee.findFirst({ where: { tenantId: apexTenant.id } });
    const belladEmp = await prisma.employee.findFirst({ where: { tenantId: belladTenant.id } });

    // Assign cross-tenant manager
    const crossTenantMgrRes = await request(
      'PUT',
      `/api/employees/${belladEmp.id}`,
      {
        reportingManagerId: apexEmp.id,
      },
      belladHRToken
    );
    assert(
      crossTenantMgrRes.status === 400,
      'Assigning cross-tenant reporting manager must be rejected with 400',
      `Got status: ${crossTenantMgrRes.status}`
    );

    // Assign self as manager
    const selfMgrRes = await request(
      'PUT',
      `/api/employees/${belladEmp.id}`,
      {
        reportingManagerId: belladEmp.id,
      },
      belladHRToken
    );
    assert(selfMgrRes.status === 400, 'Assigning self as reporting manager must be rejected with 400');

    // Circular reporting test
    const empMD = await prisma.employee.findFirst({ where: { tenantId: belladTenant.id, designation: 'MD' } });
    const empWasher = await prisma.employee.findFirst({ where: { tenantId: belladTenant.id, designation: 'Washers' } });
    // MD reports to Washer (who indirectly reports to MD)
    const circularRes = await request(
      'PUT',
      `/api/employees/${empMD.id}`,
      {
        reportingManagerId: empWasher.id,
      },
      belladHRToken
    );
    assert(
      circularRes.status === 400,
      'Circular reporting relationship must be detected and rejected with 400',
      `Got status: ${circularRes.status}`
    );

    // -------------------------------------------------------------
    // Test 12: Audit logging for master changes
    // -------------------------------------------------------------
    console.log('\n--- Test 12: Audit Logging Verification ---');
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        tenantId: belladTenant.id,
        module: { in: ['ORGANIZATION_MASTER', 'ORGANIZATION_MASTERS'] },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
    assert(auditLogs.length > 0, `Audit logs recorded for ORGANIZATION_MASTERS actions (found ${auditLogs.length})`);
    const actionTypes = new Set(auditLogs.map((a) => a.action));
    console.log('Audited actions:', Array.from(actionTypes).join(', '));
    assert(actionTypes.size > 0, 'Audit actions verified');

    console.log('\n===============================================================');
    console.log(`  Levels & Designations Suite: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runLevelsDesignationsTests();
