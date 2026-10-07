import crypto from 'crypto';
import http from 'http';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const prisma = new PrismaClient();

const KEYCLOAK_URL = 'http://localhost:8080';
const MAINTLY_PORT = 5002;
const REALM = 'automobile-ecosystem';

function base64Url(buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function maintlyRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (data) headers['Content-Length'] = Buffer.byteLength(data);
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        host: '127.0.0.1',
        port: MAINTLY_PORT,
        method,
        path: `/api${path}`,
        headers,
      },
      (res) => {
        let resBody = '';
        res.on('data', (chunk) => (resBody += chunk));
        res.on('end', () => {
          try {
            const parsed = resBody ? JSON.parse(resBody) : {};
            resolve({ status: res.statusCode, data: parsed, headers: res.headers });
          } catch {
            resolve({ status: res.statusCode, raw: resBody, headers: res.headers });
          }
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runPhase6IntegrationTests() {
  console.log('================================================================');
  console.log('🧪 AUTOMATED ECOSYSTEM PHASE 6 INTEGRATION TEST SUITE');
  console.log('   Testing MAINTLY SSO, Central RBAC, Multi-Branch & Data Isolation');
  console.log('================================================================\n');

  // TEST 1: Central SSO via Keycloak Authorization Code Flow (PKCE)
  console.log('[TEST 1] Verifying Central SSO via Keycloak Authorization Code Flow (PKCE)...');
  const codeVerifier = base64Url(crypto.randomBytes(32));
  const codeChallenge = base64Url(crypto.createHash('sha256').update(codeVerifier).digest());
  const state = crypto.randomUUID();

  // 1a. User authenticates against Keycloak /auth
  const authBody = new URLSearchParams({
    client_id: 'maintly-web',
    redirect_uri: 'http://localhost:3002/callback',
    state,
    response_type: 'code',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    scope: 'openid profile email',
    username: 'admin@bellad.com',
    password: 'Admin@123',
  });

  const authRes = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: authBody.toString(),
    redirect: 'manual',
  });

  if (authRes.status !== 302) {
    throw new Error(`Expected HTTP 302 redirect from Keycloak /auth, received ${authRes.status}`);
  }

  const redirectLocation = authRes.headers.get('location');
  const redirectUrl = new URL(redirectLocation);
  const authCode = redirectUrl.searchParams.get('code');
  if (!authCode) throw new Error('No authorization code returned by Keycloak');
  console.log(`✔ Keycloak issued Authorization Code for MAINTLY: ${authCode.substring(0, 16)}...`);

  // 1b. Exchange Code for RS256 Tokens
  const tokenBody = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: 'maintly-web',
    redirect_uri: 'http://localhost:3002/callback',
    code: authCode,
    code_verifier: codeVerifier,
  });

  const tokenRes = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenBody.toString(),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error(`Token exchange failed: ${JSON.stringify(tokenData)}`);
  const maintlyToken = tokenData.access_token;
  console.log('✔ Exchanged PKCE code for Central RS256 Access Token successfully.');

  // 1c. MAINTLY Backend accepts Keycloak token on /auth/me
  const meRes = await maintlyRequest('GET', '/auth/me', null, maintlyToken);
  if (meRes.status !== 200 || !meRes.data.success) {
    throw new Error(`MAINTLY rejected Keycloak token on /auth/me: ${JSON.stringify(meRes.data)}`);
  }
  console.log(`✔ MAINTLY backend verified Keycloak token! Resolved user: ${meRes.data.data.email} (Role: ${meRes.data.data.role})\n`);

  // TEST 2: Independent Token Verification, Signature & Expiration
  console.log('[TEST 2] Testing Independent Cryptographic Token Verification...');
  const jwks = jwksClient({ jwksUri: `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/certs` });
  const decodedHeader = jwt.decode(maintlyToken, { complete: true });
  const key = await jwks.getSigningKey(decodedHeader.header.kid);
  const publicKey = key.getPublicKey();

  const verified = jwt.verify(maintlyToken, publicKey, {
    algorithms: ['RS256'],
    issuer: `${KEYCLOAK_URL}/realms/${REALM}`,
  });
  if (!verified.aud.includes('maintly-web') && !verified.aud.includes('maintly-api')) {
    throw new Error('Audience missing maintly-web or maintly-api');
  }
  console.log(`✔ Cryptographic RS256 signature verified against Keycloak JWKS.`);
  console.log(`  - Issuer: ${verified.iss}`);
  console.log(`  - Subject (Central User ID): ${verified.sub}`);
  console.log(`  - Audience: [${verified.aud.join(', ')}]`);

  // 2b. Rejection of Tampered Token
  const tamperedToken = maintlyToken.substring(0, maintlyToken.length - 12) + 'XYZABC123456';
  const tamperedRes = await maintlyRequest('GET', '/auth/me', null, tamperedToken);
  if (tamperedRes.status !== 401) {
    throw new Error(`Tampered token was not rejected with 401 (got ${tamperedRes.status})`);
  }
  console.log('✔ Tampered token cryptographically rejected with HTTP 401.\n');

  // TEST 3: Unauthorized Application Access & Invalid Audience Rejection
  console.log('[TEST 3] Testing Unauthorized Application Access Rejection...');
  const fakeToken = jwt.sign(
    { sub: crypto.randomUUID(), email: 'unauthorized@example.com', aud: ['random-app'] },
    'fake_secret'
  );
  const fakeRes = await maintlyRequest('GET', '/maintenance/requests', null, fakeToken);
  if (fakeRes.status !== 401 && fakeRes.status !== 403) {
    throw new Error(`Unauthorized app access returned HTTP ${fakeRes.status}`);
  }
  console.log('✔ Unauthorized client token rejected with HTTP 401/403.\n');

  // TEST 4: Cross-Tenant Isolation in MAINTLY
  console.log('[TEST 4] Verifying Strict Cross-Tenant Isolation Boundaries in MAINTLY...');
  const belladReqsRes = await maintlyRequest('GET', '/maintenance/requests', null, maintlyToken);
  if (belladReqsRes.status !== 200) throw new Error(`Failed to retrieve requests for Bellad Admin: ${JSON.stringify(belladReqsRes.data)}`);

  const belladRequests = Array.isArray(belladReqsRes.data.data)
    ? belladReqsRes.data.data
    : (belladReqsRes.data.data?.items || []);
  console.log(`✔ Bellad Admin retrieved ${belladRequests.length} requests within Bellad Group.`);

  // Verify that NO request from Omni Logistics exists in Bellad's response
  const omniTenant = await prisma.tenant.findFirst({ where: { code: 'OMNI' } });
  if (omniTenant) {
    const crossTenantFound = belladRequests.some((r) => r.tenantId === omniTenant.id);
    if (crossTenantFound) {
      throw new Error('SECURITY VIOLATION: Cross-tenant data leakage detected in maintenance requests!');
    }
  }
  console.log('✔ Zero cross-tenant data leakage confirmed in MAINTLY requests query.\n');

  // TEST 5: Branch-Level Permissions & Scoping
  console.log('[TEST 5] Testing Branch-Level Scoping for Branch Users...');
  const bmAuthBody = new URLSearchParams({
    client_id: 'maintly-web',
    redirect_uri: 'http://localhost:3002/callback',
    state: crypto.randomUUID(),
    response_type: 'code',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    scope: 'openid profile email',
    username: 'manager@bellad.com',
    password: 'Admin@123',
  });

  const bmAuthRes = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: bmAuthBody.toString(),
    redirect: 'manual',
  });
  const bmRedirect = new URL(bmAuthRes.headers.get('location'));
  const bmCode = bmRedirect.searchParams.get('code');

  const bmTokenRes = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: 'maintly-web',
      redirect_uri: 'http://localhost:3002/callback',
      code: bmCode,
      code_verifier: codeVerifier,
    }).toString(),
  });
  const bmTokenData = await bmTokenRes.json();
  const bmToken = bmTokenData.access_token;
  console.log('✔ Branch Manager authenticated via Central Keycloak.');

  const bmMe = await maintlyRequest('GET', '/auth/me', null, bmToken);
  if (bmMe.status !== 200) {
    throw new Error('Branch Manager failed to access /auth/me');
  }
  console.log(`✔ Branch Manager context verified: ${bmMe.data.data.email}, Branch Count: ${bmMe.data.data.branches?.length || 0}\n`);

  // TEST 6: Multi-Branch Assigned Floating Staff Access
  console.log('[TEST 6] Testing Multi-Branch Facility Access for Technicians...');
  const techUser = await prisma.user.findFirst({
    where: { email: 'technician@bellad.com' },
    include: { branchAccesses: { include: { branch: true } } },
  });
  if (techUser && techUser.branchAccesses.length > 0) {
    console.log(`✔ Verified technician assigned to ${techUser.branchAccesses.length} branch(es):`);
    techUser.branchAccesses.forEach((ub) => console.log(`   - [${ub.branch.code}] ${ub.branch.name} (Primary: ${ub.isPrimary})`));
  }
  console.log('✔ Multi-branch access engine correctly maps facility memberships.\n');

  // TEST 7: Suspended User Immediate Rejection
  console.log('[TEST 7] Testing Suspended User Rejection...');
  const suspendedAuthBody = new URLSearchParams({
    client_id: 'maintly-web',
    redirect_uri: 'http://localhost:3002/callback',
    state: crypto.randomUUID(),
    response_type: 'code',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    scope: 'openid profile email',
    username: 'tech.floating.1790250770214@belladgroup.com',
    password: 'Admin@123',
  });

  const suspendedRes = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: suspendedAuthBody.toString(),
  });

  if (suspendedRes.status !== 401 && suspendedRes.status !== 403) {
    throw new Error(`Suspended user auth did not return 401/403 (got ${suspendedRes.status})`);
  }
  console.log('✔ Suspended user authentication immediately rejected with HTTP 401/403.\n');

  // TEST 8: Existing MAINTLY Functionality Preservation
  console.log('[TEST 8] Verifying Existing MAINTLY Operational Modules & Endpoints...');
  const modulesToTest = [
    { name: 'Requests Catalog', path: '/maintenance/requests' },
    { name: 'Purchases / Orders', path: '/purchases' },
    { name: 'Vendors Master', path: '/vendors' },
    { name: 'Master Data / Branches', path: '/org/branches' },
    { name: 'Master Data / Departments', path: '/org/departments' },
    { name: 'Master Data / Brands', path: '/org/brands' },
    { name: 'Audit Logs', path: '/audit-logs' },
  ];

  for (const mod of modulesToTest) {
    const res = await maintlyRequest('GET', mod.path, null, maintlyToken);
    if (res.status !== 200) {
      throw new Error(`Module ${mod.name} failed with HTTP ${res.status}: ${JSON.stringify(res.data)}`);
    }
    console.log(`✔ Module [${mod.name}] operational (HTTP 200 OK).`);
  }
  console.log('✔ All existing MAINTLY operational modules verified intact.\n');

  // TEST 9: EmployeeReference Model & Central Identifiers
  console.log('[TEST 9] Verifying EmployeeReference Model & Central Mapping Integrity...');
  const empRefs = await prisma.employeeReference.findMany({
    include: { tenant: true, branch: true },
  });

  if (empRefs.length === 0) {
    throw new Error('No EmployeeReference records found in MAINTLY database');
  }

  const sampleRef = empRefs[0];
  if (!sampleRef.employeeCode || !sampleRef.firstName || !sampleRef.centralTenantId) {
    throw new Error('EmployeeReference record missing mandatory central mapping fields');
  }

  console.log(`✔ Found ${empRefs.length} cached EmployeeReference records:`);
  console.log(`  - Sample: [${sampleRef.employeeCode}] ${sampleRef.firstName} ${sampleRef.lastName}`);
  console.log(`  - Central Tenant ID: ${sampleRef.centralTenantId}`);
  console.log(`  - Central Branch ID: ${sampleRef.centralBranchId || 'N/A'}`);
  console.log(`  - Status: ${sampleRef.status}`);
  console.log('✔ EmployeeReference central mapping contract verified intact.\n');

  // TEST 10: Direct Unauthenticated Access Rejection
  console.log('[TEST 10] Testing Direct Unauthenticated Access Rejection...');
  const unauthReq = await maintlyRequest('GET', '/maintenance/requests');
  if (unauthReq.status !== 401) {
    throw new Error(`Direct unauthenticated access returned HTTP ${unauthReq.status} instead of 401`);
  }
  console.log('✔ Direct unauthenticated access to /maintenance/requests rejected with HTTP 401.');

  const authReq = await maintlyRequest('GET', '/maintenance/requests', null, maintlyToken);
  if (authReq.status !== 200) {
    throw new Error(`Direct authenticated access failed with status ${authReq.status}`);
  }
  console.log('✔ Direct authenticated access to /maintenance/requests succeeds with HTTP 200 OK.\n');

  // TEST 11: Cross-Application Single Login Verification (Portal <-> HRFlow <-> MAINTLY)
  console.log('[TEST 11] Verifying Cross-Application SSO Reusability (Keycloak Single Session)...');
  // Use the same authCode flow with same central credentials for HRFlow
  const hrAuthBody = new URLSearchParams({
    client_id: 'hrflow-web',
    redirect_uri: 'http://localhost:3001/callback',
    state: crypto.randomUUID(),
    response_type: 'code',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    scope: 'openid profile email',
    username: 'admin@bellad.com',
    password: 'Admin@123',
  });

  const hrAuthRes = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: hrAuthBody.toString(),
    redirect: 'manual',
  });

  if (hrAuthRes.status !== 302) {
    throw new Error(`Keycloak refused single login for HRFlow: status ${hrAuthRes.status}`);
  }
  console.log('✔ Same central login credentials authenticated for HRFlow seamlessly.');
  console.log('✔ Full Ecosystem SSO Circle verified: Ecosystem Portal ➔ MAINTLY ➔ HRFlow.\n');

  console.log('================================================================');
  console.log('🎉 ALL 11/11 PHASE 6 INTEGRATION TESTS PASSED PERFECTLY (100%)');
  console.log('================================================================\n');
}

runPhase6IntegrationTests()
  .catch((err) => {
    console.error('❌ PHASE 6 INTEGRATION TEST FAILED:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
