import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { 
  Building2, 
  Car, 
  MapPin, 
  Users, 
  Boxes, 
  ExternalLink, 
  Activity, 
  CheckCircle2, 
  ShieldAlert,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export default function Dashboard({ onNavigate }) {
  const { user, tenant, isPlatformAdmin, activeBranch } = useAuth();
  const [stats, setStats] = useState({
    firms: 0,
    brands: 0,
    branches: 0,
    users: 0,
    applications: []
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const [firmsRes, brandsRes, branchesRes, usersRes, appsRes, logsRes] = await Promise.allSettled([
          api.get('/org/firms'),
          api.get('/org/brands'),
          api.get('/org/branches'),
          api.get('/users'),
          api.get('/applications'),
          api.get('/audit/logs?limit=5')
        ]);

        setStats({
          firms: firmsRes.status === 'fulfilled' ? firmsRes.value?.data?.length || 0 : 0,
          brands: brandsRes.status === 'fulfilled' ? brandsRes.value?.data?.length || 0 : 0,
          branches: branchesRes.status === 'fulfilled' ? branchesRes.value?.data?.length || 0 : 0,
          users: usersRes.status === 'fulfilled' ? usersRes.value?.data?.length || 0 : 0,
          applications: appsRes.status === 'fulfilled' ? appsRes.value?.data || [] : []
        });

        if (logsRes.status === 'fulfilled' && logsRes.value?.data) {
          setRecentLogs(logsRes.value.data.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [tenant]);

  const handleLaunch = async (app) => {
    if (user?.email) {
      try {
        await fetch('http://localhost:8080/realms/automobile-ecosystem/protocol/openid-connect/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: user.email })
        });
      } catch (err) {
        console.warn('[SSO] Pre-launch session sync warning:', err);
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading dealership governance analytics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>Dealership Operations Management</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {tenant ? tenant.name : 'Automobile Dealership Network Platform'}
            </h1>
            <p className="text-xs text-blue-100 mt-1 max-w-xl">
              Centralized identity, multi-firm governance, multi-brand franchise administration, and application launcher.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 shrink-0">
            <div>
              <div className="text-[11px] text-blue-200 font-medium">Logged in persona</div>
              <div className="text-xs font-bold text-white">{user?.firstName} {user?.lastName}</div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-white text-blue-700 rounded uppercase">
              {isPlatformAdmin ? 'SuperAdmin' : tenant?.plan || 'Active'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div 
          onClick={() => onNavigate('/firms-brands')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Legal Firms</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.firms}</div>
          <p className="text-[11px] text-slate-500 mt-1">Incorporated entities</p>
        </div>

        <div 
          onClick={() => onNavigate('/firms-brands')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">OEM Brands</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.brands}</div>
          <p className="text-[11px] text-slate-500 mt-1">Authorized franchises</p>
        </div>

        <div 
          onClick={() => onNavigate('/branches')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Facilities / Outlets</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.branches}</div>
          <p className="text-[11px] text-slate-500 mt-1">3S, Workshops & Bodyshops</p>
        </div>

        <div 
          onClick={() => onNavigate('/users')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Active Staff</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.users}</div>
          <p className="text-[11px] text-slate-500 mt-1">Multi-branch memberships</p>
        </div>

        <div 
          onClick={() => onNavigate('/applications')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Subscribed Apps</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.applications.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Integrated systems</p>
        </div>
      </div>

      {/* Application Launcher Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Application Launcher</h2>
            <p className="text-xs text-slate-500">Launch authorized dealership software applications</p>
          </div>
          <button 
            onClick={() => onNavigate('/launcher')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View Full Launcher</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.applications.map((app) => {
            const initials = app.code ? app.code.substring(0, 2) : (app.name || 'AP').substring(0, 2).toUpperCase();

            return (
              <div 
                key={app.id} 
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm bg-blue-600">
                        {initials}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">{app.name}</h3>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Active Subscription
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-2">{app.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-medium flex items-center gap-1">
                    <span>🔐 Central SSO Active</span>
                  </div>
                  <a
                    href={app.baseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleLaunch(app)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                  >
                    <span>Launch</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Grid: Dealership Hierarchy & Recent Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dealership Hierarchy Overview */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Organizational Hierarchy Model</h2>
            <button 
              onClick={() => onNavigate('/branches')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Manage Outlets
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 flex items-center gap-3">
              <span className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
              <div>
                <div className="font-bold text-slate-900">Dealership Group (Tenant)</div>
                <div className="text-slate-600 text-[11px]">{tenant?.name || 'All Dealership Groups'}</div>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 flex items-center gap-3 ml-4">
              <span className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
              <div>
                <div className="font-bold text-slate-900">Legal Operating Firms (PAN / GSTIN)</div>
                <div className="text-slate-600 text-[11px]">Separate corporate entities holding franchise agreements</div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center gap-3 ml-8">
              <span className="w-6 h-6 rounded-md bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
              <div>
                <div className="font-bold text-slate-900">OEM Brands & Franchises</div>
                <div className="text-slate-600 text-[11px]">Hyundai, Kia, Toyota dealership franchise allocations</div>
              </div>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 flex items-center gap-3 ml-12">
              <span className="w-6 h-6 rounded-md bg-amber-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">4</span>
              <div>
                <div className="font-bold text-slate-900">Physical Branches (Showrooms & Workshops)</div>
                <div className="text-slate-600 text-[11px]">Physical dealership facilities with auto-provisioned service bays</div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Trails */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Recent Audit Logs</h2>
            <button 
              onClick={() => onNavigate('/audit-logs')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View All Logs
            </button>
          </div>

          {recentLogs.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No recent audit trail entries found.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                      <span>{log.action}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Entity: <span className="font-medium text-slate-700">{log.entityType}</span> ({log.entityId?.substring(0, 8)}...)
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono text-right">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
