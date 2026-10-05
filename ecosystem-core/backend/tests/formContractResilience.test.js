import assert from 'assert';

const BASE_URL = 'http://localhost:4000/api/v1';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 FORM CONTRACT & REGISTRATION RESILIENCE TEST SUITE');
  console.log('====================================================\n');

  // Step 0: Login as platform admin to get auth token
  console.log('1. Authenticating as Platform Administrator...');
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@ecosystem.com',
      password: 'Admin@123'
    })
  });

  assert.strictEqual(loginRes.status, 200, `Admin login failed: ${JSON.stringify(loginRes.data)}`);
  const token = loginRes.data.data.token || loginRes.data.data.accessToken;

  // Retrieve valid dealership tenant
  const tenantsRes = await request('/tenants', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert.ok(tenantsRes.data.data && tenantsRes.data.data.length > 0, 'Must have at least one tenant');
  const targetTenant = tenantsRes.data.data[0];
  console.log(`   Found active dealership group: ${targetTenant.name} (${targetTenant.code})`);

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'x-tenant-id': targetTenant.id
  };
  console.log('   ✅ Authenticated and scoped successfully.\n');

  // Step 1: Legal Firm Registration Tests
  console.log('2. Testing Firm Registration Form Contract Resilience...');

  // Test 1.1: Exact payload from user screenshot (NO code provided, pan instead of panNumber)
  const userScreenshotPayload = {
    name: `Advait Pvt Ltd Test ${Date.now().toString().slice(-4)}`,
    pan: 'AAACR5055K',
    gstin: '07AAACR5055K1Z9',
    state: 'Karnataka',
    cin: 'L17110MH1973PLC019786'
  };

  const firmRes1 = await request('/org/firms', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(userScreenshotPayload)
  });

  assert.strictEqual(firmRes1.status, 201, `Firm creation without code failed: ${JSON.stringify(firmRes1.data)}`);
  assert.ok(firmRes1.data.data.id, 'Firm ID must be returned');
  assert.ok(firmRes1.data.data.code, 'Firm Code must be auto-generated');
  assert.strictEqual(firmRes1.data.data.panNumber, 'AAACR5055K', 'PAN must be mapped to panNumber');
  console.log(`   ✅ Exact screenshot payload passed! Auto-code generated: ${firmRes1.data.data.code}`);

  // Test 1.2: Firm creation with explicit code
  const explicitFirmCode = `EXPLICIT_${Date.now().toString().slice(-4)}`;
  const firmRes2 = await request('/org/firms', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Explicit Code Firm',
      code: explicitFirmCode,
      pan: 'BBBCR1234K',
      gstin: '29BBBCR1234K1Z2',
      state: 'Karnataka'
    })
  });
  assert.strictEqual(firmRes2.status, 201);
  assert.strictEqual(firmRes2.data.data.code, explicitFirmCode);
  console.log(`   ✅ Explicit code payload passed! Code: ${firmRes2.data.data.code}`);

  // Test 1.3: Firm collision avoidance when auto-generating code from duplicate name
  const firmRes3 = await request('/org/firms', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: userScreenshotPayload.name, // Same name as firm 1
      pan: 'CCCDD9876P',
      state: 'Karnataka'
    })
  });
  assert.strictEqual(firmRes3.status, 201, `Duplicate name auto-code should resolve with suffix: ${JSON.stringify(firmRes3.data)}`);
  assert.notStrictEqual(firmRes3.data.data.code, firmRes1.data.data.code, 'Should generate unique suffix for colliding name');
  console.log(`   ✅ Collision avoidance passed! Resolved unique code: ${firmRes3.data.data.code}\n`);

  // Step 2: Brand Registration Tests
  console.log('3. Testing OEM Brand Registration Contract Resilience...');
  const brandName = `Test Brand ${Date.now().toString().slice(-4)}`;
  const brandRes1 = await request('/org/brands', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: brandName,
      countryOfOrigin: 'Japan'
    })
  });
  assert.strictEqual(brandRes1.status, 201, `Brand creation without code failed: ${JSON.stringify(brandRes1.data)}`);
  assert.ok(brandRes1.data.data.code, 'Brand code must be auto-generated');
  console.log(`   ✅ Brand creation without code passed! Auto-code: ${brandRes1.data.data.code}\n`);

  // Step 3: Firm-Brand Link Contract Resilience
  console.log('4. Testing Firm-Brand Franchise Link Contract Resilience...');
  const linkRes = await request('/org/firm-brands', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      firmId: firmRes1.data.data.id,
      brandId: brandRes1.data.data.id,
      dealerCode: 'DLR-9988',
      contractValidUntil: '2028-12-31'
    })
  });
  assert.strictEqual(linkRes.status, 201, `Firm-Brand link with UI field names failed: ${JSON.stringify(linkRes.data)}`);
  assert.strictEqual(linkRes.data.data.dealerAgreementNo, 'DLR-9988');
  console.log('   ✅ Firm-Brand linking with UI field names (dealerCode, contractValidUntil) passed!\n');

  // Step 4: Branch Facility Creation Contract Resilience
  console.log('5. Testing Branch Facility Creation Contract Resilience...');
  const branchName = `Hubli North Hub ${Date.now().toString().slice(-4)}`;
  const branchRes = await request('/org/branches', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      firmId: firmRes1.data.data.id,
      firmBrandId: linkRes.data.data.id,
      name: branchName,
      type: 'SHOWROOM', // UI sends 'type'
      city: 'Hubli',
      state: 'Karnataka',
      phone: '9845012345'
    })
  });
  assert.strictEqual(branchRes.status, 201, `Branch creation without code failed: ${JSON.stringify(branchRes.data)}`);
  assert.ok(branchRes.data.data.code, 'Branch code must be auto-generated');
  assert.strictEqual(branchRes.data.data.outletType, 'SHOWROOM', 'type must be mapped to outletType');
  console.log(`   ✅ Branch creation without code passed! Auto-code: ${branchRes.data.data.code}, OutletType: ${branchRes.data.data.outletType}\n`);

  // Step 5: Dealership Group (Tenant) Creation Contract Resilience
  console.log('6. Testing Tenant (Dealership Group) Onboarding Contract Resilience...');
  const tenantName = `Advait Motors Group ${Date.now().toString().slice(-4)}`;
  const tenantRes = await request('/tenants', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: tenantName,
      // Note: legalName and code omitted deliberately
      contactPhone: '9876543210'
    })
  });
  assert.strictEqual(tenantRes.status, 201, `Tenant creation without legalName/code failed: ${JSON.stringify(tenantRes.data)}`);
  assert.strictEqual(tenantRes.data.data.name, tenantName);
  assert.strictEqual(tenantRes.data.data.legalName, tenantName, 'legalName must fallback to name');
  assert.ok(tenantRes.data.data.code, 'Tenant code must be auto-generated');
  console.log(`   ✅ Tenant creation without legalName/code passed! Code: ${tenantRes.data.data.code}, Legal: ${tenantRes.data.data.legalName}\n`);

  // Step 6: User Directory Staff Creation Contract Resilience
  console.log('7. Testing User Staff Creation Contract Resilience...');
  const userEmail = `staff_${Date.now()}@example.com`;
  const userRes = await request('/users', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      email: userEmail,
      password: 'TemporaryPassword123!',
      firstName: 'Ramesh',
      lastName: 'Patil',
      phone: '9845011223',
      primaryBranchId: branchRes.data.data.id // UI sends primaryBranchId
    })
  });
  assert.strictEqual(userRes.status, 201, `User creation with primaryBranchId failed: ${JSON.stringify(userRes.data)}`);
  assert.strictEqual(userRes.data.data.email, userEmail);
  console.log('   ✅ Staff creation with primaryBranchId passed!\n');

  console.log('====================================================');
  console.log('🎉 ALL FORM CONTRACT RESILIENCE TESTS PASSED (6/6)');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});
