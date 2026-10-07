import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Briefcase,
  UserPlus,
  CheckSquare,
  Banknote,
  Building2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Network,
  CalendarDays,
  Receipt,
  Package,
  LifeBuoy,
  FileText,
  Layers,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { formatINR, formatDate } from '../../utils/formatters';

export const HRDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/reports/dashboard');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to load HR stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const { summary, branchHeadcount, recentPayrolls } = stats || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            HR Master Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Enterprise overview across all branches, vacancies, onboarding and payroll
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={Briefcase}
            onClick={() => navigate('/vacancies')}
          >
            New Vacancy
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={UserPlus}
            onClick={() => navigate('/joining')}
          >
            Invite Candidate
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Workforce"
          value={summary?.totalEmployees || 0}
          subtitle="All branch records"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Active Employees"
          value={summary?.activeEmployees || 0}
          subtitle="On payroll"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Open Vacancies"
          value={summary?.openPositions || 0}
          subtitle="Awaiting hiring"
          icon={Briefcase}
          color="blue"
        />
        <StatCard
          title="Joining Pipeline"
          value={summary?.pendingJoining || 0}
          subtitle="Invited / Submitted"
          icon={UserPlus}
          color="amber"
        />
        <StatCard
          title="Pending Approvals"
          value={summary?.pendingApprovals || 0}
          subtitle="SIM, Laptops, Advances"
          icon={CheckSquare}
          color="rose"
        />
        <StatCard
          title="Exits / Notice"
          value={summary?.resignedEmployees || 0}
          subtitle="Salary held"
          icon={AlertTriangle}
          color="amber"
        />
      </div>

      {/* Horilla HRMS Operations Hub */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Horilla HRMS Architecture</span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight mt-0.5">
              Enterprise Operations & Workflow Center
            </h2>
            <p className="text-xs text-slate-300">
              Quick access to applicant tracking, organizational hierarchy, statutory KYC, leaves, and Bellad claims
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <button
            onClick={() => navigate('/recruitment')}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition group"
          >
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 w-fit mb-2 group-hover:scale-110 transition-transform">
              <UserPlus className="w-4 h-4" />
            </div>
            <p className="font-bold text-xs text-white">ATS Pipeline</p>
            <p className="text-[10px] text-slate-300">Kanban stages</p>
          </button>

          <button
            onClick={() => navigate('/employees/org-chart')}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition group"
          >
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 w-fit mb-2 group-hover:scale-110 transition-transform">
              <Network className="w-4 h-4" />
            </div>
            <p className="font-bold text-xs text-white">Org Chart</p>
            <p className="text-[10px] text-slate-300">Levels 1–10 tree</p>
          </button>

          <button
            onClick={() => navigate('/leave')}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition group"
          >
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 w-fit mb-2 group-hover:scale-110 transition-transform">
              <CalendarDays className="w-4 h-4" />
            </div>
            <p className="font-bold text-xs text-white">Leave Desk</p>
            <p className="text-[10px] text-slate-300">Approvals & Balances</p>
          </button>

          <button
            onClick={() => navigate('/claims')}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition group"
          >
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 w-fit mb-2 group-hover:scale-110 transition-transform">
              <Receipt className="w-4 h-4" />
            </div>
            <p className="font-bold text-xs text-white">Expense Claims</p>
            <p className="text-[10px] text-slate-300">Fuel & Per Diem</p>
          </button>

          <button
            onClick={() => navigate('/assets')}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition group"
          >
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 w-fit mb-2 group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
            <p className="font-bold text-xs text-white">Asset Inventory</p>
            <p className="text-[10px] text-slate-300">Laptops, Tabs, Scanners</p>
          </button>

          <button
            onClick={() => navigate('/employees/document-requests')}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition group"
          >
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-300 w-fit mb-2 group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <p className="font-bold text-xs text-white">KYC Requests</p>
            <p className="text-[10px] text-slate-300">Aadhaar & PAN audit</p>
          </button>

          <button
            onClick={() => navigate('/helpdesk')}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition group"
          >
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 w-fit mb-2 group-hover:scale-110 transition-transform">
              <LifeBuoy className="w-4 h-4" />
            </div>
            <p className="font-bold text-xs text-white">HR Helpdesk</p>
            <p className="text-[10px] text-slate-300">Employee queries</p>
          </button>
        </div>
      </div>

      {/* Branch Headcount Matrix */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Branch-Wise Manpower Allocation
            </h2>
            <p className="text-xs text-slate-500">Live headcount and open requisition ratios</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/reports')}
            className="text-indigo-600 font-semibold"
          >
            View Full Report <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {branchHeadcount?.map((b) => (
            <div
              key={b.branchId}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-indigo-100 hover:shadow-xs transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">{b.branchName}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                  {b.city}
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-bold text-slate-900">{b.headcount}</span>
                  <span className="text-xs text-slate-500 ml-1">Staff</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    {b.openVacancies} Open
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Grid: Recent Payroll & Quick Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Payroll */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recent Payroll Disbursements
              </h2>
              <p className="text-xs text-slate-500">Latest processed employee salary records</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              icon={Banknote}
              onClick={() => navigate('/payroll')}
            >
              Payroll Engine
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-100 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Branch</th>
                  <th className="py-2.5 px-3">Month/Year</th>
                  <th className="py-2.5 px-3">Net Pay</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPayrolls?.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-400">
                      No payroll records found. Run the calculation engine to generate.
                    </td>
                  </tr>
                ) : (
                  recentPayrolls?.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">
                          {p.employee?.firstName} {p.employee?.lastName}
                        </div>
                        <span className="text-[10px] text-slate-400">{p.employee?.employeeCode}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{p.branch?.name}</td>
                      <td className="py-3 px-3 font-medium text-slate-700">
                        {p.month}/{p.year}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {formatINR(p.netPay)}
                      </td>
                      <td className="py-3 px-3">
                        {p.isHold ? (
                          <Badge status="ON_HOLD" text="HELD" />
                        ) : (
                          <Badge status={p.status} />
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Server Automations Overview */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
              Active Lifecycle Automations
            </h2>
            <p className="text-xs text-slate-500 mb-4">Core business rules running server-side</p>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
                <p className="font-semibold text-emerald-900">Rule 1: Joining Completion</p>
                <p className="text-emerald-700 text-[11px] mt-0.5">
                  Provisions Employee, Closes Vacancy, Creates BM SIM/Laptop approval.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100">
                <p className="font-semibold text-amber-900">Rule 2: Employee Resignation</p>
                <p className="text-amber-700 text-[11px] mt-0.5">
                  Sets status Resigned, Holds Salary, Auto-creates replacement vacancy.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-100">
                <p className="font-semibold text-rose-900">Rule 3: Left Without Intimation</p>
                <p className="text-rose-700 text-[11px] mt-0.5">
                  Marks status LWI, Holds Salary, Auto-opens replacement vacancy.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
                <p className="font-semibold text-blue-900">Rule 4: BM Asset Approval</p>
                <p className="text-blue-700 text-[11px] mt-0.5">
                  Approves SIM/Laptop and generates procurement dispatch alert for HR.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs"
              onClick={() => navigate('/audit')}
            >
              View System Audit Logs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
