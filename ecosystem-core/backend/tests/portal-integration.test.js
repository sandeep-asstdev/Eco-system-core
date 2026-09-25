const PORTAL_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:4000/api/v1';

async function verifyPortalAndPersonas() {
  console.log('================================================================');
  console.log('🌐 AUTOMATED PORTAL & PERSONA INTEGRATION TEST SUITE');
  console.log('================================================================\n');

  // TEST 1: Portal HTTP 200 Availability
  console.log('[TEST 1] Verifying Portal availability on http://localhost:3000...');
  const portalRes = await fetch(PORTAL_URL);
  if (portalRes.status !== 200) throw new Error(`Portal returned HTTP ${portalRes.status}`);
  const html = await portalRes.text();
  if (!html.includes('Automobile Dealership Ecosystem Portal')) {
    throw new Error('Portal HTML did not contain expected title metadata');
  }
  console.log('✔ React Ecosystem Portal is running on port 3000 (HTTP 200 OK).\n');

  // TEST 2: Platform Administrator Login & Full Global Access
  console.log('[TEST 2] Verifying Platform SuperAdmin persona (admin@ecosystem.com)...');
  const adminLogin = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@ecosystem.com', password: 'Admin@123' })
  }).then(r => r.json());

  if (!adminLogin.success) throw new Error('Platform Admin login failed');
  const adminToken = adminLogin.data.token;
  console.log('✔ Platform Admin authenticated successfully.');

  // Admin queries all tenants
  const allTenants = await fetch(`${BACKEND_URL}/tenants`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  }).then(r => r.json());
  console.log(`✔ Platform Admin has global tenant visibility: Found ${allTenants.data.length} dealership groups.\n`);

  // TEST 3: Tenant Administrator (MD) Scoped Access
  console.log('[TEST 3] Verifying Tenant Administrator persona (md.bellad@belladgroup.com)...');
  const mdLogin = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'md.bellad@belladgroup.com', password: 'Admin@123' })
  }).then(r => r.json());

  if (!mdLogin.success) throw new Error('Tenant Admin login failed');
  const mdToken = mdLogin.data.token;
  const mdTenantId = mdLogin.data.user.tenantId;

  // MD accesses own firms and branches
  const belladFirms = await fetch(`${BACKEND_URL}/org/firms`, {
    headers: { 'Authorization': `Bearer ${mdToken}`, 'x-tenant-id': mdTenantId }
  }).then(r => r.json());
  console.log(`✔ Tenant Admin accesses own dealership firms: Found ${belladFirms.data.length} firms.`);

  // MD is strictly blocked from accessing another tenant's data (Apex Auto)
  const otherTenant = allTenants.data.find(t => t.id !== mdTenantId);
  if (otherTenant) {
    const crossTenantAttempt = await fetch(`${BACKEND_URL}/org/firms`, {
      headers: { 'Authorization': `Bearer ${mdToken}`, 'x-tenant-id': otherTenant.id }
    });
    if (crossTenantAttempt.status === 200) {
      const data = await crossTenantAttempt.json();
      // Must not leak other tenant's firms!
      const leakedFirms = data.data.filter(f => f.tenantId === otherTenant.id);
      if (leakedFirms.length > 0) throw new Error('Cross-tenant data leakage detected!');
    }
    console.log('✔ Cross-tenant boundary strictly enforced: Tenant Admin cannot access Tenant B.');
  }
  console.log('');

  // TEST 4: Branch Manager Persona Scoped Restrictions
  console.log('[TEST 4] Verifying Branch Manager persona (bm.hubli@belladgroup.com)...');
  const bmLogin = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'bm.hubli@belladgroup.com', password: 'Admin@123' })
  }).then(r => r.json());

  if (!bmLogin.success) throw new Error('Branch Manager login failed');
  const bmToken = bmLogin.data.token;
  const bmTenantId = bmLogin.data.user.tenantId;
  const bmHeaders = { 'Authorization': `Bearer ${bmToken}`, 'x-tenant-id': bmTenantId };

  // Branch manager can read branches in their tenant
  const bmBranches = await fetch(`${BACKEND_URL}/org/branches`, { headers: bmHeaders }).then(r => r.json());
  console.log(`✔ Branch Manager accesses facility directory (${bmBranches.data.length} facilities).`);

  // Branch manager is blocked from platform tenant creation (403 Forbidden)
  const unauthorizedTenantCreate = await fetch(`${BACKEND_URL}/tenants`, {
    method: 'POST',
    headers: bmHeaders,
    body: JSON.stringify({ name: 'Hacked Tenant', code: 'HACK' })
  });

  if (unauthorizedTenantCreate.status !== 403) {
    throw new Error(`Expected 403 Forbidden for tenant creation by BM, got ${unauthorizedTenantCreate.status}`);
  }
  console.log('✔ Branch Manager unauthorized action correctly rejected with HTTP 403 Forbidden.\n');

  // TEST 5: Subscribed Application Registry Verification
  console.log('[TEST 5] Verifying Application Registry entitlements...');
  const appsRes = await fetch(`${BACKEND_URL}/applications`, { headers: bmHeaders }).then(r => r.json());
  const appKeys = appsRes.data.map(a => a.appKey);
  if (!appKeys.includes('hrflow') || !appKeys.includes('maintly')) {
    throw new Error('Applications registry missing HRFlow or MAINTLY');
  }
  console.log(`✔ Subscribed applications active in registry: [${appKeys.join(', ')}].\n`);

  console.log('================================================================');
  console.log('🎉 ALL 5/5 PORTAL & PERSONA INTEGRATION TESTS PASSED (100%)');
  console.log('================================================================\n');
}

verifyPortalAndPersonas().catch(err => {
  console.error('❌ PORTAL INTEGRATION TEST FAILED:', err);
  process.exit(1);
});
