import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Building, MapPin, ChevronDown, User, LogOut, Shield } from 'lucide-react';

export default function Header() {
  const { user, tenant, activeBranch, memberships, switchBranch, logout, isPlatformAdmin } = useAuth();
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200">
      {/* Left: Active Tenant & Branch Selector */}
      <div className="flex items-center gap-4">
        {tenant ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
            <Building className="w-3.5 h-3.5 text-blue-600" />
            <span>{tenant.name}</span>
            <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold bg-blue-100 text-blue-700 rounded">
              {tenant.plan || 'ENTERPRISE'}
            </span>
          </div>
        ) : isPlatformAdmin ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-700">
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span>Global SaaS Platform</span>
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
