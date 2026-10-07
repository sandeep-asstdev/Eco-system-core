process.env.NODE_ENV = 'test';
import assert from 'assert';
import app from '../src/server.js';

let server;
const PORT = 5096;
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = options.headers || {};
  if (options.body) headers['Content-Type'] = 'application/json';

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runTests() {
  console.log('\n======================================================');
  console.log('TEST SUITE 3: END-TO-END WORKFLOW LIFECYCLE');
  console.log('======================================================');

  server = app.listen(PORT);
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    // 1. Logins
    const empLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'employee@maintly.com', password: 'Admin@123' }
    });
    const empToken = empLogin.data.data.token;

    const approverLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'approver@maintly.com', password: 'Admin@123' }
    });
    const approverToken = approverLogin.data.data.token;

    const managerLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'manager@maintly.com', password: 'Admin@123' }
    });
    const managerToken = managerLogin.data.data.token;

    const techLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'tech@maintly.com', password: 'Admin@123' }
    });
    const techToken = techLogin.data.data.token;
    const techId = techLogin.data.data.user.id;

    // Fetch master data to create request
    const typesRes = await request('/api/maintenance/types', {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    const typeId = typesRes.data.data[0].id;

    const branchesRes = await request('/api/org/branches', {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    const branch = branchesRes.data.data[0];

    const deptsRes = await request('/api/org/departments', {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    const deptId = deptsRes.data.data[0].id;

    // STEP 1: Employee creates a new request
    const createRes = await request('/api/maintenance/requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${empToken}` },
      body: {
        brandId: branch.brandId,
        branchId: branch.id,
        departmentId: deptId,
        maintenanceTypeId: typeId,
        priority: 'HIGH',
        location: 'Bay 1 Alignment Area',
        subject: 'Air hose compressor regulator whistling loudly',
        description: 'Pneumatic air regulator seal leaking compressed air during tyre inflation.',
        requiredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedCost: 1200
      }
    });

    assert.strictEqual(createRes.status, 201);
    const requestId = createRes.data.data.id;
    assert.strictEqual(createRes.data.data.workStatus, 'PENDING_APPROVAL');
    console.log(`✔ Step 1: Request created [${createRes.data.data.requestNumber}] in state PENDING_APPROVAL`);

    // STEP 2: Approver approves request
    const approveRes = await request(`/api/maintenance/requests/${requestId}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${approverToken}` },
      body: { remarks: 'Approved for urgent technician assignment.' }
    });
    assert.strictEqual(approveRes.status, 200);
    assert.strictEqual(approveRes.data.data.workStatus, 'APPROVED');
    console.log('✔ Step 2: Request approved by Approver');

    // STEP 3: Manager assigns technician
    const assignRes = await request(`/api/maintenance/requests/${requestId}/assign`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${managerToken}` },
      body: { assignedToId: techId, notes: 'Replace O-ring seal or regulator valve.' }
    });
    assert.strictEqual(assignRes.status, 200);
    assert.strictEqual(assignRes.data.data.workStatus, 'ASSIGNED');
    console.log('✔ Step 3: Request assigned to Technician');

    // STEP 4: Technician updates to IN_PROGRESS and logs materials
    const wipRes = await request(`/api/maintenance/requests/${requestId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${techToken}` },
      body: { workStatus: 'IN_PROGRESS', remarks: 'Work started, dismantled air regulator.' }
    });
    assert.strictEqual(wipRes.status, 200);
    assert.strictEqual(wipRes.data.data.workStatus, 'IN_PROGRESS');

    const materialRes = await request(`/api/maintenance/requests/${requestId}/materials`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${techToken}` },
      body: { materialName: 'Nitrile O-Ring 24mm', quantity: 2, unit: 'pcs', unitCost: 150 }
    });
    assert.strictEqual(materialRes.status, 201);
    console.log('✔ Step 4: Technician updated status to IN_PROGRESS and logged parts');

    // STEP 5: Technician marks COMPLETED
    const completeRes = await request(`/api/maintenance/requests/${requestId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${techToken}` },
      body: {
        workStatus: 'COMPLETED',
        completionRemarks: 'O-rings replaced and pressure tested at 120 PSI. No whistling noise.'
      }
    });
    assert.strictEqual(completeRes.status, 200);
    assert.strictEqual(completeRes.data.data.workStatus, 'COMPLETED');
    console.log('✔ Step 5: Technician completed work');

    // STEP 6: Requester marks DISSATISFIED -> triggers REOPENED workflow
    const dissatRes = await request(`/api/maintenance/requests/${requestId}/satisfaction`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${empToken}` },
      body: {
        satisfaction: 'DISSATISFIED',
        reason: 'Slight hiss heard when pressure exceeds 100 PSI.',
        comment: 'Please check the brass quick-coupler thread.'
      }
    });
    assert.strictEqual(dissatRes.status, 200);
    assert.strictEqual(dissatRes.data.data.workStatus, 'REOPENED');
    assert.strictEqual(dissatRes.data.data.isDissatisfied, true);
    console.log('✔ Step 6: Marked DISSATISFIED -> correctly transitioned to REOPENED');

    // STEP 7: Technician rectifies and re-completes
    await request(`/api/maintenance/requests/${requestId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${techToken}` },
      body: { workStatus: 'COMPLETED', completionRemarks: 'Applied PTFE teflon tape on quick-coupler threads. 100% leak free.' }
    });

    // STEP 8: Requester confirms SATISFIED -> transitions to CLOSED
    const closeRes = await request(`/api/maintenance/requests/${requestId}/satisfaction`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${empToken}` },
      body: { satisfaction: 'SATISFIED', comment: 'Tested thoroughly. Excellent job!' }
    });
    assert.strictEqual(closeRes.status, 200);
    assert.strictEqual(closeRes.data.data.workStatus, 'CLOSED');
    console.log('✔ Step 8: Confirmed SATISFIED -> transitioned to CLOSED');

    console.log('✔ FULL END-TO-END WORKFLOW TEST PASSED!\n');
    process.exit(0);
  } finally {
    if (server) server.close();
  }
}

runTests().catch(err => {
  console.error('❌ Workflow Test Failed:', err);
  if (server) server.close();
  process.exit(1);
});
