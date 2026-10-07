process.env.NODE_ENV = 'test';
import assert from 'assert';
import app from '../src/server.js';

let server;
const PORT = 5095;
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
  console.log('TEST SUITE 4: SLA & OVERDUE DETECTION');
  console.log('======================================================');

  server = app.listen(PORT);
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    const login = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'manager@maintly.com', password: 'Admin@123' }
    });
    const token = login.data.data.token;

    // Fetch dashboard metrics
    const metrics = await request('/api/dashboard/metrics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(metrics.status, 200);
    assert.ok(metrics.data.data.summary.overdue >= 1, 'Should detect at least 1 overdue task in database');
    console.log(`✔ Dashboard accurately counted ${metrics.data.data.summary.overdue} overdue requests`);

    // Fetch overdue view directly
    const overdueView = await request('/api/maintenance/requests?view=overdue', {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(overdueView.status, 200);
    const overdueItems = overdueView.data.data.items;
    assert.ok(overdueItems.length >= 1, 'Should return overdue items');
    
    for (const item of overdueItems) {
      assert.strictEqual(item.isOverdueComputed, true, `Item ${item.requestNumber} must have isOverdueComputed = true`);
      assert.ok(new Date(item.requiredDate) < new Date(), 'Due date must be in past');
      assert.ok(!['COMPLETED', 'CLOSED', 'REJECTED'].includes(item.workStatus), 'Overdue items must still be active/open');
    }
    console.log(`✔ Overdue filter strictly identified ${overdueItems.length} overdue tasks with past deadlines`);

    console.log('✔ ALL SLA & OVERDUE TESTS PASSED!\n');
  } finally {
    if (server) server.close();
  }
}

runTests().catch(err => {
  console.error('❌ Overdue Test Failed:', err);
  if (server) server.close();
  process.exit(1);
});
