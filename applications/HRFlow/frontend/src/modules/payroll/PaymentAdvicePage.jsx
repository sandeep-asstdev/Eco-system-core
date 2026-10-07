import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  Download,
  Building2,
  Calendar,
  CreditCard,
  Printer,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { formatINR, formatDate } from '../../utils/formatters';

export const PaymentAdvicePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [advices, setAdvices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [month, setMonth] = useState(9);
  const [year, setYear] = useState(2026);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [bankName, setBankName] = useState('HDFC Bank Corporate NetBanking');

  const [generating, setGenerating] = useState(false);
  const [adviceResult, setAdviceResult] = useState(null);

  const fetchAdvices = async () => {
    setLoading(true);
    try {
      const [advRes, brRes] = await Promise.allSettled([
        api.get('/payroll/payment-advice', { params: { month, year } }),
        api.get('/branches'),
      ]);
      if (advRes.status === 'fulfilled' && Array.isArray(advRes.value.data?.data)) {
        setAdvices(advRes.value.data.data);
      } else {
        setAdvices([]);
      }
      if (brRes.status === 'fulfilled' && Array.isArray(brRes.value.data?.data)) {
        setBranches(brRes.value.data.data);
      } else {
        setBranches([]);
      }
    } catch (err) {
      console.error('Failed to load advices:', err);
      setAdvices([]);
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvices();
  }, [month, year]);

  const handleGenerateAdvice = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await api.post('/payroll/payment-advice', {
        month,
        year,
        branchId: selectedBranch || null,
        bankName,
      });
      setAdviceResult(res.data.data);
      fetchAdvices();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate payment advice');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!adviceResult?.details || adviceResult.details.length === 0) return;
    const headers = [
      'Employee Code',
      'Beneficiary Name',
      'Branch Location',
      'Bank Name',
      'Account Number',
      'IFSC Code',
      'Net Amount (INR)',
      'Narration',
    ];
    const rows = adviceResult.details.map((d) => [
      `"${d.employeeCode || ''}"`,
      `"${d.employeeName || ''}"`,
      `"${d.branchName || ''}"`,
      `"${d.bankName || ''}"`,
      `"${d.accountNumber || ''}"`,
      `"${d.ifsc || ''}"`,
      d.netPay || 0,
      `"Salary ${month}/${year}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `NEFT_Payment_Advice_${adviceResult.advice?.referenceNumber || `${month}_${year}`}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/payroll')}
            className="text-xs text-indigo-600 font-semibold inline-flex items-center gap-1 mb-1 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Payroll
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Bank & Branch Payment Advice
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Formal bank disbursement schedules with employee bank accounts and net payable amounts
          </p>
        </div>

        {adviceResult && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={Download}
              onClick={handleDownloadCSV}
            >
              Export Bank CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print Advice Letter
            </Button>
          </div>
        )}
      </div>

      {/* Generator Form Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
          Generate New Bank Transmission Schedule
        </h2>

        <form onSubmit={handleGenerateAdvice} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Disbursement Bank</label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="HDFC Bank Corporate NetBanking">HDFC Bank Corporate</option>
              <option value="ICICI Bank Corporate Salary CMS">ICICI Bank CMS</option>
              <option value="State Bank of India Corporate">SBI Direct Credit</option>
              <option value="Axis Bank Corporate Disbursement">Axis Bank CMS</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Branch Scope</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Branches Combined</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Cycle Month / Year</label>
            <div className="flex gap-2">
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-1/2 px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <option key={m} value={m}>
                    Month {m}
                  </option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-1/2 px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={generating}
              icon={FileSpreadsheet}
              className="w-full"
            >
              Generate Advice
            </Button>
          </div>
        </form>
      </div>

      {/* Live Generated Advice Letter View */}
      {adviceResult && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                Official Transmission Document
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Payment Advice: {adviceResult.advice.referenceNumber}
              </h3>
              <p className="text-xs text-slate-500">
                Beneficiary Bank: {adviceResult.advice.bankName} • Month: {month}/{year}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Disbursement</span>
              <span className="text-2xl font-black text-slate-900">
                {formatINR(adviceResult.advice.totalAmount)}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Emp Code</th>
                  <th className="py-2.5 px-3">Beneficiary Name</th>
                  <th className="py-2.5 px-3">Branch Location</th>
                  <th className="py-2.5 px-3">Bank Name</th>
                  <th className="py-2.5 px-3">Account Number</th>
                  <th className="py-2.5 px-3">IFSC</th>
                  <th className="py-2.5 px-3 text-right">Net Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {adviceResult.details?.map((d, i) => (
                  <tr key={i} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono text-slate-600">{d.employeeCode}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{d.employeeName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{d.branchName}</td>
                    <td className="py-2.5 px-3 text-slate-700">{d.bankName}</td>
                    <td className="py-2.5 px-3 font-mono">{d.accountNumber}</td>
                    <td className="py-2.5 px-3 font-mono">{d.ifsc}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-950">
                      {formatINR(d.netPay)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Historical Advice Records */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50/50 border-b border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Payment Advice Transmission Archive
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Reference Code</th>
                <th className="py-3 px-4">Cycle</th>
                <th className="py-3 px-4">Bank CMS Destination</th>
                <th className="py-3 px-4">Employees</th>
                <th className="py-3 px-4">Disbursement Amount</th>
                <th className="py-3 px-4">Generated Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {advices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No payment advice records found for this period.
                  </td>
                </tr>
              ) : (
                advices.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                      {a.referenceNumber}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {a.month}/{a.year}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{a.bankName}</td>
                    <td className="py-3 px-4 font-semibold">{a.totalEmployees} staff</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatINR(a.totalAmount)}</td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(a.createdAt)}</td>
                    <td className="py-3 px-4">
                      <Badge status={a.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentAdvicePage;
