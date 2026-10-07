import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  Briefcase,
  Building2,
  TrendingUp,
  AlertCircle,
  Download,
  RefreshCw,
  CheckCircle2,
  PieChart,
  Shield,
  CreditCard,
  Printer,
  ChevronRight,
  Layers,
  Award,
  Calendar,
} from 'lucide-react';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { formatINR } from '../../utils/formatters';

const CADRE_TIER_DESCRIPTIONS = {
  1: 'Frontline Support & Utility Staff',
  2: 'Workshop Technicians & Yard Crew',
  3: 'Service Advisors & Relationship Staff',
  4: 'Senior Diagnostic Masters & Sales Executives',
  5: 'Team Leads & Showroom Floor Managers',
  6: 'Department Heads (Sales, Service, Spares)',
  7: 'Assistant General Managers (AGMs)',
  8: 'Branch Managers & Profit Centre Heads',
  9: 'Vice Presidents & Functional Directors',
  10: 'Managing Director & Group Board',
};

export const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('manpower'); // 'manpower' | 'departments' | 'levels' | 'statutory'
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('ALL');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [manpowerRes, analyticsRes] = await Promise.all([
        api.get('/reports/manpower'),
        api.get('/reports/analytics').catch(() => ({ data: { data: null } })),
      ]);
      setData(manpowerRes.data.data || []);
      setAnalytics(analyticsRes.data.data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const totalSanctioned = data.reduce((acc, curr) => acc + (curr.sanctionedBudget || 0), 0);
  const totalActive = data.reduce((acc, curr) => acc + (curr.activeHeadcount || 0), 0);
  const totalOpen = data.reduce((acc, curr) => acc + (curr.openPositions || 0), 0);
  const totalGap = data.reduce((acc, curr) => acc + (curr.gap || 0), 0);
  const fillRate = totalSanctioned > 0 ? Math.round((totalActive / totalSanctioned) * 100) : 0;

  const filteredData =
    selectedBranch === 'ALL' ? data : data.filter((d) => d.branchId === selectedBranch);

  const exportCurrentTabCSV = () => {
    let headers = [];
    let rows = [];
    let filename = `hrflow_report_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (activeTab === 'manpower') {
      headers = ['Branch', 'City', 'Sanctioned Budget', 'Active Headcount', 'Open Vacancies', 'Gap', 'Fill Rate %'];
      rows = filteredData.map((d) => [
        d.branchName,
        d.city,
        d.sanctionedBudget,
        d.activeHeadcount,
        d.openPositions,
        d.gap,
        Math.round((d.activeHeadcount / (d.sanctionedBudget || 1)) * 100) + '%',
      ]);
    } else if (activeTab === 'departments') {
      headers = ['Department', 'Active Personnel', 'Open Requisitions', 'Male', 'Female'];
      rows = (analytics?.departments || []).map((d) => [
        d.name,
        d.active,
        d.openRequisitions,
        d.male,
        d.female,
      ]);
    } else if (activeTab === 'levels') {
      headers = ['Cadre Level', 'Title / Function', 'Headcount'];
      rows = (analytics?.levels || []).map((l) => [
        `Level ${l.level}`,
        l.title,
        l.count,
      ]);
    } else if (activeTab === 'statutory') {
      const s = analytics?.statutory || {};
      headers = ['Liability Metric', 'Estimated Amount (INR)'];
      rows = [
        ['Total Disbursed Gross Pay', s.totalGross || 0],
        ['Employee PF Deductions (12%)', s.totalPf || 0],
        ['Employer Matching PF Liability (12%)', s.employerPfEstimate || 0],
        ['Employee ESIC Deductions (0.75%)', s.totalEsi || 0],
        ['Employer Matching ESIC Liability (3.25%)', s.employerEsiEstimate || 0],
        ['Tax Deducted at Source (TDS)', s.totalTax || 0],
        ['Net Take-Home Disbursed', s.totalNet || 0],
      ];
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            <span>Executive Dealership Intelligence & Reports</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manpower utilization, Bellad Levels 1–10 cadre breakdown, department staffing ratios, and statutory liabilities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchReports}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportCurrentTabCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Active View (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Sanctioned Budget"
          value={totalSanctioned}
          subtitle="Authorized Group strength"
          icon={Building2}
          color="indigo"
        />
        <StatCard
          title="Active Headcount"
          value={totalActive}
          subtitle="Currently onboard"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Open Requisitions"
          value={totalOpen}
          subtitle="Active vacancies"
          icon={Briefcase}
          color="blue"
        />
        <StatCard
          title="Staffing Gap"
          value={totalGap}
          subtitle="Unfilled approved seats"
          icon={AlertCircle}
          color={totalGap > 0 ? 'amber' : 'emerald'}
        />
        <StatCard
          title="Overall Fill Rate"
          value={`${fillRate}%`}
          subtitle="Capacity utilization"
          icon={TrendingUp}
          color="violet"
        />
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2 overflow-x-auto shadow-xs">
        <button
          onClick={() => setActiveTab('manpower')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'manpower'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Branch Manpower & Budget Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'departments'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Dealership Department Breakdown</span>
        </button>

        <button
          onClick={() => setActiveTab('levels')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'levels'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>Bellad Levels 1–10 Cadre Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('statutory')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'statutory'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <span>Statutory Liabilities & PF/ESIC Register</span>
        </button>
      </div>

      {/* TAB 1: MANPOWER & BRANCH UTILIZATION */}
      {activeTab === 'manpower' && (
        <div className="space-y-6">
          <div className="bg-white rounded-b-xl border border-t-0 border-slate-200/80 shadow-xs p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Branch Capacity Utilization Cards</h2>
                <p className="text-xs text-slate-500">Authorized strength vs active workforce per showroom & workshop</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Branch:</span>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="ALL">All Branches</option>
                  {data.map((b) => (
                    <option key={b.branchId} value={b.branchId}>
                      {b.branchName} ({b.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {filteredData.map((branch) => {
                const pct =
                  branch.sanctionedBudget > 0
                    ? Math.round((branch.activeHeadcount / branch.sanctionedBudget) * 100)
                    : 100;
                return (
                  <div
                    key={branch.branchId}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-indigo-300 transition space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{branch.branchName}</h3>
                        <p className="text-[11px] text-slate-500">{branch.city}</p>
                      </div>
                      <Badge variant={pct >= 90 ? 'emerald' : pct >= 70 ? 'amber' : 'rose'}>
                        {pct}% Staffed
                      </Badge>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-slate-600">
                        <span>Active vs Sanctioned</span>
                        <span className="font-bold font-mono">
                          {branch.activeHeadcount} / {branch.sanctionedBudget}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            pct >= 90 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        Open Vacancies: <strong className="text-slate-800">{branch.openPositions}</strong>
                      </span>
                      <span className="text-slate-500">
                        Net Gap: <strong className={branch.gap > 0 ? 'text-amber-600' : 'text-emerald-600'}>{branch.gap}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Manpower Allocation Matrix Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Detailed Branch Manpower Matrix
              </h2>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                {filteredData.length} Locations
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Dealership Facility</th>
                    <th className="py-3 px-4 text-center">Sanctioned Strength</th>
                    <th className="py-3 px-4 text-center">Active Workforce</th>
                    <th className="py-3 px-4 text-center">Open Requisitions</th>
                    <th className="py-3 px-4 text-center">Staffing Gap</th>
                    <th className="py-3 px-4 text-center">Staffing %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((branch) => {
                    const pct =
                      branch.sanctionedBudget > 0
                        ? Math.round((branch.activeHeadcount / branch.sanctionedBudget) * 100)
                        : 100;
                    return (
                      <tr key={branch.branchId} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {branch.branchName}{' '}
                          <span className="text-slate-400 font-normal">({branch.city})</span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-800 font-mono">
                          {branch.sanctionedBudget}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-700 font-mono">
                          {branch.activeHeadcount}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-blue-700 font-mono">
                          {branch.openPositions}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
                              branch.gap > 0
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {branch.gap > 0 ? `-${branch.gap}` : 'Full'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold font-mono text-slate-800">
                          {pct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEALERSHIP DEPARTMENT BREAKDOWN */}
      {activeTab === 'departments' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200/80 shadow-xs p-6 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Departmental Staffing Ratios & Gender Diversity
            </h2>
            <p className="text-xs text-slate-500">
              Headcount distribution across Sales, Workshop, Spares, CRM, Accounts, and Bodyshop
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(analytics?.departments || []).map((dept, idx) => {
              const totalDept = dept.total || 1;
              const femalePct = Math.round((dept.female / totalDept) * 100);

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        Dept
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">{dept.name}</h3>
                    </div>
                    <span className="text-lg font-black text-slate-900 font-mono">{dept.active}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs p-2.5 bg-slate-50 rounded-lg">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Open Reqs</span>
                      <span className="font-bold text-blue-700">{dept.openRequisitions || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Gender Ratio</span>
                      <span className="font-medium text-slate-700">
                        {dept.male}M / {dept.female}F
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                      <span>Diversity Index</span>
                      <span>{femalePct}% Female</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full"
                        style={{ width: `${femalePct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: BELLAD LEVELS 1-10 CADRE MATRIX */}
      {activeTab === 'levels' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Bellad Group Cadre Hierarchy (Levels 1 to 10)
              </h2>
              <p className="text-xs text-slate-500">
                Authorized dealership organizational band structure and workforce distribution
              </p>
            </div>
            <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-xs font-bold">
              10 Official Bellad Levels Enforced
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {(analytics?.levels || []).map((lvl) => {
              const desc = CADRE_TIER_DESCRIPTIONS[lvl.level] || 'Automobile Dealership Cadre';
              const isLeadership = lvl.level >= 8;
              const isManagement = lvl.level >= 5 && lvl.level <= 7;

              return (
                <div
                  key={lvl.level}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-sm shrink-0 border ${
                        isLeadership
                          ? 'bg-slate-900 text-amber-400 border-slate-800'
                          : isManagement
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      L{lvl.level}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{lvl.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{desc}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black text-slate-900 font-mono">{lvl.count}</div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Staff</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: STATUTORY LIABILITIES & REGISTER */}
      {activeTab === 'statutory' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200/80 shadow-xs p-6 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Monthly Statutory Compensation & Group Liabilities
            </h2>
            <p className="text-xs text-slate-500">
              PF (12%), ESIC (3.25% employer / 0.75% employee), PT Karnataka, and net disbursement summary
            </p>
          </div>

          {(() => {
            const s = analytics?.statutory || {};

            return (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="text-slate-500 text-xs font-semibold block">Gross Monthly Payroll</span>
                    <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                      {formatINR(s.totalGross || 0)}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 block">Aggregate salary bill</span>
                  </div>

                  <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50">
                    <span className="text-indigo-900 text-xs font-semibold block">Total Employer PF & ESI Dues</span>
                    <span className="text-2xl font-black text-indigo-700 font-mono mt-1 block">
                      {formatINR((s.employerPfEstimate || 0) + (s.employerEsiEstimate || 0))}
                    </span>
                    <span className="text-[11px] text-indigo-600 mt-1 block">Statutory compliance remittance</span>
                  </div>

                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                    <span className="text-emerald-900 text-xs font-semibold block">Net Disbursed Take-Home</span>
                    <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">
                      {formatINR(s.totalNet || 0)}
                    </span>
                    <span className="text-[11px] text-emerald-600 mt-1 block">Direct bank NEFT credit</span>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-50 px-4 py-2.5 font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 flex justify-between">
                    <span>Statutory Item / Fund</span>
                    <span>Remittance Basis</span>
                    <span className="text-right">Estimated Liability (₹)</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    <div className="flex justify-between items-center p-3">
                      <div>
                        <span className="font-bold text-slate-900 block">Employees' Provident Fund (EPF - Employee 12%)</span>
                        <span className="text-[10px] text-slate-500">Deducted from Employee Basic</span>
                      </div>
                      <span className="font-mono text-slate-600">12.00%</span>
                      <span className="font-mono font-bold text-rose-600 text-right">
                        {formatINR(s.totalPf || 0)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3">
                      <div>
                        <span className="font-bold text-slate-900 block">Employer Matching PF (12%)</span>
                        <span className="text-[10px] text-slate-500">Company Contribution (EPF 3.67% + EPS 8.33%)</span>
                      </div>
                      <span className="font-mono text-slate-600">12.00%</span>
                      <span className="font-mono font-bold text-indigo-700 text-right">
                        {formatINR(s.employerPfEstimate || 0)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3">
                      <div>
                        <span className="font-bold text-slate-900 block">Employees' State Insurance (ESIC - Employee 0.75%)</span>
                        <span className="text-[10px] text-slate-500">Deducted from Gross Pay (&lt;= ₹21,000)</span>
                      </div>
                      <span className="font-mono text-slate-600">0.75%</span>
                      <span className="font-mono font-bold text-rose-600 text-right">
                        {formatINR(s.totalEsi || 0)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3">
                      <div>
                        <span className="font-bold text-slate-900 block">Employer Matching ESIC (3.25%)</span>
                        <span className="text-[10px] text-slate-500">Company Medical Benefit Contribution</span>
                      </div>
                      <span className="font-mono text-slate-600">3.25%</span>
                      <span className="font-mono font-bold text-indigo-700 text-right">
                        {formatINR(s.employerEsiEstimate || 0)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3">
                      <div>
                        <span className="font-bold text-slate-900 block">Tax Deducted at Source (TDS Section 192)</span>
                        <span className="text-[10px] text-slate-500">Income Tax Department Remittance</span>
                      </div>
                      <span className="font-mono text-slate-600">Applicable Slabs</span>
                      <span className="font-mono font-bold text-slate-800 text-right">
                        {formatINR(s.totalTax || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
