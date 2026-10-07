import assert from 'assert';

const CORE_URL = 'http://localhost:4000/api/v1';
const HRFLOW_URL = 'http://localhost:5000/api';
const MAINTLY_URL = 'http://localhost:5002/api';

const INTERNAL_KEY = 'ecosystem-internal-service-sync-key';

console.log('\n================================================================');
console.log('🔒 INTERNAL SERVICE CALLER AUTHORIZATION & SECURITY TEST SUITE');
console.log('   Verifying caller authorization for internal sync and lookup');
console.log('================================================================\n');

async function httpRequest(url, method = 'GET', body = null, headers = {}) {
  const reqHeaders = { 'Content-Type': 'application/json', ...headers };
  const opts = { method, headers: reqHeaders };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    data = null;
  }
  return { status: res.status, data };
}

async function run() {
  // Step 1: Obtain Platform Admin token from Core
  console.log('[STEP 1] Logging in as Platform Admin (admin@ecosystem.com)...');
  const adminLogin = await httpRequest(`${CORE_URL}/auth/login`, 'POST', {
    email: 'admin@ecosystem.com',
    password: 'Admin@123'
  });
  assert.strictEqual(adminLogin.status, 200, 'Platform admin login must succeed');
  const platformAdminToken = adminLogin.data.data.token;
  console.log('✔ Platform Admin authenticated.\n');

  // Step 2: Obtain normal tenant user token (Trident Dealership Admin)
  console.log('[STEP 2] Logging in as normal tenant user (admin@tridentgroup.in)...');
  const tenantLogin = await httpRequest(`${CORE_URL}/auth/login`, 'POST', {
    email: 'admin@tridentgroup.in',
    password: 'Admin@123'
  });
  assert.strictEqual(tenantLogin.status, 200, 'Trident tenant user login must succeed');
  const tenantUserToken = tenantLogin.data.data.token;
  const tridentTenantId = tenantLogin.data.data.tenant.id;
  console.log(`✔ Normal tenant user authenticated (Tenant ID: ${tridentTenantId}).\n`);

  // Step 3: Obtain normal employee token from HRFlow demo-switch
  console.log('[STEP 3] Obtaining normal HR employee token (emp.priya@hrflow.com)...');
  const hrEmployeeLogin = await httpRequest(`${HRFLOW_URL}/auth/demo-switch`, 'POST', {
    demoRole: 'EMP_PRIYA'
  });
  assert.strictEqual(hrEmployeeLogin.status, 200, 'HR employee demo switch must succeed');
  const hrEmployeeToken = hrEmployeeLogin.data.data.token;
  console.log('✔ Normal HR employee token obtained.\n');

  // -------------------------------------------------------------------------
  // CHECK A: Internal service key → tenant sync = ALLOWED (200)
  // -------------------------------------------------------------------------
  console.log('[CHECK A.1] Internal Service -> HRFlow POST /api/internal/tenants/sync...');
  const hrInternalSync = await httpRequest(
    `${HRFLOW_URL}/internal/tenants/sync`,
    'POST',
    {
      id: tridentTenantId,
      code: 'TRIDENT',
      name: 'Trident Automotive Group',
      legalName: 'Trident Automobiles Private Limited',
      status: 'ACTIVE'
    },
    { 'X-Internal-Service-Key': INTERNAL_KEY }
  );
  assert.strictEqual(hrInternalSync.status, 200, 'Internal service key must be allowed on HRFlow sync');
  assert.strictEqual(hrInternalSync.data.success, true);
  console.log('✔ HRFlow internal sync allowed for internal service.\n');

  console.log('[CHECK A.2] Internal Service -> MAINTLY POST /api/internal/tenants/sync...');
  const maintInternalSync = await httpRequest(
    `${MAINTLY_URL}/internal/tenants/sync`,
    'POST',
    {
      id: tridentTenantId,
      code: 'TRIDENT',
      name: 'Trident Automotive Group',
      slug: 'trident',
      status: 'ACTIVE'
    },
    { 'X-Internal-Service-Key': INTERNAL_KEY }
  );
  assert.strictEqual(maintInternalSync.status, 200, 'Internal service key must be allowed on MAINTLY sync');
  assert.strictEqual(maintInternalSync.data.success, true);
  console.log('✔ MAINTLY internal sync allowed for internal service.\n');

  console.log('[CHECK A.3] Internal Service -> Core GET /api/v1/internal/tenants/:id...');
  const coreInternalLookup = await httpRequest(
    `${CORE_URL}/internal/tenants/${tridentTenantId}`,
    'GET',
    null,
    { 'X-Internal-Service-Key': INTERNAL_KEY }
  );
  assert.strictEqual(coreInternalLookup.status, 200, 'Internal service key must be allowed on Core internal tenant lookup');
  assert.strictEqual(coreInternalLookup.data.data.code, 'TRIDENT');
  console.log('✔ Core internal tenant lookup allowed for internal service.\n');

  console.log('[CHECK A.4] Internal Service -> Core GET /api/v1/internal/tenants/:id/subscription...');
  const coreInternalSub = await httpRequest(
    `${CORE_URL}/internal/tenants/${tridentTenantId}/subscription?appKey=hrflow`,
    'GET',
    null,
    { 'X-Internal-Service-Key': INTERNAL_KEY }
  );
  assert.strictEqual(coreInternalSub.status, 200, 'Internal service key must be allowed on Core subscription lookup');
  assert.strictEqual(coreInternalSub.data.isSubscribed, true);
  console.log('✔ Core internal subscription lookup allowed for internal service.\n');

  // -------------------------------------------------------------------------
  // CHECK B: Platform Admin → allowed (200)
  // -------------------------------------------------------------------------
  console.log('[CHECK B.1] Platform Admin -> HRFlow POST /api/internal/tenants/sync...');
  const hrAdminSync = await httpRequest(
    `${HRFLOW_URL}/internal/tenants/sync`,
    'POST',
    {
      id: tridentTenantId,
      code: 'TRIDENT',
      name: 'Trident Automotive Group',
      legalName: 'Trident Automobiles Private Limited',
      status: 'ACTIVE'
    },
    { Authorization: `Bearer ${platformAdminToken}` }
  );
  assert.strictEqual(hrAdminSync.status, 200, 'Platform admin must be allowed on HRFlow sync');
  console.log('✔ HRFlow internal sync allowed for Platform Admin.\n');

  console.log('[CHECK B.2] Platform Admin -> MAINTLY POST /api/internal/tenants/sync...');
  const maintAdminSync = await httpRequest(
    `${MAINTLY_URL}/internal/tenants/sync`,
    'POST',
    {
      id: tridentTenantId,
      code: 'TRIDENT',
      name: 'Trident Automotive Group',
      slug: 'trident',
      status: 'ACTIVE'
    },
    { Authorization: `Bearer ${platformAdminToken}` }
  );
  assert.strictEqual(maintAdminSync.status, 200, 'Platform admin must be allowed on MAINTLY sync');
  console.log('✔ MAINTLY internal sync allowed for Platform Admin.\n');

  console.log('[CHECK B.3] Platform Admin -> Core GET /api/v1/internal/tenants/:id...');
  const coreAdminLookup = await httpRequest(
    `${CORE_URL}/internal/tenants/${tridentTenantId}`,
    'GET',
    null,
    { Authorization: `Bearer ${platformAdminToken}` }
  );
  assert.strictEqual(coreAdminLookup.status, 200, 'Platform admin must be allowed on Core internal tenant lookup');
  console.log('✔ Core internal tenant lookup allowed for Platform Admin.\n');

  console.log('[CHECK B.4] Platform Admin -> Core GET /api/v1/internal/tenants/:id/subscription...');
  const coreAdminSub = await httpRequest(
    `${CORE_URL}/internal/tenants/${tridentTenantId}/subscription?appKey=maintly`,
    'GET',
    null,
    { Authorization: `Bearer ${platformAdminToken}` }
  );
  assert.strictEqual(coreAdminSub.status, 200, 'Platform admin must be allowed on Core subscription lookup');
  console.log('✔ Core internal subscription lookup allowed for Platform Admin.\n');

  // -------------------------------------------------------------------------
  // CHECK C: Normal tenant employee / user → tenant sync = 403 Forbidden
  // -------------------------------------------------------------------------
  console.log('[CHECK C.1] Normal tenant user -> HRFlow POST /api/internal/tenants/sync (must return 403)...');
  const hrForbiddenSync1 = await httpRequest(
    `${HRFLOW_URL}/internal/tenants/sync`,
    'POST',
    { id: tridentTenantId, code: 'TRIDENT' },
    { Authorization: `Bearer ${tenantUserToken}` }
  );
  assert.strictEqual(hrForbiddenSync1.status, 403, 'Normal tenant user token must receive 403 on HRFlow sync');
  console.log(`✔ HRFlow rejected normal tenant user with HTTP 403 (${JSON.stringify(hrForbiddenSync1.data?.error || hrForbiddenSync1.data?.message)}).\n`);

  console.log('[CHECK C.2] Normal HR employee -> HRFlow POST /api/internal/tenants/sync (must return 403)...');
  const hrForbiddenSync2 = await httpRequest(
    `${HRFLOW_URL}/internal/tenants/sync`,
    'POST',
    { id: tridentTenantId, code: 'TRIDENT' },
    { Authorization: `Bearer ${hrEmployeeToken}` }
  );
  assert.strictEqual(hrForbiddenSync2.status, 403, 'Normal HR employee token must receive 403 on HRFlow sync');
  console.log(`✔ HRFlow rejected normal HR employee with HTTP 403 (${JSON.stringify(hrForbiddenSync2.data?.error || hrForbiddenSync2.data?.message)}).\n`);

  console.log('[CHECK C.3] Normal tenant user -> MAINTLY POST /api/internal/tenants/sync (must return 403)...');
  const maintForbiddenSync1 = await httpRequest(
    `${MAINTLY_URL}/internal/tenants/sync`,
    'POST',
    { id: tridentTenantId, code: 'TRIDENT' },
    { Authorization: `Bearer ${tenantUserToken}` }
  );
  assert.strictEqual(maintForbiddenSync1.status, 403, 'Normal tenant user token must receive 403 on MAINTLY sync');
  console.log(`✔ MAINTLY rejected normal tenant user with HTTP 403 (${JSON.stringify(maintForbiddenSync1.data?.message)}).\n`);

  // -------------------------------------------------------------------------
  // CHECK D: Normal tenant user → internal Core tenant lookup = 403 Forbidden
  // -------------------------------------------------------------------------
  console.log('[CHECK D.1] Normal tenant user -> Core GET /api/v1/internal/tenants/:id (must return 403)...');
  const coreForbiddenLookup = await httpRequest(
    `${CORE_URL}/internal/tenants/${tridentTenantId}`,
    'GET',
    null,
    { Authorization: `Bearer ${tenantUserToken}` }
  );
  assert.strictEqual(coreForbiddenLookup.status, 403, 'Normal tenant user token must receive 403 on Core internal tenant lookup');
  console.log(`✔ Core rejected normal tenant user internal tenant lookup with HTTP 403 (${JSON.stringify(coreForbiddenLookup.data?.error)}).\n`);

  console.log('[CHECK D.2] Normal tenant user -> Core GET /api/v1/internal/tenants/BELLAD (must return 403)...');
  const coreForbiddenArbitraryLookup = await httpRequest(
    `${CORE_URL}/internal/tenants/BELLAD`,
    'GET',
    null,
    { Authorization: `Bearer ${tenantUserToken}` }
  );
  assert.strictEqual(coreForbiddenArbitraryLookup.status, 403, 'Normal tenant user token must receive 403 on arbitrary tenant lookup');
  console.log(`✔ Core rejected arbitrary internal tenant query with HTTP 403 (${JSON.stringify(coreForbiddenArbitraryLookup.data?.error)}).\n`);

  // -------------------------------------------------------------------------
  // CHECK E: Normal tenant user → internal Core subscription lookup = 403 Forbidden
  // -------------------------------------------------------------------------
  console.log('[CHECK E.1] Normal tenant user -> Core GET /api/v1/internal/tenants/:id/subscription (must return 403)...');
  const coreForbiddenSub = await httpRequest(
    `${CORE_URL}/internal/tenants/${tridentTenantId}/subscription?appKey=hrflow`,
    'GET',
    null,
    { Authorization: `Bearer ${tenantUserToken}` }
  );
  assert.strictEqual(coreForbiddenSub.status, 403, 'Normal tenant user token must receive 403 on Core subscription lookup');
  console.log(`✔ Core rejected normal tenant user internal subscription lookup with HTTP 403 (${JSON.stringify(coreForbiddenSub.data?.error)}).\n`);

  // -------------------------------------------------------------------------
  // CHECK F: Existing Centralized Onboarding contract & validation still works
  // -------------------------------------------------------------------------
  console.log('[CHECK F] Verifying Centralized Onboarding contract validations on Core...');
  const emptyNameAttempt = await httpRequest(
    `${CORE_URL}/tenants`,
    'POST',
    {},
    { Authorization: `Bearer ${platformAdminToken}` }
  );
  assert.strictEqual(emptyNameAttempt.status, 400, 'Must enforce tenant name is required');
  assert.strictEqual(emptyNameAttempt.data.error.code, 'VALIDATION_ERROR');

  const missingLegalNameAttempt = await httpRequest(
    `${CORE_URL}/tenants`,
    'POST',
    { name: 'Some Dealer Group', code: 'SOME_DEALER_GRP' },
    { Authorization: `Bearer ${platformAdminToken}` }
  );
  assert.strictEqual(missingLegalNameAttempt.status, 400, 'Must enforce legalName is required when code is provided');
  assert.strictEqual(missingLegalNameAttempt.data.error.code, 'VALIDATION_ERROR');

  const duplicateCodeAttempt = await httpRequest(
    `${CORE_URL}/tenants`,
    'POST',
    { name: 'Duplicate Bellad', legalName: 'Duplicate Bellad Ltd', code: 'BELLAD' },
    { Authorization: `Bearer ${platformAdminToken}` }
  );
  assert.strictEqual(duplicateCodeAttempt.status, 409, 'Must reject duplicate dealership code with 409 CONFLICT');

  const unauthorizedCreateAttempt = await httpRequest(
    `${CORE_URL}/tenants`,
    'POST',
    { name: 'Unauthorized Create', legalName: 'Unauthorized Ltd', code: 'UNAUTH_TEST' },
    { Authorization: `Bearer ${tenantUserToken}` }
  );
  assert.strictEqual(unauthorizedCreateAttempt.status, 403, 'Normal tenant user must not be able to create tenants on Core');

  const readTenantsList = await httpRequest(
    `${CORE_URL}/tenants?search=TRIDENT`,
    'GET',
    null,
    { Authorization: `Bearer ${platformAdminToken}` }
  );
  assert.strictEqual(readTenantsList.status, 200, 'Platform admin must be able to list tenants');
  assert.ok(readTenantsList.data.data.some(t => t.code === 'TRIDENT'), 'Existing TRIDENT tenant must be present in tenant list');
  console.log('✔ Centralized Onboarding contracts, uniqueness, access control, and tenant listing work as expected.\n');

  // -------------------------------------------------------------------------
  // CHECK G: HRFlow independent onboarding remains disabled
  // -------------------------------------------------------------------------
  console.log('[CHECK G] Verifying HRFlow independent onboarding endpoints remain disabled...');
  const hrTenantCreate = await httpRequest(
    `${HRFLOW_URL}/tenants`,
    'POST',
    { organizationName: 'Illegal Dealer', code: 'ILLEGAL' },
    { Authorization: `Bearer ${platformAdminToken}` }
  );
  assert.strictEqual(hrTenantCreate.status, 403, 'HRFlow POST /api/tenants must return 403');
  assert.strictEqual(hrTenantCreate.data.error.code, 'TENANT_ONBOARDING_CENTRALIZED');

  const hrRegister = await httpRequest(
    `${HRFLOW_URL}/auth/register`,
    'POST',
    { email: 'illegal@dealer.com', code: 'ILLEGAL' }
  );
  assert.strictEqual(hrRegister.status, 403, 'HRFlow POST /api/auth/register must return 403');
  assert.strictEqual(hrRegister.data.error.code, 'CENTRAL_AUTHENTICATION_REQUIRED');
  console.log('✔ HRFlow independent dealership creation and signup remain strictly disabled (403).\n');

  // -------------------------------------------------------------------------
  // CHECK H: MAINTLY independent onboarding remains disabled
  // -------------------------------------------------------------------------
  console.log('[CHECK H] Verifying MAINTLY independent onboarding endpoints remain disabled...');
  const maintTenantCreate = await httpRequest(
    `${MAINTLY_URL}/org/tenants`,
    'POST',
    { name: 'Illegal Dealer', code: 'ILLEGAL', slug: 'illegal' },
    { Authorization: `Bearer ${platformAdminToken}` }
  );
  assert.strictEqual(maintTenantCreate.status, 403, 'MAINTLY POST /api/org/tenants must return 403');
  assert.strictEqual(maintTenantCreate.data.error.code, 'TENANT_ONBOARDING_CENTRALIZED');
  console.log('✔ MAINTLY independent dealership creation remains strictly disabled (403).\n');

  // -------------------------------------------------------------------------
  // CHECK I: Cross-tenant isolation still passes
  // -------------------------------------------------------------------------
  console.log('[CHECK I] Verifying cross-tenant isolation enforcement...');
  // Normal tenant user trying to read other tenant's details on Core
  const belladTenantRes = await httpRequest(
    `${CORE_URL}/tenants?search=BELLAD`,
    'GET',
    null,
    { Authorization: `Bearer ${platformAdminToken}` }
  );
  const belladTenantId = belladTenantRes.data.data[0].id;

  const crossTenantCore = await httpRequest(
    `${CORE_URL}/tenants/${belladTenantId}`,
    'GET',
    null,
    { Authorization: `Bearer ${tenantUserToken}` }
  );
  assert.strictEqual(crossTenantCore.status, 403, 'Tenant user reading other tenant must return 403');
  assert.strictEqual(crossTenantCore.data.error.code, 'FORBIDDEN');
  console.log('✔ Cross-tenant access strictly prevented with HTTP 403.\n');

  // -------------------------------------------------------------------------
  // FINAL CONFIRMATION
  // -------------------------------------------------------------------------
  console.log('================================================================');
  console.log('🎉 ALL INTERNAL SERVICE & ACCESS CONTROL CHECKS PASSED!');
  console.log('   - Internal Service authentication verified');
  console.log('   - Platform Admin caller privileges verified');
  console.log('   - Normal tenant employee / user 403 Forbidden verified');
  console.log('   - Central onboarding contracts intact');
  console.log('   - Independent onboarding disabled');
  console.log('   - Cross-tenant isolation enforced');
  console.log('================================================================\n');
}

run().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
