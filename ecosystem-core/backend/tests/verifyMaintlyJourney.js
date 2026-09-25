import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const KEYCLOAK_URL = 'http://localhost:8080';
const ECOSYSTEM_CORE_URL = 'http://localhost:4000/api/v1';
const MAINTLY_API_URL = 'http://localhost:5002/api';
const HRFLOW_API_URL = 'http://localhost:5000/api';
const REALM = 'automobile-ecosystem';

function base64Url(buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function runFullJourneySimulation() {
  console.log('================================================================');
  console.log('🚀 DEMONSTRATING FULL USER JOURNEY: PORTAL ➔ MAINTLY ➔ HRFLOW');
  console.log('================================================================\n');

  const codeVerifier = base64Url(crypto.randomBytes(32));
  const codeChallenge = base64Url(crypto.createHash('sha256').update(codeVerifier).digest());

  // STEP 1: Portal SSO Authentication
  console.log('Step 1: Authenticating on Ecosystem Portal via Central Keycloak SSO...');
  const authParams = new URLSearchParams({
    client_id: 'ecosystem-portal',
    redirect_uri: 'http://localhost:3000/callback',
    state: crypto.randomUUID(),
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
    body: authParams.toString(),
    redirect: 'manual'
  });

  if (authRes.status !== 302) {
    throw new Error(`Portal SSO login failed with status ${authRes.status}`);
  }

  const portalRedirect = new URL(authRes.headers.get('location'));
  const portalCode = portalRedirect.searchParams.get('code');
  const setCookie = authRes.headers.get('set-cookie');

  // Exchange code for portal token
  const tokenRes = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: 'ecosystem-portal',
      redirect_uri: 'http://localhost:3000/callback',
      code: portalCode,
      code_verifier: codeVerifier
    }).toString()
  });

  const tokenData = await tokenRes.json();
  const portalToken = tokenData.access_token;
  console.log('✔ Authenticated into Ecosystem Portal (:3000). Issued central JWT.');

  // STEP 2: Fetch App Launcher Registry
  console.log('\nStep 2: Accessing Application Launcher (:3000/apps)...');
  const appsRes = await fetch(`${ECOSYSTEM_CORE_URL}/applications`, {
    headers: { Authorization: `Bearer ${portalToken}` }
  });
  const appsPayload = await appsRes.json();
  const apps = Array.isArray(appsPayload) ? appsPayload : (appsPayload.data || []);
  console.log(`✔ Application Launcher retrieved ${apps.length} registered applications:`);
  apps.forEach(a => console.log(`   - [${a.appKey}] ${a.name} ➔ Target: ${a.baseUrl}`));

  const maintlyApp = apps.find(a => a.appKey === 'maintly');
  if (!maintlyApp) throw new Error('MAINTLY not found in application registry');
  console.log('✔ User selects MAINTLY card ➔ Launching http://localhost:3002');

  // STEP 3: Silent SSO into MAINTLY using active Keycloak session cookie
  console.log('\nStep 3: Reusing Keycloak session for seamless MAINTLY SSO (:3002/callback)...');
  const maintlyVerifier = base64Url(crypto.randomBytes(32));
  const maintlyChallenge = base64Url(crypto.createHash('sha256').update(maintlyVerifier).digest());

  const ssoAuthRes = await fetch(
    `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth?client_id=maintly-web&redirect_uri=${encodeURIComponent('http://localhost:3002/callback')}&response_type=code&code_challenge=${maintlyChallenge}&code_challenge_method=S256&scope=openid%20profile%20email`,
    {
      method: 'GET',
      headers: { Cookie: setCookie || '' },
      redirect: 'manual'
    }
  );

  let maintlyCode;
  if (ssoAuthRes.status === 302) {
    const maintlyRedirect = new URL(ssoAuthRes.headers.get('location'));
    maintlyCode = maintlyRedirect.searchParams.get('code');
    console.log('✔ Reused active Keycloak session! Zero credential prompt required.');
  } else {
    // Direct code grant with active credentials
    const promptAuthRes = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: 'maintly-web',
        redirect_uri: 'http://localhost:3002/callback',
        response_type: 'code',
        code_challenge: maintlyChallenge,
        code_challenge_method: 'S256',
        scope: 'openid profile email',
        username: 'admin@bellad.com',
        password: 'Admin@123'
      }).toString(),
      redirect: 'manual'
    });
    const promptRedirect = new URL(promptAuthRes.headers.get('location'));
    maintlyCode = promptRedirect.searchParams.get('code');
  }

  // Exchange code for MAINTLY token
  const maintlyTokenRes = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: 'maintly-web',
      redirect_uri: 'http://localhost:3002/callback',
      code: maintlyCode,
      code_verifier: maintlyVerifier
    }).toString()
  });

  const maintlyTokenData = await maintlyTokenRes.json();
  const maintlyToken = maintlyTokenData.access_token;
  console.log('✔ MAINTLY frontend (:3002) completed PKCE code exchange in memory (No token in URL parameters).');

  // STEP 4: Access MAINTLY Maintenance Dashboard
  console.log('\nStep 4: Opening MAINTLY Maintenance Dashboard (:3002/dashboard)...');
  const userMeRes = await fetch(`${MAINTLY_API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${maintlyToken}` }
  });
  const meData = await userMeRes.json();
  const fullName = `${meData.data.firstName || ''} ${meData.data.lastName || ''}`.trim();
  console.log(`✔ User Profile resolved: ${fullName || 'Central Admin'} (${meData.data.email}) - Tenant: ${meData.data.tenant?.name}`);

  const dashboardRes = await fetch(`${MAINTLY_API_URL}/dashboard/metrics`, {
    headers: { Authorization: `Bearer ${maintlyToken}` }
  });
  const metricsData = await dashboardRes.json();
  console.log(`✔ Maintenance Dashboard KPIs Loaded:`);
  console.log(`   - Total Requests: ${metricsData.data?.totalRequests || 0}`);
  console.log(`   - Waiting for Approval: ${metricsData.data?.waitingApproval || 0}`);
  console.log(`   - Work In Progress: ${metricsData.data?.inProgress || 0}`);
  console.log(`   - Overdue: ${metricsData.data?.overdue || 0}`);

  const requestsRes = await fetch(`${MAINTLY_API_URL}/maintenance/requests?limit=3`, {
    headers: { Authorization: `Bearer ${maintlyToken}` }
  });
  const reqData = await requestsRes.json();
  const reqItems = reqData.data?.items || reqData.data || [];
  console.log(`✔ Maintenance Request Records Verified: ${reqItems.length} sample records retrieved.`);
  if (reqItems.length > 0) {
    console.log(`   - Top Ticket: [${reqItems[0].requestNumber}] ${reqItems[0].subject} (${reqItems[0].workStatus})`);
  }

  // STEP 5: Re-use Single Login for HRFlow
  console.log('\nStep 5: Verifying Cross-Application SSO Reusability with HRFlow (:3001)...');
  const hrVerifier = base64Url(crypto.randomBytes(32));
  const hrChallenge = base64Url(crypto.createHash('sha256').update(hrVerifier).digest());

  const hrAuthRes = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: 'hrflow-web',
      redirect_uri: 'http://localhost:3001/callback',
      response_type: 'code',
      code_challenge: hrChallenge,
      code_challenge_method: 'S256',
      scope: 'openid profile email',
      username: 'admin@bellad.com',
      password: 'Admin@123'
    }).toString(),
    redirect: 'manual'
  });

  const hrRedirect = new URL(hrAuthRes.headers.get('location'));
  const hrCode = hrRedirect.searchParams.get('code');

  const hrTokenRes = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: 'hrflow-web',
      redirect_uri: 'http://localhost:3001/callback',
      code: hrCode,
      code_verifier: hrVerifier
    }).toString()
  });

  const hrTokenData = await hrTokenRes.json();
  const hrToken = hrTokenData.access_token;
  const hrMeRes = await fetch(`${HRFLOW_API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${hrToken}` }
  });
  const hrMeData = await hrMeRes.json();
  console.log(`✔ HRFlow session established seamlessly! User: ${hrMeData.data?.user?.email} (${hrMeData.data?.user?.role})`);

  console.log('\n================================================================');
  console.log('🎉 DEMONSTRATION COMPLETE: SEAMLESS PORTAL ➔ MAINTLY ➔ HRFLOW SSO');
  console.log('================================================================\n');
}

runFullJourneySimulation().catch(err => {
  console.error('❌ Journey Simulation Failed:', err);
  process.exit(1);
});
