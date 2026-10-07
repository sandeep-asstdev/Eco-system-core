import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, XCircle, ArrowUpRight, RotateCcw } from 'lucide-react';

export function WorkStatusBadge({ status }) {
  const normalized = String(status || '').toUpperCase().trim();
  const configs = {
    NEW: { label: 'New', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    DRAFT: { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
    SUBMITTED: { label: 'Submitted', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    PENDING_APPROVAL: { label: 'Waiting Approval', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
    WAITING_FOR_APPROVAL: { label: 'Waiting Approval', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
    APPROVED: { label: 'Approved', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
    ASSIGNED: { label: 'Assigned', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
    IN_PROGRESS: { label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: ArrowUpRight },
    WAITING_FOR_PURCHASE: { label: 'Waiting Purchase', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    WAITING_FOR_VENDOR: { label: 'Waiting Vendor', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    COMPLETED: { label: 'Completed', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', icon: CheckCircle2 },
    CLOSED: { label: 'Closed', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' },
    REJECTED: { label: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: XCircle },
    CANCELLED: { label: 'Cancelled', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', icon: XCircle },
    REOPENED: { label: 'Reopened', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: RotateCcw }
  };

  const conf = configs[normalized] || { 
    label: normalized.replace(/_/g, ' ') || 'Unknown', 
    bg: 'bg-slate-100', 
    text: 'text-slate-700', 
    border: 'border-slate-200' 
  };
  const Icon = conf.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${conf.bg} ${conf.text} ${conf.border}`}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {conf.label}
    </span>
  );
}

export function TicketBadge({ requestNumber, showFull = true, className = '' }) {
  if (!requestNumber) return null;
  const parts = String(requestNumber).split('-');
  const lastPart = parts[parts.length - 1];
  const shortNum = !isNaN(parseInt(lastPart, 10)) ? parseInt(lastPart, 10) : lastPart;
  const shortId = `#${shortNum}`;

  return (
    <div
      title={`Corporate Reference: ${requestNumber}`}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap ${className}`}
    >
      <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-indigo-50/90 text-indigo-700 border border-indigo-200/80 shadow-2xs group-hover:bg-indigo-100 group-hover:border-indigo-300 transition-colors">
        {shortId}
      </span>
      {showFull && (
        <span className="text-[11px] font-mono text-slate-400 group-hover:text-indigo-600 transition-colors hidden sm:inline">
          {requestNumber}
        </span>
      )}
    </div>
  );
}

export function PriorityBadge({ priority }) {
  const configs = {
    HIGH: { label: 'High Priority', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
    MEDIUM: { label: 'Medium Priority', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    LOW: { label: 'Low Priority', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' }
  };

  const conf = configs[priority] || configs.MEDIUM;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${conf.bg} ${conf.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
      {conf.label}
    </span>
  );
}

export function OverdueBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700 border border-red-300 animate-pulse">
      <AlertTriangle className="w-3 h-3" />
      OVERDUE
    </span>
  );
}
