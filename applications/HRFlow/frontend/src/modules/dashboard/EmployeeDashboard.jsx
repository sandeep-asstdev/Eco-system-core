import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Clock,
  Banknote,
  CreditCard,
  Building2,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Download,
  ArrowRight,
  ShieldCheck,
  IdCard,
  CalendarDays,
  Receipt,
  Package,
  LifeBuoy,
  FileText,
} from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { formatINR, formatDate } from '../../utils/formatters';

export const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const res = await api.get('/reports/dashboard');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to load employee dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeeData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-200 rounded-xl"></div>
          <div className="h-64 bg-slate-200 rounded-xl"></div>
          <div className="h-64 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const { employee, profileCompletion } = data || {};
  const latestPayroll = employee?.payrolls?.[0];
  const activeAdvance = employee?.salaryAdvances?.[0];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-indigo-100">
            {employee ? `${employee.firstName[0]}${employee.lastName[0]}` : 'EM'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Welcome back, {employee?.firstName}!
              </h1>
              <Badge status={employee?.status} />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {employee?.designation} • {employee?.department} • {employee?.branch?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant="outline"
            icon={IdCard}
            onClick={() => navigate(`/employees/${employee?.id}`)}
          >
            Digital ID Card
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={Clock}
            onClick={() => navigate('/attendance')}
          >
            Punch Attendance
          </Button>
        </div>
      </div>

      {/* Employee Quick Actions Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => navigate('/leave')}
          className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-indigo-300 transition text-left group"
        >
          <div className="p-2 rounded-lg bg-blue-50 text-blue-700 w-fit mb-2 group-hover:scale-110 transition-transform">
            <CalendarDays className="w-4 h-4" />
          </div>
          <p className="font-bold text-xs text-slate-900">Apply Leave</p>
          <p className="text-[10px] text-slate-500">CL, SL & Comp-off</p>
        </button>

        <button
          onClick={() => navigate('/claims')}
          className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-indigo-300 transition text-left group"
        >
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 w-fit mb-2 group-hover:scale-110 transition-transform">
            <Receipt className="w-4 h-4" />
          </div>
          <p className="font-bold text-xs text-slate-900">Expense Claims</p>
          <p className="text-[10px] text-slate-500">Fuel & Travel bills</p>
        </button>

        <button
          onClick={() => navigate('/payroll')}
          className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-indigo-300 transition text-left group"
        >
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 w-fit mb-2 group-hover:scale-110 transition-transform">
            <Banknote className="w-4 h-4" />
          </div>
          <p className="font-bold text-xs text-slate-900">My Payslips</p>
          <p className="text-[10px] text-slate-500">Monthly salary slips</p>
        </button>

        <button
          onClick={() => navigate('/advances')}
          className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-indigo-300 transition text-left group"
        >
          <div className="p-2 rounded-lg bg-purple-50 text-purple-700 w-fit mb-2 group-hover:scale-110 transition-transform">
            <CreditCard className="w-4 h-4" />
          </div>
          <p className="font-bold text-xs text-slate-900">Salary Advance</p>
          <p className="text-[10px] text-slate-500">Request up to 50%</p>
        </button>

        <button
          onClick={() => navigate('/assets')}
          className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-indigo-300 transition text-left group"
        >
          <div className="p-2 rounded-lg bg-amber-50 text-amber-700 w-fit mb-2 group-hover:scale-110 transition-transform">
            <Package className="w-4 h-4" />
          </div>
          <p className="font-bold text-xs text-slate-900">My Assets</p>
          <p className="text-[10px] text-slate-500">Laptops, SIM, Tools</p>
        </button>

        <button
          onClick={() => navigate('/helpdesk')}
          className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-indigo-300 transition text-left group"
        >
          <div className="p-2 rounded-lg bg-cyan-50 text-cyan-700 w-fit mb-2 group-hover:scale-110 transition-transform">
            <LifeBuoy className="w-4 h-4" />
          </div>
          <p className="font-bold text-xs text-slate-900">HR Helpdesk</p>
          <p className="text-[10px] text-slate-500">Raise query / ticket</p>
        </button>
      </div>

      {/* Grid: Profile Progress, Latest Payslip, Salary Advance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Completion Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Profile Readiness
              </span>
              <span className="text-xs font-bold text-indigo-600">{profileCompletion}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-3">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Employee Code:</span>
                <span className="font-semibold text-slate-900">{employee?.employeeCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Date of Joining:</span>
                <span className="font-semibold text-slate-900">{formatDate(employee?.dateOfJoining)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Assigned Assets:</span>
                <span className="font-semibold text-slate-900">{employee?.assets?.length || 0} active</span>
              </div>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="w-full mt-4 text-xs"
            onClick={() => navigate(`/employees/${employee?.id}`)}
          >
            Manage Full Profile & KYC
          </Button>
        </div>

        {/* Latest Salary Slip Snapshot */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Latest Salary Slip
              </span>
              {latestPayroll && (
                <span className="text-xs text-slate-500 font-medium">
                  {latestPayroll.month}/{latestPayroll.year}
                </span>
              )}
            </div>

            {latestPayroll ? (
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-slate-500">Net Disbursed Pay</span>
                  <p className="text-2xl font-bold text-slate-900">{formatINR(latestPayroll.netPay)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block">Gross Earnings</span>
                    <span className="font-semibold text-slate-700">{formatINR(latestPayroll.grossPay)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Total Deductions</span>
                    <span className="font-semibold text-rose-600">-{formatINR(latestPayroll.totalDeductions)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-400">
                No salary slips generated yet for this financial cycle.
              </div>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            icon={Download}
            className="w-full mt-4 text-xs"
            onClick={() => navigate('/payroll')}
          >
            View All Payslips
          </Button>
        </div>

        {/* Salary Advance & Services */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Salary Advance
              </span>
              {activeAdvance && <Badge status={activeAdvance.status} />}
            </div>

            {activeAdvance ? (
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400">Requested Amount</span>
                  <p className="text-xl font-bold text-slate-900">{formatINR(activeAdvance.amount)}</p>
                </div>
                <p className="text-slate-600 mt-1 line-clamp-2">{activeAdvance.purpose}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>Monthly Recovery:</span>
                  <span className="font-semibold text-slate-800">{formatINR(activeAdvance.monthlyDeduction)}</span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-400">
                You have no active salary advance requests.
              </div>
            )}
          </div>

          <Button
            size="sm"
            variant="primary"
            className="w-full mt-4 text-xs"
            onClick={() => navigate('/advances')}
          >
            Apply for Advance
          </Button>
        </div>
      </div>

      {/* Quick Employee Actions Banner */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Employee Self-Service Desk</p>
            <p className="text-xs text-indigo-700">Submit attendance punch, request advance, or file resignation & NOC</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/exit')}
            className="text-xs bg-white text-slate-700"
          >
            Resignation & NOC Desk
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
