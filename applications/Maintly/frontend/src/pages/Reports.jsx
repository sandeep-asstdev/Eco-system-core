import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { BarChart3, Download, DollarSign, Clock, Users, Wrench, RefreshCw } from 'lucide-react';

export default function Reports() {
  const { activeBranchId } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeBranchId) params.branchId = activeBranchId;
      const res = await api.get('/reports/summary', { params });
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeBranchId]);

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/reports/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `maintly-maintenance-report-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Reports & Operations Telemetry</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational SLAs, technician task completion rates, and material expenditure analytics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchReports}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold">Total Requests Handled</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{data?.totalRequests || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Across active branch scope</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold">Total Maintenance Material Cost</div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">
            ₹{(data?.totalMaintenanceCost || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Logged by technicians</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold">Purchase & Procurement Outlay</div>
          <div className="text-2xl font-bold text-indigo-600 mt-2">
            ₹{(data?.totalPurchaseSpend || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Approved purchase orders</div>
        </div>
      </div>

      {/* Technician Workload & Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Technician Workload & Resolution Metrics</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-4">Total Tasks Assigned</th>
                <th className="py-3 px-4">In Progress</th>
                <th className="py-3 px-4">Completed</th>
                <th className="py-3 px-4">Avg Resolution Time</th>
                <th className="py-3 px-4">Material Cost Logged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.technicianWorkload?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No technician metrics available.
                  </td>
                </tr>
              ) : (
                data?.technicianWorkload?.map((tech) => (
                  <tr key={tech.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{tech.name}</div>
                      <div className="text-[10px] text-slate-400">{tech.email}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{tech.totalAssigned}</td>
                    <td className="py-3 px-4 text-blue-600 font-bold">{tech.inProgressCount}</td>
                    <td className="py-3 px-4 text-emerald-600 font-bold">{tech.completedCount}</td>
                    <td className="py-3 px-4 text-slate-700">
                      {tech.avgResolutionTimeHours ? `${tech.avgResolutionTimeHours} hrs` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{tech.totalCostLogged.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost By Type breakdown table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Maintenance Cost Distribution By Category
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Work Category</th>
                <th className="py-3 px-4">Request Count</th>
                <th className="py-3 px-4">Estimated Budget</th>
                <th className="py-3 px-4">Actual Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.costByType?.map((item) => (
                <tr key={item.name} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-800">{item.name}</td>
                  <td className="py-3 px-4 text-slate-600">{item.count} requests</td>
                  <td className="py-3 px-4 text-slate-600">₹{item.estimated.toLocaleString()}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">₹{item.actual.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
