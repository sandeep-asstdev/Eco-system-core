import React, { useRef } from 'react';
import {
  Printer,
  Download,
  X,
  Building2,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  ShieldCheck,
  Calendar,
  Briefcase,
  User,
  Clock,
} from 'lucide-react';
import { formatINR, formatDate, numberToWordsINR } from '../../../utils/formatters';

const MONTH_NAMES = [
  '',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const PayslipModal = ({ payslip, onClose }) => {
  if (!payslip) return null;

  const emp = payslip.employee || {};
  const branch = payslip.branch || {};
  const tenant = payslip.tenant || {};
  const kyc = emp.kyc || {};
  const statutory = emp.statutory || {};
  const salaryMaster = emp.salary || {};
  const payDay = (emp.payDays && emp.payDays[0]) || {
    totalWorkingDays: 30,
    presentDays: 26,
    paidLeaves: 4,
    lopDays: 0,
    payableDays: 30,
  };

  const monthName = MONTH_NAMES[payslip.month] || `Month ${payslip.month}`;
  const year = payslip.year;

  // Mask bank account number
  const rawAcc = kyc.accountNumber || '';
  const maskedAcc = rawAcc.length > 4 ? `••••••••${rawAcc.slice(-4)}` : rawAcc || '—';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      {/* Print-only CSS rules */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #official-payslip-document, #official-payslip-document * {
            visibility: visible;
          }
          #official-payslip-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 15px;
            background: white !important;
            box-shadow: none !important;
            border: 1px solid #1e293b !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Top Control Bar (Non-printable) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight">Dealership Payslip Preview</div>
              <div className="text-xs text-slate-400">
                {emp.firstName} {emp.lastName} ({emp.employeeCode}) • {monthName} {year}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto bg-slate-50/50">
          <div
            id="official-payslip-document"
            className="bg-white p-6 sm:p-8 rounded-xl border border-slate-300 shadow-xs text-slate-800 font-sans"
          >
            {/* Header Letterhead */}
            <div className="border-b-2 border-slate-800 pb-4 mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                    {tenant.legalName || tenant.organizationName || tenant.name || 'Bellad Enterprises Private Limited'}
                  </h1>
                  <p className="text-xs font-semibold text-indigo-700 tracking-wide uppercase mt-0.5">
                    Automobile Dealership Network & Authorized Service Centres
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xl">
                    {branch.name ? `${branch.name}, ` : ''}
                    {branch.address ? `${branch.address}, ` : ''}
                    {branch.city || 'Hubli'}, {branch.state || 'Karnataka'} - Dealership Code: {branch.code || 'BLD-HQ'}
                  </p>
                </div>
                <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6 shrink-0">
                  <span className="inline-block px-3 py-1 rounded bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                    Payslip
                  </span>
                  <div className="text-xs font-bold text-slate-800 mt-1">
                    {monthName.toUpperCase()} {year}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Ref: PAY/{year}/{String(payslip.month).padStart(2, '0')}/{emp.employeeCode || 'EMP'}
                  </div>
                </div>
              </div>
            </div>

            {/* Hold Banner if applicable */}
            {payslip.isHold && (
              <div className="mb-4 p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>SALARY PAYMENT HELD BY MANAGEMENT</span>
                </div>
                <span className="text-[10px] uppercase font-mono">Disbursement suspended pending clearance</span>
              </div>
            )}

            {/* Employee Demographic & Master Details */}
            <div className="border border-slate-300 rounded-lg overflow-hidden mb-5 text-[11px]">
              <div className="bg-slate-100 px-3 py-1.5 font-bold uppercase tracking-wider text-slate-700 border-b border-slate-300 flex items-center justify-between">
                <span>Employee & Deployment Profile</span>
                <span className="font-mono text-slate-500 text-[10px]">
                  Cadre Level: {emp.level?.name || (emp.level?.levelNumber ? `Level ${emp.level.levelNumber}` : 'Standard Staff')}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                {/* Col 1 */}
                <div className="p-3 space-y-1.5">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Employee ID</span>
                    <span className="font-bold text-slate-900 font-mono">{emp.employeeCode || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Employee Name</span>
                    <span className="font-bold text-slate-900">
                      {emp.firstName} {emp.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Designation</span>
                    <span className="font-medium text-slate-800">{emp.designation || 'Automobile Professional'}</span>
                  </div>
                </div>

                {/* Col 2 */}
                <div className="p-3 space-y-1.5">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Department</span>
                    <span className="font-semibold text-slate-800">{emp.department || 'Operations'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Dealership Branch</span>
                    <span className="font-semibold text-slate-800">{branch.name || 'Hubli Dealership'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Date of Joining</span>
                    <span className="font-medium text-slate-800">{formatDate(emp.dateOfJoining)}</span>
                  </div>
                </div>

                {/* Col 3 */}
                <div className="p-3 space-y-1.5">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Bank Name</span>
                    <span className="font-semibold text-slate-800">{kyc.bankName || 'State Bank of India'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Bank Account No</span>
                    <span className="font-mono font-medium text-slate-900">{maskedAcc}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">IFSC Code</span>
                    <span className="font-mono font-medium text-slate-900">{kyc.ifscCode || 'SBIN0040123'}</span>
                  </div>
                </div>

                {/* Col 4 */}
                <div className="p-3 space-y-1.5">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">PAN Number</span>
                    <span className="font-mono font-medium text-slate-900">{kyc.panNumber || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">UAN / PF Number</span>
                    <span className="font-mono font-medium text-slate-900">
                      {statutory.uanNumber || '—'} {statutory.pfNumber ? `/ ${statutory.pfNumber}` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">ESIC Number</span>
                    <span className="font-mono font-medium text-slate-900">{statutory.esiNumber || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance & Work Days Summary */}
            <div className="border border-slate-300 rounded-lg overflow-hidden mb-5 text-[11px]">
              <div className="bg-slate-100 px-3 py-1 font-bold uppercase tracking-wider text-slate-700 border-b border-slate-300">
                Attendance & Payable Days Summary
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 text-center divide-x divide-slate-200 py-2 bg-white">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Total Days</span>
                  <span className="font-bold text-slate-800 text-sm">{payDay.totalWorkingDays || 30}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Present Days</span>
                  <span className="font-bold text-emerald-700 text-sm">{payDay.presentDays || 26}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Paid Leaves / Off</span>
                  <span className="font-bold text-indigo-700 text-sm">{payDay.paidLeaves || 4}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Loss of Pay (LOP)</span>
                  <span className="font-bold text-rose-600 text-sm">{payDay.lopDays || 0}</span>
                </div>
                <div className="col-span-2 sm:col-span-1 bg-indigo-50/50">
                  <span className="text-indigo-900 block text-[10px] uppercase font-semibold">Payable Days</span>
                  <span className="font-extrabold text-indigo-950 text-sm">{payDay.payableDays || 30}</span>
                </div>
              </div>
            </div>

            {/* Financial Ledger: Earnings vs Deductions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 text-xs">
              {/* Earnings Table */}
              <div className="border border-slate-300 rounded-lg overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="bg-emerald-50 text-emerald-950 px-3 py-1.5 font-bold uppercase tracking-wider border-b border-emerald-200 flex justify-between">
                    <span>Earnings Component</span>
                    <span>Amount (₹)</span>
                  </div>
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-1.5 px-3 text-slate-600">Basic Salary</td>
                        <td className="py-1.5 px-3 text-right font-medium text-slate-900 font-mono">
                          {formatINR(payslip.basic)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 text-slate-600">House Rent Allowance (HRA)</td>
                        <td className="py-1.5 px-3 text-right font-medium text-slate-900 font-mono">
                          {formatINR(payslip.hra)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 text-slate-600">Conveyance Allowance</td>
                        <td className="py-1.5 px-3 text-right font-medium text-slate-900 font-mono">
                          {formatINR(salaryMaster.conveyance || 0)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 text-slate-600">Dealership Special / Performance Allowance</td>
                        <td className="py-1.5 px-3 text-right font-medium text-slate-900 font-mono">
                          {formatINR(payslip.allowances || 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="bg-slate-50 border-t border-slate-300 px-3 py-2 flex justify-between items-center font-bold text-slate-900">
                  <span className="uppercase text-[11px]">Gross Earnings (A):</span>
                  <span className="text-sm font-extrabold font-mono text-emerald-700">
                    {formatINR(payslip.grossPay)}
                  </span>
                </div>
              </div>

              {/* Deductions Table */}
              <div className="border border-slate-300 rounded-lg overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="bg-rose-50 text-rose-950 px-3 py-1.5 font-bold uppercase tracking-wider border-b border-rose-200 flex justify-between">
                    <span>Statutory & Other Deductions</span>
                    <span>Amount (₹)</span>
                  </div>
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-1.5 px-3 text-slate-600">Employee Provident Fund (EPF 12%)</td>
                        <td className="py-1.5 px-3 text-right font-medium text-rose-700 font-mono">
                          {payslip.pfDeduction > 0 ? `-${formatINR(payslip.pfDeduction)}` : '₹0'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 text-slate-600">Employee State Insurance (ESIC 0.75%)</td>
                        <td className="py-1.5 px-3 text-right font-medium text-rose-700 font-mono">
                          {payslip.esiDeduction > 0 ? `-${formatINR(payslip.esiDeduction)}` : '₹0'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 text-slate-600">Professional Tax (PT Karnataka)</td>
                        <td className="py-1.5 px-3 text-right font-medium text-rose-700 font-mono">
                          {payslip.grossPay >= 15000 ? '-₹200' : '₹0'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 text-slate-600">Advance / Loan Recovery</td>
                        <td className="py-1.5 px-3 text-right font-medium text-rose-700 font-mono">
                          {payslip.advanceDeduction > 0 ? `-${formatINR(payslip.advanceDeduction)}` : '₹0'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 text-slate-600">Tax Deducted at Source (TDS)</td>
                        <td className="py-1.5 px-3 text-right font-medium text-rose-700 font-mono">
                          {payslip.taxDeduction > 0 ? `-${formatINR(payslip.taxDeduction)}` : '₹0'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="bg-slate-50 border-t border-slate-300 px-3 py-2 flex justify-between items-center font-bold text-slate-900">
                  <span className="uppercase text-[11px]">Total Deductions (B):</span>
                  <span className="text-sm font-extrabold font-mono text-rose-700">
                    -{formatINR(payslip.totalDeductions)}
                  </span>
                </div>
              </div>
            </div>

            {/* Net Pay Callout */}
            <div className="p-4 rounded-xl bg-slate-900 text-white mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Net Disbursed Take-Home Pay (A - B)
                  </span>
                  <div className="text-xs text-indigo-300 mt-0.5 font-medium">
                    {numberToWordsINR(payslip.netPay)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight font-mono">
                    {formatINR(payslip.netPay)}
                  </div>
                  <span className="text-[10px] text-slate-400">Direct Account Credit</span>
                </div>
              </div>
            </div>

            {/* Signatures & Legal Disclaimer */}
            <div className="border-t border-slate-200 pt-6 mt-6">
              <div className="grid grid-cols-2 gap-8 items-end mb-6">
                <div>
                  <div className="w-32 h-10 border-b border-dashed border-slate-400 mb-1 flex items-center justify-center">
                    <span className="text-[9px] text-slate-400 font-mono">[Electronic Approval]</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-800 uppercase">Authorized Signatory</p>
                  <p className="text-[10px] text-slate-500">Corporate HR & Finance Dept</p>
                </div>

                <div className="text-right">
                  <div className="inline-block border border-slate-300 rounded p-2 text-left bg-slate-50">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>BELLAD GROUP SYSTEM VERIFIED</span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-mono">
                      Timestamp: {new Date().toISOString().slice(0, 19).replace('T', ' ')}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-3">
                * Note: This is an authentic computer-generated dealership payslip and requires no physical signature under IT Act 2000. For discrepancies, please log a query on HRFlow Helpdesk within 3 business days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipModal;
