import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { authService } from '../services/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ecosystem_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [tenant, setTenant] = useState(() => {
    const saved = localStorage.getItem('ecosystem_tenant');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeBranch, setActiveBranch] = useState(() => {
    const saved = localStorage.getItem('ecosystem_active_branch');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('ecosystem_token'));
  const [memberships, setMemberships] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = async () => {
    const token = localStorage.getItem('ecosystem_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data) {
        setUser(res.data.user);
        setTenant(res.data.tenant);
        setMemberships(res.data.memberships || []);
        setRoles(res.data.roles || []);
        setPermissions(res.data.permissions || []);
        setApplications(res.data.applications || []);

        localStorage.setItem('ecosystem_user', JSON.stringify(res.data.user));
        if (res.data.tenant) {
          localStorage.setItem('ecosystem_tenant', JSON.stringify(res.data.tenant));
          api.setTenantId(res.data.tenant.id);
        }

        // Set primary branch if available
        const primary = res.data.memberships?.find(m => m.isPrimary);
        if (primary && primary.branch) {
          setActiveBranch(primary.branch);
          localStorage.setItem('ecosystem_active_branch', JSON.stringify(primary.branch));
        } else if (res.data.memberships?.[0]?.branch) {
          setActiveBranch(res.data.memberships[0].branch);
          localStorage.setItem('ecosystem_active_branch', JSON.stringify(res.data.memberships[0].branch));
        }
      }
    } catch (err) {
      console.warn('[AUTH] Token verification failed:', err.message);
      authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.directLogin(email, password);
    setToken(data.token);
    setUser(data.user);
    setTenant(data.tenant);
    setMemberships(data.memberships || []);
    setRoles(data.roles || []);
    setPermissions(data.permissions || []);
    setApplications(data.applications || []);

    localStorage.setItem('ecosystem_user', JSON.stringify(data.user));
    if (data.tenant) {
      localStorage.setItem('ecosystem_tenant', JSON.stringify(data.tenant));
    }

    const primary = data.memberships?.find(m => m.isPrimary);
    if (primary && primary.branch) {
      setActiveBranch(primary.branch);
      localStorage.setItem('ecosystem_active_branch', JSON.stringify(primary.branch));
    } else if (data.memberships?.[0]?.branch) {
      setActiveBranch(data.memberships[0].branch);
      localStorage.setItem('ecosystem_active_branch', JSON.stringify(data.memberships[0].branch));
    }

    return data;
  };

  const signup = async (payload) => {
    const data = await authService.directSignup(payload);
    setToken(data.token);
    setUser(data.user);
    setTenant(data.tenant);
    setMemberships(data.memberships || []);
    setRoles(data.roles || []);
    setPermissions(data.permissions || []);
    setApplications(data.applications || []);

    localStorage.setItem('ecosystem_user', JSON.stringify(data.user));
    if (data.tenant) {
      localStorage.setItem('ecosystem_tenant', JSON.stringify(data.tenant));
    }

    return data;
  };

  const loginWithKeycloak = () => {
    return authService.initiateKeycloakLogin();
  };

  const handleKeycloakCallback = async (code, state) => {
    setIsLoading(true);
    try {
      const data = await authService.handleKeycloakCallback(code, state);
      setToken(data.token);
      setUser(data.user);
      setTenant(data.tenant);
      setMemberships(data.memberships || []);
      setRoles(data.roles || []);
      setPermissions(data.permissions || []);
      setApplications(data.applications || []);

      localStorage.setItem('ecosystem_user', JSON.stringify(data.user));
      if (data.tenant) {
        localStorage.setItem('ecosystem_tenant', JSON.stringify(data.tenant));
        api.setTenantId(data.tenant.id);
      }

      const primary = data.memberships?.find(m => m.isPrimary);
      if (primary && primary.branch) {
        setActiveBranch(primary.branch);
        localStorage.setItem('ecosystem_active_branch', JSON.stringify(primary.branch));
      } else if (data.memberships?.[0]?.branch) {
        setActiveBranch(data.memberships[0].branch);
        localStorage.setItem('ecosystem_active_branch', JSON.stringify(data.memberships[0].branch));
      }

      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setTenant(null);
    setActiveBranch(null);
    setMemberships([]);
    setRoles([]);
    setPermissions([]);
    setApplications([]);
    authService.logout();
  };

  const switchBranch = (branch) => {
    setActiveBranch(branch);
    if (branch) {
      localStorage.setItem('ecosystem_active_branch', JSON.stringify(branch));
    } else {
      localStorage.removeItem('ecosystem_active_branch');
    }
  };

  const switchTenant = (newTenant) => {
    setTenant(newTenant);
    if (newTenant) {
      localStorage.setItem('ecosystem_tenant', JSON.stringify(newTenant));
      api.setTenantId(newTenant.id);
    } else {
      localStorage.removeItem('ecosystem_tenant');
      api.setTenantId(null);
    }
  };

  const hasPermission = (permissionCode) => {
    if (!user) return false;
    if (user.isPlatformAdmin) return true;
    return permissions.includes(permissionCode);
  };

  const isPlatformAdmin = Boolean(user?.isPlatformAdmin);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        tenant,
        activeBranch,
        memberships,
        roles,
        permissions,
        applications,
        isAuthenticated: Boolean(user),
        isLoading,
        isPlatformAdmin,
        login,
        signup,
        loginWithKeycloak,
        handleKeycloakCallback,
        logout,
        switchBranch,
        switchTenant,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
