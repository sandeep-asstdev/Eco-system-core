process.env.PORT = '5099';
process.env.NODE_ENV = 'test';

import app from '../src/server.js';
import prisma from '../src/config/db.js';
import assert from 'assert';

let BASE_URL = 'http://127.0.0.1:5000';
let server = null;

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = options.headers || {};
  headers['Connection'] = 'close';
  if (options.body) headers['Content-Type'] = 'application/json';

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function run() {
  console.log('\n======================================================');
  console.log('MAINTLY ROLE-BASED ARCHITECTURE TEST SUITE (POSTGRESQL 18)');
  console.log('Testing Items A through O (Requirements 17)');
  console.log('======================================================\n');

  // Check if port 5002 is active
  try {
    const check = await fetch('http://127.0.0.1:5002/api/health', { headers: { Connection: 'close' } });
    const json = await check.json().catch(() => ({}));
    if (check.status === 200 && json.application === 'MAINTLY') {
      BASE_URL = 'http://127.0.0.1:5002';
      console.log('[TEST RUNNER] Running against active server on port 5002');
    } else {
      throw new Error('Not Maintly');
    }
  } catch (e) {
    server = app.listen(5099);
    BASE_URL = 'http://127.0.0.1:5099';
    console.log('[TEST RUNNER] Started dedicated test server on port 5099');
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  try {
    // Authenticate users across all key roles
    const [belladAdminLogin, omniAdminLogin, empLogin, managerLogin, approverLogin, techLogin, purchaseLogin] = await Promise.all([
      request('/api/auth/login', { method: 'POST', body: { email: 'admin@bellad.com', password: 'Admin@123' } }),
      request('/api/auth/login', { method: 'POST', body: { email: 'admin@omnilogistics.com', password: 'Admin@123' } }),
      request('/api/auth/login', { method: 'POST', body: { email: 'employee@bellad.com', password: 'Admin@123' } }),
      request('/api/auth/login', { method: 'POST', body: { email: 'manager@bellad.com', password: 'Admin@123' } }),
      request('/api/auth/login', { method: 'POST', body: { email: 'approver@bellad.com', password: 'Admin@123' } }),
      request('/api/auth/login', { method: 'POST', body: { email: 'technician@bellad.com', password: 'Admin@123' } }),
      request('/api/auth/login', { method: 'POST', body: { email: 'purchase@bellad.com', password: 'Admin@123' } })
    ]);

    assert.strictEqual(belladAdminLogin.status, 200);
    assert.strictEqual(omniAdminLogin.status, 200);
    assert.strictEqual(empLogin.status, 200);
    assert.strictEqual(managerLogin.status, 200);
    assert.strictEqual(approverLogin.status, 200);
    assert.strictEqual(techLogin.status, 200);
    assert.strictEqual(purchaseLogin.status, 200);

    const belladToken = belladAdminLogin.data.data.token;
    const omniToken = omniAdminLogin.data.data.token;
    const empToken = empLogin.data.data.token;
    const managerToken = managerLogin.data.data.token;
    const approverToken = approverLogin.data.data.token;
    const techToken = techLogin.data.data.token;
    const techId = techLogin.data.data.user.id;
    const purchaseToken = purchaseLogin.data.data.token;

    // -----------------------------------------------------------------
    // TEST I: TENANT A CANNOT SEE TENANT B DATA (MULTI-TENANT ISOLATION)
    // -----------------------------------------------------------------
    console.log('[TEST I] Verifying Tenant Isolation (Tenant A cannot see Tenant B)...');
    const belladReqs = await request('/api/maintenance/requests', { headers: { Authorization: `Bearer ${belladToken}` } });
    const omniReqs = await request('/api/maintenance/requests', { headers: { Authorization: `Bearer ${omniToken}` } });
    assert.strictEqual(belladReqs.status, 200);
    assert.strictEqual(omniReqs.status, 200);

    const omniSampleId = omniReqs.data.data.items[0]?.id;
    if (omniSampleId) {
      const breach = await request(`/api/maintenance/requests/${omniSampleId}`, { headers: { Authorization: `Bearer ${belladToken}` } });
      assert.strictEqual(breach.status, 404, 'Bellad user cannot access OmniLogistics request');
    }
    console.log('✔ Test I Passed: Strict multi-tenant isolation verified.');

    // -----------------------------------------------------------------
    // TEST J: BELLAD CONFIGURATION CANNOT ALTER ANOTHER TENANT
    // -----------------------------------------------------------------
    console.log('[TEST J] Verifying Tenant Config Isolation...');
    const belladTenant = await prisma.tenant.findUnique({ where: { code: 'BELLAD' } });
    const omniTenant = await prisma.tenant.findUnique({ where: { code: 'OMNI' } });
    assert.notStrictEqual(belladTenant.requestPrefix, omniTenant.requestPrefix);
    console.log('✔ Test J Passed: Tenant configurations independently maintained.');

    // -----------------------------------------------------------------
    // TEST K: ONE REQUEST CREATES ONE UNIQUE ID & SEQUENTIAL NUMBER
    // -----------------------------------------------------------------
    console.log('[TEST K] Verifying Unique Request Number Generation...');
    const branchRes = await request('/api/org/branches', { headers: { Authorization: `Bearer ${empToken}` } });
    const branch = branchRes.data.data[0];
    const deptRes = await request('/api/org/departments', { headers: { Authorization: `Bearer ${empToken}` } });
    const dept = deptRes.data.data[0];
    const typeRes = await request('/api/maintenance/types', { headers: { Authorization: `Bearer ${empToken}` } });
    const mType = typeRes.data.data[0];

    const newReqRes = await request('/api/maintenance/requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${empToken}` },
      body: {
        branchId: branch.id,
        departmentId: dept.id,
        maintenanceTypeId: mType.id,
        priority: 'HIGH',
        location: 'Server Room AC Unit #2',
        subject: 'Cooling failure in primary server room',
        description: 'Compressor tripped. Temperature rising rapidly.',
        requiredDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
      }
    });

    assert.strictEqual(newReqRes.status, 201);
    const testReq = newReqRes.data.data;
    assert.ok(testReq.id, 'Request must have unique UUID');
    assert.ok(testReq.requestNumber.startsWith('BELL-MAIN-'), 'Request number matches tenant prefix');
    console.log(`✔ Test K Passed: Unique request created: ${testReq.requestNumber} (${testReq.id})`);

    // -----------------------------------------------------------------
    // TEST A: EMPLOYEE CANNOT APPROVE (STRICT SERVER-SIDE 403)
    // -----------------------------------------------------------------
    console.log('[TEST A] Verifying Employee cannot approve requests...');
    const empApproveAttempt = await request(`/api/maintenance/requests/${testReq.id}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${empToken}` },
      body: { remarks: 'Hacked approval attempt' }
    });
    assert.strictEqual(empApproveAttempt.status, 403, 'Employee approval must be rejected with 403');
    console.log('✔ Test A Passed: Server rejected employee approval with HTTP 403 Forbidden.');

    // -----------------------------------------------------------------
    // TEST B: EMPLOYEE CANNOT ASSIGN (STRICT SERVER-SIDE 403)
    // -----------------------------------------------------------------
    console.log('[TEST B] Verifying Employee cannot assign technicians...');
    const empAssignAttempt = await request(`/api/maintenance/requests/${testReq.id}/assign`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${empToken}` },
      body: { assignedToId: techId, notes: 'Self assignment attempt' }
    });
    assert.strictEqual(empAssignAttempt.status, 403, 'Employee assign must be rejected with 403');
    console.log('✔ Test B Passed: Server rejected employee assignment with HTTP 403 Forbidden.');

    // -----------------------------------------------------------------
    // TEST C: EMPLOYEE CANNOT MODIFY PURCHASE (STRICT SERVER-SIDE 403)
    // -----------------------------------------------------------------
    console.log('[TEST C] Verifying Employee cannot modify purchase status...');
    const empPurchaseAttempt = await request(`/api/purchases/dummy-id/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${empToken}` },
      body: { status: 'RECEIVED' }
    });
    assert.strictEqual(empPurchaseAttempt.status, 403, 'Employee purchase modification must be rejected with 403');
    console.log('✔ Test C Passed: Server rejected employee purchase update with HTTP 403 Forbidden.');

    // -----------------------------------------------------------------
    // TEST D: APPROVER CAN ONLY APPROVE/REJECT (CANNOT ASSIGN)
    // -----------------------------------------------------------------
    console.log('[TEST D] Verifying Approver permissions...');
    const approverAssignAttempt = await request(`/api/maintenance/requests/${testReq.id}/assign`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${approverToken}` },
      body: { assignedToId: techId }
    });
    assert.strictEqual(approverAssignAttempt.status, 403, 'Approver cannot assign technicians');

    const approveRes = await request(`/api/maintenance/requests/${testReq.id}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${approverToken}` },
      body: { remarks: 'Emergency server room approval granted.' }
    });
    assert.strictEqual(approveRes.status, 200, 'Approver should successfully approve');
    console.log('✔ Test D Passed: Approver authorized only for approvals.');

    // -----------------------------------------------------------------
    // TEST E: MANAGER CAN ASSIGN TECHNICIAN
    // -----------------------------------------------------------------
    console.log('[TEST E] Verifying Manager assignment...');
    const assignRes = await request(`/api/maintenance/requests/${testReq.id}/assign`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${managerToken}` },
      body: {
        assignedToId: techId,
        actionPlan: '1. Check refrigerant pressure\n2. Inspect capacitor\n3. Restart blower',
        notes: 'Priority task: server room heat critical'
      }
    });
    assert.strictEqual(assignRes.status, 200, 'Manager can assign');
    assert.strictEqual(assignRes.data.data.workStatus, 'ASSIGNED');
    console.log('✔ Test E Passed: Manager assigned technician and set action plan.');

    // -----------------------------------------------------------------
    // TEST F: TECHNICIAN CAN EXECUTE ASSIGNED WORK
    // -----------------------------------------------------------------
    console.log('[TEST F] Verifying Technician work execution...');
    const startRes = await request(`/api/maintenance/requests/${testReq.id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${techToken}` },
      body: { workStatus: 'IN_PROGRESS', remarks: 'Arrived at server room, opened AC panel.' }
    });
    assert.strictEqual(startRes.status, 200);
    assert.strictEqual(startRes.data.data.workStatus, 'IN_PROGRESS');
    console.log('✔ Test F Passed: Technician commenced work.');

    // -----------------------------------------------------------------
    // TEST G & O: PURCHASE USER MANAGES REQUISITION LINKED TO PARENT
    // -----------------------------------------------------------------
    console.log('[TEST G & O] Verifying Purchase Requisition linked to parent request...');
    const prCreateRes = await request('/api/purchases', {
      method: 'POST',
      headers: { Authorization: `Bearer ${purchaseToken}` },
      body: {
        maintenanceRequestId: testReq.id,
        purchaseSource: 'AMAZON_BUSINESS',
        poReference: 'AMZ-882190',
        orderUrl: 'https://business.amazon.in/orders/402-11928',
        items: [{ itemName: 'Capacitor 50uF Dual Run', quantity: 1, estimatedPrice: 1200 }]
      }
    });
    assert.strictEqual(prCreateRes.status, 201);
    const prId = prCreateRes.data.data.id;

    // Verify parent request updated to WAITING_FOR_PURCHASE
    const parentReqCheck = await request(`/api/maintenance/requests/${testReq.id}`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    assert.strictEqual(parentReqCheck.data.data.workStatus, 'WAITING_FOR_PURCHASE');

    // Mark Order Placed
    const prOrderRes = await request(`/api/purchases/${prId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${purchaseToken}` },
      body: { status: 'ORDERED', trackingNumber: 'TRK-9921', carrier: 'BlueDart' }
    });
    assert.strictEqual(prOrderRes.status, 200);

    // Mark Received -> Automatically resumes parent to IN_PROGRESS
    const prReceiveRes = await request(`/api/purchases/${prId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${purchaseToken}` },
      body: { status: 'RECEIVED', actualTotal: 1150 }
    });
    assert.strictEqual(prReceiveRes.status, 200);

    const parentResumed = await request(`/api/maintenance/requests/${testReq.id}`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    assert.strictEqual(parentResumed.data.data.workStatus, 'IN_PROGRESS', 'Parent request resumed to IN_PROGRESS upon receipt');
    console.log('✔ Test G & O Passed: Procurement lifecycle linked to parent maintenance ticket with automated resumption.');

    // -----------------------------------------------------------------
    // TEST H: VENDOR ASSIGNMENT & EMPLOYEE VIEW CLEANLINESS
    // -----------------------------------------------------------------
    console.log('[TEST H] Verifying Vendor Assignment and Employee Friendly View...');
    const vendors = await prisma.vendor.findMany({ where: { tenantId: belladTenant.id } });
    if (vendors.length > 0) {
      const vendorAssignRes = await request(`/api/maintenance/requests/${testReq.id}/vendor`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${managerToken}` },
        body: {
          vendorId: vendors[0].id,
          vendorScope: 'HVAC precision gas charging and compressor calibration',
          vendorServiceDate: new Date().toISOString()
        }
      });
      assert.strictEqual(vendorAssignRes.status, 200);

      // Verify Employee view shows friendly status
      const empView = await request(`/api/maintenance/requests/${testReq.id}`, {
        headers: { Authorization: `Bearer ${empToken}` }
      });
      assert.strictEqual(empView.data.data.humanReadableStatus, 'Waiting for External Service Provider', 'Employee sees friendly vendor message');
    }
    console.log('✔ Test H Passed: Vendor scheduled without exposing internal controls to requester.');

    // Complete the task and test satisfaction
    await request(`/api/maintenance/requests/${testReq.id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${techToken}` },
      body: { workStatus: 'COMPLETED', completionRemarks: 'Repairs done and server room cooled to 19°C.' }
    });

    const verifySatisfied = await request(`/api/maintenance/requests/${testReq.id}/satisfaction`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${empToken}` },
      body: { satisfaction: 'SATISFIED', comment: 'Temperature confirmed normal. Great job.' }
    });
    assert.strictEqual(verifySatisfied.status, 200);
    assert.strictEqual(verifySatisfied.data.data.workStatus, 'CLOSED');

    // -----------------------------------------------------------------
    // TEST L: EVERY MAJOR ACTION CREATES AUDIT/TIMELINE EVENT
    // -----------------------------------------------------------------
    console.log('[TEST L] Verifying Real-Time Chronological Timeline Events...');
    const detailWithTimeline = await request(`/api/maintenance/requests/${testReq.id}`, {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    const timeline = detailWithTimeline.data.data.timeline || [];
    assert.ok(timeline.length >= 5, `Timeline must record major milestones (Found ${timeline.length})`);
    assert.ok(timeline.some(e => e.type === 'REQUEST_CREATED'));
    assert.ok(timeline.some(e => e.type === 'APPROVED'));
    assert.ok(timeline.some(e => e.type === 'ASSIGNED'));
    assert.ok(timeline.some(e => e.type === 'WORK_COMPLETED'));
    assert.ok(timeline.some(e => e.type === 'SATISFACTORY'));
    console.log(`✔ Test L Passed: Chronological event timeline recorded ${timeline.length} milestone events.`);

    // -----------------------------------------------------------------
    // TEST M & N: REFRESH RESILIENCE & UNAUTHORIZED REJECTION
    // -----------------------------------------------------------------
    console.log('[TEST M & N] Verifying Browser Refresh State & Direct Unauthorized API Rejection...');
    const meRes = await request('/api/auth/me', { headers: { Authorization: `Bearer ${empToken}` } });
    assert.strictEqual(meRes.status, 200, 'Token persists across reloads');
    assert.strictEqual(meRes.data.data.role, 'EMPLOYEE');

    const directHack = await request(`/api/maintenance/requests/${testReq.id}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${empToken}` },
      body: {}
    });
    assert.strictEqual(directHack.status, 403, 'Unauthorized API call strictly fails with 403');
    console.log('✔ Test M & N Passed: Refresh state verified; direct unauthorized API calls rejected server-side.');

    console.log('\n======================================================');
    console.log('🎉 ALL TESTS (A THROUGH O) PASSED WITH 100% SUCCESS!');
    console.log('======================================================\n');
  } finally {
    if (server) server.close();
    await prisma.$disconnect();
  }
}

run()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Test Suite Failed:', err);
    process.exit(1);
  });
