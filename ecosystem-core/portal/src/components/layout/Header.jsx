import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import { Building, MapPin, ChevronDown, User, LogOut, Shield, Check } from 'lucide-react';

export default function Header() {
  const { user, tenant, activeBranch, memberships, switchBranch, switchTenant, logout, isPlatformAdmin } = useAuth();
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [isTenantDropdownOpen, setIsTenantDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [tenantsList, setTenantsList] = useState([]);

  useEffect(() => {
    if (isPlatformAdmin) {
      api.get('/tenants').then(res => {
        if (res.success && res.data) setTenantsList(res.data);
      }).catch(err => console.warn(err));
    }
  }, [isPlatformAdmin]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200">
      {/* Left: Active Tenant & Branch Selector */}
      <div className="flex items-center gap-4">
        {/* Dealership Switcher for Platform Admin */}
        {isPlatformAdmin ? (
          <div className="relative">
            <button
              onClick={() => setIsTenantDropdownOpen(!isTenantDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition"
            >
              {tenant ? (
                <>
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  <span>{tenant.name}</span>
                  <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold bg-blue-100 text-blue-700 rounded">
                    {tenant.plan || tenant.subscriptionTier || 'ENTERPRISE'}
                  </span>
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Global SaaS Platform</span>
                  <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold bg-indigo-100 text-indigo-700 rounded">
                    SUPERADMIN
                  </span>
                </>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isTenantDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 divide-y divide-slate-100">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Dealership Group Context
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      switchTenant(null);
                      setIsTenantDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                      !tenant ? 'bg-indigo-50/70 font-semibold text-indigo-700' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-indigo-600" />
                      <div>
                        <div>Global SaaS Platform</div>
                        <div className="text-[10px] text-slate-400 font-normal">SuperAdmin Cross-Tenant View</div>
                      </div>
                    </div>
                    {!tenant && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                </div>

                <div className="py-1 max-h-64 overflow-y-auto">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Dealership Groups ({tenantsList.length})
                  </div>
                  {tenantsList.map((t) => {
                    const isSelected = tenant?.id === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          switchTenant(t);
                          setIsTenantDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                          isSelected ? 'bg-blue-50/70 font-semibold text-blue-700' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building className="w-3.5 h-3.5 text-blue-600" />
                          <div>
                            <div>{t.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">Code: {t.code}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : tenant ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
            <Building className="w-3.5 h-3.5 text-blue-600" />
            <span>{tenant.name}</span>
            <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold bg-blue-100 text-blue-700 rounded">
              {tenant.plan || tenant.subscriptionTier || 'ENTERPRISE'}
            </span>
          </div>
        ) : null}

        {/* Branch Switcher for Users with Multiple Memberships */}
        {memberships && memberships.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-medium text-slate-700 transition"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{activeBranch ? activeBranch.name : 'Select Branch'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isBranchDropdownOpen && (
              <div className="absolute left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Assigned Branches ({memberships.length})
                </div>
                {memberships.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      switchBranch(m.branch);
                      setIsBranchDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                      activeBranch?.id === m.branch?.id ? 'bg-blue-50/70 font-semibold text-blue-700' : 'text-slate-700'
                    }`}
                  >
                    <span>{m.branch?.name}</span>
                    {m.isPrimary && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Primary</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: User Profile & Actions */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 transition focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              {user?.firstName?.[0] || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-[11px] text-slate-500 leading-tight">
                {isPlatformAdmin ? 'Platform Admin' : user?.email}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5 divide-y divide-slate-100">
              <div className="px-4 py-2 text-xs">
                <p className="font-semibold text-slate-800">{user?.firstName} {user?.lastName}</p>
                <p className="text-slate-500 truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <a
                  href="/profile"
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <User className="w-4 h-4 text-slate-400" /> My Profile & Roles
                </a>
              </div>

              <div className="py-1">
                <button
                  onClick={logout}
                  className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition font-medium"
                >
                  <LogOut className="w-4 h-4 text-rose-500" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
