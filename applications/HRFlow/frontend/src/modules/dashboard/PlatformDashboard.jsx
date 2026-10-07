import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  GitBranch,
  ShieldAlert,
  Plus,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export const PlatformDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tenantsRes] = await Promise.all([
          api.get('/tenants/stats'),
          api.get('/tenants'),
        ]);
        setStats(statsRes.data.data);
        setTenants(tenantsRes.data.data);
      } catch (err) {
        console.error('Failed to load platform data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const effectiveStats = stats?.summary || stats || {};
  const {
    totalTenants = 0,
    activeTenants = 0,
    suspendedTenants = 0,
    totalEmployees = 0,
    totalBranches = 0,
    planBreakdown = {},
  } = effectiveStats;

  return (
    <div className="space-y-6">
      {/* Platform Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              SaaS Multi-Tenant Architecture
            </span>
            <span className="text-xs text-slate-300">• PostgreSQL 18 Row-Level Isolation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            HRFlow SaaS Platform Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Managing independent automobile dealership organizations, multi-branch hierarchies, global tenant isolation, and subscription entitlements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
            icon={Plus}
            onClick={() => navigate('/platform/tenants')}
          >
            Onboard Dealership
          </Button>
        </div>
      </div>

      {/* Platform KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Dealership Groups"
          value={totalTenants}
          subtitle={`${activeTenants} Active • ${suspendedTenants} Suspended`}
          icon={Building2}
          color="indigo"
        />
        <StatCard
          title="Total System Branches"
          value={totalBranches}
          subtitle="Across all dealer networks"
          icon={GitBranch}
          color="blue"
        />
        <StatCard
          title="Total Managed Employees"
          value={totalEmployees}
          subtitle="Dealership workforce"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Active Subscriptions"
          value={activeTenants}
          subtitle={`Enterprise: ${planBreakdown.ENTERPRISE || 0} • Pro: ${planBreakdown.PRO || 0}`}
          icon={Layers}
          color="purple"
        />
      </div>

      {/* Main Content Split: Dealership Directory & Platform Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dealerships Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Onboarded Dealership Organizations
              </h2>
              <p className="text-xs text-slate-500">
                Live multi-tenant accounts with distinct database partition scoping
              </p>
            </div>
            <button
              onClick={() => navigate('/platform/tenants')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Manage All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/60">
                <tr>
                  <th className="px-4 py-3">Organization & Code</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Branches</th>
                  <th className="px-4 py-3">Employees</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{t.organizationName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{t.code}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {t.subscriptionPlan}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {t._count?.branches || 0}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {t._count?.employees || 0}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          t.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate('/platform/tenants')}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Configure
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Multi-Tenancy Architecture Guarantees (1 Col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Multi-Tenancy Security Enforcements
            </h2>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-emerald-950">Strict Server-Side Tenant Scoping</div>
                  <div className="text-emerald-800 text-[11px] mt-0.5">
                    Tenant identity extracted exclusively from verified JWTs. Parameter spoofing is rejected with 403.
                  </div>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-indigo-950">Isolated Physical File Directories</div>
                  <div className="text-indigo-800 text-[11px] mt-0.5">
                    Storage partitioned into <code>storage/tenants/:tenantId/</code>. Downloads verify tenant access.
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-blue-950">Branch-Scoped Manager Scoping</div>
                  <div className="text-blue-800 text-[11px] mt-0.5">
                    Branch Managers constrained strictly to their assigned showroom or service center within their tenant.
                  </div>
                </div>
              </div>

              <div className="p-3 bg-purple-50/60 rounded-lg border border-purple-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-purple-950">Feature Entitlement Gating</div>
                  <div className="text-purple-800 text-[11px] mt-0.5">
                    Individual modules (Payroll, Recruitment, Advances) toggled dynamically per subscription tier.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformDashboard;
