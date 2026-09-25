import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { User, Shield, Building, MapPin, Key, CheckCircle, Smartphone, Mail } from 'lucide-react';

export default function Profile() {
  const { user, tenant, activeBranch, memberships, roles, permissions } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">User Profile & Security Settings</h1>
        <p className="text-xs text-slate-500">
          Account credentials, assigned multi-tenant dealership scopes, and active cryptographic session
        </p>
      </div>

      {/* Identity Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            {user?.firstName?.[0] || 'U'}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle className="w-3 h-3" /> ACTIVE
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user?.email}
              </span>
              {user?.phone && (
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  {user?.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block mb-0.5 text-[11px]">Dealership Tenant</span>
            <span className="font-semibold text-slate-800">{tenant?.name || 'Global SaaS Platform'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block mb-0.5 text-[11px]">Primary Base Branch</span>
            <span className="font-semibold text-slate-800">{activeBranch?.name || 'All Facilities'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block mb-0.5 text-[11px]">Identity Provider</span>
            <span className="font-semibold text-blue-700">Keycloak OIDC (PKCE)</span>
          </div>
        </div>
      </div>

      {/* Scoped Roles Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Assigned Scoped Roles ({roles.length})</span>
        </h3>

        {roles.length === 0 ? (
          <p className="text-xs text-slate-500">No scoped roles assigned.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {roles.map((r, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">{r.roleName || r.roleCode}</span>
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    SCOPE: {r.scopeType}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {r.branch && <span>Branch: {r.branch}</span>}
                  {r.firm && <span>Firm: {r.firm}</span>}
                  {r.brand && <span>Brand: {r.brand}</span>}
                  {r.department && <span>Department: {r.department}</span>}
                  {!r.branch && !r.firm && !r.brand && !r.department && <span>Global Tenant Scope</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assigned Memberships Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span>Floating Branch Facility Memberships ({memberships.length})</span>
        </h3>

        {memberships.length === 0 ? (
          <p className="text-xs text-slate-500">No branch memberships assigned.</p>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
            {memberships.map((m) => (
              <div key={m.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <div className="font-semibold text-slate-800 flex items-center gap-2">
                    <span>{m.branch?.name}</span>
                    {m.isPrimary && (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                        PRIMARY BASE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {m.branch?.city}, {m.branch?.state} • Code: {m.branch?.code}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
