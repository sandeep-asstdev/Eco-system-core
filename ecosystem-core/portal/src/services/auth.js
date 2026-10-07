import { api } from './api.js';

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080';
const REALM = import.meta.env.VITE_KEYCLOAK_REALM || 'automobile-ecosystem';
const CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'ecosystem-portal';
const REDIRECT_URI = `${window.location.origin}/callback`;

function base64UrlEncode(buffer) {
  const bytes = new Uint8Array(buffer);
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
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length];
  }
  return result;
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(digest);
}

export const authService = {
  async initiateKeycloakLogin() {
    const codeVerifier = generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateRandomString(32);

    sessionStorage.setItem('pkce_code_verifier', codeVerifier);
    sessionStorage.setItem('pkce_state', state);

    const authUrl = new URL(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth`);
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid profile email');
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('state', state);

    window.location.href = authUrl.toString();
  },

  async handleKeycloakCallback(code, state) {
    const savedVerifier = sessionStorage.getItem('pkce_code_verifier');
    const savedState = sessionStorage.getItem('pkce_state');

    if (!savedVerifier) {
      throw new Error('PKCE code verifier missing from session.');
    }
    if (savedState && state && savedState !== state) {
      throw new Error('OAuth2 state mismatch. Possible CSRF detected.');
    }

    sessionStorage.removeItem('pkce_code_verifier');
    sessionStorage.removeItem('pkce_state');

    const tokenUrl = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      code,
      code_verifier: savedVerifier
    });

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error_description || 'Failed to exchange Keycloak authorization code');
    }

    const tokenData = await res.json();
    api.setToken(tokenData.access_token);

    // Fetch user details from Central API using Keycloak token
    const profileRes = await api.get('/auth/me');
    return {
      token: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      user: profileRes.data.user,
      tenant: profileRes.data.tenant,
      memberships: profileRes.data.memberships || [],
      roles: profileRes.data.roles || [],
      permissions: profileRes.data.permissions || [],
      applications: profileRes.data.applications || []
    };
  },

  async directLogin(email, password) {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      api.setToken(res.data.token);
      if (res.data.tenant?.id) {
        api.setTenantId(res.data.tenant.id);
      }

      // Synchronize Keycloak SSO session so application launches bypass login prompts
      try {
        await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: res.data.user.email })
        });
      } catch (err) {
        console.warn('[SSO] Keycloak session synchronization warning:', err.message);
      }

      return res.data;
    }
    throw new Error(res.error?.message || 'Login failed');
  },

  async directSignup(payload) {
    const res = await api.post('/auth/signup', payload);
    if (res.success && res.data) {
      api.setToken(res.data.token);
      if (res.data.tenant?.id) {
        api.setTenantId(res.data.tenant.id);
      }

      try {
        await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: res.data.user.email })
        });
      } catch (err) {
        console.warn('[SSO] Keycloak session synchronization warning:', err.message);
      }

      return res.data;
    }
    throw new Error(res.error?.message || 'Registration failed');
  },

  logout() {
    api.setToken(null);
    api.setTenantId(null);
    localStorage.removeItem('ecosystem_user');
    localStorage.removeItem('ecosystem_tenant');
    localStorage.removeItem('ecosystem_active_branch');
    window.location.href = '/login';
  }
};
