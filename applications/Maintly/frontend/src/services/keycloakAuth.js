/**
 * Keycloak OIDC Authentication Service with PKCE for MAINTLY
 * Protocol: RFC 7636 Proof Key for Code Exchange (PKCE S256)
 * Client: maintly-web
 */

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080';
const REALM = import.meta.env.VITE_KEYCLOAK_REALM || 'automobile-ecosystem';
const CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'maintly-web';
const REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/callback` : 'http://localhost:3002/callback';

function base64UrlEncode(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function generateRandomString(length = 43) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => charset[byte % charset.length]).join('');
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(digest);
}

export const keycloakAuth = {
  async initiateKeycloakLogin(forcePrompt = false) {
    const codeVerifier = generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateRandomString(32);

    // Save temporary PKCE exchange secrets in sessionStorage (purged immediately on exchange)
    sessionStorage.setItem('maintly_pkce_verifier', codeVerifier);
    sessionStorage.setItem('maintly_pkce_state', state);

    const authUrl = new URL(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth`);
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid profile email');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    if (forcePrompt) {
      authUrl.searchParams.set('prompt', 'login');
    }

    window.location.href = authUrl.toString();
  },

  async handleKeycloakCallback(code, state) {
    const savedState = sessionStorage.getItem('maintly_pkce_state');
    const codeVerifier = sessionStorage.getItem('maintly_pkce_verifier');

    sessionStorage.removeItem('maintly_pkce_state');
    sessionStorage.removeItem('maintly_pkce_verifier');

    if (savedState && state && savedState !== state) {
      throw new Error('Invalid OAuth state returned by Keycloak. Authentication rejected.');
    }

    const tokenUrl = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      code: code,
      redirect_uri: REDIRECT_URI
    });
    if (codeVerifier) {
      params.set('code_verifier', codeVerifier);
    }

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error_description || errorData.error || 'Failed to exchange authorization code for token');
    }

    return await response.json();
  }
};
