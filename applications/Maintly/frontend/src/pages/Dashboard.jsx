import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { PriorityBadge, WorkStatusBadge, TicketBadge } from '../components/StatusBadge.jsx';
import {
  Wrench, PlusCircle, RefreshCw, Clock, ArrowRight,
  CheckCircle2, CreditCard, AlertCircle, FileText,
  UserCheck, ShieldCheck, CheckCheck, LayoutGrid, ListFilter,
  MapPin, Building2, Laptop, Zap, ChevronRight, Sparkles, Filter
} from 'lucide-react';

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function getCategoryIcon(catName) {
  const lower = String(catName || '').toLowerCase();
  if (lower.includes('elect') || lower.includes('power')) return Zap;
  if (lower.includes('it') || lower.includes('comp') || lower.includes('lap') || lower.includes('pendrive') || lower.includes('hardware')) return Laptop;
  if (lower.includes('civil') || lower.includes('plumb') || lower.includes('build') || lower.includes('facility')) return Building2;
  return Wrench;
}

export default function Dashboard() {
  const { user, role, activeBranchId } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('stream'); // 'stream' (cards) or 'table' (grid)
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'APPROVAL', 'ACTIVE', 'COMPLETED'

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeBranchId) params.branchId = activeBranchId;
      const res = await api.get('/dashboard/metrics', { params });
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeBranchId]);

  const simple = data?.simpleSummary || {
    myRequests: 0,
    pendingApproval: 0,
    assignedToMe: 0,
    inProgress: 0,
    completed: 0,
    paymentPending: 0,
    closed: 0
  };

  const pendingActions = Array.isArray(data?.pendingActionsSummary) ? data.pendingActionsSummary : [];
  const recentRequests = Array.isArray(data?.recentRequests) ? data.recentRequests : [];

  const filteredRecent = recentRequests.filter((req) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'APPROVAL') {
      return ['WAITING_FOR_APPROVAL', 'PENDING_APPROVAL', 'NEW'].includes(req.workStatus);
    }
    if (statusFilter === 'ACTIVE') {
      return ['ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_PURCHASE', 'WAITING_FOR_VENDOR'].includes(req.workStatus);
    }
    if (statusFilter === 'COMPLETED') {
      return ['COMPLETED', 'CLOSED'].includes(req.workStatus);
    }
    return true;
  });

  const cards = [
    {
      id: 'my_requests',
      title: 'MY REQUESTS',
      count: simple.myRequests,
      view: 'my_requests',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50/70',
      border: 'border-indigo-100',
      hoverBorder: 'hover:border-indigo-300'
    },
    {
      id: 'pending_approval',
      title: 'PENDING APPROVAL',
      count: simple.pendingApproval,
      view: 'pending_approval',
      color: 'text-amber-600',
      bg: 'bg-amber-50/70',
      border: 'border-amber-100',
      hoverBorder: 'hover:border-amber-300'
    },
    {
      id: 'assigned_to_me',
      title: 'ASSIGNED TO ME',
      count: simple.assignedToMe,
      view: 'assigned_to_me',
      color: 'text-blue-600',
      bg: 'bg-blue-50/70',
      border: 'border-blue-100',
      hoverBorder: 'hover:border-blue-300'
    },
    {
      id: 'in_progress',
      title: 'IN PROGRESS',
      count: simple.inProgress,
      view: 'in_progress',
      color: 'text-sky-600',
      bg: 'bg-sky-50/70',
      border: 'border-sky-100',
      hoverBorder: 'hover:border-sky-300'
    },
    {
      id: 'completed',
      title: 'COMPLETED',
      count: simple.completed,
      view: 'completed',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-100',
      hoverBorder: 'hover:border-emerald-300'
    },
    {
      id: 'payment_pending',
      title: 'PAYMENT PENDING',
      count: simple.paymentPending,
      view: 'payment_pending',
      color: 'text-purple-600',
      bg: 'bg-purple-50/70',
      border: 'border-purple-100',
      hoverBorder: 'hover:border-purple-300'
    },
    {
      id: 'closed',
      title: 'CLOSED',
      count: simple.closed,
      view: 'closed',
      color: 'text-slate-600',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      hoverBorder: 'hover:border-slate-300'
    }
  ];

  const getActionTheme = (action) => {
    const id = action.id || '';
    if (id === 'approval' || action.view === 'pending_approval') {
      return {
        icon: Clock,
        iconBg: 'bg-amber-500/10 text-amber-600',
        activeBorder: 'border-amber-200/90 bg-amber-50/40 hover:bg-amber-50 hover:border-amber-300',
        badgeBg: 'bg-amber-100/80 text-amber-700'
      };
    }
    if (id === 'assigned' || action.view === 'assigned_to_me') {
      return {
        icon: UserCheck,
        iconBg: 'bg-blue-500/10 text-blue-600',
        activeBorder: 'border-blue-200/90 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-300',
        badgeBg: 'bg-blue-100/80 text-blue-700'
      };
    }
    if (id === 'payment' || action.view === 'payment_pending') {
      return {
        icon: CreditCard,
        iconBg: 'bg-emerald-500/10 text-emerald-600',
        activeBorder: 'border-emerald-200/90 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-300',
        badgeBg: 'bg-emerald-100/80 text-emerald-700'
      };
    }
    return {
      icon: FileText,
      iconBg: 'bg-purple-500/10 text-purple-600',
      activeBorder: 'border-purple-200/90 bg-purple-50/40 hover:bg-purple-50 hover:border-purple-300',
      badgeBg: 'bg-purple-100/80 text-purple-700'
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">MAINTLY</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Operations Suite
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Welcome back, <span className="font-semibold text-slate-700">{user?.firstName || 'User'}</span>. Simplified maintenance request & lifecycle tracking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => navigate('/requests?action=new')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-xs shadow-indigo-200 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ New Request</span>
          </button>
        </div>
      </div>

      {/* 7 Core Workflow Status Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {cards.map((card, idx) => (
          <div
            key={card.id}
            onClick={() => navigate(`/requests?view=${card.view}`)}
            className={`p-3.5 rounded-xl border ${card.border} ${card.bg} ${card.hoverBorder} transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs group ${
              idx === cards.length - 1 ? 'col-span-2 sm:col-span-1' : ''
            }`}
          >
            <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase truncate">
              {card.title}
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className={`text-2xl font-black tracking-tight ${card.color}`}>
                {card.count}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout: Pending Actions + Operations Stream / Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Pending Actions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Pending Actions
                  </h2>
                  <p className="text-[10px] text-slate-400">Action items requiring attention</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                Live Queue
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {pendingActions.map((action, idx) => {
                const count = action.count || 0;
                const isZero = count === 0;
                const theme = getActionTheme(action);
                const IconComponent = theme.icon;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (!isZero) navigate(`/requests?view=${action.view}`);
                    }}
                    className={`group flex items-center justify-between p-3.5 rounded-xl border text-xs transition-all duration-150 ${
                      isZero
                        ? 'border-slate-100 bg-slate-50/50 text-slate-400 cursor-default'
                        : `${theme.activeBorder} text-slate-800 cursor-pointer shadow-2xs hover:shadow-xs`
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                          isZero ? 'bg-slate-100 text-slate-400' : theme.iconBg
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className={`truncate ${isZero ? 'font-normal' : 'font-semibold text-slate-900'}`}>
                          {action.label}
                        </div>
                        {action.title && (
                          <div className="text-[10px] text-slate-400 font-medium">
                            {action.title}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span
                        className={`px-2 py-0.5 text-xs font-bold rounded-md font-mono ${
                          isZero ? 'bg-slate-100 text-slate-400' : theme.badgeBg
                        }`}
                      >
                        {count}
                      </span>
                      {!isZero && (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-transform group-hover:translate-x-0.5" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Automated workflow triggers
            </span>
            <button
              onClick={() => navigate('/requests')}
              className="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline cursor-pointer"
            >
              View all requests →
            </button>
          </div>
        </div>

        {/* Right Column: Operations Activity Stream / Executive Table */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header: Title + Live Sync + Dual Mode Switcher + Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Recent Requests
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Activity
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Latest maintenance activity across your permitted branches
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                {/* View Mode Toggle: Stream (Cards) vs Table (Grid) */}
                <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                  <button
                    onClick={() => setViewMode('stream')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-xs transition-all cursor-pointer ${
                      viewMode === 'stream'
                        ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Card Stream View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Cards</span>
                  </button>

                  <button
                    onClick={() => setViewMode('table')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-xs transition-all cursor-pointer ${
                      viewMode === 'table'
                        ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Executive Data Grid"
                  >
                    <ListFilter className="w-3.5 h-3.5" />
                    <span>Table</span>
                  </button>
                </div>

                <button
                  onClick={() => navigate('/requests')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer pl-1"
                >
                  View all →
                </button>
              </div>
            </div>

            {/* Quick Status Filter Tabs */}
            <div className="flex items-center gap-1.5 pt-3 pb-2 overflow-x-auto text-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Filter:
              </span>
              {[
                { id: 'ALL', label: 'All', count: recentRequests.length },
                {
                  id: 'APPROVAL',
                  label: 'Waiting Approval',
                  count: recentRequests.filter((r) => ['WAITING_FOR_APPROVAL', 'PENDING_APPROVAL', 'NEW'].includes(r.workStatus)).length
                },
                {
                  id: 'ACTIVE',
                  label: 'Active Work',
                  count: recentRequests.filter((r) => ['ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_PURCHASE', 'WAITING_FOR_VENDOR'].includes(r.workStatus)).length
                },
                {
                  id: 'COMPLETED',
                  label: 'Completed',
                  count: recentRequests.filter((r) => ['COMPLETED', 'CLOSED'].includes(r.workStatus)).length
                }
              ].map((tab) => {
                const isActive = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                        : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1 rounded-full ${isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-500'}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Main Content Area: Cards Stream View vs Table Grid View */}
            {filteredRecent.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-medium text-slate-600">No requests match this filter.</p>
                <p className="text-xs text-slate-400 mt-0.5">Switch filter or create a new request.</p>
              </div>
            ) : viewMode === 'stream' ? (
              /* MODERN ACTIVITY STREAM (Cards View) */
              <div className="mt-2 space-y-2.5">
                {filteredRecent.map((req) => {
                  const CategoryIcon = getCategoryIcon(req.maintenanceType?.name || req.subject);
                  const assignedName = req.assignedTo
                    ? `${req.assignedTo.firstName || ''} ${req.assignedTo.lastName || ''}`.trim()
                    : null;

                  return (
                    <div
                      key={req.id}
                      onClick={() => navigate(`/requests/${req.id}`)}
                      className="group p-3.5 rounded-xl border border-slate-200/70 hover:border-indigo-300 bg-white hover:bg-indigo-50/20 transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                    >
                      {/* Left: Category Icon + Subject + TicketBadge + Metadata */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs transition-transform group-hover:scale-105"
                          style={{
                            backgroundColor: `${req.maintenanceType?.color || '#4f46e5'}15`,
                            borderColor: `${req.maintenanceType?.color || '#4f46e5'}35`,
                            color: req.maintenanceType?.color || '#4f46e5'
                          }}
                        >
                          <CategoryIcon className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <TicketBadge requestNumber={req.requestNumber} showFull={false} />
                            <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-sm">
                              {req.subject}
                            </h3>
                            <PriorityBadge priority={req.priority} />
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1.5">
                            {req.branch?.name && (
                              <span className="flex items-center gap-1 text-slate-600 font-medium">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {req.branch.name}
                              </span>
                            )}

                            {req.department?.name && (
                              <span className="flex items-center gap-1 text-slate-500">
                                <Building2 className="w-3 h-3 text-slate-400" />
                                {req.department.name}
                              </span>
                            )}

                            <span className="flex items-center gap-1 text-slate-400">
                              <Clock className="w-3 h-3" />
                              {formatDate(req.createdAt)}
                            </span>

                            <span className="font-mono text-[10px] text-slate-400 hidden md:inline">
                              {req.requestNumber}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Assignee + Status + Action Chevron */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {assignedName ? (
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                              {getInitials(assignedName)}
                            </div>
                            <span className="font-medium truncate max-w-[110px]">{assignedName}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
                            Unassigned
                          </span>
                        )}

                        <WorkStatusBadge status={req.workStatus} />

                        <div className="w-7 h-7 rounded-lg bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white text-slate-400 flex items-center justify-center transition-colors">
                          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* EXECUTIVE DATA GRID (Table View) */
              <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200/80">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-3.5">Ticket #</th>
                      <th className="py-3 px-3.5">Issue</th>
                      <th className="py-3 px-3.5">Branch</th>
                      <th className="py-3 px-3.5">Assigned To</th>
                      <th className="py-3 px-3.5">Priority</th>
                      <th className="py-3 px-3.5">Status</th>
                      <th className="py-3 px-3.5 text-right">Date</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredRecent.map((req) => {
                      const assignedName = req.assignedTo
                        ? `${req.assignedTo.firstName || ''} ${req.assignedTo.lastName || ''}`.trim()
                        : null;

                      return (
                        <tr
                          key={req.id}
                          onClick={() => navigate(`/requests/${req.id}`)}
                          className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                        >
                          <td className="py-3 px-3.5">
                            <TicketBadge requestNumber={req.requestNumber} showFull={true} />
                          </td>

                          <td className="py-3 px-3.5 max-w-[220px]">
                            <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                              {req.subject}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {req.maintenanceType?.name || 'General Maintenance'}
                            </div>
                          </td>

                          <td className="py-3 px-3.5 text-slate-600">
                            <div className="flex items-center gap-1 font-medium">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[130px]">{req.branch?.name || '-'}</span>
                            </div>
                          </td>

                          <td className="py-3 px-3.5">
                            {assignedName ? (
                              <div className="flex items-center gap-1.5 text-slate-700">
                                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {getInitials(assignedName)}
                                </div>
                                <span className="font-medium truncate max-w-[120px]">{assignedName}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Unassigned</span>
                            )}
                          </td>

                          <td className="py-3 px-3.5">
                            <PriorityBadge priority={req.priority} />
                          </td>

                          <td className="py-3 px-3.5">
                            <WorkStatusBadge status={req.workStatus} />
                          </td>

                          <td className="py-3 px-3.5 text-right font-medium text-slate-500">
                            {formatDate(req.createdAt)}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <span className="inline-flex items-center text-indigo-600 group-hover:text-indigo-800 font-semibold group-hover:underline text-[11px]">
                              View →
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer stats */}
          <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Showing recent requests across permitted branches</span>
            <button
              onClick={() => navigate('/requests')}
              className="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline"
            >
              Browse entire archive ({simple.myRequests + simple.completed + simple.closed} total) →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
