import http from 'http';
import prisma from '../src/config/db.js';

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('\n================================================================');
  console.log('🏢 REAL-WORLD DEALERSHIP ONBOARDING & ENTRY VERIFICATION SUITE');
  console.log('================================================================\n');

  try {
    // [TEST 1] Advait Group Admin Login & Dashboard Token
    console.log('[TEST 1] Verifying Advait Group direct login as Tenant Administrator...');
    const loginRes = await request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'hello@gmail.com', password: 'Admin@123' });

    if (loginRes.status !== 200 || !loginRes.data?.data?.token) {
      throw new Error(`Advait login failed with status ${loginRes.status}: ${JSON.stringify(loginRes.data)}`);
    }
    const advaitToken = loginRes.data.data.token;
    const advaitTenant = loginRes.data.data.tenant;
    const advaitRoles = loginRes.data.data.roles;
    if (advaitTenant.code !== 'ADV_GRP' || advaitTenant.name !== 'Advait Group') {
      throw new Error(`Expected Advait Group tenant, got: ${JSON.stringify(advaitTenant)}`);
    }
    const hasTenantAdminRole = advaitRoles.some(r => r.roleCode === 'TENANT_ADMIN');
    if (!hasTenantAdminRole) {
      throw new Error(`Expected TENANT_ADMIN role for Advait Admin, got: ${JSON.stringify(advaitRoles)}`);
    }
    console.log(`✔ Advait Admin authenticated successfully (Tenant: ${advaitTenant.name}, Role: TENANT_ADMIN).`);

    // [TEST 2] Advait Group Organization Tree
    console.log('\n[TEST 2] Verifying Advait Group dashboard organization tree access...');
    const treeRes = await request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/org/tree',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${advaitToken}` }
    });

    if (treeRes.status !== 200 || !treeRes.data?.data) {
      throw new Error(`Failed to load Advait org tree: ${JSON.stringify(treeRes.data)}`);
    }
    const treeData = treeRes.data.data;
    if (treeData.tenant.code !== 'ADV_GRP') {
      throw new Error(`Expected Advait Group tree, got: ${treeData.tenant.code}`);
    }
    console.log(`✔ Advait Group dashboard org tree loaded (Tenant: ${treeData.tenant.name}, Plan: ${treeData.tenant.subscriptionTier}).`);

    // [TEST 3] Public Self-Service Dealership Signup Flow
    console.log('\n[TEST 3] Testing public self-service dealership enterprise registration (/signup)...');
    const randomSuffix = Math.floor(Math.random() * 100000);
    const testCode = `TEST_AUTO_${randomSuffix}`;
    const testEmail = `owner_${randomSuffix}@autotestdealers.in`;

    const signupPayload = {
      name: `Test Automobile Network ${randomSuffix}`,
      legalName: `Test Automobile Enterprise India Pvt Ltd`,
      code: testCode,
      adminName: 'Rohan Deshmukh',
      email: testEmail,
      phone: '9876543210',
      password: 'SecurePassword@123',
      subscriptionTier: 'ENTERPRISE'
    };

    const signupRes = await request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/auth/signup',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, signupPayload);

    if (signupRes.status !== 201 || !signupRes.data?.data?.token) {
      throw new Error(`Signup endpoint failed with status ${signupRes.status}: ${JSON.stringify(signupRes.data)}`);
    }

    const newTenant = signupRes.data.data.tenant;
    const newUser = signupRes.data.data.user;
    const newRoles = signupRes.data.data.roles;
    const newApps = signupRes.data.data.applications;

    if (newTenant.code !== testCode || newUser.email !== testEmail) {
      throw new Error(`Signup data mismatch: ${JSON.stringify(signupRes.data.data)}`);
    }
    if (!newRoles.some(r => r.roleCode === 'TENANT_ADMIN')) {
      throw new Error(`New dealership owner was not assigned TENANT_ADMIN role!`);
    }
    if (newApps.length === 0) {
      throw new Error(`New dealership group was not auto-subscribed to active applications.`);
    }
    console.log(`✔ Public signup flow verified: Registered ${newTenant.name}, created admin ${newUser.email}, subscribed ${newApps.length} apps.`);

    // [TEST 4] Standard 3S Capabilities Verification
    console.log('\n[TEST 4] Verifying automatic 3S capabilities seeded for newly registered dealership...');
    const buCount = await prisma.businessUnit.count({ where: { tenantId: newTenant.id } });
    if (buCount < 9) {
      throw new Error(`Expected at least 9 standard 3S business units, found: ${buCount}`);
    }
    console.log(`✔ 3S operational units automatically initialized: ${buCount} capabilities present.`);

    // [TEST 5] Clean up test data
    console.log('\n[TEST 5] Cleaning up test registration artifacts...');
    await prisma.user.deleteMany({ where: { tenantId: newTenant.id } });
    await prisma.businessUnit.deleteMany({ where: { tenantId: newTenant.id } });
    await prisma.tenantApplication.deleteMany({ where: { tenantId: newTenant.id } });
    await prisma.tenant.deleteMany({ where: { id: newTenant.id } });
    console.log('✔ Test dealership cleanly deprovisioned.');

    console.log('\n================================================================');
    console.log('🎉 ALL 5/5 DEALERSHIP ONBOARDING & ENTRY TESTS PASSED (100%)');
    console.log('================================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED:', err.message);
    process.exit(1);
  }
}

runTests();
