import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Banknote,
  Play,
  Download,
  AlertCircle,
  CheckCircle,
  PauseCircle,
  PlayCircle,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { formatINR, formatDate } from '../../utils/formatters';
import PayslipModal from './components/PayslipModal';

export const PayrollListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  const [month, setMonth] = useState(9);
  const [year, setYear] = useState(2026);

  // Calculation Modal
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcSuccess, setCalcSuccess] = useState('');

  // Selected Payslip for view
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payroll', {
        params: { month, year },
      });
      setPayrolls(res.data.data);
    } catch (err) {
      console.error('Failed to load payroll:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [month, year]);

  const handleRunPayroll = async () => {
    setCalcLoading(true);
    setCalcSuccess('');
    try {
      const res = await api.post('/payroll/calculate', { month, year });
      setCalcSuccess(res.data.message);
      fetchPayrolls();
    } catch (err) {
      alert(err.response?.data?.error || 'Payroll calculation failed');
    } finally {
      setCalcLoading(false);
    }
  };

  const handleToggleHold = async (id, currentHold) => {
    try {
      await api.patch(`/payroll/${id}/hold`, { isHold: !currentHold });
      fetchPayrolls();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to toggle salary hold');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Salary & Payroll Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Backend salary calculation engine, deductions, salary holds, and payslip generation
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(user?.role === 'HR' || user?.role === 'PLATFORM_ADMIN' || user?.role === 'BM') && (
            <Button
              size="sm"
              variant="outline"
              icon={FileSpreadsheet}
              onClick={() => navigate('/payroll/advice')}
            >
              Payment Advice
            </Button>
          )}

          {(user?.role === 'HR' || user?.role === 'PLATFORM_ADMIN') && (
            <Button
              size="sm"
              variant="primary"
              icon={Play}
              loading={calcLoading}
              onClick={handleRunPayroll}
            >
              Run Salary Calculation
            </Button>
          )}
        </div>
      </div>

      {calcSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{calcSuccess}</span>
        </div>
      )}

      {/* Month & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Payroll Cycle:</span>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium"
          >
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium"
          >
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          {payrolls.length} records in this cycle
        </span>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Gross Earnings</th>
                <th className="py-3 px-4">PF / ESI</th>
                <th className="py-3 px-4">Advance / Tax</th>
                <th className="py-3 px-4">Total Deductions</th>
                <th className="py-3 px-4">Net Take-Home</th>
                <th className="py-3 px-4">Disbursement Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payrolls.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12">
                    <EmptyState
                      icon={Banknote}
                      title="No payroll records for this month"
                      description="Click 'Run Salary Calculation' to process salaries for this period."
                    />
                  </td>
                </tr>
              ) : (
                payrolls.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {p.employee?.firstName} {p.employee?.lastName}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{p.employee?.employeeCode}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{p.branch?.name}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{formatINR(p.grossPay)}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatINR(p.pfDeduction)} / {formatINR(p.esiDeduction)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatINR(p.advanceDeduction)} / {formatINR(p.taxDeduction)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-rose-600">-{formatINR(p.totalDeductions)}</td>
                    <td className="py-3 px-4 font-bold text-slate-950 text-sm">{formatINR(p.netPay)}</td>
                    <td className="py-3 px-4">
                      {p.isHold ? (
                        <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          HELD (NO DISBURSE)
                        </span>
                      ) : (
                        <Badge status={p.status} />
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedPayslip(p)}
                          className="text-[11px] py-1 px-2.5"
                        >
                          Payslip
                        </Button>
                        {user?.role === 'HR' && (
                          <button
                            type="button"
                            onClick={() => handleToggleHold(p.id, p.isHold)}
                            title={p.isHold ? 'Release Salary Hold' : 'Place Salary on Hold'}
                            className={`p-1 rounded transition ${
                              p.isHold
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-amber-600 hover:bg-amber-50'
                            }`}
                          >
                            {p.isHold ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Official Dealership Printable Payslip */}
      {selectedPayslip && (
        <PayslipModal
          payslip={selectedPayslip}
          onClose={() => setSelectedPayslip(null)}
        />
      )}
    </div>
  );
};

export default PayrollListPage;
