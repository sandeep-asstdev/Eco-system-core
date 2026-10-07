import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setAuthToken, clearAuthToken, getAuthToken } from '../services/api';
import { keycloakAuth } from '../services/keycloakAuth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => getAuthToken());
  const [loading, setLoading] = useState(true);

  const applyAuthToken = useCallback((newToken) => {
    setAuthToken(newToken);
    setTokenState(newToken);
  }, []);

  const clearAuth = useCallback(() => {
    clearAuthToken();
    setTokenState(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const pathname = window.location.pathname;

      // Allow public candidate routes and callback to handle their own flow
      if (pathname.startsWith('/join') || pathname.startsWith('/callback')) {
        setLoading(false);
        return;
      }

      // Check if session was already initialized in memory or localStorage
      const currentToken = getAuthToken();
      if (currentToken) {
        try {
          const res = await api.get('/auth/me');
          setTokenState(currentToken);
          setUser(res.data.data.user);
          setLoading(false);
          return;
        } catch {
          clearAuth();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, [clearAuth]);

  const loginWithKeycloak = useCallback(async (forcePrompt = false) => {
    await keycloakAuth.initiateKeycloakLogin(forcePrompt);
  }, []);

  const handleKeycloakCallback = useCallback(async (code, state) => {
    setLoading(true);
    try {
      const tokenData = await keycloakAuth.handleKeycloakCallback(code, state);
      applyAuthToken(tokenData.access_token);

      // Query HRFlow backend using the verified Keycloak RS256 token
      const res = await api.get('/auth/me');
      const userData = res.data.data.user;
      setUser(userData);
      return userData;
    } finally {
      setLoading(false);
    }
  }, [applyAuthToken]);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data.data;
    applyAuthToken(newToken);
    setUser(newUser);
    return newUser;
  }, [applyAuthToken]);

  const register = useCallback(async (registrationData) => {
    const res = await api.post('/auth/register', registrationData);
    const { token: newToken, user: newUser } = res.data.data;
    applyAuthToken(newToken);
    setUser(newUser);
    return newUser;
  }, [applyAuthToken]);

  const switchRole = useCallback(async (demoRole) => {
    const res = await api.post('/auth/demo-switch', { demoRole });
    const { token: newToken, user: newUser } = res.data.data;
    applyAuthToken(newToken);
    setUser(newUser);
    return newUser;
  }, [applyAuthToken]);

  const logout = useCallback(() => {
    clearAuth();
    keycloakAuth.logout();
  }, [clearAuth]);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data.user);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  }, []);

  const hasPermission = useCallback((permissionCode) => {
    if (!user) return false;
    if (user.role === 'PLATFORM_ADMIN' || user.isPlatformAdmin) return true;
    const permissions = user.permissions || [];
    if (permissions.includes('*') || permissions.includes(permissionCode)) return true;
    const domain = permissionCode.split('.')[0];
    return permissions.includes(`${domain}.*`);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        loading,
        login,
        loginWithKeycloak,
        handleKeycloakCallback,
        register,
        logout,
        switchRole,
        refreshUser,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
