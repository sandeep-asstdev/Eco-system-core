import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Briefcase,
  UserPlus,
  CheckSquare,
  CreditCard,
  Building2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Network,
  CalendarDays,
  Receipt,
  Package,
  LifeBuoy,
  FileCheck,
} from 'lucide-react';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { formatINR, formatDate } from '../../utils/formatters';

export const BMDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/reports/dashboard');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to load BM stats:', err);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const { branch, summary, recentAdvances } = stats || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Branch Manager Portal
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-600">{branch?.code}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            {branch?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{branch?.address}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={Briefcase}
            onClick={() => navigate('/vacancies')}
          >
            Request Position
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={CheckSquare}
            onClick={() => navigate('/approvals')}
          >
            Review Approvals
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Branch Staff"
          value={summary?.branchEmployees || 0}
          subtitle="Assigned to branch"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Active Staff"
          value={summary?.activeCount || 0}
          subtitle="Working in branch"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Branch Vacancies"
          value={summary?.openPositions || 0}
          subtitle="Open for requisition"
          icon={Briefcase}
          color="blue"
        />
        <StatCard
          title="Pending Approvals"
          value={summary?.pendingApprovals || 0}
          subtitle="SIM & Laptops"
          icon={CheckSquare}
          color="rose"
        />
        <StatCard
          title="Joining Pipeline"
          value={summary?.branchJoining || 0}
          subtitle="New joiners"
          icon={UserPlus}
          color="amber"
        />
        <StatCard
          title="Resignations"
          value={summary?.branchResignations || 0}
          subtitle="Pending exit"
          icon={AlertTriangle}
          color="amber"
        />
      </div>

      {/* Branch Operations Hub */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Branch Action & Operations Center
            </h2>
            <p className="text-xs text-slate-500">Quick shortcuts to branch approvals, attendance, leaves and assets</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => navigate('/leave')}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition text-left group"
          >
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700 w-fit mb-2 group-hover:scale-110 transition-transform">
              <CalendarDays className="w-4 h-4" />
            </div>
            <p className="font-bold text-xs text-slate-900">Branch Leaves</p>
            <p className="text-[10px] text-slate-500">Review requests</p>
          </button>

          <button
            onClick={() => navigate('/claims')}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition text-left group"
          >
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 w-fit mb-2 group-hover:scale-110 transition-transform">
              <Receipt className="w-4 h-4" />
            </div>
            <p className="font-bold text-xs text-slate-900">Expense Claims</p>
            <p className="text-[10px] text-slate-500">Fuel & Per Diem</p>
          </button>

          <button
            onClick={() => navigate('/assets')}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition text-left group"
          >
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700 w-fit mb-2 group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
            <p className="font-bold text-xs text-slate-900">Branch Assets</p>
            <p className="text-[10px] text-slate-500">Tabs & Scanners</p>
          </button>

          <button
            onClick={() => navigate('/recruitment')}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition text-left group"
          >
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700 w-fit mb-2 group-hover:scale-110 transition-transform">
              <UserPlus className="w-4 h-4" />
            </div>
            <p className="font-bold text-xs text-slate-900">Recruitment</p>
            <p className="text-[10px] text-slate-500">Interviews & Tests</p>
          </button>

          <button
            onClick={() => navigate('/employees/org-chart')}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition text-left group"
          >
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 w-fit mb-2 group-hover:scale-110 transition-transform">
              <Network className="w-4 h-4" />
            </div>
            <p className="font-bold text-xs text-slate-900">Branch Org Tree</p>
            <p className="text-[10px] text-slate-500">Reporting lines</p>
          </button>

          <button
            onClick={() => navigate('/helpdesk')}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition text-left group"
          >
            <div className="p-2 rounded-lg bg-cyan-50 text-cyan-700 w-fit mb-2 group-hover:scale-110 transition-transform">
              <LifeBuoy className="w-4 h-4" />
            </div>
            <p className="font-bold text-xs text-slate-900">Support Desk</p>
            <p className="text-[10px] text-slate-500">Employee queries</p>
          </button>
        </div>
      </div>

      {/* Grid: Branch Salary Advances & Branch Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branch Salary Advance Requests */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recent Salary Advance Requests
              </h2>
              <p className="text-xs text-slate-500">Employee applications requiring branch review</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate('/advances')}
              className="text-indigo-600 font-semibold"
            >
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-100 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Purpose</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAdvances?.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-400">
                      No active salary advance requests for this branch.
                    </td>
                  </tr>
                ) : (
                  recentAdvances?.map((adv) => (
                    <tr key={adv.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">
                          {adv.employee?.firstName} {adv.employee?.lastName}
                        </div>
                        <span className="text-[10px] text-slate-400">{adv.employee?.employeeCode}</span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {formatINR(adv.amount)}
                      </td>
                      <td className="py-3 px-3 text-slate-600 truncate max-w-xs">{adv.purpose}</td>
                      <td className="py-3 px-3">
                        <Badge status={adv.status} />
                      </td>
                      <td className="py-3 px-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate('/advances')}
                          className="text-[11px] py-1 px-2"
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Branch Quick Management Actions */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
              Branch Action Center
            </h2>
            <p className="text-xs text-slate-500 mb-4">Operations scoped to {branch?.name}</p>

            <div className="space-y-2.5">
              <button
                onClick={() => navigate('/approvals')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-900">Pending SIM & Laptop Approvals</p>
                  <p className="text-[11px] text-slate-500">Approve or hold asset allocation for new hires</p>
                </div>
                <span className="text-xs font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                  {summary?.pendingApprovals || 0}
                </span>
              </button>

              <button
                onClick={() => navigate('/attendance')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-900">Attendance Regularization</p>
                  <p className="text-[11px] text-slate-500">Verify punch corrections from staff</p>
                </div>
                <Clock className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/exit')}
                className="w-full text-left p-3 rounded-xl border border-rose-200 bg-rose-50/20 hover:bg-rose-50/50 transition flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-rose-900">Mark Left Without Intimation</p>
                  <p className="text-[11px] text-rose-600">Auto-holds salary & reopens vacancy</p>
                </div>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Branch scope strictly enforced: You cannot view or modify other branch data.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BMDashboard;
