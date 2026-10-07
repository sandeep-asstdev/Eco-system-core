process.env.NODE_ENV = 'test';
import assert from 'assert';
import http from 'http';
import app from '../src/server.js';

let server;
const PORT = 5098;
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = options.headers || {};
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

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
  console.log('TEST SUITE 1: STRICT MULTI-TENANT ISOLATION');
  console.log('======================================================');

  server = app.listen(PORT);
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    // 1. Log in as Apex Tenant Admin
    const apexLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'tenantadmin@maintly.com', password: 'Admin@123' }
    });
    assert.strictEqual(apexLogin.status, 200, 'Apex login should succeed');
    const apexToken = apexLogin.data.data.token;
    const apexTenantId = apexLogin.data.data.user.tenantId;

    // 2. Log in as OmniLogistics Tenant Admin (Tenant B)
    const omniLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@omnilogistics.com', password: 'Admin@123' }
    });
    assert.strictEqual(omniLogin.status, 200, 'Omni login should succeed');
    const omniToken = omniLogin.data.data.token;
    const omniTenantId = omniLogin.data.data.user.tenantId;

    assert.notStrictEqual(apexTenantId, omniTenantId, 'Tenants must have distinct IDs');
    console.log(`✔ Verified distinct tenant IDs: Apex (${apexTenantId}) vs Omni (${omniTenantId})`);

    // 3. Apex user fetches maintenance requests
    const apexRequests = await request('/api/maintenance/requests', {
      headers: { Authorization: `Bearer ${apexToken}` }
    });
    assert.strictEqual(apexRequests.status, 200);
    const apexItems = apexRequests.data.data.items;
    
    // Ensure every single item belongs to Apex tenant
    for (const req of apexItems) {
      assert.strictEqual(req.tenantId, apexTenantId, `Request ${req.requestNumber} must belong to Apex tenant`);
      assert.doesNotMatch(req.subject, /Omni/i, 'Apex requests must not contain Omni confidential tasks');
    }
    console.log(`✔ Apex tenant fetched ${apexItems.length} requests - ZERO cross-tenant leakage`);

    // 4. Omni user fetches maintenance requests
    const omniRequests = await request('/api/maintenance/requests', {
      headers: { Authorization: `Bearer ${omniToken}` }
    });
    assert.strictEqual(omniRequests.status, 200);
    const omniItems = omniRequests.data.data.items;
    for (const req of omniItems) {
      assert.strictEqual(req.tenantId, omniTenantId, `Omni request must belong to Omni tenant`);
    }
    console.log(`✔ Omni tenant fetched ${omniItems.length} requests - isolated properly`);

    // 5. Cross-tenant direct resource access attack:
    // Apex attempts to fetch an Omni request ID directly
    const omniRequestId = omniItems[0]?.id;
    if (omniRequestId) {
      const hackAttempt = await request(`/api/maintenance/requests/${omniRequestId}`, {
        headers: { Authorization: `Bearer ${apexToken}` }
      });
      assert.strictEqual(hackAttempt.status, 404, 'Direct fetch across tenant boundary must return 404 Not Found');
      console.log('✔ Direct ID access across tenant boundary blocked with 404');
    }

    console.log('✔ ALL TENANT ISOLATION TESTS PASSED!\n');
    process.exit(0);
  } finally {
    if (server) server.close();
  }
}

runTests().catch(err => {
  console.error('❌ Tenant Isolation Test Failed:', err);
  if (server) server.close();
  process.exit(1);
});
