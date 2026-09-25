import React, { useState, useEffect } from 'react';
import {
  Activity,
  RefreshCw,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRightLeft,
  RotateCcw,
  Zap,
  Server,
  Eye,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export default function SyncMonitor() {
  const { isPlatformAdmin } = useAuth();
  const [overview, setOverview] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sync/overview');
      if (res.success && res.data) {
        setOverview(res.data);
      }

      // Fetch recent outbox events
      const evRes = await api.get('/sync/outbox/events?limit=25');
      if (evRes.success && evRes.data?.events) {
        setEvents(evRes.data.events);
      }
    } catch (err) {
      console.error('Error fetching sync overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, 6000);
    return () => clearInterval(interval);
  }, []);

  const triggerInitialSync = async () => {
    try {
      setActionLoading(true);
      setMessage({ type: 'info', text: 'Executing HRFlow to MAINTLY initial employee reconciliation...' });
      const res = await api.post('/sync/initial-sync', { dryRun: false });
      if (res.success) {
        const r = res.data?.reconciliation;
        setMessage({
          type: 'success',
          text: `Synchronization complete! ${r?.newEmployeesImported || 0} imported, ${r?.employeesUpdated || 0} updated, ${r?.matchedExistingCount || 0} matched existing.`,
        });
      } else {
        const errText = res.error?.message || (typeof res.error === 'string' ? res.error : 'Failed to complete initial sync');
        setMessage({ type: 'error', text: errText });
      }
      await fetchOverview();
    } catch (err) {
      const errText = err.message || (typeof err === 'string' ? err : 'Initial sync failed');
      setMessage({ type: 'error', text: errText });
    } finally {
      setActionLoading(false);
    }
  };

  const retryFailedOutbox = async () => {
    try {
      setActionLoading(true);
      const res = await api.post('/sync/retry-failed');
      setMessage({
        type: 'success',
        text: `Queued ${res.data?.retriedCount || 0} failed events for immediate re-publishing.`,
      });
      await fetchOverview();
    } catch (err) {
      const errText = err.message || (typeof err === 'string' ? err : 'Retry failed');
      setMessage({ type: 'error', text: errText });
    } finally {
      setActionLoading(false);
    }
  };

  const replayDLQ = async () => {
    try {
      setActionLoading(true);
      const res = await api.post('/sync/replay-dlq');
      setMessage({
        type: 'success',
        text: `Replayed ${res.data?.replayedCount || 0} dead-lettered messages back to topic exchange.`,
      });
      await fetchOverview();
    } catch (err) {
      const errText = err.message || (typeof err === 'string' ? err : 'DLQ replay failed');
      setMessage({ type: 'error', text: errText });
    } finally {
      setActionLoading(false);
    }
  };

  const queues = overview?.queues || {};
  const mainQueue = queues['maintly.employee.sync'] || {};
  const dlqQueue = queues['maintly.employee.sync.dlq'] || {};
  const outboxStats = overview?.hrflowOutbox?.data?.stats || {};

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">HRFlow ➔ MAINTLY Synchronization Monitor</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Transactional Outbox &bull; RabbitMQ Topic Routing &bull; Idempotent Consumption &bull; DLQ Replay
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchOverview}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={triggerInitialSync}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Run Initial Sync
          </button>

          <button
            onClick={retryFailedOutbox}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition"
          >
            <Zap className="w-3.5 h-3.5" />
            Retry Failed Events
          </button>

          <button
            onClick={replayDLQ}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Replay DLQ
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {message && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          message.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' :
          'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          <span>{typeof message.text === 'object' ? (message.text?.message || JSON.stringify(message.text)) : String(message.text || '')}</span>
          <button onClick={() => setMessage(null)} className="font-bold underline ml-4">Dismiss</button>
        </div>
      )}

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: RabbitMQ Engine */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AMQP Topic Broker</span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ONLINE
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">Port 5672</div>
            <p className="text-xs text-slate-500 mt-1">
              Exchange: <span className="font-mono text-blue-600">automobile.events.topic</span>
            </p>
          </div>
        </div>

        {/* Card 2: Main Sync Queue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">MAINTLY Sync Queue</span>
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              {mainQueue.consumerCount || 0} Consumer(s)
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{mainQueue.messageCount || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Pending in <span className="font-mono">maintly.employee.sync</span></p>
          </div>
        </div>

        {/* Card 3: Dead Letter Queue */}
        <div className={`p-5 rounded-xl border shadow-sm ${
          (dlqQueue.messageCount || 0) > 0 ? 'bg-rose-50/50 border-rose-200' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dead-Letter Queue</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              (dlqQueue.messageCount || 0) > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {(dlqQueue.messageCount || 0) > 0 ? 'NEEDS ATTENTION' : 'HEALTHY'}
            </span>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-bold ${(dlqQueue.messageCount || 0) > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {dlqQueue.messageCount || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">In <span className="font-mono">maintly.employee.sync.dlq</span></p>
          </div>
        </div>

        {/* Card 4: HRFlow Outbox */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">HRFlow Outbox</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {outboxStats.published || 0} Delivered
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {outboxStats.total || 0} <span className="text-xs font-normal text-slate-400">total events</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span className="text-amber-600 font-medium">{outboxStats.pending || 0} pending</span>
              <span>&bull;</span>
              <span className="text-rose-600 font-medium">{outboxStats.failed || 0} failed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Outbox Event History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Recent Transactional Outbox Events</h2>
          <span className="text-xs text-slate-500">{events.length} events logged in PostgreSQL</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Event ID</th>
                <th className="py-3 px-4 font-semibold">Event Type</th>
                <th className="py-3 px-4 font-semibold">Employee</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Retries</th>
                <th className="py-3 px-4 font-semibold">Created At</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No outbox events recorded yet. Employee creations, updates, or transfers in HRFlow will appear here automatically.
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                      {ev.id.substring(0, 8)}...
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                        {ev.eventType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{ev.payload?.fullName || ev.aggregateId}</div>
                      <div className="text-[11px] text-slate-400">{ev.payload?.employeeCode} &bull; {ev.payload?.designation}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[11px] ${
                        ev.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' :
                        ev.status === 'PENDING' ? 'bg-blue-50 text-blue-700' :
                        ev.status === 'PUBLISHING' ? 'bg-purple-50 text-purple-700' :
                        ev.status === 'FAILED' ? 'bg-amber-50 text-amber-700' :
                        'bg-rose-50 text-rose-700'
                      }`}>
                        {ev.status === 'PUBLISHED' && <CheckCircle2 className="w-3 h-3" />}
                        {ev.status === 'PENDING' && <Clock className="w-3 h-3" />}
                        {ev.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {ev.retryCount} / {ev.maxRetries}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(ev.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedEvent(ev)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-blue-600 transition"
                        title="View Payload"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Payload Inspection Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Event Payload Inspector</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedEvent.id}</p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto bg-slate-950 text-slate-200 font-mono text-xs rounded-b-xl">
              <pre>{JSON.stringify(selectedEvent, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
