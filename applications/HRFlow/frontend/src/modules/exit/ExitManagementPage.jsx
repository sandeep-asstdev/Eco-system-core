import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  AlertTriangle,
  Plus,
  CheckCircle2,
  FileCheck,
  Calculator,
  ShieldAlert,
  Search,
  Building,
  Briefcase,
  Calendar,
  Clock,
  Printer,
  X,
  CreditCard,
  DollarSign,
  AlertCircle,
  FileText,
  Check,
  ChevronRight,
  ShieldCheck,
  Users,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { formatINR, formatDate, numberToWordsINR } from '../../utils/formatters';

const RESIGNATION_REASONS = [
  'Career Advancement / Better Opportunity',
  'Higher Compensation / Benefits',
  'Relocation / Family Convenience',
  'Pursuing Higher Education / Certifications',
  'Health / Personal Reasons',
  'Career Transition / Sector Switch',
];

export const ExitManagementPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'noc' | 'fnf' | 'lwi'
  const [resignations, setResignations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  // Apply Resignation Modal (Employee)
  const [showResignModal, setShowResignModal] = useState(false);
  const [resignReason, setResignReason] = useState(RESIGNATION_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [noticeDays, setNoticeDays] = useState(30);
  const [proposedLwd, setProposedLwd] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [resignLoading, setResignLoading] = useState(false);

  // Mark Left Without Intimation Modal (BM / HR)
  const [showLwiModal, setShowLwiModal] = useState(false);
  const [lwiEmpId, setLwiEmpId] = useState('');
  const [lwiRemarks, setLwiRemarks] = useState('');
  const [lwiLoading, setLwiLoading] = useState(false);

  // F&F Calculation Modal (HR)
  const [showFnfModal, setShowFnfModal] = useState(false);
  const [selectedResig, setSelectedResig] = useState(null);
  const [fnfForm, setFnfForm] = useState({
    unpaidDays: 15,
    encashmentAmount: 12000,
    gratuityAmount: 0,
    deductions: 2500,
  });
  const [fnfLoading, setFnfLoading] = useState(false);

  // Formal Settlement Statement Modal
  const [selectedSettlement, setSelectedSettlement] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resigRes, empRes] = await Promise.all([
        api.get('/exit/resignations'),
        user?.role !== 'EMPLOYEE'
          ? api.get('/employees?status=ACTIVE')
          : Promise.resolve({ data: { data: { employees: [] } } }),
      ]);
      setResignations(resigRes.data.data || []);
      const activeEmps = empRes.data.data?.employees || [];
      setEmployees(activeEmps);
      if (activeEmps.length > 0 && !lwiEmpId) {
        setLwiEmpId(activeEmps[0].id);
      }
    } catch (err) {
      console.error('Failed to load exit data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResignSubmit = async (e) => {
    e.preventDefault();
    setResignLoading(true);
    try {
      const reasonText = customReason ? `${resignReason} - ${customReason}` : resignReason;
      await api.post('/exit/resignations', {
        reason: reasonText,
        noticePeriodDays: parseInt(noticeDays),
        proposedLastWorkingDate: proposedLwd,
      });
      setShowResignModal(false);
      setCustomReason('');
      fetchData();
      alert('Resignation submitted successfully. Salary marked on hold and replacement vacancy opened under Rule 2.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit resignation');
    } finally {
      setResignLoading(false);
    }
  };

  const handleLwiSubmit = async (e) => {
    e.preventDefault();
    setLwiLoading(true);
    try {
      await api.post('/exit/left-without-intimation', {
        employeeId: lwiEmpId,
        remarks: lwiRemarks,
      });
      setShowLwiModal(false);
      setLwiRemarks('');
      fetchData();
      alert('Employee marked Left Without Intimation. Salary placed on hold and replacement vacancy opened under Rule 3.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to mark employee Left Without Intimation');
    } finally {
      setLwiLoading(false);
    }
  };

  const handleToggleNoc = async (nocRecordId, key, currentValue) => {
    try {
      await api.patch(`/exit/noc/${nocRecordId}`, {
        [key]: !currentValue,
      });
      fetchData();
    } catch (err) {
      alert('Failed to update NOC clearance');
    }
  };

  const openFnfModal = (resig) => {
    setSelectedResig(resig);
    const basic = resig.employee?.salary?.basic || 30000;
    const doj = resig.employee?.dateOfJoining ? new Date(resig.employee.dateOfJoining) : null;
    let tenureYears = 1;
    if (doj) {
      const diffMs = Date.now() - doj.getTime();
      tenureYears = Math.floor(diffMs / (365.25 * 86400000));
    }

    const calculatedGratuity = tenureYears >= 5 ? Math.round((15 * basic * tenureYears) / 26) : 0;
    const suggestedLeaveEncash = Math.round(10 * (basic / 30));

    setFnfForm({
      unpaidDays: 15,
      encashmentAmount: suggestedLeaveEncash,
      gratuityAmount: calculatedGratuity,
      deductions: 2500,
    });
    setShowFnfModal(true);
  };

  const handleFnfSubmit = async (e) => {
    e.preventDefault();
    setFnfLoading(true);
    try {
      await api.post('/exit/fnf', {
        resignationId: selectedResig.id,
        employeeId: selectedResig.employeeId,
        ...fnfForm,
      });
      setShowFnfModal(false);
      fetchData();
      alert('Full & Final settlement calculated and logged successfully.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to calculate F&F');
    } finally {
      setFnfLoading(false);
    }
  };

  // Filtered resignations
  const filteredResignations = resignations.filter((r) => {
    const empName = `${r.employee?.firstName || ''} ${r.employee?.lastName || ''}`.toLowerCase();
    const empCode = (r.employee?.employeeCode || '').toLowerCase();
    const matchesSearch =
      !searchTerm ||
      empName.includes(searchTerm.toLowerCase()) ||
      empCode.includes(searchTerm.toLowerCase()) ||
      r.reason?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBranch = !branchFilter || r.employee?.branch?.name === branchFilter;
    return matchesSearch && matchesBranch;
  });

  // Unique branches
  const uniqueBranches = Array.from(
    new Set(resignations.map((r) => r.employee?.branch?.name).filter(Boolean))
  );

  // Metrics
  const totalExits = resignations.length;
  const heldSalaryCount = resignations.filter((r) => r.salaryHoldStatus === 'ON_HOLD').length;
  const pendingNocCount = resignations.filter(
    (r) => r.nocRecords?.[0]?.status === 'PENDING' || !r.nocRecords?.[0]
  ).length;
  const settledFnfCount = resignations.filter((r) => r.fnfRecords?.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-600" />
            <span>Offboarding & Separation Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage resignations, automated salary holds (Rule 2), multi-department NOC clearances, and full & final (F&F) settlements
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user?.role === 'EMPLOYEE' && (
            <Button
              size="sm"
              variant="outline"
              icon={Plus}
              onClick={() => setShowResignModal(true)}
            >
              Submit Resignation
            </Button>
          )}

          {['HR', 'BM', 'PLATFORM_ADMIN'].includes(user?.role) && (
            <>
              <Button
                size="sm"
                variant="danger"
                icon={AlertTriangle}
                onClick={() => setShowLwiModal(true)}
              >
                Mark Absconding / LWI
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Separations</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{totalExits}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Active exit cases</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Salary Holds Active</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600">{heldSalaryCount}</div>
          <span className="text-[11px] text-rose-700 font-medium mt-1 block">Automated lock applied</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Department NOCs</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600">{pendingNocCount}</div>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">Tooling, Asset & Accounts</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">F&F Settled</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">{settledFnfCount}</div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">Payouts calculated</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2 overflow-x-auto shadow-xs">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'pipeline'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Exit Pipeline & Resignations ({resignations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('noc')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'noc'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Dealership NOC & Asset Clearances</span>
        </button>

        <button
          onClick={() => setActiveTab('fnf')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'fnf'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Full & Final (F&F) Settlements ({settledFnfCount})</span>
        </button>
      </div>

      {/* TAB 1: RESIGNATIONS PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200/80 overflow-hidden shadow-xs">
          {/* Filter Bar */}
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search exits or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 w-48 sm:w-64 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-700"
              >
                <option value="">All Dealership Branches</option>
                {uniqueBranches.map((b, i) => (
                  <option key={i} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredResignations.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Branch & Dept</th>
                  <th className="py-3 px-4">Resignation Date</th>
                  <th className="py-3 px-4">Notice Period & LWD</th>
                  <th className="py-3 px-4">Separation Reason</th>
                  <th className="py-3 px-4">Salary Hold Status</th>
                  <th className="py-3 px-4">Exit Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResignations.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12">
                      <EmptyState
                        icon={UserCheck}
                        title="No active resignation or exit records"
                        description="All employee lifecycle records are active and in good standing."
                      />
                    </td>
                  </tr>
                ) : (
                  filteredResignations.map((r) => {
                    const fnf = r.fnfRecords?.[0];
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-900 block">
                            {r.employee?.firstName} {r.employee?.lastName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {r.employee?.employeeCode} • {r.employee?.designation}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-700">{r.employee?.branch?.name}</div>
                          <span className="text-[10px] text-indigo-600 font-medium">
                            {r.employee?.department || 'Operations'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {formatDate(r.resignationDate)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-900">{r.noticePeriodDays} Days</span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            LWD: {formatDate(r.proposedLastWorkingDate)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={r.reason}>
                          {r.reason}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded border ${
                              r.salaryHoldStatus === 'ON_HOLD'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {r.salaryHoldStatus === 'ON_HOLD' ? 'LOCKED (ON HOLD)' : 'RELEASED'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge status={r.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {user?.role === 'HR' && !fnf && (
                              <Button
                                size="sm"
                                variant="outline"
                                icon={Calculator}
                                onClick={() => openFnfModal(r)}
                                className="text-[11px] py-1 px-2.5"
                              >
                                Calculate F&F
                              </Button>
                            )}
                            {fnf && (
                              <button
                                type="button"
                                onClick={() => setSelectedSettlement({ ...fnf, resignation: r })}
                                className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] border border-indigo-200 transition"
                              >
                                Settlement Slip
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DEALERSHIP NOC CLEARANCE MATRIX */}
      {activeTab === 'noc' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200/80 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Departmental Handover & NOC Checklists
              </h3>
              <p className="text-[11px] text-slate-500">
                Multi-tier clearance required prior to releasing final salary disbursement
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200">
              3 Clearances Required
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Exiting Employee</th>
                  <th className="py-3 px-4">Dealership Branch</th>
                  <th className="py-3 px-4">1. Departmental Tooling & Handover</th>
                  <th className="py-3 px-4">2. IT Hardware & Portal Credentials</th>
                  <th className="py-3 px-4">3. Finance & Advance Recovery</th>
                  <th className="py-3 px-4">Overall NOC Clearance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resignations.map((r) => {
                  const noc = r.nocRecords?.[0];
                  if (!noc) return null;

                  return (
                    <tr key={noc.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {r.employee?.firstName} {r.employee?.lastName}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {r.employee?.employeeCode} • {r.employee?.designation}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {r.employee?.branch?.name}
                      </td>

                      {/* Department Handover */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          disabled={!['HR', 'BM', 'PLATFORM_ADMIN'].includes(user?.role)}
                          onClick={() =>
                            handleToggleNoc(noc.id, 'departmentClearance', noc.departmentClearance)
                          }
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                            noc.departmentClearance
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                          }`}
                        >
                          {noc.departmentClearance ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          <span>{noc.departmentClearance ? 'Tooling Returned' : 'Pending Return'}</span>
                        </button>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Keys, diagnostic OBD, uniforms
                        </span>
                      </td>

                      {/* IT Asset Handover */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          disabled={!['HR', 'BM', 'PLATFORM_ADMIN'].includes(user?.role)}
                          onClick={() =>
                            handleToggleNoc(noc.id, 'assetClearance', noc.assetClearance)
                          }
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                            noc.assetClearance
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                          }`}
                        >
                          {noc.assetClearance ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          <span>{noc.assetClearance ? 'Hardware Returned' : 'Pending Assets'}</span>
                        </button>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          SIM card, laptop, email deactivation
                        </span>
                      </td>

                      {/* Finance Clearance */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          disabled={user?.role !== 'HR' && user?.role !== 'PLATFORM_ADMIN'}
                          onClick={() =>
                            handleToggleNoc(noc.id, 'financeClearance', noc.financeClearance)
                          }
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                            noc.financeClearance
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                          }`}
                        >
                          {noc.financeClearance ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          <span>{noc.financeClearance ? 'Finance Cleared' : 'Pending Accounts'}</span>
                        </button>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Advance recovery & claims
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <Badge status={noc.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FULL & FINAL SETTLEMENTS */}
      {activeTab === 'fnf' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200/80 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Full & Final (F&F) Settlement Register
              </h3>
              <p className="text-[11px] text-slate-500">
                Official calculated separation dues, leave encashments, statutory gratuity, and deductions
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200">
              {settledFnfCount} Settled Cases
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Exiting Employee</th>
                  <th className="py-3 px-4">Settlement Date</th>
                  <th className="py-3 px-4">Unpaid Days Pay</th>
                  <th className="py-3 px-4">Leave Encashment</th>
                  <th className="py-3 px-4">Gratuity (5+ Yrs)</th>
                  <th className="py-3 px-4">Deductions</th>
                  <th className="py-3 px-4">Net Payable Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resignations.filter((r) => r.fnfRecords?.length > 0).length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12">
                      <EmptyState
                        icon={Calculator}
                        title="No F&F settlements finalized"
                        description="Calculate F&F for employees in the Resignations Pipeline tab."
                      />
                    </td>
                  </tr>
                ) : (
                  resignations
                    .filter((r) => r.fnfRecords?.length > 0)
                    .map((r) => {
                      const fnf = r.fnfRecords[0];
                      const basic = r.employee?.salary?.basic || 30000;
                      const unpaidAmount = Math.round((fnf.unpaidDays || 0) * (basic / 30));

                      return (
                        <tr key={fnf.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-900 block">
                              {r.employee?.firstName} {r.employee?.lastName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {r.employee?.employeeCode} • {r.employee?.branch?.name}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-800">
                            {formatDate(fnf.settlementDate)}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                            {formatINR(unpaidAmount)}{' '}
                            <span className="text-[10px] text-slate-400 font-sans">
                              ({fnf.unpaidDays} days)
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-medium text-emerald-700">
                            +{formatINR(fnf.encashmentAmount)}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-medium text-indigo-700">
                            +{formatINR(fnf.gratuityAmount)}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-medium text-rose-600">
                            -{formatINR(fnf.deductions)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-slate-950 font-mono text-sm block">
                              {formatINR(fnf.netPayable)}
                            </span>
                            <Badge status={fnf.status} />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              icon={Printer}
                              onClick={() => setSelectedSettlement({ ...fnf, resignation: r })}
                              className="text-[11px] py-1 px-2.5"
                            >
                              Settlement Slip
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Submit Resignation (Employee) */}
      <Modal
        isOpen={showResignModal}
        onClose={() => setShowResignModal(false)}
        title="Submit Employee Resignation"
      >
        <form onSubmit={handleResignSubmit} className="space-y-4 text-xs">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Dealership Separation Policy Notice</span>
            </div>
            <p className="text-[11px]">
              Submitting resignation triggers <strong>Automation Rule 2</strong>: HR & BM are notified, monthly salary disbursement is placed on hold until complete clearance, a replacement requisition is opened, and department NOC checklists are initialized.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Primary Reason for Leaving *</label>
            <select
              value={resignReason}
              onChange={(e) => setResignReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
            >
              {RESIGNATION_REASONS.map((reason, idx) => (
                <option key={idx} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Additional Feedback / Remarks</label>
            <textarea
              rows="3"
              placeholder="State any specific details or feedback for your exit interview..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contractual Notice (Days) *</label>
              <input
                type="number"
                required
                min="0"
                max="90"
                value={noticeDays}
                onChange={(e) => setNoticeDays(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Proposed Last Working Day *</label>
              <input
                type="date"
                required
                value={proposedLwd}
                onChange={(e) => setProposedLwd(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button size="sm" variant="outline" onClick={() => setShowResignModal(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" type="submit" loading={resignLoading}>
              Confirm Resignation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Mark Left Without Intimation */}
      <Modal
        isOpen={showLwiModal}
        onClose={() => setShowLwiModal(false)}
        title="Mark Employee as Left Without Intimation (Absconding)"
      >
        <form onSubmit={handleLwiSubmit} className="space-y-4 text-xs">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Critical Lifecycle Action: Automation Rule 3</span>
            </div>
            <p className="text-[11px]">
              Marking an employee as absconding immediately transitions their status to <strong>LEFT_WITHOUT_INTIMATION</strong>, locks their salary payments, initiates replacement recruitment, and flags their profile for legal show-cause notice delivery.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Employee *</label>
            <select
              required
              value={lwiEmpId}
              onChange={(e) => setLwiEmpId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeCode}) — {emp.designation} ({emp.branch?.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Absence Details & Remarks *</label>
            <textarea
              required
              rows="3"
              placeholder="Detail the dates of unauthorized absence, missed phone calls, and supervisor reports..."
              value={lwiRemarks}
              onChange={(e) => setLwiRemarks(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button size="sm" variant="outline" onClick={() => setShowLwiModal(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" type="submit" loading={lwiLoading}>
              Execute Rule 3 (Lock & Replace)
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Calculate F&F Settlement */}
      {selectedResig && (
        <Modal
          isOpen={showFnfModal}
          onClose={() => setShowFnfModal(false)}
          title={`Calculate Full & Final Settlement: ${selectedResig.employee?.firstName} ${selectedResig.employee?.lastName}`}
        >
          <form onSubmit={handleFnfSubmit} className="space-y-4 text-xs">
            {/* Employee Demographic Header */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Employee</span>
                <span className="font-bold text-slate-900">
                  {selectedResig.employee?.firstName} {selectedResig.employee?.lastName} (
                  {selectedResig.employee?.employeeCode})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Base Monthly Basic</span>
                <span className="font-mono font-bold text-slate-800">
                  {formatINR(selectedResig.employee?.salary?.basic || 30000)}
                </span>
              </div>
            </div>

            {/* Input Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unpaid Working Days *</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="31"
                  value={fnfForm.unpaidDays}
                  onChange={(e) => setFnfForm({ ...fnfForm, unpaidDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-semibold"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">Days worked in final month</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Leave Encashment (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={fnfForm.encashmentAmount}
                  onChange={(e) => setFnfForm({ ...fnfForm, encashmentAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-semibold text-emerald-700"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">Accrued Earned Leave credit</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Statutory Gratuity (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={fnfForm.gratuityAmount}
                  onChange={(e) => setFnfForm({ ...fnfForm, gratuityAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-semibold text-indigo-700"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">Applicable for 5+ years service</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Deductions (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={fnfForm.deductions}
                  onChange={(e) => setFnfForm({ ...fnfForm, deductions: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-semibold text-rose-600"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">Advances, damages, tax</span>
              </div>
            </div>

            {/* Calculated Take-Home Summary */}
            {(() => {
              const basic = selectedResig.employee?.salary?.basic || 30000;
              const unpaidTotal = Math.round(fnfForm.unpaidDays * (basic / 30));
              const totalEarnings = unpaidTotal + Number(fnfForm.encashmentAmount || 0) + Number(fnfForm.gratuityAmount || 0);
              const netPayable = Math.max(0, totalEarnings - Number(fnfForm.deductions || 0));

              return (
                <div className="p-3.5 bg-slate-900 text-white rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Net Final Settlement Payout
                    </span>
                    <span className="text-xs text-indigo-300 font-medium">
                      {numberToWordsINR(netPayable)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-emerald-400 font-mono">
                      {formatINR(netPayable)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Discharged upon all NOCs</span>
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button size="sm" variant="outline" onClick={() => setShowFnfModal(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="success" type="submit" loading={fnfLoading}>
                Finalize & Save Settlement
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Printable Dealership Settlement Statement */}
      {selectedSettlement && (
        <Modal
          isOpen={Boolean(selectedSettlement)}
          onClose={() => setSelectedSettlement(null)}
          title={`Full & Final Settlement Discharge Slip: ${selectedSettlement.resignation?.employee?.firstName} ${selectedSettlement.resignation?.employee?.lastName}`}
        >
          <div className="space-y-4 text-xs font-sans">
            <style>{`
              @media print {
                body * {
                  visibility: hidden;
                }
                #fnf-printable-slip, #fnf-printable-slip * {
                  visibility: visible;
                }
                #fnf-printable-slip {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  margin: 0;
                  padding: 20px;
                  background: white !important;
                }
              }
            `}</style>

            <div id="fnf-printable-slip" className="p-6 bg-white border border-slate-300 rounded-xl space-y-4">
              <div className="border-b-2 border-slate-800 pb-3 text-center">
                <h2 className="text-lg font-black text-slate-900 uppercase">
                  Bellad Enterprises Private Limited
                </h2>
                <p className="text-xs font-bold text-indigo-700 uppercase">
                  Automobile Dealership Network & Authorized Workshops
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Full & Final (F&F) Settlement & Clearance Certificate
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg text-[11px] border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Employee Name & Code</span>
                  <span className="font-bold text-slate-900">
                    {selectedSettlement.resignation?.employee?.firstName}{' '}
                    {selectedSettlement.resignation?.employee?.lastName} (
                    {selectedSettlement.resignation?.employee?.employeeCode})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Designation & Branch</span>
                  <span className="font-semibold text-slate-800">
                    {selectedSettlement.resignation?.employee?.designation} —{' '}
                    {selectedSettlement.resignation?.employee?.branch?.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Settlement Date</span>
                  <span className="font-semibold text-slate-800">
                    {formatDate(selectedSettlement.settlementDate)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Reason for Exit</span>
                  <span className="font-medium text-slate-800">
                    {selectedSettlement.resignation?.reason}
                  </span>
                </div>
              </div>

              {/* Settlement Components */}
              <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
                <div className="bg-slate-100 px-3 py-1.5 font-bold uppercase text-slate-700 flex justify-between">
                  <span>Settlement Component</span>
                  <span>Amount (₹)</span>
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="flex justify-between p-2.5">
                    <span className="text-slate-600">Unpaid Days Salary ({selectedSettlement.unpaidDays} days)</span>
                    <span className="font-mono font-medium text-slate-900">
                      {formatINR(
                        Math.round(
                          (selectedSettlement.unpaidDays || 0) *
                            ((selectedSettlement.resignation?.employee?.salary?.basic || 30000) / 30)
                        )
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between p-2.5">
                    <span className="text-slate-600">Earned Leave Encashment</span>
                    <span className="font-mono font-medium text-emerald-700">
                      +{formatINR(selectedSettlement.encashmentAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between p-2.5">
                    <span className="text-slate-600">Statutory Gratuity Settlement</span>
                    <span className="font-mono font-medium text-indigo-700">
                      +{formatINR(selectedSettlement.gratuityAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between p-2.5">
                    <span className="text-slate-600">Less: Outstanding Advances, Damages & Recoveries</span>
                    <span className="font-mono font-medium text-rose-600">
                      -{formatINR(selectedSettlement.deductions)}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-900 text-white p-3 flex justify-between items-center font-bold">
                  <span className="uppercase text-xs tracking-wider">Net Amount Disbursed to Account:</span>
                  <span className="font-mono text-emerald-400 text-base">
                    {formatINR(selectedSettlement.netPayable)}
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200">
                <div>
                  <div className="w-32 h-8 border-b border-dashed border-slate-400 mb-1" />
                  <p className="font-bold text-slate-800">Employee Signature</p>
                  <p className="text-[10px] text-slate-400">Full & Final Discharge Acknowledged</p>
                </div>
                <div className="text-right">
                  <div className="w-32 h-8 border-b border-dashed border-slate-400 mb-1 ml-auto" />
                  <p className="font-bold text-slate-800">Dealership HR & Finance</p>
                  <p className="text-[10px] text-slate-400">Authorized Signatory</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button size="sm" variant="outline" onClick={() => setSelectedSettlement(null)}>
                Close
              </Button>
              <Button size="sm" variant="primary" icon={Printer} onClick={() => window.print()}>
                Print / Save PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ExitManagementPage;
