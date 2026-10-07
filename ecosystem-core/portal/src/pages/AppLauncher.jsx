import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Grid, ExternalLink, ShieldCheck, AlertTriangle, Users, Wrench, 
  ArrowRight, Car, FileText, Package, Calculator, ShoppingCart, 
  Layers, AppWindow, Sparkles, CheckCircle2, Info
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

// Dynamic Icon Resolver mapping icon names to Lucide icons
const ICON_MAP = {
  Users,
  Wrench,
  Car,
  FileText,
  Package,
  Calculator,
  ShoppingCart,
  Layers,
  AppWindow,
  Sparkles,
  Grid
};

function ResolveAppIcon({ iconName, category, className = "w-6 h-6" }) {
  const IconComponent = ICON_MAP[iconName] || ICON_MAP[category] || AppWindow;
  return <IconComponent className={className} />;
}

// Category theme palette
const CATEGORY_THEMES = {
  HR: { bg: 'bg-indigo-600', shadow: 'shadow-indigo-500/25', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  OPERATIONS: { bg: 'bg-blue-600', shadow: 'shadow-blue-500/25', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  SALES: { bg: 'bg-emerald-600', shadow: 'shadow-emerald-500/25', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CRM: { bg: 'bg-cyan-600', shadow: 'shadow-cyan-500/25', badge: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  FINANCE: { bg: 'bg-amber-600', shadow: 'shadow-amber-500/25', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  INVENTORY: { bg: 'bg-purple-600', shadow: 'shadow-purple-500/25', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  DEMO: { bg: 'bg-violet-600', shadow: 'shadow-violet-500/25', badge: 'bg-violet-50 text-violet-700 border-violet-200' }
};

export default function AppLauncher() {
  const { tenant, user, hasPermission, isPlatformAdmin } = useAuth();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAuthorizedApps() {
      setIsLoading(true);
      try {
        const res = await api.get('/applications');
        const allApps = res.data || [];

        // Dynamic permission and tenant subscription evaluation:
        // Evaluates application-declared requiredPermissions dynamically without hardcoding app names
        const authorized = allApps.filter((app) => {
          if (isPlatformAdmin) return true;
          if (app.status === 'SUSPENDED' || app.status === 'INACTIVE') return false;
          if (!app.isSubscribed) return false;

          const perms = app.requiredPermissions || [];
          if (perms.length > 0) {
            const hasAny = perms.some((p) => hasPermission(p));
            return hasAny || hasPermission('org.tenant.manage') || hasPermission('platform.tenant.manage');
          }

          const legacyPerms = app.settings?.requiredPermissions || [];
          if (legacyPerms.length > 0) {
            return legacyPerms.some((p) => hasPermission(p)) || hasPermission('org.tenant.manage');
          }

          return true;
        });

        setApplications(authorized);
      } catch (err) {
        console.error('Failed to load launcher applications:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAuthorizedApps();
  }, [tenant, user]);

  const handleLaunch = (app, e) => {
    if (e) e.preventDefault();
    const token = localStorage.getItem('ecosystem_token');
    const targetKey = (app.appKey || app.code || '').toLowerCase();
    if (token && (targetKey === 'hrflow' || targetKey === 'maintly')) {
      const tenantParam = tenant?.id ? `&tenantId=${encodeURIComponent(tenant.id)}` : '';
      const ssoUrl = `http://localhost:8080/realms/automobile-ecosystem/protocol/openid-connect/sso-launch?appKey=${targetKey}&token=${encodeURIComponent(token)}${tenantParam}`;
      window.open(ssoUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open(app.baseUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Application Launcher</h1>
            <p className="text-xs text-slate-500">
              Authorized enterprise applications available to your dealership profile
            </p>
          </div>
        </div>

        {/* Informative Alert regarding Central Single Sign-On */}
        <div className="mt-4 p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Central Single Sign-On (SSO) Active:</span>
            <p className="mt-0.5 text-emerald-700">
              All ecosystem applications are connected through Central Keycloak SSO. Launching any module reuses your active portal credentials via cryptographic PKCE authorization code exchange and scoped RBAC.
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Evaluating application entitlements and licenses..." />
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Grid className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">No Authorized Applications Available</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Your current assigned roles or active tenant subscription do not grant access to any applications.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {applications.map((app) => {
            const theme = CATEGORY_THEMES[app.category?.toUpperCase()] || {
              bg: 'bg-blue-600',
              shadow: 'shadow-blue-500/25',
              badge: 'bg-blue-50 text-blue-700 border-blue-200'
            };
            const isMaintenance = app.status === 'MAINTENANCE';
            const features = app.capabilities?.length > 0 
              ? app.capabilities 
              : (app.settings?.modules || []);

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${theme.bg} ${theme.shadow}`}>
                        <ResolveAppIcon iconName={app.icon} category={app.category} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-slate-900 leading-tight">{app.name}</h2>
                          <span className="text-[10px] font-mono text-slate-400">v{app.version}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                            Entitled & Licensed
                          </span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${theme.badge}`}>
                            {app.category}
                          </span>
                          {isMaintenance && (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Maintenance Mode
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{app.description}</p>

                  {features.length > 0 && (
                    <div className="space-y-1 text-xs">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Features & Capabilities
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {features.map((m, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded-md">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 font-mono">
                    Target: {app.baseUrl}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleLaunch(app, e)}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-white font-semibold text-xs rounded-xl shadow-sm transition cursor-pointer ${
                      isMaintenance 
                        ? 'bg-amber-600 hover:bg-amber-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <span>Launch Application</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
