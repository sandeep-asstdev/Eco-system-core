import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  BarChart3, TrendingUp, DollarSign, Clock, AlertTriangle, ShieldCheck,
  Building2, Award, Flame, Scale, Layers, ChevronRight, Activity,
  Disc, Cpu, Hammer, Palette, Droplets, Zap, Wind, Wrench, X
} from 'lucide-react';

export default function Analytics({ initialTab }) {
  const { role, activeBranchId, branches } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab || 'branches'); // 'branches', 'cost', 'sla', 'health', 'heatmap'
  const [branchComparison, setBranchComparison] = useState([]);
  const [healthData, setHealthData] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [repeatFailures, setRepeatFailures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBay, setSelectedBay] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeBranchId) params.branchId = activeBranchId;

      const [compRes, healthRes, heatmapRes, repeatRes] = await Promise.all([
        api.get('/intelligence/branch-comparison').catch(() => ({ data: { data: [] } })),
        api.get('/intelligence/health-score', { params }).catch(() => ({ data: { data: null } })),
        api.get('/intelligence/heatmap', { params }).catch(() => ({ data: { data: { bays: [] } } })),
        api.get('/intelligence/repeat-failures', { params }).catch(() => ({ data: { data: [] } }))
      ]);

      setBranchComparison(compRes.data.data || []);
      setHealthData(healthRes.data.data);
      setHeatmapData(heatmapRes.data.data);
      setRepeatFailures(repeatRes.data.data || []);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [activeBranchId]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Enterprise Operations Telemetry</span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">Analytics & Maintenance Intelligence</h1>
          <p className="text-xs text-slate-500 mt-1">
            Comparative branch analytics, SLA penalties, transparent health score factors, and facility bay heatmaps.
          </p>
        </div>
      </div>

      {/* Analytics Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('branches')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'branches' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Branch Performance
        </button>
        <button
          onClick={() => setActiveTab('cost')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'cost' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Cost & Expenditure
        </button>
        <button
          onClick={() => setActiveTab('sla')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'sla' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          SLA & Penalties
        </button>
        <button
          onClick={() => setActiveTab('health')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'health' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Health Score & Debt
        </button>
        <button
          onClick={() => setActiveTab('heatmap')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'heatmap' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Bay Heatmap View
        </button>
      </div>

      {/* TAB 1: Branch Performance Comparison */}
      {activeTab === 'branches' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Regional Dealership Comparison</h3>
                <p className="text-xs text-slate-400">Comparing Hubballi, Dharwad, Belagavi, Gadag and company facilities</p>
              </div>
              <span className="text-xs font-bold text-slate-500">{branchComparison.length} Active Facilities</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Dealership Branch</th>
                    <th className="py-3 px-4">Maintenance Health</th>
                    <th className="py-3 px-4">Total Requests</th>
                    <th className="py-3 px-4">Open Backlog</th>
                    <th className="py-3 px-4">Overdue Work</th>
                    <th className="py-3 px-4">SLA Adherence</th>
                    <th className="py-3 px-4">PM Compliance</th>
                    <th className="py-3 px-4">Total Expenditure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {branchComparison.map((b) => (
                    <tr key={b.branchId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div>
                          <div>{b.name}</div>
                          <span className="text-[10px] text-slate-400 font-mono">Code: {b.code} • {b.city}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full font-extrabold text-[11px] ${
                          b.healthScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {b.healthScore} / 100
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{b.totalRequests}</td>
                      <td className="py-3 px-4 text-slate-700">{b.openRequests}</td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${b.overdueRequests > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                          {b.overdueRequests}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{b.slaCompliancePct}%</td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{b.pmCompliancePct}%</td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">₹{b.totalCost.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Cost Analysis */}
      {activeTab === 'cost' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reconciled Actual Total</span>
              <div className="text-2xl font-black text-slate-900 mt-2">
                ₹{branchComparison.reduce((s, b) => s + b.totalCost, 0).toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Across all authorized branches</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Spare Parts & Materials</span>
              <div className="text-2xl font-black text-indigo-600 mt-2">55%</div>
              <span className="text-[11px] text-slate-400 mt-1 block">Primary cost driver</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Internal Labour</span>
              <div className="text-2xl font-black text-blue-600 mt-2">35%</div>
              <span className="text-[11px] text-slate-400 mt-1 block">Direct technician hours</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vendor & Contractor Work</span>
              <div className="text-2xl font-black text-teal-600 mt-2">10%</div>
              <span className="text-[11px] text-slate-400 mt-1 block">Specialized third-party repairs</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SLA & Penalty Engine */}
      {activeTab === 'sla' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-md">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <Scale className="w-4 h-4" />
              <span>Automated Overdue Penalty Feature</span>
            </div>
            <h2 className="text-xl font-bold mt-1">SLA Breach Penalty Enforcement Engine</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              When a maintenance request crosses its SLA target completion time + 12-hour grace period, penalties automatically accrue based on priority (₹500/hr for High/Critical, ₹250/hr for Medium, ₹100/day for Low). Managers must provide a justified reason to waive accrued penalties.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Penalty Rates</span>
              <ul className="mt-3 space-y-2 text-xs text-slate-700">
                <li className="flex justify-between">
                  <span>High / Critical Breakdown:</span>
                  <span className="font-bold text-rose-600">₹500 / hour</span>
                </li>
                <li className="flex justify-between">
                  <span>Medium Facility Issue:</span>
                  <span className="font-bold text-amber-600">₹250 / hour</span>
                </li>
                <li className="flex justify-between">
                  <span>Low Routine Maintenance:</span>
                  <span className="font-bold text-slate-700">₹100 / day</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">SLA Grace Periods</span>
              <p className="text-xs text-slate-600 mt-2">
                12-hour automatic grace period is applied to all work orders before penalty accrual commences.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Waiver Governance</span>
              <p className="text-xs text-slate-600 mt-2">
                Penalties can only be waived by an authorized Branch Manager or Tenant Admin with a permanent immutable audit reason.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Health Score & Contributing Factors */}
      {activeTab === 'health' && healthData && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Calculated Health Score</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-4xl font-black text-slate-900">{healthData.score}</span>
                <span className="text-base font-bold text-slate-400">/ 100</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  {healthData.rating}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Transparently calculated from 7 operational parameters without arbitrary values.
              </p>
            </div>

            {/* Maintenance Debt indicator */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 max-w-md">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-900">
                  Maintenance Debt: {healthData.maintenanceDebt?.level}
                </span>
              </div>
              <ul className="mt-2 space-y-1 text-xs text-amber-800">
                {healthData.maintenanceDebt?.reasons?.map((r, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 7 Contributing Factors */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">The 7 Contributing Factors Breakdown</h3>
            <div className="space-y-3">
              {healthData.factors?.map((f, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{f.name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">(Weight: {f.weight})</span>
                    </div>
                    <span className="text-xs text-slate-500 mt-0.5 block">Current Metric: {f.value}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900">Score: {f.score} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Interactive Visual Maintenance Heatmap */}
      {activeTab === 'heatmap' && heatmapData && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Facility Bay & Zone Heatmap ({heatmapData.branch?.name})
                </h3>
                <p className="text-xs text-slate-400">Click any bay to view equipment health, downtime, and active issues</p>
              </div>

              {/* Status legend */}
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" /> Optimal (GREEN)
                </span>
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-3 h-3 rounded-full bg-amber-500" /> Attention / Open Work (YELLOW)
                </span>
                <span className="flex items-center gap-1.5 text-rose-700">
                  <span className="w-3 h-3 rounded-full bg-rose-500" /> Critical Breakdown (RED)
                </span>
              </div>
            </div>

            {/* Bay Grid Layout */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {heatmapData.bays?.map((bay) => {
                const isRed = bay.status === 'RED';
                const isYellow = bay.status === 'YELLOW';
                const isGreen = bay.status === 'GREEN';

                return (
                  <div
                    key={bay.id}
                    onClick={() => setSelectedBay(bay)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[140px] ${
                      isRed ? 'bg-rose-50/70 border-rose-400 hover:border-rose-500 shadow-xs' :
                      isYellow ? 'bg-amber-50/70 border-amber-300 hover:border-amber-400 shadow-xs' :
                      'bg-emerald-50/50 border-emerald-300 hover:border-emerald-400 shadow-2xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isRed ? 'bg-rose-500 text-white' : isYellow ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                        }`}>
                          {bay.status}
                        </span>
                        {isRed && <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />}
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 mt-2">{bay.name}</h4>
                      <span className="text-[11px] text-slate-500">{bay.zone}</span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/50 text-[11px] flex justify-between text-slate-700 font-semibold">
                      <span>{bay.openIssuesCount} Issue(s)</span>
                      <span>{bay.risk} Risk</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Bay Popover Details */}
          {selectedBay && (
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-md animate-fadeIn flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Selected Bay Details</span>
                <h4 className="text-sm font-bold text-slate-900">{selectedBay.name} ({selectedBay.zone})</h4>
                <div className="text-xs text-slate-600 flex items-center gap-3 pt-1">
                  <span>Assigned Equipment: <strong>{selectedBay.asset?.name || 'General Facility Bay'}</strong></span>
                  <span>•</span>
                  <span>Downtime: <strong>{selectedBay.downtimeHours} hours</strong></span>
                  <span>•</span>
                  <span>Status: <strong className={selectedBay.status === 'RED' ? 'text-rose-600' : 'text-emerald-600'}>{selectedBay.status}</strong></span>
                </div>
              </div>

              <button onClick={() => setSelectedBay(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
