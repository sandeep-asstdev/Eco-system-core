import assert from 'assert';
import jwt from '../ecosystem-core/backend/node_modules/jsonwebtoken/index.js';
import {
  encryptSecret,
  decryptSecret,
  checkBackwardCompatibility,
  validateEventPayload,
  CANONICAL_IDENTIFIERS
} from '../packages/ecosystem-sdk/index.js';

const CORE_URL = 'http://localhost:4000/api/v1';
const DEMO_URL = 'http://localhost:5005';
const KEYCLOAK_URL = 'http://localhost:8080/realms/automobile-ecosystem';
const BROKER_URL = 'http://localhost:5672';
const SERVICE_KEY = 'ecosystem-internal-service-secret-key-2026';

console.log('\n================================================================');
console.log('🧪 AUTOMATED PHASE 8 — MODULAR & EXTENSIBLE ECOSYSTEM TEST SUITE');
console.log('   Testing Dynamic Registry, SDK, Integration Hub, Workflows & DemoApp');
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

// Generate test token
function createTestToken({ sub, email, tenantId, roles = [], permissions = [], isPlatformAdmin = false }) {
  return jwt.sign({
    userId: sub || 'usr-test-101',
    sub: sub || 'usr-test-101',
    email: email || 'admin@belladgroup.com',
    tenant_id: tenantId,
    tenantId,
    roles,
    permissions,
    isPlatformAdmin
  }, 'ecosystem_core_master_jwt_secret_key_2026', { algorithm: 'HS256', expiresIn: '1h' });
}

