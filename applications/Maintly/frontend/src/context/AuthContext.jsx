import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setAuthToken, clearAuthToken, getAuthToken } from '../services/api.js';
import { keycloakAuth } from '../services/keycloakAuth.js';

const AuthContext = createContext(null);

export const DEMO_USERS = [
  { label: 'Bellad Admin', email: 'admin@bellad.com', role: 'TENANT_ADMIN', desc: 'Bellad & Groups Governance' },
  { label: 'Branch Manager', email: 'manager@bellad.com', role: 'MANAGER', desc: 'Work Assignment & SLAs' },
  { label: 'Approver', email: 'approver@bellad.com', role: 'APPROVER', desc: 'Request Approvals & Rejections' },
  { label: 'Technician', email: 'technician@bellad.com', role: 'MAINTENANCE_USER', desc: 'Execution & Material Logging' },
  { label: 'Purchase Officer', email: 'purchase@bellad.com', role: 'PURCHASE_USER', desc: 'Quotations & PO Handling' },
  { label: 'Employee', email: 'employee@bellad.com', role: 'EMPLOYEE', desc: 'Raise Requests & Satisfaction' },
  { label: 'Platform Admin', email: 'platformadmin@maintly.com', role: 'PLATFORM_ADMIN', desc: 'Multi-Tenant Superuser' },
  { label: 'Tenant B Admin', email: 'admin@omnilogistics.com', role: 'TENANT_ADMIN', desc: 'OmniLogistics (Isolation Demo)' }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => getAuthToken());
  const [loading, setLoading] = useState(true);
  const [activeBranchId, setActiveBranchId] = useState('');

  const applyAuthToken = useCallback((newToken) => {
    setAuthToken(newToken);
    setTokenState(newToken);
  }, []);

  const clearAuth = useCallback(() => {
    clearAuthToken();
    setTokenState(null);
    setUser(null);
    setActiveBranchId('');
  }, []);

  useEffect(() => {
    async function initAuth() {
      const pathname = window.location.pathname;

      if (pathname.startsWith('/callback')) {
        setLoading(false);
        return;
      }

      // Check if session token was already initialized in memory
      const currentToken = getAuthToken();
      if (currentToken) {
        try {
          const res = await api.get('/auth/me');
          const userData = res.data.data;
          setTokenState(currentToken);
          setUser(userData);
          if (userData.branches?.length > 0 && !activeBranchId) {
            const primary = userData.branches.find(b => b.isPrimary) || userData.branches[0];
            setActiveBranchId(primary.id);
          }
          setLoading(false);
          return;
        } catch {
          clearAuth();
        }
      }

      // If user is accessing protected routes and has no token, check if we can attempt silent SSO with Keycloak
      const isLogin = pathname.startsWith('/login');
      const hasSessionExpiredParam = window.location.search.includes('session_expired=true');

      if (!isLogin && !hasSessionExpiredParam) {
        try {
          keycloakAuth.initiateKeycloakLogin(false);
          return;
        } catch (err) {
          console.error('Silent SSO initiation failed:', err);
        }
      }

      setLoading(false);
    }

    initAuth();
  }, [clearAuth, activeBranchId]);

  const loginWithKeycloak = async (forcePrompt = false) => {
    await keycloakAuth.initiateKeycloakLogin(forcePrompt);
  };

  const handleKeycloakCallback = async (code, state) => {
    setLoading(true);
    try {
      const tokenData = await keycloakAuth.handleKeycloakCallback(code, state);
      applyAuthToken(tokenData.access_token);

      const res = await api.get('/auth/me');
      const userData = res.data.data;
      setUser(userData);

      if (userData.branches?.length > 0) {
        const primary = userData.branches.find(b => b.isPrimary) || userData.branches[0];
        setActiveBranchId(primary.id);
      }

      return userData;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: jwtToken, user: userData } = res.data.data;

    applyAuthToken(jwtToken);
    setUser(userData);

    if (userData.branches?.length > 0) {
      const primary = userData.branches.find(b => b.isPrimary) || userData.branches[0];
      setActiveBranchId(primary.id);
    }

    return userData;
  };

  const logout = () => {
    clearAuth();
    window.location.href = 'http://localhost:8080/realms/automobile-ecosystem/protocol/openid-connect/logout?redirect_uri=' + encodeURIComponent('http://localhost:3002/login');
  };

  const switchDemoRole = async (email) => {
    return await login(email, 'Admin@123');
  };

  const setBranch = (branchId) => {
    setActiveBranchId(branchId);
  };

  const value = {
    user,
    token,
    loading,
    role: user?.role,
    tenant: user?.tenant,
    branches: user?.branches || [],
    activeBranchId,
    setBranch,
    login,
    logout,
    loginWithKeycloak,
    handleKeycloakCallback,
    switchDemoRole,
    isAuthenticated: !!token && !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
