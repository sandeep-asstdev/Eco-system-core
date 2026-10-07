import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Users,
  Building2,
  Calendar,
  AlertCircle,
  Check,
  X,
  Loader2,
  TrendingDown,
  FileText,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../utils/formatters';

export const LeaveManagementPage = () => {
  const { user } = useAuth();

  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Apply Leave Modal State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    leaveType: 'CASUAL_LEAVE',
    startDate: '',
    endDate: '',
    isHalfDay: false,
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Review Modal State
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Leave balances for current user
  const [balances, setBalances] = useState({
    casualLeave: { total: 12, used: 3, available: 9 },
    sickLeave: { total: 8, used: 2, available: 6 },
    earnedLeave: { total: 15, used: 4, available: 11 },
    compOff: { total: 2, used: 0, available: 2 },
  });

  useEffect(() => {
    fetchLeavesAndEmployees();
  }, []);

  const fetchLeavesAndEmployees = async () => {
    setLoading(true);
    try {
      const [empRes] = await Promise.all([
        api.get('/employees?limit=200').catch(() => ({ data: { data: [] } })),
      ]);

      const empList = empRes.data?.data?.employees || empRes.data?.data || [];
      setEmployees(empList);

      // Construct initial leave records for dealership operations
      const initialLeaves = [
        {
          id: 'leave-101',
          employeeId: empList[0]?.id || 'emp-1',
          employeeName: empList[0] ? `${empList[0].firstName} ${empList[0].lastName}` : 'Rahul Sharma',
          employeeCode: empList[0]?.employeeCode || 'BLD-1004',
          branch: empList[0]?.branch?.name || 'Hubli Central HQ',
          department: empList[0]?.department || 'Service',
          leaveType: 'CASUAL_LEAVE',
          startDate: '2026-09-28',
          endDate: '2026-09-29',
          totalDays: 2,
          reason: 'Family function at native village',
          status: 'PENDING',
          appliedAt: '2026-09-25T10:30:00Z',
        },
        {
          id: 'leave-102',
          employeeId: empList[1]?.id || 'emp-2',
          employeeName: empList[1] ? `${empList[1].firstName} ${empList[1].lastName}` : 'Manjunath Desai',
          employeeCode: empList[1]?.employeeCode || 'BLD-1007',
          branch: empList[1]?.branch?.name || 'Hubli Central HQ',
          department: empList[1]?.department || 'Service',
          leaveType: 'SICK_LEAVE',
          startDate: '2026-09-24',
          endDate: '2026-09-24',
          totalDays: 1,
          reason: 'High fever and doctor consultation',
          status: 'APPROVED',
          appliedAt: '2026-09-24T08:15:00Z',
          approvedBy: 'Kavitha Deshpande (HR Head)',
        },
        {
          id: 'leave-103',
          employeeId: empList[2]?.id || 'emp-3',
          employeeName: empList[2] ? `${empList[2].firstName} ${empList[2].lastName}` : 'Girish Hiremath',
          employeeCode: empList[2]?.employeeCode || 'BLD-1006',
          branch: empList[2]?.branch?.name || 'Hubli Central HQ',
          department: empList[2]?.department || 'Service',
          leaveType: 'EARNED_LEAVE',
          startDate: '2026-10-02',
          endDate: '2026-10-06',
          totalDays: 5,
          reason: 'Festival vacation and pilgrimage',
          status: 'PENDING',
          appliedAt: '2026-09-23T14:20:00Z',
        },
        {
          id: 'leave-104',
          employeeId: empList[3]?.id || 'emp-4',
          employeeName: empList[3] ? `${empList[3].firstName} ${empList[3].lastName}` : 'Basavaraj Korvi',
          employeeCode: empList[3]?.employeeCode || 'BLD-1008',
          branch: empList[3]?.branch?.name || 'Hubli Central HQ',
          department: empList[3]?.department || 'Service',
          leaveType: 'COMP_OFF',
          startDate: '2026-09-22',
          endDate: '2026-09-22',
          totalDays: 1,
          reason: 'Compensatory off for Sunday overtime mega-camp service duty',
          status: 'APPROVED',
          appliedAt: '2026-09-21T18:00:00Z',
          approvedBy: 'Branch Manager Hubli',
        },
      ];

      setLeaves(initialLeaves);
    } catch (err) {
      console.error('Failed to load leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = (start, end, half) => {
    if (!start || !end) return 1;
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return half ? 0.5 : Math.max(1, diffDays);
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const days = calculateDays(applyForm.startDate, applyForm.endDate, applyForm.isHalfDay);
      const newLeave = {
        id: `leave-${Date.now()}`,
        employeeId: user?.employeeId || 'me',
        employeeName: user?.employee
          ? `${user.employee.firstName} ${user.employee.lastName}`
          : user?.name || user?.email.split('@')[0],
        employeeCode: user?.employee?.employeeCode || 'MY-ID',
        branch: user?.branch?.name || 'Hubli Central HQ',
        department: user?.employee?.department || 'Operations',
        leaveType: applyForm.leaveType,
        startDate: applyForm.startDate,
        endDate: applyForm.endDate,
        totalDays: days,
        reason: applyForm.reason,
        status: 'PENDING',
        appliedAt: new Date().toISOString(),
      };

      setLeaves([newLeave, ...leaves]);
      setShowApplyModal(false);
      setApplyForm({
        leaveType: 'CASUAL_LEAVE',
        startDate: '',
        endDate: '',
        isHalfDay: false,
        reason: '',
      });
      alert('Leave application submitted successfully for manager approval!');
    } catch (err) {
      console.error('Failed to apply leave:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewAction = (status) => {
    if (!selectedLeave) return;
    setActionLoading(true);
    try {
      setLeaves((prev) =>
        prev.map((l) =>
          l.id === selectedLeave.id
            ? {
                ...l,
                status,
                approvedBy: user?.name || user?.email,
                remarks: reviewRemarks,
              }
            : l
        )
      );
      setSelectedLeave(null);
      setReviewRemarks('');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredLeaves = leaves.filter((l) => {
    if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
    if (
      searchQuery &&
      !`${l.employeeName} ${l.employeeCode} ${l.leaveType} ${l.reason}`.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Pending Approval
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" /> Rejected
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  const formatLeaveType = (type) => {
    return type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-700 font-semibold uppercase tracking-wider">
            <CalendarDays className="w-4 h-4" />
            <span>Time & Attendance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Leave Management & Entitlements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Horilla-style leave balances, dealership holiday calendar, and multi-tier approval workflows
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Apply Leave</span>
        </button>
      </div>

      {/* Leave Entitlement Balances Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Casual Leave (CL)</p>
            <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded">Annual</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{balances.casualLeave.available}</span>
            <span className="text-xs text-slate-400">/ {balances.casualLeave.total} days</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ width: `${(balances.casualLeave.available / balances.casualLeave.total) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Sick Leave (SL)</p>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded">Medical</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{balances.sickLeave.available}</span>
            <span className="text-xs text-slate-400">/ {balances.sickLeave.total} days</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-600 h-1.5 rounded-full"
              style={{ width: `${(balances.sickLeave.available / balances.sickLeave.total) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Earned Leave (EL)</p>
            <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded">Privilege</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{balances.earnedLeave.available}</span>
            <span className="text-xs text-slate-400">/ {balances.earnedLeave.total} days</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-purple-600 h-1.5 rounded-full"
              style={{ width: `${(balances.earnedLeave.available / balances.earnedLeave.total) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Compensatory Off</p>
            <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded">Overtime</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{balances.compOff.available}</span>
            <span className="text-xs text-slate-400">/ {balances.compOff.total} earned</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-amber-600 h-1.5 rounded-full"
              style={{ width: `${(balances.compOff.available / balances.compOff.total) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[240px] max-w-sm flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by employee, code, reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total Leave Records: <span className="font-bold text-slate-900">{filteredLeaves.length}</span>
        </div>
      </div>

      {/* Leave Applications Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading leave requests...</p>
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No leave records found matching the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Branch & Dept</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{leave.employeeName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{leave.employeeCode}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div>{leave.branch}</div>
                      <div className="text-[10px] text-slate-400">{leave.department}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{formatLeaveType(leave.leaveType)}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {leave.startDate} to {leave.endDate}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{leave.totalDays} Day(s)</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(leave.status)}</td>
                    <td className="py-3 px-4 text-right">
                      {['HR', 'BM', 'PLATFORM_ADMIN'].includes(user?.role) && leave.status === 'PENDING' ? (
                        <button
                          onClick={() => setSelectedLeave(leave)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition"
                        >
                          Review
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Review Leave Application</h3>
                <p className="text-xs text-slate-500">Approve or reject employee leave request</p>
              </div>
              <button
                onClick={() => setSelectedLeave(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-semibold text-slate-800">
                  {selectedLeave.employeeName} ({selectedLeave.employeeCode})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Leave Type:</span>
                <span className="font-bold text-indigo-700">{formatLeaveType(selectedLeave.leaveType)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dates:</span>
                <span className="font-mono text-slate-800">
                  {selectedLeave.startDate} to {selectedLeave.endDate} ({selectedLeave.totalDays} Days)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reason:</span>
                <span className="text-slate-800">{selectedLeave.reason}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Manager Remarks</label>
              <textarea
                rows={2}
                placeholder="e.g., Approved. Reliever technician Basavaraj assigned for stall 2."
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleReviewAction('REJECTED')}
                disabled={actionLoading}
                className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
              <button
                onClick={() => handleReviewAction('APPROVED')}
                disabled={actionLoading}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-xs"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Approve Leave</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleApplyLeave}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Apply for Leave</h3>
                <p className="text-xs text-slate-500">Submit leave request for management approval</p>
              </div>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Type</label>
              <select
                value={applyForm.leaveType}
                onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="CASUAL_LEAVE">Casual Leave (CL) - Balance: {balances.casualLeave.available}d</option>
                <option value="SICK_LEAVE">Sick Leave (SL) - Balance: {balances.sickLeave.available}d</option>
                <option value="EARNED_LEAVE">Earned Leave (EL) - Balance: {balances.earnedLeave.available}d</option>
                <option value="COMP_OFF">Compensatory Off - Balance: {balances.compOff.available}d</option>
                <option value="MATERNITY_PATERNITY">Maternity / Paternity Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">From Date</label>
                <input
                  required
                  type="date"
                  value={applyForm.startDate}
                  onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">To Date</label>
                <input
                  required
                  type="date"
                  value={applyForm.endDate}
                  onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="halfDay"
                checked={applyForm.isHalfDay}
                onChange={(e) => setApplyForm({ ...applyForm, isHalfDay: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="halfDay" className="text-xs font-medium text-slate-700">
                Half Day Leave (0.5 day)
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Leave</label>
              <textarea
                required
                rows={3}
                placeholder="State the reason clearly for reporting manager..."
                value={applyForm.reason}
                onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
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
                <span>Submit Application</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default LeaveManagementPage;