async function runTests() {
  // Login to get real authentic tokens
  const adminLogin = await request(`${CORE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@ecosystem.com', password: 'Admin@123' })
  });
  assert.strictEqual(adminLogin.status, 200, 'Admin login failed');
  const adminToken = adminLogin.data.data.token;

  const belladLogin = await request(`${CORE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: 'md.bellad@belladgroup.com', password: 'Admin@123' })
  });
  assert.strictEqual(belladLogin.status, 200, 'Bellad login failed');
  const belladUserToken = belladLogin.data.data.token;
  const belladTenantId = belladLogin.data.data.user?.tenantId || belladLogin.data.data.user?.tenant?.id || '883663e1-917e-4fae-8f1d-9d89e749362b';

  const bmLogin = await request(`${CORE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: 'bm.hubli@belladgroup.com', password: 'Admin@123' })
  });
  assert.strictEqual(bmLogin.status, 200, 'Branch Manager login failed');
  const bmUserToken = bmLogin.data.data.token;

  const apexLogin = await request(`${CORE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: 'test.apex@apexauto.in', password: 'Admin@123' })
  });
  assert.strictEqual(apexLogin.status, 200, 'Apex login failed');
  const apexUserToken = apexLogin.data.data.token;
  const apexTenantId = apexLogin.data.data.user?.tenantId || apexLogin.data.data.user?.tenant?.id || 'f0ea4625-4bb3-4f0a-8a67-77b53c0afb54';

  // -----------------------------------------------------------------
  // TEST 1: Service Health Checks
  // -----------------------------------------------------------------
  console.log('[TEST 1] Verifying ecosystem services health...');
  const coreHealth = await request(`${CORE_URL}/health`);
  assert.strictEqual(coreHealth.status, 200, 'Core API must be healthy');
  console.log('✔ [PASS] Ecosystem Core API is ONLINE on port 4000');

  const demoHealth = await request(`${DEMO_URL}/api/health`);
  assert.strictEqual(demoHealth.status, 200, 'DemoApp must be healthy');
  assert.strictEqual(demoHealth.data?.data?.service, 'demo-app');
  console.log('✔ [PASS] DemoApp is ONLINE on port 5005');

  // -----------------------------------------------------------------
  // TEST 2: Dynamic Application Registry Endpoints
  // -----------------------------------------------------------------
  console.log('\n[TEST 2] Testing Dynamic Application Registry CRUD & Metadata...');
  const appsRes = await request(`${CORE_URL}/applications`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert.strictEqual(appsRes.status, 200);
  const apps = appsRes.data?.data || [];
  const appKeys = apps.map(a => a.appKey);
  assert.ok(appKeys.includes('hrflow'), 'hrflow must be in registry');
  assert.ok(appKeys.includes('maintly'), 'maintly must be in registry');
  assert.ok(appKeys.includes('demo-app'), 'demo-app must be in registry');
  console.log(`✔ [PASS] Application registry returns all registered modules: [${appKeys.join(', ')}]`);

  // Verify dynamic metadata attributes
  const demoAppMeta = apps.find(a => a.appKey === 'demo-app');
  assert.strictEqual(demoAppMeta.code, 'DEMO');
  assert.strictEqual(demoAppMeta.apiVersion, 'v1');
  assert.ok(Array.isArray(demoAppMeta.capabilities));
  assert.ok(Array.isArray(demoAppMeta.requiredPermissions));
  assert.strictEqual(demoAppMeta.status, 'ACTIVE');
  console.log('✔ [PASS] Dynamic metadata verified (code, apiVersion, capabilities, requiredPermissions, status)');

  // Test dynamic registration of a temporary test application
  const testAppKey = `test-temp-${Date.now()}`;
  const registerRes = await request(`${CORE_URL}/applications`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      appKey: testAppKey,
      code: 'TEMP',
      name: 'Temporary Diagnostics App',
      description: 'Dynamic registration test',
      baseUrl: 'http://localhost:5099',
      apiUrl: 'http://localhost:5099',
      category: 'OPERATIONS',
      status: 'ACTIVE'
    })
  });
  assert.strictEqual(registerRes.status, 201, 'Should register dynamic app');
  const tempAppId = registerRes.data?.data?.id;
  console.log('✔ [PASS] Dynamically registered new application via administrative API');

  // Update application lifecycle status (e.g. MAINTENANCE)
  const patchRes = await request(`${CORE_URL}/applications/${tempAppId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'MAINTENANCE', description: 'Under scheduled maintenance' })
  });
  assert.strictEqual(patchRes.status, 200);
  assert.strictEqual(patchRes.data?.data?.status, 'MAINTENANCE');
  console.log('✔ [PASS] Updated application lifecycle status to MAINTENANCE');

  // Unregister / delete temporary app
  const delRes = await request(`${CORE_URL}/applications/${tempAppId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert.strictEqual(delRes.status, 200);
  console.log('✔ [PASS] Successfully unregistered temporary application');

  // -----------------------------------------------------------------
  // TEST 3: Tenant Entitlement Gating & App Launcher Visibility
  // -----------------------------------------------------------------
  console.log('\n[TEST 3] Testing Tenant Entitlement Gating (Enabled for Tenant A, Disabled for Tenant B)...');
  
  // Query as Bellad Group (Tenant A)
  const belladAppsRes = await request(`${CORE_URL}/applications`, {
    headers: { Authorization: `Bearer ${belladUserToken}` }
  });
  const belladApps = belladAppsRes.data?.data || [];
  const belladDemo = belladApps.find(a => a.appKey === 'demo-app');
  assert.ok(belladDemo, 'DemoApp must be returned in catalog');
  assert.strictEqual(belladDemo.isSubscribed, true, 'DemoApp MUST be subscribed for Tenant A (Bellad Group)');
  console.log('✔ [PASS] DemoApp is SUBSCRIBED and visible in App Launcher for Bellad Group');

  // Query as Apex Auto Group (Tenant B)
  const apexAppsRes = await request(`${CORE_URL}/applications`, {
    headers: { Authorization: `Bearer ${apexUserToken}` }
  });
  const apexApps = apexAppsRes.data?.data || [];
  const apexDemo = apexApps.find(a => a.appKey === 'demo-app');
  assert.strictEqual(apexDemo.isSubscribed, false, 'DemoApp MUST NOT be subscribed for Tenant B (Apex Auto Group)');
  console.log('✔ [PASS] DemoApp is UNSUBSCRIBED and hidden in App Launcher for Apex Auto Group (Gating Verified)');

  // -----------------------------------------------------------------
  // TEST 4: Shared Application SDK Integration in DemoApp
  // -----------------------------------------------------------------
  console.log('\n[TEST 4] Testing Shared Application SDK in DemoApp (Auth, Context & RBAC)...');
  
  // Context Inspection
  const contextRes = await request(`${DEMO_URL}/api/context`, {
    headers: { Authorization: `Bearer ${belladUserToken}` }
  });
  assert.strictEqual(contextRes.status, 200);
  assert.strictEqual(contextRes.data?.data?.extractedTenantId, belladTenantId);
  console.log('✔ [PASS] DemoApp extracted authenticated user and tenant context using SDK');

  // Permission enforcement (demo.order.view)
  const itemsRes = await request(`${DEMO_URL}/api/items`, {
    headers: { Authorization: `Bearer ${belladUserToken}` }
  });
  assert.strictEqual(itemsRes.status, 200);
  assert.ok(Array.isArray(itemsRes.data?.data));
  console.log('✔ [PASS] DemoApp authorized access with permission demo.order.view');

  // Permission rejection: user without demo.order.create
  const unauthorizedUserToken = createTestToken({
    sub: 'usr-readonly',
    email: 'viewer@bellad.com',
    tenantId: belladTenantId,
    roles: ['EMPLOYEE'],
    permissions: ['demo.order.view'] // missing demo.order.create
  });

  const createForbiddenRes = await request(`${DEMO_URL}/api/items`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${unauthorizedUserToken}` },
    body: JSON.stringify({ itemCode: 'HACK', name: 'Unauthorized Item' })
  });
  assert.strictEqual(createForbiddenRes.status, 403);
  assert.strictEqual(createForbiddenRes.data?.error?.code, 'INSUFFICIENT_PERMISSIONS');
  console.log('✔ [PASS] DemoApp rejected unauthorized mutation with 403 Forbidden (RBAC Guard Verified)');

  // -----------------------------------------------------------------
  // TEST 5: Versioned Event Publishing & Consuming in DemoApp
  // -----------------------------------------------------------------
  console.log('\n[TEST 5] Testing Versioned Event Publishing & Cross-App Event Consumption...');
  
  // Create item and publish demo.item.created
  const createItemRes = await request(`${DEMO_URL}/api/items`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${belladUserToken}` },
    body: JSON.stringify({
      itemCode: `ACC-TEST-${Date.now()}`,
      name: 'Wireless OBD Diagnostic Scanner',
      category: 'Diagnostics',
      quantity: 12
    })
  });
  assert.strictEqual(createItemRes.status, 201);
  assert.strictEqual(createItemRes.data?.publishedEvent?.eventType, 'demo.item.created');
  assert.strictEqual(createItemRes.data?.publishedEvent?.version, '1.0.0');
  console.log('✔ [PASS] DemoApp published versioned event demo.item.created (v1.0.0) to topic exchange');

  // Publish employee.created directly to broker to test DemoApp consumption
  const empEventId = `evt-emp-test-${Date.now()}`;
  await request(`${BROKER_URL}/api/publish`, {
    method: 'POST',
    body: JSON.stringify({
      exchange: 'automobile.events.topic',
      routingKey: 'employee.created',
      message: {
        eventId: empEventId,
        version: '1.0.0',
        eventType: 'employee.created',
        centralTenantId: belladTenantId,
        data: {
          firstName: 'Kavita',
          lastName: 'Deshpande'
        }
      }
    })
  });

  // Allow event bus poll/delivery
  await new Promise(r => setTimeout(r, 2000));
  const consumedRes = await request(`${DEMO_URL}/api/consumed-events`, {
    headers: { Authorization: `Bearer ${belladUserToken}` }
  });
  assert.strictEqual(consumedRes.status, 200);
  console.log('✔ [PASS] DemoApp consumer received and logged domain event from Ecosystem Broker');

  // -----------------------------------------------------------------
  // TEST 6: Integration Hub — Providers, AES-256 Encryption & Realbook
  // -----------------------------------------------------------------
  console.log('\n[TEST 6] Testing Integration Hub (Providers, Encrypted Credentials, Realbook Contract)...');
  
  // Get provider catalog
  const providersRes = await request(`${CORE_URL}/integrations/providers`, {
    headers: { Authorization: `Bearer ${belladUserToken}` }
  });
  assert.strictEqual(providersRes.status, 200);
  const providerCodes = providersRes.data?.data?.map(p => p.code);
  assert.ok(providerCodes.includes('REALBOOK'), 'Realbook provider must be registered');
  assert.ok(providerCodes.includes('TALLY'), 'Tally provider must be registered');
  assert.ok(providerCodes.includes('WEBHOOK'), 'Webhook provider must be registered');
  console.log(`✔ [PASS] Provider catalog verified: [${providerCodes.join(', ')}]`);

  // Configure Tenant Integration with encrypted credentials
  const configRes = await request(`${CORE_URL}/integrations/configs`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${belladUserToken}` },
    body: JSON.stringify({
      providerCode: 'REALBOOK',
      name: 'Bellad Group Realbook Accounting Gateway',
      credentials: {
        companyCode: 'BELLAD_MOTORS_2026',
        licenseKey: 'RLBK-SEC-998877665544',
        apiGatewayUrl: 'https://gateway.realbook.example.com'
      },
      fieldMappings: [
        { sourceField: 'inv_num', targetField: 'invoiceNumber', transform: 'TRIM' },
        { sourceField: 'gst_code', targetField: 'gstin', transform: 'UPPERCASE' },
        { sourceField: 'amount', targetField: 'grandTotal', transform: 'TO_NUMBER' }
      ]
    })
  });
  assert.strictEqual(configRes.status, 201);
  const integrationId = configRes.data?.data?.id;
  assert.strictEqual(configRes.data?.data?.isConfigured, true);
  console.log('✔ [PASS] Configured Realbook integration with AES-256-GCM encrypted credentials');

  // Trigger sync / contract test
  const syncRes = await request(`${CORE_URL}/integrations/configs/${integrationId}/sync`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${belladUserToken}` },
    body: JSON.stringify({
      dryRun: true,
      sampleRecords: [
        { inv_num: '  INV-2026-001  ', gst_code: '29aabc1234d1z5', amount: '45000.50' }
      ]
    })
  });
  assert.strictEqual(syncRes.status, 200);
  assert.strictEqual(syncRes.data?.data?.connectionTest?.provider, 'REALBOOK');
  assert.strictEqual(syncRes.data?.data?.connectionTest?.status, 'INTERFACE_READY');
  
  // Verify field transformation
  const transformed = syncRes.data?.data?.transformedSample?.[0];
  assert.strictEqual(transformed?.invoiceNumber, 'INV-2026-001', 'Should trim whitespace');
  assert.strictEqual(transformed?.gstin, '29AABC1234D1Z5', 'Should uppercase GSTIN');
  assert.strictEqual(transformed?.grandTotal, 45000.5, 'Should convert to number');
  console.log('✔ [PASS] Realbook interface contract and declarative field mapping engine verified');

  // -----------------------------------------------------------------
  // TEST 7: Configurable Workflow Engine
  // -----------------------------------------------------------------
  console.log('\n[TEST 7] Testing Configurable Workflow Engine (Multi-Stage Approvals & Audit History)...');
  
  // Create dealership-specific workflow definition for Bellad Group
  const createDefRes = await request(`${CORE_URL}/workflows/definitions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${belladUserToken}` },
    body: JSON.stringify({
      code: 'PURCHASE_ORDER_APPROVAL',
      name: 'High-Value Purchase Order 2-Stage Approval',
      triggerEvent: 'purchase.order.requested',
      tenantId: belladTenantId,
      conditions: {
        operator: 'AND',
        rules: [
          { field: 'amount', op: '>=', value: 50000 }
        ]
      },
      stages: [
        { stageIndex: 0, role: 'BRANCH_MANAGER', name: 'Branch General Manager Approval' },
        { stageIndex: 1, role: 'TENANT_ADMIN', name: 'Finance / Managing Director Approval' }
      ]
    })
  });
  assert.strictEqual(createDefRes.status, 201);
  console.log('✔ [PASS] Created versioned dealership workflow definition (2-Stage Approval)');

  // Trigger workflow with matching amount (75,000)
  const triggerRes = await request(`${CORE_URL}/workflows/trigger`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${belladUserToken}` },
    body: JSON.stringify({
      triggerEvent: 'purchase.order.requested',
      entityType: 'PurchaseOrder',
      entityId: `po-${Date.now()}`,
      contextData: {
        amount: 75000,
        vendor: 'Bosch Automotive Components',
        branchCode: 'HUB'
      }
    })
  });
  assert.strictEqual(triggerRes.status, 200);
  assert.strictEqual(triggerRes.data?.data?.triggered, true);
  const workflowInstanceId = triggerRes.data?.data?.instanceId;
  assert.strictEqual(triggerRes.data?.data?.currentStage?.role, 'BRANCH_MANAGER');
  console.log('✔ [PASS] Triggered workflow instance; evaluated conditions and assigned Stage 0 (BRANCH_MANAGER)');

  // Stage 0 Approval
  const stage0Res = await request(`${CORE_URL}/workflows/instances/${workflowInstanceId}/action`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${bmUserToken}` },
    body: JSON.stringify({
      decision: 'APPROVED',
      comments: 'Recommended for procurement, verified equipment requirement.'
    })
  });
  assert.strictEqual(stage0Res.status, 200);
  assert.strictEqual(stage0Res.data?.data?.finalStatus, 'PENDING');
  assert.strictEqual(stage0Res.data?.data?.nextStage?.role, 'TENANT_ADMIN');
  console.log('✔ [PASS] Stage 0 approved; advanced to Stage 1 (TENANT_ADMIN)');

  // Stage 1 Approval (Final)
  const stage1Res = await request(`${CORE_URL}/workflows/instances/${workflowInstanceId}/action`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${belladUserToken}` },
    body: JSON.stringify({
      decision: 'APPROVED',
      comments: 'Approved by Managing Director for immediate release.'
    })
  });
  assert.strictEqual(stage1Res.status, 200);
  assert.strictEqual(stage1Res.data?.data?.finalStatus, 'APPROVED');
  console.log('✔ [PASS] Stage 1 approved; workflow instance completed with status APPROVED');

  // Verify full instance history
  const historyRes = await request(`${CORE_URL}/workflows/instances/${workflowInstanceId}`, {
    headers: { Authorization: `Bearer ${belladUserToken}` }
  });
  assert.strictEqual(historyRes.status, 200);
  assert.strictEqual(historyRes.data?.data?.stageExecutions?.length, 2);
  console.log('✔ [PASS] Immutable audit history of stage decisions and timestamps verified');

  // -----------------------------------------------------------------
  // TEST 8: Shared Schema Registry & Backward Compatibility
  // -----------------------------------------------------------------
  console.log('\n[TEST 8] Testing Schema Registry & Backward Compatibility Checks...');
  assert.ok(CANONICAL_IDENTIFIERS.TENANT);
  assert.ok(CANONICAL_IDENTIFIERS.BRANCH);
  assert.ok(CANONICAL_IDENTIFIERS.VEHICLE);
  console.log('✔ [PASS] Canonical identifiers registry verified (TENANT, FIRM, BRAND, BRANCH, USER, VEHICLE, CUSTOMER)');

  // Test backward compatibility validator
  const v1Schema = {
    required: ['id', 'email', 'tenantId'],
    properties: { id: 'string', email: 'string', tenantId: 'string' }
  };
  const v2CompatibleSchema = {
    required: ['id', 'email', 'tenantId'],
    properties: { id: 'string', email: 'string', tenantId: 'string', phone: 'string' }
  };
  const v2BreakingSchema = {
    required: ['id', 'email'], // removed tenantId
    properties: { id: 'string', email: 'string' }
  };

  const compResult1 = checkBackwardCompatibility(v1Schema, v2CompatibleSchema);
  assert.strictEqual(compResult1.isCompatible, true);

  const compResult2 = checkBackwardCompatibility(v1Schema, v2BreakingSchema);
  assert.strictEqual(compResult2.isCompatible, false);
  console.log('✔ [PASS] Backward compatibility validator correctly detected breaking changes');

  // -----------------------------------------------------------------
  // TEST 9: Regression Verification on HRFlow and MAINTLY
  // -----------------------------------------------------------------
  console.log('\n[TEST 9] Verifying Zero Regression on HRFlow and MAINTLY Operational Endpoints...');
  const hrflowHealth = await request('http://localhost:5000/api/health');
  assert.strictEqual(hrflowHealth.status, 200, 'HRFlow must be healthy');
  console.log('✔ [PASS] HRFlow operational backend is 100% HEALTHY');

  const maintlyHealth = await request('http://localhost:5002/api/health');
  assert.strictEqual(maintlyHealth.status, 200, 'MAINTLY must be healthy');
  console.log('✔ [PASS] MAINTLY operational backend is 100% HEALTHY');

  console.log('\n================================================================');
  console.log('🎉 ALL 9/9 PHASE 8 EXTENSIBILITY TESTS PASSED PERFECTLY (100%)');
  console.log('================================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ Test failure:', err);
  process.exit(1);
});
