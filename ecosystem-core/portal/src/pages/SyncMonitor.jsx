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
  X,
  Shield,
  Radio,
  Play,
  Filter,
  Database,
  Search,
  Cpu,
  ArrowUpRight,
  Check
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
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'outbox' | 'dlq' | 'queues'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sync/overview');
      if (res.success && res.data) {
        setOverview(res.data);
      }

      // Fetch recent outbox events
      const evRes = await api.get('/sync/outbox/events?limit=50');
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
    const interval = setInterval(fetchOverview, 5000);
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

  const retrySingleOutbox = async (eventId) => {
    try {
      setActionLoading(true);
      const res = await api.post(`/sync/outbox/retry/${eventId}`);
      if (res.success) {
        setMessage({
          type: 'success',
          text: `Event ${eventId} queued for immediate retry.`,
        });
      } else {
        setMessage({
          type: 'error',
          text: res.error?.message || 'Failed to retry event',
        });
      }
      await fetchOverview();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Retry failed' });
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
  const registeredApps = overview?.registeredApplications || [];
  const dlqMessages = overview?.dlqMessages || [];
  const recentSyncLogs = overview?.recentSyncLogs || [];
  const lastSync = recentSyncLogs.find(l => l.action.includes('SYNC')) || null;

  // Filter events
  const filteredEvents = events.filter((ev) => {
    const matchesStatus = statusFilter === 'ALL' || ev.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      ev.id.toLowerCase().includes(q) ||
      (ev.eventType && ev.eventType.toLowerCase().includes(q)) ||
      (ev.payload?.fullName && ev.payload.fullName.toLowerCase().includes(q)) ||
      (ev.payload?.employeeCode && ev.payload.employeeCode.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-xl shadow-sm">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Central Integration & Event Monitor
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Stream
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-Application Health &bull; Distributed Event Pipeline &bull; Outbox Guarantee &bull; DLQ Governance
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchOverview}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={triggerInitialSync}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Run Initial Sync
          </button>

          <button
            onClick={retryFailedOutbox}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition"
          >
            <Zap className="w-3.5 h-3.5" />
            Retry All Failed
          </button>

          <button
            onClick={replayDLQ}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Replay DLQ ({dlqMessages.length})
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
          <button onClick={() => setMessage(null)} className="font-bold underline ml-4 hover:opacity-80">Dismiss</button>
        </div>
      )}

      {/* Global Stat Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Registered Apps</span>
            <Server className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{registeredApps.length}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
            {registeredApps.filter(a => a.health === 'HEALTHY').length} Healthy
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Events Published</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{outboxStats.published || 0}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">HRFlow Outbox Engine</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Outbox</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600">{outboxStats.pending || 0}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Awaiting broker batch</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Failed Events</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600">{outboxStats.failed || 0}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Safe retry enabled</p>
        </div>

        <div className={`p-4 rounded-xl border shadow-xs ${
          dlqMessages.length > 0 ? 'bg-rose-50/60 border-rose-300' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Dead Letters</span>
            <Shield className={`w-4 h-4 ${dlqMessages.length > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <div className={`mt-2 text-2xl font-bold ${dlqMessages.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {dlqMessages.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {dlqMessages.length > 0 ? 'Requires attention' : 'DLQ Clean'}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Application & Broker Grid
        </button>

        <button
          onClick={() => setActiveTab('outbox')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'outbox'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Transactional Outbox ({events.length})
        </button>

        <button
          onClick={() => setActiveTab('dlq')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'dlq'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Dead-Letter Queue ({dlqMessages.length})
        </button>

        <button
          onClick={() => setActiveTab('queues')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'queues'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          RabbitMQ Queues ({Object.keys(queues).length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & APPLICATION GRID */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Registered Applications Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Ecosystem Applications Live Status</h2>
                <p className="text-xs text-slate-500">
                  Continuous health probe and event contract registration
                </p>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {registeredApps.length} active apps
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {registeredApps.map((app) => (
                <div
                  key={app.id || app.appKey}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition bg-slate-50/50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-sm text-slate-900">{app.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">{app.appKey} &bull; v{app.version}</div>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        app.health === 'HEALTHY'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${app.health === 'HEALTHY' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        {app.health}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Category:</span>
                        <span className="font-semibold text-slate-700">{app.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Publishes:</span>
                        <span className="font-mono text-blue-600 text-[11px]">
                          {Array.isArray(app.eventsPublished) ? app.eventsPublished.length : 0} event(s)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Subscribes:</span>
                        <span className="font-mono text-purple-600 text-[11px]">
                          {Array.isArray(app.eventsSubscribed) ? app.eventsSubscribed.length : 0} event(s)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 truncate max-w-[180px] font-mono">{app.baseUrl}</span>
                    <a
                      href={app.baseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5"
                    >
                      Open <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Broker Infrastructure & Last Sync Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Broker Specs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Message Broker Topology</h3>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  AMQP 0-9-1
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Topic Exchange</span>
                  <span className="font-mono font-semibold text-slate-900">automobile.events.topic (Durable)</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Dead-Letter Exchange (DLX)</span>
                  <span className="font-mono font-semibold text-rose-700">automobile.events.dlx</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Broker Ports</span>
                  <span className="font-mono font-semibold text-slate-900">5672 (AMQP) &bull; 15672 (HTTP)</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Delivery Guarantees</span>
                  <span className="font-semibold text-blue-700">At-Least-Once + Idempotent Consumers</span>
                </div>
              </div>
            </div>

            {/* Reconciliation & Recent Sync Audit */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Initial Data Synchronization Status</h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  {lastSync ? new Date(lastSync.createdAt).toLocaleTimeString() : 'Ready'}
                </span>
              </div>

              {lastSync ? (
                <div className="space-y-2.5">
                  <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs">
                    <div className="font-semibold text-blue-900 mb-1">Last Reconciliation Activity</div>
                    <div className="text-slate-600 text-[11px]">
                      Action: <span className="font-mono font-bold text-slate-800">{lastSync.action}</span>
                    </div>
                    <div className="text-slate-600 text-[11px] mt-0.5">
                      Completed: {new Date(lastSync.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <div className="text-[11px] font-semibold text-slate-700">Audit History (Last 3 Operations):</div>
                    {recentSyncLogs.slice(0, 3).map((log) => (
                      <div key={log.id} className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                        <span>{log.action}</span>
                        <span className="font-mono">{new Date(log.createdAt).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  No explicit initial sync recorded yet. Click "Run Initial Sync" above to snapshot existing employees.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRANSACTIONAL OUTBOX STREAM */}
      {activeTab === 'outbox' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">HRFlow Transactional Outbox Stream</h2>
              <p className="text-xs text-slate-500">Atomic persistence with database transaction &bull; Periodic publisher delivery</p>
            </div>

            {/* Filter and Search Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search event ID, code, name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-1.5 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="DEAD_LETTER">Dead Letter</option>
              </select>
            </div>
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
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      No outbox events match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((ev) => (
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
                        <div className="font-medium text-slate-900">{ev.payload?.fullName || ev.payload?.displayName || ev.aggregateId}</div>
                        <div className="text-[11px] text-slate-400">{ev.payload?.employeeCode} &bull; {ev.payload?.designation}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[11px] ${
                          ev.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          ev.status === 'PENDING' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          ev.status === 'FAILED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
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
                      <td className="py-3 px-4 text-right flex items-center justify-end gap-1.5">
                        {ev.status !== 'PUBLISHED' && (
                          <button
                            onClick={() => retrySingleOutbox(ev.id)}
                            disabled={actionLoading}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded text-[11px] font-semibold flex items-center gap-1 transition"
                            title="Retry Event"
                          >
                            <Zap className="w-3 h-3" />
                            Retry
                          </button>
                        )}
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
      )}

      {/* TAB 3: DEAD-LETTER QUEUE (DLQ) INSPECTOR */}
      {activeTab === 'dlq' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Dead-Letter Queue Inspector
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  automobile.events.dlx
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Poison messages rejected by consumers after retry exhaustion are isolated here without blocking queues
              </p>
            </div>

            <button
              onClick={replayDLQ}
              disabled={actionLoading || dlqMessages.length === 0}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Replay All to Topic
            </button>
          </div>

          {dlqMessages.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <div className="font-semibold text-slate-700 text-sm">Dead-Letter Queue is Clean</div>
              <p className="mt-1">All messages delivered and acknowledged successfully by subscribed consumers.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dlqMessages.map((msg, idx) => (
                <div key={msg.id || idx} className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-rose-900">{msg.id}</span>
                      <span className="bg-rose-100 text-rose-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                        {msg.eventType || 'Unknown Event'}
                      </span>
                    </div>
                    <div className="text-slate-600 mt-1">
                      Routing Key: <span className="font-mono text-slate-800">{msg.routingKey}</span> &bull; Tenant: <span className="font-mono text-slate-800">{msg.tenantId || 'GLOBAL'}</span>
                    </div>
                    <div className="text-rose-700 font-medium text-[11px] mt-1">
                      Error: {msg.error}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedEvent(msg)}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-semibold text-[11px]"
                    >
                      Inspect
                    </button>
                    <button
                      onClick={replayDLQ}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-[11px]"
                    >
                      Replay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: RABBITMQ QUEUES & TOPIC BINDINGS */}
      {activeTab === 'queues' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Provisioned Queues & Consumer Bindings</h2>
            <p className="text-xs text-slate-500">Dynamic queue assertions and topic exchange subscription routes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(queues).map(([qName, qDetails]) => (
              <div key={qName} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="font-mono font-bold text-xs text-slate-900">{qName}</div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    qName.endsWith('.dlq') ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {qName.endsWith('.dlq') ? 'DEAD_LETTER' : 'ACTIVE_QUEUE'}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">Pending Messages</span>
                    <span className="font-bold text-slate-900 text-sm">{qDetails.messageCount || 0}</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">Active Consumers</span>
                    <span className="font-bold text-slate-900 text-sm">{qDetails.consumerCount || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* JSON Payload Inspection Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Event Payload Inspector</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedEvent.id || selectedEvent.eventId}</p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-[480px] overflow-y-auto bg-slate-950 text-slate-200 font-mono text-xs rounded-b-2xl">
              <pre>{JSON.stringify(selectedEvent, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
