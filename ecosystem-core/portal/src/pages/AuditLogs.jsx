import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { History, Shield, RefreshCw, Filter, Eye } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import Modal from '../components/common/Modal.jsx';
import UnauthorizedScreen from '../components/common/UnauthorizedScreen.jsx';

export default function AuditLogs() {
  const { isPlatformAdmin, hasPermission } = useAuth();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filterAction, setFilterAction] = useState('ALL');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/audit/logs?limit=50');
      setLogs(res.data || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (!isPlatformAdmin && !hasPermission('org.audit.view')) {
    return <UnauthorizedScreen requiredPermission="org.audit.view" title="Audit Trails Restricted" />;
  }

  const filteredLogs = logs.filter((log) => {
    if (filterAction === 'ALL') return true;
    return log.action?.includes(filterAction);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Immutable Audit Trails</h1>
          <p className="text-xs text-slate-500">
            Cryptographically sealed compliance log tracking all administrative, permission, and state mutations
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Trails
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="font-semibold text-slate-700">Filter Event:</span>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Recorded Actions</option>
          <option value="USER">User & Status Events</option>
          <option value="ROLE">Role & Scoped Assignments</option>
          <option value="BRANCH">Facility & Branch Events</option>
          <option value="FIRM">Legal Firm & Brand Events</option>
        </select>
        <span className="text-slate-400 ml-auto font-mono text-[11px]">
          Showing {filteredLogs.length} events
        </span>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Retrieving immutable audit logs from PostgreSQL 18..." />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Target Entity ID</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {log.entityType}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                    {log.entityId || '—'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                      title="Inspect Snapshot"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Snapshot Modal */}
      {selectedLog && (
        <Modal
          isOpen={Boolean(selectedLog)}
          onClose={() => setSelectedLog(null)}
          title={`Audit Snapshot: ${selectedLog.action}`}
        >
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 block">Entity:</span>
                <span className="font-semibold text-slate-800">{selectedLog.entityType}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Target ID:</span>
                <span className="font-mono text-slate-700">{selectedLog.entityId}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Timestamp:</span>
                <span className="text-slate-700">{new Date(selectedLog.createdAt).toISOString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block">IP:</span>
                <span className="font-mono text-slate-700">{selectedLog.ipAddress || 'localhost'}</span>
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-700 block mb-1">State Mutation Payload (JSON):</span>
              <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto max-h-60">
                {JSON.stringify(selectedLog.details || {}, null, 2)}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
