import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  DollarSign,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { formatINR, formatDate } from '../../utils/formatters';

export const AdvancesPage = () => {
  const { user } = useAuth();
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);

  // Apply Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [amount, setAmount] = useState(15000);
  const [purpose, setPurpose] = useState('');
  const [monthlyDeduction, setMonthlyDeduction] = useState(5000);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState('');

  // Review Modal for BM and HR
  const [selectedAdvance, setSelectedAdvance] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchAdvances = async () => {
    setLoading(true);
    try {
      const res = await api.get('/advances');
      setAdvances(res.data.data);
    } catch (err) {
      console.error('Failed to load advances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvances();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplyLoading(true);
    setApplyError('');
    try {
      await api.post('/advances/apply', {
        amount,
        purpose,
        monthlyDeduction,
      });
      setShowApplyModal(false);
      setPurpose('');
      fetchAdvances();
    } catch (err) {
      setApplyError(err.response?.data?.error || 'Failed to apply for advance');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleReview = async (action) => {
    setReviewLoading(true);
    try {
      await api.patch(`/advances/${selectedAdvance.id}/review`, {
        action,
        remarks: reviewRemarks,
      });
      setSelectedAdvance(null);
      setReviewRemarks('');
      fetchAdvances();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to review advance');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Salary Advance Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {user?.role === 'EMPLOYEE'
              ? 'Apply for interest-free emergency advances with flexible monthly payroll recovery'
              : 'Review, recommend, and disburse staff advance requests'}
          </p>
        </div>

        {user?.role === 'EMPLOYEE' && (
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={() => setShowApplyModal(true)}
          >
            Apply for Advance
          </Button>
        )}
      </div>

      {/* Advance List */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Monthly Recovery</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4">Current Workflow Stage</th>
                <th className="py-3 px-4">Application Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {advances.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12">
                    <EmptyState
                      icon={CreditCard}
                      title="No salary advance applications"
                      description="No records to display at this time."
                    />
                  </td>
                </tr>
              ) : (
                advances.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {a.employee?.firstName} {a.employee?.lastName}
                      </div>
                      <span className="text-[10px] text-slate-400">{a.employee?.employeeCode}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                      {formatINR(a.amount)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {formatINR(a.monthlyDeduction)} / mo
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{a.purpose}</td>
                    <td className="py-3 px-4">
                      <Badge status={a.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(a.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      {['HR', 'BM'].includes(user?.role) &&
                        ['PENDING_BM', 'PENDING_HR'].includes(a.status) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAdvance(a);
                              setReviewRemarks('');
                            }}
                            className="text-[11px] py-1 px-2.5"
                          >
                            Review
                          </Button>
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Apply for Advance (Employee Only) */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title="Apply for Salary Advance"
      >
        <form onSubmit={handleApply} className="space-y-4 text-xs">
          {applyError && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
              {applyError}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Advance Amount (₹) *</label>
            <input
              type="number"
              required
              min="1000"
              max="200000"
              step="1000"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Maximum allowable is up to 3 times your basic monthly pay.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Purpose / Reason *</label>
            <textarea
              required
              rows="3"
              placeholder="e.g. Medical emergency, urgent house maintenance, or family event"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Proposed Monthly Payroll Deduction (₹)
            </label>
            <input
              type="number"
              required
              min="500"
              step="500"
              value={monthlyDeduction}
              onChange={(e) => setMonthlyDeduction(parseFloat(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Estimated repayment period: {Math.ceil(amount / (monthlyDeduction || 1))} months
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button size="sm" variant="outline" onClick={() => setShowApplyModal(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" loading={applyLoading}>
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Review Advance Request (BM / HR) */}
      {selectedAdvance && (
        <Modal
          isOpen={Boolean(selectedAdvance)}
          onClose={() => setSelectedAdvance(null)}
          title={`Review Salary Advance: ${selectedAdvance.employee?.firstName} ${selectedAdvance.employee?.lastName}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Requested Amount:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {formatINR(selectedAdvance.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Monthly Deduction:</span>
                <span className="font-semibold text-slate-800">
                  {formatINR(selectedAdvance.monthlyDeduction)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Purpose:</span>
                <span className="text-slate-800">{selectedAdvance.purpose}</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Review Remarks</label>
              <textarea
                rows="2"
                placeholder="Enter approval/rejection remarks..."
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                size="sm"
                variant="danger"
                icon={XCircle}
                loading={reviewLoading}
                onClick={() => handleReview('REJECT')}
              >
                Reject Request
              </Button>
              <Button
                size="sm"
                variant="success"
                icon={CheckCircle2}
                loading={reviewLoading}
                onClick={() => handleReview('APPROVE')}
              >
                {user?.role === 'BM' ? 'Recommend to HR' : 'Approve & Disburse'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdvancesPage;
