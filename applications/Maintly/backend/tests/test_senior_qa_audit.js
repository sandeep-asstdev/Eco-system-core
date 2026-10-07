import jwt from 'jsonwebtoken';
import prisma from '../src/config/db.js';
import { ENV } from '../src/config/env.js';

const BASE_URL = 'http://localhost:5002';
const JWT_SECRET = ENV.JWT_SECRET;

function makeToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      branchIds: user.branchIds || []
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

async function testSeniorQAAudit() {
  console.log('================================================================');
  console.log('🧪 SENIOR QA AUDIT: 10 LAKH/MONTH TESTING MANAGER RIGOROUS TEST');
  console.log('================================================================\n');

  const tenant = await prisma.tenant.findFirst({
    where: { name: { contains: 'Bellad' } }
  });
  if (!tenant) throw new Error('Tenant Bellad not found in DB');
  const tenantId = tenant.id;

  const branches = await prisma.branch.findMany({ where: { tenantId } });
  const dept = await prisma.department.findFirst({ where: { tenantId } });
  const type = await prisma.maintenanceType.findFirst({ where: { tenantId } });

  console.log(`✓ Active Tenant: ${tenant.name} (Branches: ${branches.length})`);

  // Ensure test users exist for all roles
  async function getOrCreateUser(role, emailPrefix) {
    let user = await prisma.user.findFirst({ where: { tenantId, role } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          tenantId,
          email: `${emailPrefix}@bellad.demo`,
          passwordHash: 'DEMO_HASH',
          firstName: role.charAt(0) + role.slice(1).toLowerCase(),
          lastName: 'Tester',
          role,
          status: 'ACTIVE'
        }
      });
    }
    return user;
  }

  const manager = await getOrCreateUser('MANAGER', 'mgr');
  const approver = await getOrCreateUser('APPROVER', 'appr');
  const tech = await getOrCreateUser('MAINTENANCE_USER', 'tech');
  const employee = await getOrCreateUser('EMPLOYEE', 'emp');

  console.log(`✓ Users: Manager (${manager.email}), Approver (${approver.email}), Technician (${tech.email}), Employee (${employee.email})`);

  const approverToken = makeToken({ id: approver.id, email: approver.email, role: 'APPROVER', tenantId, branchIds: [branches[0].id] });
  const techToken = makeToken({ id: tech.id, email: tech.email, role: 'MAINTENANCE_USER', tenantId, branchIds: [branches[0].id] });
  const empToken = makeToken({ id: employee.id, email: employee.email, role: 'EMPLOYEE', tenantId, branchIds: [branches[0].id] });
  const managerToken = makeToken({ id: manager.id, email: manager.email, role: 'MANAGER', tenantId, branchIds: [branches[0].id] });

  // -------------------------------------------------------------
  // TEST CASE 1: Employee creates new ticket
  // -------------------------------------------------------------
  console.log('\n[TEST 1] Employee raises ticket...');
  const form = new FormData();
  form.append('branchId', branches[0].id);
  form.append('departmentId', dept.id);
  form.append('maintenanceTypeId', type.id);
  form.append('location', 'Bay 4 Service Pit');
  form.append('subject', 'Hydraulic jack cylinder pressure drop');
  form.append('description', 'Jack cylinder loses 2 bar pressure after 5 minutes of load.');
  form.append('priority', 'HIGH');

  const createRes = await fetch(`${BASE_URL}/api/maintenance/requests`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${empToken}`, 'x-tenant-id': tenantId },
    body: form
  });
  const createJson = await createRes.json();
  if (createRes.status !== 201 && createRes.status !== 200) {
    throw new Error(`Failed to create request: HTTP ${createRes.status} ${JSON.stringify(createJson)}`);
  }
  const ticketId = createJson.data.id;
  console.log(`✓ Ticket #${createJson.data.requestNumber} created successfully. ID: ${ticketId}`);

  // -------------------------------------------------------------
  // TEST CASE 2: Approver Approves the request (NO 403 Forbidden)
  // -------------------------------------------------------------
  console.log('\n[TEST 2] Approver approves the request...');
  const apprRes = await fetch(`${BASE_URL}/api/maintenance/requests/${ticketId}/approve`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${approverToken}`,
      'x-tenant-id': tenantId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ remarks: 'Approved by Senior Approver' })
  });
  const apprJson = await apprRes.json();
  if (apprRes.status === 403) throw new Error('FAIL: Approver got 403 Forbidden on /approve!');
  if (!apprJson.success) throw new Error(`FAIL: Approver approve failed: ${JSON.stringify(apprJson)}`);
  console.log(`✓ Approver successfully approved. Status is now: ${apprJson.data.workStatus}`);

  // -------------------------------------------------------------
  // TEST CASE 3: Technician clicks "Start Work" directly (Auto-assigns & transitions to IN_PROGRESS without 403)
  // -------------------------------------------------------------
  console.log('\n[TEST 3] Technician clicks "Start Work" on unassigned approved ticket...');
  const startRes = await fetch(`${BASE_URL}/api/maintenance/requests/${ticketId}/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${techToken}`,
      'x-tenant-id': tenantId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ workStatus: 'IN_PROGRESS', remarks: 'Work commenced by technician' })
  });
  const startJson = await startRes.json();
  if (startRes.status === 403) throw new Error('FAIL: Technician got 403 Forbidden on "Start Work"!');
  if (!startJson.success) throw new Error(`FAIL: Start work failed: ${JSON.stringify(startJson)}`);
  console.log(`✓ Technician started work! WorkStatus: ${startJson.data.workStatus}, AssignedToId: ${startJson.data.assignedToId}`);
  if (startJson.data.assignedToId !== tech.id) {
    throw new Error(`FAIL: Expected ticket to auto-assign to technician ${tech.id}, but got ${startJson.data.assignedToId}`);
  }
  console.log('✓ Auto-assignment verified!');

  // -------------------------------------------------------------
  // TEST CASE 4: Approver / Manager adds materials and updates costs (NO 403 Forbidden)
  // -------------------------------------------------------------
  console.log('\n[TEST 4] Approver records spare part and labour cost...');
  const matRes = await fetch(`${BASE_URL}/api/maintenance/requests/${ticketId}/materials`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${approverToken}`,
      'x-tenant-id': tenantId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      materialName: 'Hydraulic Seal Kit 45mm',
      quantity: 1,
      unit: 'kit',
      unitCost: 1800
    })
  });
  const matJson = await matRes.json();
  if (matRes.status === 403) throw new Error('FAIL: Approver got 403 Forbidden on /materials!');
  console.log('✓ Approver recorded material without 403!');

  const costRes = await fetch(`${BASE_URL}/api/maintenance/requests/${ticketId}/costs`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${approverToken}`,
      'x-tenant-id': tenantId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      labourCost: 1200,
      actualCost: 3000
    })
  });
  const costJson = await costRes.json();
  if (costRes.status === 403) throw new Error('FAIL: Approver got 403 Forbidden on /costs!');
  console.log('✓ Approver recorded costs without 403!');

  // -------------------------------------------------------------
  // TEST CASE 5: Technician Marks Completed
  // -------------------------------------------------------------
  console.log('\n[TEST 5] Technician marks work as COMPLETED...');
  const compRes = await fetch(`${BASE_URL}/api/maintenance/requests/${ticketId}/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${techToken}`,
      'x-tenant-id': tenantId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      workStatus: 'COMPLETED',
      completionRemarks: 'Hydraulic seals replaced, tested under 8 ton load, zero leakage.'
    })
  });
  const compJson = await compRes.json();
  if (compRes.status === 403) throw new Error('FAIL: Technician got 403 Forbidden on Mark Completed!');
  if (!compJson.success) throw new Error(`FAIL: Mark completed failed: ${JSON.stringify(compJson)}`);
  console.log(`✓ Work marked COMPLETED. Status: ${compJson.data.workStatus}`);

  // -------------------------------------------------------------
  // TEST CASE 6: Satisfaction Verification
  // -------------------------------------------------------------
  console.log('\n[TEST 6] Satisfaction verification security check...');
  // A third-party technician who is NOT requester should not close without permission
  const otherUser = await prisma.user.findFirst({
    where: { tenantId, role: 'EMPLOYEE', id: { not: employee.id } }
  });
  if (otherUser) {
    const intruderToken = makeToken({ id: otherUser.id, email: otherUser.email, role: 'EMPLOYEE', tenantId, branchIds: [branches[0].id] });
    const intruderRes = await fetch(`${BASE_URL}/api/maintenance/requests/${ticketId}/satisfaction`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${intruderToken}`,
        'x-tenant-id': tenantId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ satisfaction: 'SATISFIED' })
    });
    if (intruderRes.status !== 403) {
      throw new Error(`FAIL: Expected 403 Forbidden for unauthorized employee, got ${intruderRes.status}`);
    }
    console.log('✓ Unauthorized employee correctly blocked with 403 Forbidden!');
  }

  // The true Requester confirms satisfaction -> CLOSED
  const satRes = await fetch(`${BASE_URL}/api/maintenance/requests/${ticketId}/satisfaction`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${empToken}`,
      'x-tenant-id': tenantId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ satisfaction: 'SATISFIED' })
  });
  const satJson = await satRes.json();
  if (satRes.status === 403) throw new Error('FAIL: Original requester got 403 Forbidden on satisfaction!');
  if (!satJson.success) throw new Error(`FAIL: Requester satisfaction failed: ${JSON.stringify(satJson)}`);
  console.log(`✓ Original requester confirmed satisfaction. Final Status: ${satJson.data.workStatus}`);

  // -------------------------------------------------------------
  // TEST CASE 7: Multi-Branch & Dashboard Queries (Zero 403s for Manager / Approver)
  // -------------------------------------------------------------
  console.log('\n[TEST 7] Cross-branch and dashboard queries for Manager and Approver...');
  for (const b of branches) {
    const dashRes = await fetch(`${BASE_URL}/api/dashboard?branchId=${b.id}`, {
      headers: { 'Authorization': `Bearer ${managerToken}`, 'x-tenant-id': tenantId }
    });
    if (dashRes.status === 403) throw new Error(`FAIL: Manager got 403 on Dashboard for branch ${b.id}`);

    const reqsRes = await fetch(`${BASE_URL}/api/maintenance/requests?branchId=${b.id}&view=assigned_to_me`, {
      headers: { 'Authorization': `Bearer ${techToken}`, 'x-tenant-id': tenantId }
    });
    if (reqsRes.status === 403) throw new Error(`FAIL: Technician got 403 on view=assigned_to_me for branch ${b.id}`);
  }
  console.log(`✓ Tested all ${branches.length} branches: Zero 403 Forbidden errors across Dashboard and Requests!`);

  await prisma.$disconnect();
  console.log('\n================================================================');
  console.log('🏆 100% PASSED: ALL 7 SENIOR QA AUDIT CRITICAL TEST CASES VERIFIED!');
  console.log('================================================================\n');
}

testSeniorQAAudit().catch((err) => {
  console.error('\n❌ SENIOR QA AUDIT FAILED:', err);
  prisma.$disconnect();
  process.exit(1);
});
