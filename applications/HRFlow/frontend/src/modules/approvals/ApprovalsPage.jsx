import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Laptop,
  CreditCard,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

export const ApprovalsPage = () => {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [typeFilter, setTypeFilter] = useState('');

  // Decision state
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [decisionAction, setDecisionAction] = useState('APPROVED'); // 'APPROVED' | 'REJECTED'
  const [remarks, setRemarks] = useState('');
  const [acting, setActing] = useState(false);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/approvals', {
        params: {
          status: statusFilter || undefined,
          type: typeFilter || undefined,
        },
      });
      setApprovals(res.data.data);
    } catch (err) {
      console.error('Failed to load approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [statusFilter, typeFilter]);

  const handleDecision = async (e) => {
    e.preventDefault();
    setActing(true);
    try {
      await api.patch(`/approvals/${selectedApproval.id}/action`, {
        status: decisionAction,
        remarks: remarks || `Marked as ${decisionAction} by ${user.role}`,
      });
      setSelectedApproval(null);
      setRemarks('');
      fetchApprovals();
      alert(`Approval marked as ${decisionAction}. Automated workflows processed.`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to process decision');
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Approvals & Governance Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Unified authorization queue for SIM, Laptop, Advances, and Attendance regularizations
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium"
          >
            <option value="">All Request Types</option>
            <option value="SIM_REQUEST">SIM Card Allocation</option>
            <option value="LAPTOP_REQUEST">Laptop Allocation</option>
            <option value="SALARY_ADVANCE">Salary Advance</option>
            <option value="ATTENDANCE_CORRECTION">Attendance Correction</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          {approvals.length} requests in queue
        </span>
      </div>

      {/* Approvals Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Request Type</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Requested By</th>
                <th className="py-3 px-4">Details & Remarks</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {approvals.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12">
                    <EmptyState
                      icon={CheckSquare}
                      title="Queue is empty"
                      description="No pending requests matching your filter criteria."
                    />
                  </td>
                </tr>
              ) : (
                approvals.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">
                        {app.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{app.branch?.name}</td>
                    <td className="py-3 px-4 text-slate-600">{app.requestedBy?.email}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs">{app.remarks || '—'}</td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(app.createdAt)}</td>
                    <td className="py-3 px-4">
                      <Badge status={app.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {app.status === 'PENDING' && (
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => {
                              setSelectedApproval(app);
                              setDecisionAction('APPROVED');
                            }}
                            className="text-[11px] py-1 px-2.5"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              setSelectedApproval(app);
                              setDecisionAction('REJECTED');
                            }}
                            className="text-[11px] py-1 px-2.5"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Modal */}
      {selectedApproval && (
        <Modal
          isOpen={Boolean(selectedApproval)}
          onClose={() => setSelectedApproval(null)}
          title={`Confirm Decision: ${decisionAction} ${selectedApproval.type.replace(/_/g, ' ')}`}
        >
          <form onSubmit={handleDecision} className="space-y-4 text-xs">
            <div
              className={`p-3 rounded-lg border ${
                decisionAction === 'APPROVED'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              You are about to <span className="font-bold">{decisionAction}</span> this request for{' '}
              {selectedApproval.branch?.name}. Rule 4 automation will notify the respective departments.
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Decision Remarks</label>
              <textarea
                rows="3"
                placeholder="Enter remarks for the audit record..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button size="sm" variant="outline" onClick={() => setSelectedApproval(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant={decisionAction === 'APPROVED' ? 'success' : 'danger'}
                type="submit"
                loading={acting}
              >
                Confirm {decisionAction}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ApprovalsPage;
