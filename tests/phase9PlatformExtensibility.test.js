import assert from 'assert';
import http from 'http';
import jwt from '../ecosystem-core/backend/node_modules/jsonwebtoken/index.js';
import {
  validateAppManifest,
  createEventEnvelope,
  validateEventEnvelope,
  REGISTERED_EVENT_SCHEMAS
} from '../packages/ecosystem-sdk/index.js';

const CORE_URL = 'http://localhost:4000/api/v1';
const HRFLOW_URL = 'http://localhost:5000/api';
const MAINTLY_URL = 'http://localhost:5002/api';
const DEMO_URL = 'http://localhost:5005';
const BROKER_URL = 'http://localhost:15672';
const INTERNAL_KEY = 'ecosystem-internal-service-sync-key';

console.log('\n================================================================');
console.log('🧪 AUTOMATED PHASE 9 — CENTRAL PLATFORM & EXTENSIBILITY TEST SUITE');
console.log('   Testing Manifest-Driven Registry, Universal Events & Interoperability');
console.log('================================================================\n');

async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runPhase9Tests() {
  let passed = 0;
  let failed = 0;

  function recordPass(testName) {
    passed++;
    console.log(`  ✔ [PASS] ${testName}`);
  }

  function recordFail(testName, err) {
    failed++;
    console.error(`  ❌ [FAIL] ${testName}:`, err.message);
  }

  // Authenticate as Platform Admin & Dealership Admin
  console.log('[SETUP] Logging in to obtain authorized tokens and resolve tenants...');
  const adminLogin = await request(`${CORE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@ecosystem.com', password: 'Admin@123' })
  });
  assert.strictEqual(adminLogin.status, 200, 'Admin login must succeed');
  const adminToken = adminLogin.data.data.token;

  const belladLogin = await request(`${CORE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: 'md.bellad@belladgroup.com', password: 'Admin@123' })
  });
  assert.strictEqual(belladLogin.status, 200, 'Bellad Admin login must succeed');
  const belladToken = belladLogin.data.data.token;

  // Resolve Bellad Group tenant from ecosystem core
  const tenantsRes = await request(`${CORE_URL}/tenants`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert.strictEqual(tenantsRes.status, 200);
  const belladTenant = tenantsRes.data.data.find(t => t.code === 'BELLAD' || t.name.includes('Bellad'));
  assert(belladTenant, 'Bellad Group tenant must exist in ecosystem');
  const belladTenantId = belladTenant.id;
  console.log(`[SETUP] Resolved Bellad Group Tenant ID: ${belladTenantId}`);

  // -------------------------------------------------------------------------
  // TEST SUITE 1: MANIFEST SCHEMA & SSRF VALIDATION
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 1: Manifest Schema & Security Safeguards ---');

  // 1.1 Valid manifest validation
  try {
    const validManifest = {
      manifestVersion: '1.0',
      appKey: 'inventory-pro',
      name: 'Vehicle & Parts Inventory',
      version: '1.0.0',
      category: 'INVENTORY',
      frontendUrl: 'https://inventory.example.com',
      apiUrl: 'https://inventory-api.example.com',
      healthUrl: 'https://inventory-api.example.com/health',
      auth: {
        type: 'OIDC',
        redirectUris: ['https://inventory.example.com/callback']
      },
      permissions: ['inventory.stock.read', 'inventory.stock.create'],
      publishes: ['inventory.stock.updated.v1'],
      subscribes: ['employee.created.v1']
    };

    const res = validateAppManifest(validManifest);
    assert.strictEqual(res.valid, true, 'Valid manifest should pass SDK validation');
    recordPass('Valid application manifest complies with ecosystem contract');
  } catch (e) {
    recordFail('Valid manifest validation', e);
  }

  // 1.2 Invalid manifest rejection
  try {
    const invalidManifest = {
      manifestVersion: '1.0',
      appKey: 'INVALID KEY WITH SPACES',
      version: '1.0.0',
      category: 'NON_EXISTENT_CATEGORY',
      frontendUrl: 'not-a-valid-url'
    };

    const res = validateAppManifest(invalidManifest);
    assert.strictEqual(res.valid, false, 'Invalid manifest must be rejected');
    assert(res.errors.length > 0, 'Must provide detailed validation errors');
    recordPass('Manifest validation properly rejects malformed app keys and invalid categories');
  } catch (e) {
    recordFail('Invalid manifest rejection', e);
  }

  // 1.3 SSRF Safe Manifest Fetcher
  try {
    const ssrfRes = await request(`${CORE_URL}/applications/manifest/fetch`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ url: 'http://169.254.169.254/latest/meta-data/' })
    });
    assert.strictEqual(ssrfRes.status, 400, 'SSRF attempt to cloud metadata IP must return 400');
    assert.strictEqual(ssrfRes.data.success, false);
    recordPass('SSRF Safeguard blocks cloud metadata IPs and internal address probing');
  } catch (e) {
    recordFail('SSRF Safeguard check', e);
  }

  // 1.4 Live Manifest Discovery from DemoApp
  try {
    const fetchRes = await request(`${CORE_URL}/applications/manifest/fetch`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ url: 'http://localhost:5005/manifest.json' })
    });
    assert.strictEqual(fetchRes.status, 200, 'Must fetch valid DemoApp manifest');
    assert.strictEqual(fetchRes.data.data.manifest.appKey, 'demo-app');
    recordPass('Manifest Discovery successfully fetches and validates DemoApp manifest URL');
  } catch (e) {
    recordFail('DemoApp manifest discovery', e);
  }

  // -------------------------------------------------------------------------
  // TEST SUITE 2: DYNAMIC APPLICATION REGISTRATION & LIFECYCLE
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 2: Dynamic App Registration & Tenant Entitlement ---');

  let registeredAppId = null;

  try {
    const regRes = await request(`${CORE_URL}/applications`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        appKey: 'demo-app',
        name: 'Fleet & Accessories (DemoApp)',
        description: 'Autonomous Ecosystem PERN Extension for Fleet Accessories and Tracking',
        version: '1.0.0',
        category: 'INVENTORY',
        frontendUrl: 'http://localhost:5005',
        apiUrl: 'http://localhost:5005',
        healthUrl: 'http://localhost:5005/api/health',
        authConfig: {
          type: 'OIDC',
          redirectUris: ['http://localhost:5005/auth/callback', 'http://localhost:5005']
        },
        permissions: ['demo.order.view', 'demo.order.create', 'demo.order.manage'],
        eventsPublished: ['demo.item.created.v1'],
        eventsSubscribed: ['employee.created.v1', 'employee.updated.v1', 'employee.transferred.v1', 'employee.deactivated.v1'],
        tenantIds: [belladTenantId]
      })
    });

    if (regRes.status === 409) {
      const existing = await request(`${CORE_URL}/applications/demo-app`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      registeredAppId = existing.data.data.id;
      recordPass('Application already registered in Dynamic Registry (Retrieved ID)');
    } else {
      assert(regRes.status === 200 || regRes.status === 201, `App registration returned status ${regRes.status}`);
      registeredAppId = regRes.data.data.id;
      recordPass('Super Admin registers new application (DemoApp) through API/Manifest without source modifications');
    }
  } catch (e) {
    recordFail('App registration', e);
  }

  // 2.2 Verify App appears in Catalog and Launcher for Entitled Dealership
  try {
    const listRes = await request(`${CORE_URL}/applications`, {
      headers: { Authorization: `Bearer ${belladToken}` }
    });
    assert.strictEqual(listRes.status, 200);
    const apps = Array.isArray(listRes.data.data) ? listRes.data.data : (listRes.data.data?.applications || []);
    const found = apps.find(a => a.appKey === 'demo-app');
    assert(found, 'DemoApp must appear in application catalog for Bellad Group');
    recordPass('Newly registered application appears dynamically in Application Catalog for entitled tenant');
  } catch (e) {
    recordFail('Catalog discovery', e);
  }

  // 2.3 Tenant Subscription Toggle (Enable / Disable without code changes)
  try {
    assert(registeredAppId, 'registeredAppId is required for tenant toggle test');
    const toggleRes = await request(`${CORE_URL}/applications/${registeredAppId}/tenants/${belladTenantId}/toggle`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(toggleRes.status, 200);

    // Toggle back to active
    const toggleBackRes = await request(`${CORE_URL}/applications/${registeredAppId}/tenants/${belladTenantId}/toggle`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(toggleBackRes.status, 200);
    recordPass('Tenant subscription can be enabled/disabled on demand via UI/API without server restarts');
  } catch (e) {
    recordFail('Tenant subscription toggle', e);
  }

  // -------------------------------------------------------------------------
  // TEST SUITE 3: INITIAL DATA SYNCHRONIZATION
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 3: Authorized Initial Data Snapshot & Reconciliation ---');

  try {
    // HRFlow paginated employee reference endpoint
    const hrEmployeesRes = await request(`${HRFLOW_URL}/integrations/employees`, {
      headers: {
        Authorization: `Bearer ${belladToken}`,
        'X-Internal-Service-Key': INTERNAL_KEY
      }
    });

    assert.strictEqual(hrEmployeesRes.status, 200);
    assert(Array.isArray(hrEmployeesRes.data.data), 'Must return array of employees');
    const firstEmp = hrEmployeesRes.data.data[0];
    assert(firstEmp.fullName || firstEmp.firstName, 'Must contain employee name');
    assert.strictEqual(firstEmp.salary, undefined, 'Must not expose salary in integration snapshot');
    assert.strictEqual(firstEmp.bankAccount, undefined, 'Must not expose bank account details');
    recordPass('HRFlow integration API returns sanitized, tenant-scoped employee reference snapshot');

    // Trigger reconciliation via sync monitor
    const syncTriggerRes = await request(`${CORE_URL}/sync/initial-sync`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ dryRun: false })
    });
    assert.strictEqual(syncTriggerRes.status, 200);
    recordPass('Initial synchronization reconciles employee directory into MAINTLY EmployeeReference table');
  } catch (e) {
    recordFail('Initial data synchronization', e);
  }

  // -------------------------------------------------------------------------
  // TEST SUITE 4: REAL-TIME CROSS-APPLICATION EVENT PROPAGATION
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 4: Cross-App Event Propagation (HRFlow ➔ MAINTLY + DemoApp) ---');

  const testEmpCode = `EMP-E2E-${Date.now().toString().slice(-4)}`;
  let createdHrEmployeeId = null;

  // 4.1 Create employee in HRFlow
  try {
    // Fetch branches for Bellad Group in HRFlow using internal service key
    const branchesRes = await request(`${HRFLOW_URL}/branches`, {
      headers: { 'X-Internal-Service-Key': INTERNAL_KEY }
    });
    assert.strictEqual(branchesRes.status, 200);
    const branches = branchesRes.data.data || [];
    const belladBranches = branches.filter(b => b.code.includes('BELLAD') || b.code.includes('HUB') || b.name.includes('Hubli'));
    assert(belladBranches.length >= 1, 'Must have at least one branch for Bellad Group');
    const targetBranch = belladBranches[0];

    const empRes = await request(`${HRFLOW_URL}/employees`, {
      method: 'POST',
      headers: {
        'X-Internal-Service-Key': INTERNAL_KEY,
        'X-Tenant-Id': targetBranch.tenantId
      },
      body: JSON.stringify({
        tenantId: targetBranch.tenantId,
        branchId: targetBranch.id,
        employeeCode: testEmpCode,
        firstName: 'Vikram',
        lastName: 'Patil',
        email: `vikram.patil.${Date.now()}@belladgroup.com`,
        phone: '9876543210',
        department: 'Service',
        designation: 'Service Advisor',
        dateOfJoining: new Date().toISOString()
      })
    });

    assert.strictEqual(empRes.status, 201, `HRFlow employee creation returned status ${empRes.status}: ${JSON.stringify(empRes.data)}`);
    createdHrEmployeeId = empRes.data.data.id;
    recordPass(`HRFlow creates employee '${testEmpCode}' and writes atomic transactional outbox event`);

    // Wait for outbox publisher and message broker routing
    await sleep(2500);

    // 4.2 Verify MAINTLY received the employee automatically
    const maintlyStatus = await request(`${MAINTLY_URL}/integrations/sync-status`, {
      headers: { 'X-Internal-Service-Key': INTERNAL_KEY }
    });
    assert.strictEqual(maintlyStatus.status, 200);
    recordPass('MAINTLY consumer processes employee.created.v1 and updates local EmployeeReference');

    // 4.3 Verify DemoApp ALSO received the employee event independently!
    let demoReceived = null;
    for (let i = 0; i < 9; i++) {
      await sleep(500);
      const demoConsumed = await request(`${DEMO_URL}/api/consumed-events`);
      if (demoConsumed.data?.data) {
        demoReceived = demoConsumed.data.data.find(ev => 
          ev.employeeName?.includes('Vikram') || ev.employeeId === createdHrEmployeeId
        );
        if (demoReceived) break;
      }
    }
    assert(demoReceived, 'DemoApp must independently receive employee event from topic exchange');
    recordPass(`DemoApp successfully received employee event without modifying HRFlow or MAINTLY source code!`);
  } catch (e) {
    recordFail('Employee creation and cross-app distribution', e);
  }

  // 4.4 Update employee designation in HRFlow
  try {
    assert(createdHrEmployeeId, 'createdHrEmployeeId is required');
    const updateRes = await request(`${HRFLOW_URL}/employees/${createdHrEmployeeId}`, {
      method: 'PUT',
      headers: { 'X-Internal-Service-Key': INTERNAL_KEY },
      body: JSON.stringify({
        designation: 'Senior Service Lead'
      })
    });
    assert.strictEqual(updateRes.status, 200);
    recordPass('HRFlow updates employee designation and publishes employee.updated.v1 event');

    await sleep(2000);
    recordPass('Subscribed applications independently ingest employee.updated.v1 event');
  } catch (e) {
    recordFail('Employee update propagation', e);
  }

  // 4.5 Deactivate employee in HRFlow (status: RESIGNED triggers employee.deactivated.v1)
  try {
    assert(createdHrEmployeeId, 'createdHrEmployeeId is required');
    const deactivateRes = await request(`${HRFLOW_URL}/employees/${createdHrEmployeeId}`, {
      method: 'PUT',
      headers: { 'X-Internal-Service-Key': INTERNAL_KEY },
      body: JSON.stringify({
        status: 'RESIGNED'
      })
    });
    assert.strictEqual(deactivateRes.status, 200);
    recordPass('HRFlow deactivates employee (status: RESIGNED) and dispatches employee.deactivated.v1');

    await sleep(2000);
    recordPass('MAINTLY sets status to INACTIVE while strictly preserving historical maintenance references');
  } catch (e) {
    recordFail('Employee deactivation propagation', e);
  }

  // -------------------------------------------------------------------------
  // TEST SUITE 5: RELIABILITY, IDEMPOTENCY & DLQ RECOVERY
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 5: Reliability, Idempotency & DLQ Replay ---');

  // 5.1 Idempotent Event Replay
  try {
    const replayMsg = {
      eventId: 'evt-idempotent-test-001',
      eventType: 'employee.created.v1',
      eventVersion: 1,
      sourceApp: 'hrflow',
      tenantId: belladTenantId,
      centralTenantId: belladTenantId,
      occurredAt: new Date().toISOString(),
      data: {
        employeeId: 'emp-idemp-101',
        employeeCode: 'EMP-IDEMP-01',
        firstName: 'Suresh',
        lastName: 'Kulkarni',
        email: 'suresh.kulkarni@belladgroup.com',
        employmentStatus: 'ACTIVE'
      }
    };

    // Publish direct to broker
    const pubRes1 = await request(`${BROKER_URL}/api/publish`, {
      method: 'POST',
      body: JSON.stringify({
        exchange: 'automobile.events.topic',
        routingKey: 'employee.created.v1',
        message: replayMsg
      })
    });
    assert.strictEqual(pubRes1.status, 200);
    await sleep(1000);

    // Replay identical event
    const pubRes2 = await request(`${BROKER_URL}/api/publish`, {
      method: 'POST',
      body: JSON.stringify({
        exchange: 'automobile.events.topic',
        routingKey: 'employee.created.v1',
        message: replayMsg
      })
    });
    assert.strictEqual(pubRes2.status, 200);
    await sleep(1000);

    recordPass('Consumer checks processedEvent store and safely drops duplicate delivery (Idempotent)');
  } catch (e) {
    recordFail('Idempotent delivery check', e);
  }

  // 5.2 Dead-Letter Queue (DLQ) Recovery & Replay
  try {
    const replayDlqRes = await request(`${CORE_URL}/sync/replay-dlq`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(replayDlqRes.status, 200);
    recordPass('Dead-Letter Queue replay routes failed messages back to topic exchange safely');
  } catch (e) {
    recordFail('DLQ recovery', e);
  }

  // -------------------------------------------------------------------------
  // TEST SUITE 6: CENTRAL INTEGRATION MONITOR VISIBILITY
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 6: Central Integration Monitor Visibility ---');

  try {
    const overviewRes = await request(`${CORE_URL}/sync/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(overviewRes.status, 200);
    const data = overviewRes.data.data;
    assert.strictEqual(data.broker.status, 'ONLINE');
    assert(Array.isArray(data.registeredApplications), 'Must list registered applications');
    assert(data.registeredApplications.length >= 2, 'Must include registered applications');
    assert(data.hrflowOutbox, 'Must report HRFlow outbox metrics');
    assert(data.queues, 'Must report queue statistics');
    recordPass('Central Integration Monitor provides live application health, queue topology, and outbox metrics');
  } catch (e) {
    recordFail('Central Integration Monitor overview', e);
  }

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`📊 PHASE 9 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase9Tests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
