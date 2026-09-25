import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldCheck, Key, Lock, Layers } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import UnauthorizedScreen from '../components/common/UnauthorizedScreen.jsx';

export default function RolesPermissions() {
  const { isPlatformAdmin, hasPermission } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRolesData() {
      setIsLoading(true);
      try {
        const [rolesRes, permsRes] = await Promise.all([
          api.get('/users/roles'),
          api.get('/users/permissions')
        ]);
        setRoles(rolesRes.data || []);
        setPermissions(permsRes.data || []);
      } catch (err) {
        console.error('Failed to load roles and permissions:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadRolesData();
  }, []);

  if (!isPlatformAdmin && !hasPermission('rbac.role.manage') && !hasPermission('org.user.manage')) {
    return <UnauthorizedScreen requiredPermission="rbac.role.manage" title="RBAC Governance Restricted" />;
  }

  // Group permissions by domain
  const permsByDomain = permissions.reduce((acc, p) => {
    const domain = p.domain || 'general';
    if (!acc[domain]) acc[domain] = [];
    acc[domain].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Scoped Roles & Permissions Catalog</h1>
        <p className="text-xs text-slate-500">
          Centralized Role-Based Access Control (RBAC) Engine across Global, Tenant, Firm, Brand, Branch, and Department Scopes
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Fetching roles and system permissions..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roles Column */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Standard System Roles ({roles.length})</span>
            </h2>

            <div className="space-y-3">
              {roles.map((r) => (
                <div key={r.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-xs text-slate-900">{r.name}</h3>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                      {r.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{r.description || 'Pre-configured system role'}</p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Supported Scopes:</span>
                    <span className="font-semibold text-slate-700">GLOBAL, TENANT, BRANCH</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Permissions Catalog */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600" />
              <span>Permissions Catalog ({permissions.length} Granular Actions)</span>
            </h2>

            <div className="space-y-4">
              {Object.entries(permsByDomain).map(([domain, perms]) => (
                <div key={domain} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                      Domain: {domain}
                    </span>
                    <span className="text-[10px] font-semibold bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                      {perms.length} Permissions
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {perms.map((p) => (
                      <div key={p.id} className="p-3 text-xs flex items-center justify-between hover:bg-slate-50/60">
                        <div>
                          <div className="font-mono font-semibold text-slate-800 text-[11px]">{p.code}</div>
                          <div className="text-slate-500 text-[11px] mt-0.5">{p.description}</div>
                        </div>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded shrink-0">
                          {p.action}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
