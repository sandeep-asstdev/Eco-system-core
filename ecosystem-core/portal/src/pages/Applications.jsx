import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Boxes, ExternalLink, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export default function Applications() {
  const { tenant, isPlatformAdmin } = useAuth();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadApps() {
      setIsLoading(true);
      try {
        const res = await api.get('/applications');
        setApplications(res.data || []);
      } catch (err) {
        console.error('Failed to load applications:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadApps();
  }, [tenant]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Application Registry & Subscriptions</h1>
        <p className="text-xs text-slate-500">
          Integrated SaaS application modules for {tenant?.name || 'All Dealership Groups'}
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Fetching application registry..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {applications.map((app) => {
            const initials = app.code ? app.code.substring(0, 2) : (app.name || 'AP').substring(0, 2).toUpperCase();
            const category = app.category || 'OPERATIONS';
            const modules = app.capabilities?.length > 0 ? app.capabilities : (app.settings?.modules || []);

            return (
              <div 
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-md bg-blue-600 shadow-blue-500/20">
                        {initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-slate-900">{app.name}</h2>
                          <span className="text-[10px] font-mono text-slate-400">v{app.version}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono text-slate-500">code: {app.code || app.appKey}</span>
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            {category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Subscribed
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-4">{app.description}</p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Web URL:</span>
                      <span className="font-mono text-[11px] text-blue-600">{app.baseUrl}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Backend API:</span>
                      <span className="font-mono text-[11px] text-slate-700">{app.apiUrl}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Health Check:</span>
                      <span className="font-mono text-[11px] text-emerald-600 font-semibold">{app.healthEndpoint || '/api/health'}</span>
                    </div>
                  </div>

                  {modules.length > 0 && (
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Included Modules
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {modules.map((m, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded-md">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 font-medium">
                    ⚠️ Opening requires standalone app login until Phase 5 & 6 SSO
                  </div>

                  <a
                    href={app.baseUrl || defaultUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
                  >
                    <span>Launch</span>
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
