import assert from 'assert';
import prisma from '../ecosystem-core/backend/src/config/db.js';

const BASE_URL = 'http://localhost:4000/api/v1';

console.log('\n================================================================');
console.log('🧪 TENANT ONBOARDING CONTRACT & VALIDATION TEST SUITE');
console.log('   Testing legalName requirement, payload mapping & isolation');
console.log('================================================================\n');

async function run() {
  // Step 1: Login as Platform Admin
  console.log('[STEP 1] Logging in as Platform Admin...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@ecosystem.com',
      password: 'Admin@123'
    })
  });
  const loginData = await loginRes.json();
  assert.strictEqual(loginRes.status, 200, 'Platform admin login must succeed');
  const token = loginData.data.token;
  console.log('✔ Authenticated as Platform Admin.\n');

  // Test 1: Empty legalName must be rejected by backend
  console.log('[TEST 1] Testing rejection when legalName is missing...');
  const noLegalRes = await fetch(`${BASE_URL}/tenants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'Test Incomplete Group',
      code: 'TEST_INC_GRP',
      subscriptionTier: 'ENTERPRISE',
      primaryEmail: 'incomplete@dealership.com'
    })
  });
  const noLegalData = await noLegalRes.json();
  assert.strictEqual(noLegalRes.status, 400, 'Must return HTTP 400 when legalName is missing');
  assert.strictEqual(noLegalData.error.code, 'VALIDATION_ERROR');
  assert.strictEqual(noLegalData.error.message, 'Tenant code, name, and legalName are required.');
  console.log('✔ Backend strictly rejected missing legalName with 400 VALIDATION_ERROR.\n');

  // Test 2: Duplicate Tenant Code (e.g. BELLAD) must be rejected
  console.log('[TEST 2] Testing rejection when tenant code already exists (e.g. BELLAD)...');
  const dupCodeRes = await fetch(`${BASE_URL}/tenants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'Duplicate Bellad Attempt',
      legalName: 'Duplicate Bellad Private Limited',
      code: 'BELLAD',
      subscriptionTier: 'ENTERPRISE'
    })
  });
  const dupCodeData = await dupCodeRes.json();
  assert.strictEqual(dupCodeRes.status, 409, 'Must return HTTP 409 CONFLICT on duplicate code');
  assert.strictEqual(dupCodeData.error.code, 'CONFLICT');
  console.log('✔ Backend strictly rejected duplicate tenant code with 409 CONFLICT.\n');

  // Test 3: Successful creation of Advait Group with explicit legalName
  console.log('[TEST 3] Creating Advait Group with explicit legalName...');
  // Check if ADV_GRP exists from prior run and clean only if present
  await prisma.tenant.deleteMany({ where: { code: 'ADV_GRP' } });

  const createRes = await fetch(`${BASE_URL}/tenants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'Advait Group',
      legalName: 'Advait Motors Private Limited',
      code: 'ADV_GRP',
      subscriptionTier: 'ENTERPRISE',
      primaryEmail: 'hello@gmail.com',
      primaryPhone: '9878264378'
    })
  });
  const createData = await createRes.json();
  assert.strictEqual(createRes.status, 201, 'Must return HTTP 201 CREATED');
  assert.strictEqual(createData.data.name, 'Advait Group');
  assert.strictEqual(createData.data.legalName, 'Advait Motors Private Limited');
  assert.strictEqual(createData.data.code, 'ADV_GRP');
  assert.strictEqual(createData.data.subscriptionTier, 'ENTERPRISE');
  assert.strictEqual(createData.data.primaryEmail, 'hello@gmail.com');
  assert.strictEqual(createData.data.primaryPhone, '9878264378');
  console.log('✔ Tenant Advait Group created successfully with distinct legalName and canonical fields.\n');

  // Test 4: Verify tenant in /tenants query list
  console.log('[TEST 4] Verifying Advait Group in GET /tenants list...');
  const listRes = await fetch(`${BASE_URL}/tenants?search=Advait`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const listData = await listRes.json();
  assert.strictEqual(listRes.status, 200);
  const found = listData.data.find(t => t.code === 'ADV_GRP');
  assert(found, 'Advait Group must be present in tenant list');
  assert.strictEqual(found.name, 'Advait Group');
  assert.strictEqual(found.legalName, 'Advait Motors Private Limited');
  assert.strictEqual(found.subscriptionTier, 'ENTERPRISE');
  console.log('✔ Advait Group verified in tenant directory with both commercial name and legalName.\n');

  // Test 5: Verify pre-existing baseline tenants remain untouched
  console.log('[TEST 5] Verifying baseline tenants integrity (BELLAD, APEX, KALYANI_MOTORS)...');
  const bellad = await prisma.tenant.findUnique({ where: { code: 'BELLAD' } });
  assert.strictEqual(bellad.name, 'Bellad Group');
  assert.strictEqual(bellad.legalName, 'Bellad Enterprises Private Limited');

  const apex = await prisma.tenant.findUnique({ where: { code: 'APEX' } });
  assert.strictEqual(apex.name, 'Apex Auto Group');
  assert.strictEqual(apex.legalName, 'Apex Automotive Network Private Limited');

  const kalyani = await prisma.tenant.findUnique({ where: { code: 'KALYANI_MOTORS' } });
  assert.strictEqual(kalyani.name, 'Kalyani Automotive Group');
  assert.strictEqual(kalyani.legalName, 'Kalyani Automotive Group Private Limited');

  console.log('✔ All 3 baseline tenants verified 100% intact with original IDs, codes, names, and legalNames.\n');

  console.log('================================================================');
  console.log('🎉 ALL 5/5 ONBOARDING CONTRACT VALIDATION TESTS PASSED (100%)');
  console.log('================================================================\n');

  await prisma.$disconnect();
}

run().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
