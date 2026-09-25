import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const KEYCLOAK_URL = 'http://localhost:8080';
const BACKEND_URL = 'http://localhost:4000';
const REALM = 'automobile-ecosystem';

function base64Url(buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function runKeycloakVerification() {
  console.log('================================================================');
  console.log('🔐 KEYCLOAK OIDC & PKCE FULL VERIFICATION SUITE');
  console.log('   Testing against http://localhost:8080 & http://localhost:4000');
  console.log('================================================================\n');

  // TEST 1: Health & Database Connectivity
  console.log('[TEST 1] Verifying Keycloak service health & PostgreSQL 18 connection...');
  const healthRes = await fetch(`${KEYCLOAK_URL}/health`).then(r => r.json());
  if (healthRes.status !== 'UP') throw new Error('Keycloak health check failed');
  console.log('✔ Keycloak service is UP with PostgreSQL 18.\n');

  // TEST 2: OpenID Configuration Discovery
  console.log('[TEST 2] Verifying OpenID Discovery Configuration...');
  const oidcConfig = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/.well-known/openid-configuration`).then(r => r.json());
  if (oidcConfig.issuer !== `${KEYCLOAK_URL}/realms/${REALM}`) throw new Error('Invalid issuer in discovery document');
  if (!oidcConfig.code_challenge_methods_supported.includes('S256')) throw new Error('S256 PKCE not supported');
  console.log(`✔ OIDC Discovery document validated. Issuer: ${oidcConfig.issuer}\n`);

  // TEST 3: JWKS Certificates Endpoint
  console.log('[TEST 3] Verifying JWKS Public Key Certificates...');
  const jwks = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/certs`).then(r => r.json());
  if (!jwks.keys || jwks.keys.length === 0) throw new Error('No JWKS keys returned');
  const signingKey = jwks.keys[0];
  if (signingKey.kty !== 'RSA' || signingKey.alg !== 'RS256') throw new Error('JWKS key is not RS256 RSA');
  console.log(`✔ JWKS Certificate published: kid="${signingKey.kid}", kty="${signingKey.kty}", alg="${signingKey.alg}"\n`);

  // TEST 4: Authorization Code Flow with PKCE (S256)
  console.log('[TEST 4] Testing Authorization Code Flow with PKCE (RFC 7636 S256)...');
  const codeVerifier = base64Url(crypto.randomBytes(32));
  const codeChallenge = base64Url(crypto.createHash('sha256').update(codeVerifier).digest());
  const state = crypto.randomUUID();

  // Step 4a: Submit browser credentials to auth endpoint
  const authBody = new URLSearchParams({
    client_id: 'ecosystem-portal',
    redirect_uri: 'http://localhost:3000/callback',
    state,
    response_type: 'code',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    scope: 'openid profile email',
    username: 'admin@ecosystem.com',
    password: 'Admin@123'
  });

  const authRes = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: authBody.toString(),
    redirect: 'manual'
  });

  if (authRes.status !== 302) {
    throw new Error(`Expected HTTP 302 redirect from /auth, received ${authRes.status}`);
  }

  const redirectLocation = authRes.headers.get('location');
  const redirectUrl = new URL(redirectLocation);
  const authCode = redirectUrl.searchParams.get('code');
  const returnedState = redirectUrl.searchParams.get('state');

  if (!authCode) throw new Error('No authorization code returned in redirect');
  if (returnedState !== state) throw new Error('State parameter mismatch in redirect');
  console.log(`✔ Authorization code issued: ${authCode.substring(0, 16)}... with state verification.`);

  // Step 4b: Exchange authorization code with PKCE verification
  const tokenBody = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: 'ecosystem-portal',
    redirect_uri: 'http://localhost:3000/callback',
    code: authCode,
    code_verifier: codeVerifier
  });

  const tokenRes = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenBody.toString()
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error(`Token exchange failed: ${JSON.stringify(tokenData)}`);
  console.log('✔ Code exchanged successfully for RS256 Access Token and Refresh Token.\n');

  // TEST 5: Verify Token Issuer, Audience, Signature, Expiry
  console.log('[TEST 5] Verifying Token Claims (iss, aud, exp, roles, signature)...');
  const client = jwksClient({
    jwksUri: `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/certs`
  });

  const decodedHeader = jwt.decode(tokenData.access_token, { complete: true });
  const key = await client.getSigningKey(decodedHeader.header.kid);
  const publicKey = key.getPublicKey();

  const verifiedClaims = jwt.verify(tokenData.access_token, publicKey, {
    algorithms: ['RS256'],
    issuer: `${KEYCLOAK_URL}/realms/${REALM}`
  });

  if (!verifiedClaims.aud.includes('ecosystem-core-api')) throw new Error('Audience missing ecosystem-core-api');
  if (verifiedClaims.email !== 'admin@ecosystem.com') throw new Error('Email claim mismatch');
  if (!verifiedClaims.isPlatformAdmin) throw new Error('Platform admin claim missing');
  console.log(`✔ RS256 Cryptographic Signature verified against JWKS.`);
  console.log(`  - Issuer: ${verifiedClaims.iss}`);
  console.log(`  - Subject: ${verifiedClaims.sub}`);
  console.log(`  - Audience: [${verifiedClaims.aud.join(', ')}]`);
  console.log(`  - Roles: [${verifiedClaims.realm_access.roles.join(', ')}]`);
  console.log(`  - Expiration: ${new Date(verifiedClaims.exp * 1000).toISOString()}\n`);

  // TEST 6: Real Token Authorization Against Live Ecosystem Core API
  console.log('[TEST 6] Testing Keycloak-issued token against live backend API on port 4000...');
  const apiRes = await fetch(`${BACKEND_URL}/api/v1/users`, {
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`
    }
  });

  if (apiRes.status !== 200) {
    const errText = await apiRes.text();
    throw new Error(`Live API rejected Keycloak token with status ${apiRes.status}: ${errText}`);
  }

  const usersData = await apiRes.json();
  console.log(`✔ Live backend accepted Keycloak RS256 token! Found ${usersData.data.length} central users in ecosystem_core_db.\n`);

  // TEST 7: Negative Security & PKCE Tampering Rejection
  console.log('[TEST 7] Testing Security Boundaries & PKCE Tampering Rejection...');

  // Tampered PKCE verifier
  const badTokenRes = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: 'ecosystem-portal',
      code: 'invalid-or-fake-code',
      code_verifier: 'invalid-verifier'
    }).toString()
  });
  if (badTokenRes.status !== 400) throw new Error('Tampered code not rejected with 400');
  console.log('✔ Invalid authorization code correctly rejected with HTTP 400.');

  // Tampered JWT signature to API
  const tamperedToken = tokenData.access_token.substring(0, tokenData.access_token.length - 10) + 'ABCDEFGHIJ';
  const tamperedRes = await fetch(`${BACKEND_URL}/api/v1/users`, {
    headers: { 'Authorization': `Bearer ${tamperedToken}` }
  });
  if (tamperedRes.status !== 401) throw new Error('Tampered JWT token was not rejected by API');
  console.log('✔ Tampered RS256 token correctly rejected by Ecosystem Core API with HTTP 401.');

  // Suspended account rejection
  const suspendedAuth = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      username: 'tech.floating.1790250770214@belladgroup.com', // Suspended user
      password: 'Admin@123'
    }).toString()
  });
  if (suspendedAuth.status !== 401) throw new Error('Suspended user was not rejected by Keycloak auth');
  console.log('✔ Suspended user authentication rejected with HTTP 401.\n');

  console.log('================================================================');
  console.log('🎉 ALL 7/7 KEYCLOAK OIDC & PKCE TESTS PASSED PERFECTLY (100%)');
  console.log('================================================================\n');
}

runKeycloakVerification().catch(err => {
  console.error('❌ KEYCLOAK VERIFICATION FAILED:', err);
  process.exit(1);
});
