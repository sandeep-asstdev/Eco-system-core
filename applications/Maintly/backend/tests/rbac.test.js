process.env.NODE_ENV = 'test';
import assert from 'assert';
import app from '../src/server.js';

let server;
const PORT = 5097;
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
  console.log('TEST SUITE 2: ROLE-BASED ACCESS CONTROL (RBAC)');
  console.log('======================================================');

  server = app.listen(PORT);
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    // 1. Unauthenticated request should fail
    const unauth = await request('/api/maintenance/requests');
    assert.strictEqual(unauth.status, 401, 'Unauthenticated request must return 401');
    console.log('✔ Unauthenticated request rejected with 401');

    // 2. Login as Employee
    const empLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'employee@maintly.com', password: 'Admin@123' }
    });
    const empToken = empLogin.data.data.token;

    // 3. Login as Approver
    const approverLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'approver@maintly.com', password: 'Admin@123' }
    });
    const approverToken = approverLogin.data.data.token;

    // 4. Fetch a pending request
    const pendingReqs = await request('/api/maintenance/requests?workStatus=PENDING_APPROVAL', {
      headers: { Authorization: `Bearer ${approverToken}` }
    });
    const targetRequestId = pendingReqs.data.data.items[0]?.id;
    assert.ok(targetRequestId, 'Should find at least one pending approval request');

    // 5. Employee attempts to approve -> MUST FAIL with 403 Forbidden
    const forbiddenApprove = await request(`/api/maintenance/requests/${targetRequestId}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${empToken}` },
      body: { remarks: 'Illegal approval attempt by employee' }
    });
    assert.strictEqual(forbiddenApprove.status, 403, 'Employee approving request must return 403 Forbidden');
    console.log('✔ Employee prohibited from approving requests (403 Forbidden)');

    // 6. Approver approves -> MUST SUCCEED with 200 OK
    const allowedApprove = await request(`/api/maintenance/requests/${targetRequestId}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${approverToken}` },
      body: { remarks: 'Authorized approval by branch approver' }
    });
    assert.strictEqual(allowedApprove.status, 200, 'Approver approving request must return 200 OK');
    assert.strictEqual(allowedApprove.data.data.approvalStatus, 'APPROVED');
    console.log('✔ Authorized approver successfully approved request (200 OK)');

    console.log('✔ ALL RBAC TESTS PASSED!\n');
    process.exit(0);
  } finally {
    if (server) server.close();
  }
}

runTests().catch(err => {
  console.error('❌ RBAC Test Failed:', err);
  if (server) server.close();
  process.exit(1);
});
