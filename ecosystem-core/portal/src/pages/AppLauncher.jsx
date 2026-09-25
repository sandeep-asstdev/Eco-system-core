import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Grid, ExternalLink, ShieldCheck, AlertTriangle, Users, Wrench, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

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

        // Filter based on user permission and tenant active subscription:
        // HRFlow requires hr.* / hrflow.* or platform/tenant admin
        // MAINTLY requires maintenance.* / maintly.* or platform/tenant admin
        const authorized = allApps.filter((app) => {
          if (isPlatformAdmin) return true;
          if (app.appKey === 'hrflow') {
            return hasPermission('hrflow.employee.view') || hasPermission('hrflow.employee.manage') || hasPermission('hr.employee.read') || hasPermission('org.tenant.manage');
          }
          if (app.appKey === 'maintly') {
            return hasPermission('maintly.ticket.create') || hasPermission('maintly.ticket.manage') || hasPermission('maintenance.ticket.create') || hasPermission('maintenance.ticket.read') || hasPermission('org.tenant.manage');
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

        {/* Informative Alert regarding Single Sign-On */}
        <div className="mt-4 p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Single Sign-On (SSO) Active:</span>
            <p className="mt-0.5 text-emerald-700">
              <strong>HRFlow HRMS</strong> &amp; <strong>MAINTLY Facility &amp; Operations</strong> are connected with Central Keycloak SSO. Launching applications reuses your active portal session with cryptographic PKCE token exchange and scoped RBAC.
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
            Your current assigned roles or tenant subscription do not grant access to any applications.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {applications.map((app) => {
            const isHrflow = app.appKey === 'hrflow';
            const defaultUrl = isHrflow ? 'http://localhost:3001' : 'http://localhost:3002';
            const Icon = isHrflow ? Users : Wrench;

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
                        isHrflow ? 'bg-indigo-600 shadow-indigo-500/25' : 'bg-blue-600 shadow-blue-500/25'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900 leading-tight">{app.name}</h2>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                          Entitled & Licensed
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{app.description}</p>

                  <div className="space-y-1 text-xs">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Enabled Features
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(app.settings?.modules || []).map((m, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded-md">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 font-mono">
                    Target: {app.baseUrl || defaultUrl}
                  </div>

                  <a
                    href={app.baseUrl || defaultUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
                  >
                    <span>Launch Application</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
