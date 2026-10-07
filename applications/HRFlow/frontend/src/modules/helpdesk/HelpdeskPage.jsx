import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Users,
  Building2,
  MessageSquare,
  AlertCircle,
  ShieldAlert,
  Send,
  Check,
  X,
  Loader2,
  ChevronRight,
  Tag,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../utils/formatters';

export const HelpdeskPage = () => {
  const { user } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Raise Ticket Modal State
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    category: 'PAYROLL',
    priority: 'MEDIUM',
    subject: '',
    description: '',
  });

  // Ticket Detail / Reply Modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      // Seed realistic dealership HR & IT Helpdesk tickets
      const initialTickets = [
        {
          id: 'TKT-1042',
          ticketNumber: 'TKT-1042',
          subject: 'PF UAN number mismatch with Aadhaar records',
          category: 'STATUTORY',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          employeeName: 'Basavaraj Korvi',
          employeeCode: 'BLD-1008',
          branch: 'Hubli Central HQ',
          department: 'Service',
          createdAt: '2026-09-24T09:30:00Z',
          description:
            'My EPFO portal shows father name spelling differs from Aadhaar. Need joint declaration signed by HR.',
          replies: [
            {
              sender: 'Kavitha Deshpande (HR Head)',
              time: '2026-09-24T14:00:00Z',
              text: 'Received Aadhaar copy. Joint declaration letter generated and submitted to PF regional office Hubli.',
            },
          ],
        },
        {
          id: 'TKT-1043',
          ticketNumber: 'TKT-1043',
          subject: 'Sunday Mega-Camp overtime not reflected in September payslip preview',
          category: 'PAYROLL',
          priority: 'URGENT',
          status: 'OPEN',
          employeeName: 'Manjunath Desai',
          employeeCode: 'BLD-1007',
          branch: 'Hubli Central HQ',
          department: 'Service',
          createdAt: '2026-09-25T11:00:00Z',
          description:
            'Worked 8 hours overtime on 20th Sept for monsoon service camp. PayDay register has 29 instead of 30 days.',
          replies: [],
        },
        {
          id: 'TKT-1044',
          ticketNumber: 'TKT-1044',
          subject: 'Service Advisor Shop Tablet screen touch unresponsive',
          category: 'IT_ASSETS',
          priority: 'MEDIUM',
          status: 'RESOLVED',
          employeeName: 'Girish Hiremath',
          employeeCode: 'BLD-1006',
          branch: 'Hubli Central HQ',
          department: 'Service',
          createdAt: '2026-09-22T08:15:00Z',
          description:
            'Floor Tab SAM-TAB-44019 touch screen is sticking on customer job card opening.',
          replies: [
            {
              sender: 'Branch Manager Hubli',
              time: '2026-09-22T10:30:00Z',
              text: 'Digitizer screen replaced under warranty by OEM service center. Tablet re-allocated.',
            },
          ],
        },
        {
          id: 'TKT-1045',
          ticketNumber: 'TKT-1045',
          subject: 'Family Group Health Insurance E-card download assistance',
          category: 'INSURANCE',
          priority: 'LOW',
          status: 'CLOSED',
          employeeName: 'Vijay Kulkarni',
          employeeCode: 'BLD-1004',
          branch: 'Hubli Central HQ',
          department: 'Service',
          createdAt: '2026-09-18T16:00:00Z',
          description: 'Need TPA health card link for hospitalization cashless admission.',
          replies: [
            {
              sender: 'Kavitha Deshpande (HR Head)',
              time: '2026-09-18T17:15:00Z',
              text: 'MediBuddy portal link and policy credentials sent via SMS and registered email.',
            },
          ],
        },
      ];

      setTickets(initialTickets);
    } finally {
      setLoading(false);
    }
  };

  const handleRaiseTicket = (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newTkt = {
        id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        subject: ticketForm.subject,
        category: ticketForm.category,
        priority: ticketForm.priority,
        status: 'OPEN',
        employeeName: user?.employee
          ? `${user.employee.firstName} ${user.employee.lastName}`
          : user?.name || user?.email.split('@')[0],
        employeeCode: user?.employee?.employeeCode || 'BLD-EMP',
        branch: user?.branch?.name || 'Hubli Central HQ',
        department: user?.employee?.department || 'Operations',
        createdAt: new Date().toISOString(),
        description: ticketForm.description,
        replies: [],
      };

      setTickets([newTkt, ...tickets]);
      setShowRaiseModal(false);
      setTicketForm({
        category: 'PAYROLL',
        priority: 'MEDIUM',
        subject: '',
        description: '',
      });
      alert('Support ticket raised successfully! HR team has been notified.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = (newStatus) => {
    if (!selectedTicket) return;
    setActionLoading(true);
    try {
      const updatedTicket = {
        ...selectedTicket,
        status: newStatus || selectedTicket.status,
        replies: replyMessage
          ? [
              ...selectedTicket.replies,
              {
                sender: user?.name || user?.email,
                time: new Date().toISOString(),
                text: replyMessage,
              },
            ]
          : selectedTicket.replies,
      };

      setTickets((prev) => prev.map((t) => (t.id === selectedTicket.id ? updatedTicket : t)));
      setSelectedTicket(updatedTicket);
      setReplyMessage('');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    if (filterCategory !== 'ALL' && t.category !== filterCategory) return false;
    if (
      searchQuery &&
      !`${t.subject} ${t.ticketNumber} ${t.employeeName} ${t.category}`.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            Urgent
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            High
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 border border-blue-200">
            Medium
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
            Low
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <Clock className="w-3 h-3 text-rose-600" /> Open
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3 h-3 text-amber-600" /> In Progress
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Resolved
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Check className="w-3 h-3 text-slate-500" /> Closed
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-700 font-semibold uppercase tracking-wider">
            <LifeBuoy className="w-4 h-4" />
            <span>Support & Helpdesk</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            HR & Operational Helpdesk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Resolve payroll discrepancies, attendance corrections, insurance claims, and asset issues
          </p>
        </div>

        <button
          onClick={() => setShowRaiseModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Raise Support Ticket</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Total Tickets</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{tickets.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Pending Action</p>
          <p className="text-xl font-bold text-rose-600 mt-1">
            {tickets.filter((t) => t.status === 'OPEN').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">In Investigation</p>
          <p className="text-xl font-bold text-amber-600 mt-1">
            {tickets.filter((t) => t.status === 'IN_PROGRESS').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Resolved Cases</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">
            {tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[240px] max-w-sm flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ticket ID, subject, employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-700"
            >
              <option value="ALL">All Categories</option>
              <option value="PAYROLL">Payroll & Salary Mismatch</option>
              <option value="STATUTORY">EPFO / ESIC Statutory</option>
              <option value="IT_ASSETS">IT & Device Hardware</option>
              <option value="INSURANCE">Group Mediclaim Insurance</option>
              <option value="OTHER">General HR Operations</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{filteredTickets.length}</span> tickets
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading helpdesk tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No tickets found matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Employee & Branch</th>
                  <th className="py-3 px-4">Logged At</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTickets.map((tkt) => (
                  <tr key={tkt.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{tkt.ticketNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 max-w-sm truncate" title={tkt.subject}>
                        {tkt.subject}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-sm">{tkt.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-700">{tkt.category}</span>
                    </td>
                    <td className="py-3 px-4">{getPriorityBadge(tkt.priority)}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{tkt.employeeName}</div>
                      <div className="text-[10px] text-slate-400">{tkt.branch}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{formatDateTime(tkt.createdAt)}</td>
                    <td className="py-3 px-4">{getStatusBadge(tkt.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedTicket(tkt)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition"
                      >
                        Open Case
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Details & Action Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-600">{selectedTicket.ticketNumber}</span>
                <h3 className="font-bold text-slate-900 text-base mt-0.5">{selectedTicket.subject}</h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Raised By:</span>
                <span className="font-semibold text-slate-800">
                  {selectedTicket.employeeName} ({selectedTicket.employeeCode}) • {selectedTicket.branch}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category & Priority:</span>
                <span>
                  {selectedTicket.category} • {getPriorityBadge(selectedTicket.priority)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200/80">
                <p className="text-slate-500 font-semibold mb-1">Issue Description:</p>
                <p className="text-slate-800 leading-relaxed">{selectedTicket.description}</p>
              </div>
            </div>

            {/* Conversation Log */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700">Internal Updates & Action Log</h4>
              {selectedTicket.replies?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No updates logged yet.</p>
              ) : (
                selectedTicket.replies.map((r, i) => (
                  <div key={i} className="p-2.5 bg-indigo-50/40 border border-indigo-100 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                      <span className="font-bold text-indigo-900">{r.sender}</span>
                      <span>{formatDateTime(r.time)}</span>
                    </div>
                    <p className="text-slate-800">{r.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Response Form */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Add Case Resolution Note</label>
              <textarea
                rows={2}
                placeholder="Type internal remarks or resolution update..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              ></textarea>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleAddReply('RESOLVED')}
                  disabled={actionLoading}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Resolved</span>
                </button>
                <button
                  onClick={() => handleAddReply('IN_PROGRESS')}
                  disabled={actionLoading}
                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold"
                >
                  In Progress
                </button>
              </div>

              <button
                onClick={() => handleAddReply()}
                disabled={actionLoading || !replyMessage.trim()}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-40"
              >
                Post Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Raise Ticket Modal */}
      {showRaiseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleRaiseTicket}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Raise Support Ticket</h3>
                <p className="text-xs text-slate-500">Report an issue to dealership HR or Operations</p>
              </div>
              <button
                type="button"
                onClick={() => setShowRaiseModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Category</label>
              <select
                value={ticketForm.category}
                onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="PAYROLL">Payroll & Salary Mismatch</option>
                <option value="STATUTORY">EPFO / ESIC Compliance Issue</option>
                <option value="IT_ASSETS">Hardware / Tab / SIM Card Issue</option>
                <option value="INSURANCE">Group Mediclaim & Hospitalization</option>
                <option value="OTHER">General Workplace Query</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={ticketForm.priority}
                onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium (Normal SLA 48h)</option>
                <option value="HIGH">High (SLA 24h)</option>
                <option value="URGENT">Urgent (Immediate)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <input
                required
                type="text"
                placeholder="Brief summary of the issue..."
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description</label>
              <textarea
                required
                rows={3}
                placeholder="Explain the specific details, dates, or error encountered..."
                value={ticketForm.description}
                onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRaiseModal(false)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Submit Ticket</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default HelpdeskPage;
