import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  Clock,
  User,
  Activity,
  Layers
} from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

const MODULES = ['ALL', 'EMPLOYEE', 'PAYROLL', 'ADVANCE', 'APPROVAL', 'JOINING', 'RESIGNATION', 'VACANCY', 'SYSTEM'];

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 20 });
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
      };
      if (selectedModule !== 'ALL') params.module = selectedModule;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await api.get('/audit', { params });
      setLogs(res.data.data.logs || []);
      setPagination(res.data.data.pagination || { total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, selectedModule]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getActionBadgeColor = (action) => {
    if (action.includes('CREATE') || action.includes('JOIN') || action.includes('APPROVE')) return 'emerald';
    if (action.includes('UPDATE') || action.includes('CHANGE')) return 'blue';
    if (action.includes('HOLD') || action.includes('REJECT') || action.includes('RESIGN')) return 'amber';
    if (action.includes('DELETE') || action.includes('LEFT')) return 'rose';
    return 'neutral';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
            System Audit Trail
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable system logs capturing security, HR transactions, salary updates, and administrative events.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, ID, or value..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Module:
          </span>
          <div className="flex items-center gap-1.5">
            {MODULES.map((mod) => (
              <button
                key={mod}
                onClick={() => {
                  setSelectedModule(mod);
                  setPage(1);
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  selectedModule === mod
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {mod}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Record</th>
                <th className="py-3 px-4">Details / Values</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    Loading audit trail events...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8">
                    <EmptyState
                      icon={ShieldCheck}
                      title="No Audit Logs Found"
                      description="No recorded activities match the selected search and module filters."
                    />
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {formatDate(log.createdAt)}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                          {log.user?.email?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-800">
                            {log.user?.email || 'System Automated'}
                          </p>
                          {log.user?.role && (
                            <span className="text-[10px] text-indigo-600 font-semibold uppercase">
                              {log.user.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        <Layers className="w-3 h-3 text-slate-400" />
                        {log.module}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge variant={getActionBadgeColor(log.action)}>
                        {log.action}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-xs font-mono text-slate-600">
                      {log.recordId ? (
                        <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                          {log.recordId.slice(0, 16)}...
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate">
                      {log.newValue ? (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-indigo-600 hover:text-indigo-800 hover:underline text-left font-mono truncate block max-w-[200px]"
                          title="Click to view full diff"
                        >
                          {log.newValue}
                        </button>
                      ) : (
                        <span className="text-slate-400">No diff captured</span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-right text-xs font-mono text-slate-400">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-700">{logs.length}</strong> of{' '}
            <strong className="text-slate-700">{pagination.total}</strong> events
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700">
              Page {page} of {pagination.totalPages || 1}
            </span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* JSON Modal for Details */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Audit Event Payload ({selectedLog.action})
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400">Record ID:</span>{' '}
                <span className="font-mono font-medium text-slate-700">{selectedLog.recordId}</span>
              </div>
              <div>
                <span className="text-slate-400">Executed At:</span>{' '}
                <span className="text-slate-700">{new Date(selectedLog.createdAt).toLocaleString()}</span>
              </div>
              {selectedLog.oldValue && (
                <div>
                  <span className="text-slate-400 block mb-1">Previous State:</span>
                  <pre className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] overflow-x-auto text-slate-700">
                    {selectedLog.oldValue}
                  </pre>
                </div>
              )}
              {selectedLog.newValue && (
                <div>
                  <span className="text-slate-400 block mb-1">Updated State:</span>
                  <pre className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-[11px] overflow-x-auto text-indigo-900">
                    {selectedLog.newValue}
                  </pre>
                </div>
              )}
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
