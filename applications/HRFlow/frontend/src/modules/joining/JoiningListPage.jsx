import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Link as LinkIcon,
  Copy,
  Check,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  ExternalLink,
  Search,
  Filter,
  Eye,
  Shield,
  CreditCard,
  Building,
  Briefcase,
  AlertCircle,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, formatINR } from '../../utils/formatters';

const DEALERSHIP_DESIGNATION_SUGGESTIONS = [
  'Sales Consultant — New Cars',
  'Sales Consultant — Certified Pre-Owned',
  'Service Advisor',
  'Diagnostic Master Technician',
  'Bodyshop Estimator & Painter',
  'Spare Parts & Inventory Specialist',
  'Customer Relations Executive (CRM)',
  'Dealership Accountant & Cashier',
  'PDI & Quality Inspector',
  'Accessories Installation Specialist',
];

export const JoiningListPage = () => {
  const [records, setRecords] = useState([]);
  const [branches, setBranches] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'FORM_SUBMITTED' | 'COMPLETED'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    positionId: '',
    branchId: '',
    designation: '',
    department: 'Sales',
    joiningDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');

  // Review & Complete Onboarding Modal
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [proposedBasic, setProposedBasic] = useState(30000);
  const [copiedToken, setCopiedToken] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [joinRes, brRes, posRes] = await Promise.all([
        api.get('/joining'),
        api.get('/branches'),
        api.get('/vacancies/positions?status=OPEN'),
      ]);
      setRecords(joinRes.data.data || []);
      setBranches(brRes.data.data || []);
      setPositions(posRes.data.data || []);
      if (brRes.data.data?.length > 0 && !inviteForm.branchId) {
        setInviteForm((prev) => ({ ...prev, branchId: brRes.data.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load joining pipeline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError('');
    try {
      await api.post('/joining/invite', inviteForm);
      setShowInviteModal(false);
      setInviteForm({
        candidateName: '',
        candidateEmail: '',
        candidatePhone: '',
        positionId: '',
        branchId: branches[0]?.id || '',
        designation: '',
        department: 'Sales',
        joiningDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      });
      fetchData();
      alert('Onboarding invitation generated successfully! You can now copy and dispatch the onboarding link to the candidate.');
    } catch (err) {
      setInviteError(err.response?.data?.error || 'Failed to send candidate invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCompleteJoining = async (recordId) => {
    setCompleting(true);
    try {
      const submissionData = {
        ...(selectedRecord?.formData || {}),
        basic: Number(proposedBasic) || 30000,
      };

      await api.post(`/joining/${recordId}/complete`, {
        employeeData: submissionData,
      });

      setSelectedRecord(null);
      fetchData();
      alert(
        `🎉 Successfully provisioned ${selectedRecord.candidateName} as an Active Employee! Associated position closed, and BM hardware approval tasks (SIM/Laptop) created.`
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to complete joining formalities');
    } finally {
      setCompleting(false);
    }
  };

  const copyLink = (token) => {
    const url = `${window.location.origin}/join/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  // Pipeline Filtered Records
  const filteredRecords = records.filter((r) => {
    if (activeTab !== 'ALL' && r.status !== activeTab) return false;
    if (selectedBranch && r.branchId !== selectedBranch) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = r.candidateName?.toLowerCase().includes(term);
      const matchEmail = r.candidateEmail?.toLowerCase().includes(term);
      const matchPhone = r.candidatePhone?.toLowerCase().includes(term);
      const matchDesig = r.designation?.toLowerCase().includes(term);
      const matchDept = r.department?.toLowerCase().includes(term);
      return matchName || matchEmail || matchPhone || matchDesig || matchDept;
    }
    return true;
  });

  // Pipeline Counts
  const pendingCount = records.filter((r) => r.status === 'PENDING').length;
  const submittedCount = records.filter((r) => r.status === 'FORM_SUBMITTED').length;
  const completedCount = records.filter((r) => r.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-indigo-600" />
            <span>Candidate Onboarding & Digital Joining</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Issue secure onboarding links, verify candidate KYC & bank credentials, and auto-provision Employee Master records (Rule 1)
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          icon={UserPlus}
          onClick={() => setShowInviteModal(true)}
          className="shadow-sm"
        >
          Invite New Joiner
        </Button>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Invitations</span>
            <LinkIcon className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{records.length}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Tokens generated</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Awaiting Submission</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600">{pendingCount}</div>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">Link with candidate</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Ready for Provisioning</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-600">{submittedCount}</div>
          <span className="text-[11px] text-blue-700 font-medium mt-1 block">KYC form submitted</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Successfully Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">{completedCount}</div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">In Dealership Roster</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Stage Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Records ({records.length})
            </button>
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'PENDING'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Pending Candidate ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('FORM_SUBMITTED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'FORM_SUBMITTED'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Ready to Provision ({submittedCount})
            </button>
            <button
              onClick={() => setActiveTab('COMPLETED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'COMPLETED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Active Employees ({completedCount})
            </button>
          </div>

          {/* Search & Branch Select */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 w-44 sm:w-56 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Candidate Pipeline Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Candidate & Profile</th>
                <th className="py-3 px-4">Dealership Placement</th>
                <th className="py-3 px-4">Joining Date</th>
                <th className="py-3 px-4">Onboarding Stage</th>
                <th className="py-3 px-4">Self-Service Link</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12">
                    <EmptyState
                      icon={UserPlus}
                      title="No candidates found in this stage"
                      description="Click 'Invite New Joiner' to generate an onboarding token or change filters."
                    />
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const initials = r.candidateName
                    ? r.candidateName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()
                    : 'CD';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{r.candidateName}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{r.candidateEmail}</span>
                            </div>
                            {r.candidatePhone && (
                              <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{r.candidatePhone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{r.designation}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{r.branch?.name}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-medium text-indigo-600">{r.department}</span>
                        </div>
                        {r.position && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 mt-0.5">
                            Req: {r.position.positionCode || 'OPEN'}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">{formatDate(r.joiningDate)}</div>
                        <span className="text-[10px] text-slate-400 block">Proposed Start</span>
                      </td>

                      <td className="py-3.5 px-4">
                        {r.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            <span>Link Dispatched</span>
                          </span>
                        )}
                        {r.status === 'FORM_SUBMITTED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
                            <FileText className="w-3 h-3" />
                            <span>KYC Form Submitted</span>
                          </span>
                        )}
                        {r.status === 'COMPLETED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active in Roster</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => copyLink(r.token)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition"
                            title="Copy Candidate Portal Link"
                          >
                            {copiedToken === r.token ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700 font-semibold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>
                          <a
                            href={`/join/${r.token}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Preview / Fill Candidate Portal Form"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {r.status === 'FORM_SUBMITTED' && (
                          <Button
                            size="sm"
                            variant="success"
                            icon={CheckCircle2}
                            onClick={() => setSelectedRecord(r)}
                            className="text-[11px] py-1 px-3 shadow-xs"
                          >
                            Verify & Provision
                          </Button>
                        )}
                        {r.status === 'PENDING' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyLink(r.token)}
                            className="text-[11px] py-1 px-2.5 text-slate-600"
                          >
                            Resend Link
                          </Button>
                        )}
                        {r.status === 'COMPLETED' && (
                          <span className="text-[11px] text-emerald-700 font-semibold inline-flex items-center gap-1">
                            <span>Provisioned ✓</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Invite Joiner */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Candidate for Dealership Onboarding"
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
          {inviteError && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
              {inviteError}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Candidate Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ananya Verma"
              value={inviteForm.candidateName}
              onChange={(e) => setInviteForm({ ...inviteForm, candidateName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="ananya.v@gmail.com"
                value={inviteForm.candidateEmail}
                onChange={(e) => setInviteForm({ ...inviteForm, candidateEmail: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mobile Phone (10 digits) *</label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                required
                placeholder="9876543210"
                value={inviteForm.candidatePhone}
                onChange={(e) => setInviteForm({ ...inviteForm, candidatePhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dealership Branch *</label>
              <select
                value={inviteForm.branchId}
                onChange={(e) => setInviteForm({ ...inviteForm, branchId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Linked Open Requisition</label>
              <select
                value={inviteForm.positionId}
                onChange={(e) => setInviteForm({ ...inviteForm, positionId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">No linked requisition</option>
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.branch?.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Designation *</label>
              <input
                type="text"
                required
                list="designation-suggestions"
                placeholder="e.g. Sales Consultant — New Cars"
                value={inviteForm.designation}
                onChange={(e) => setInviteForm({ ...inviteForm, designation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
              <datalist id="designation-suggestions">
                {DEALERSHIP_DESIGNATION_SUGGESTIONS.map((d, i) => (
                  <option key={i} value={d} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department *</label>
              <select
                value={inviteForm.department}
                onChange={(e) => setInviteForm({ ...inviteForm, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Sales">Sales</option>
                <option value="Service">Service</option>
                <option value="Spares">Spare Parts</option>
                <option value="Bodyshop">Bodyshop & Paint</option>
                <option value="CRM">Customer Relations (CRM)</option>
                <option value="Accounts">Accounts & Finance</option>
                <option value="PDI">PDI & Accessories</option>
                <option value="HR & Admin">HR & Dealership Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Proposed Joining Date *</label>
            <input
              type="date"
              required
              value={inviteForm.joiningDate}
              onChange={(e) => setInviteForm({ ...inviteForm, joiningDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button size="sm" variant="outline" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" loading={inviteLoading}>
              Generate Invitation Token
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Review & Finalize Joining (Execute Rule 1) */}
      {selectedRecord && (
        <Modal
          isOpen={Boolean(selectedRecord)}
          onClose={() => setSelectedRecord(null)}
          title={`Review & Provision Employee: ${selectedRecord.candidateName}`}
        >
          <div className="space-y-4 text-xs">
            {/* Automation Banner */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-indigo-50 border border-emerald-200 rounded-xl text-slate-700 space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Automated Onboarding Engine (Automation Rule 1)</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Upon confirmation, HRFlow will generate the Employee Master record, mark the vacancy as <strong>FILLED & CLOSED</strong>, initialize salary structure, and automatically dispatch Branch Manager approval tasks for <strong>Corporate SIM & Laptop</strong> hardware issuance.
              </p>
            </div>

            {/* Candidate Submitted Data Review */}
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
              <div className="p-3 bg-slate-50 font-bold text-slate-800 flex justify-between items-center">
                <span>Submitted Candidate Credentials</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono">
                  KYC Verified
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Candidate Name</span>
                  <span className="font-bold text-slate-900">{selectedRecord.candidateName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Target Branch & Dept</span>
                  <span className="font-semibold text-slate-800">
                    {selectedRecord.branch?.name} ({selectedRecord.department})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Designation</span>
                  <span className="font-semibold text-slate-800">{selectedRecord.designation}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Date of Joining</span>
                  <span className="font-semibold text-slate-800">{formatDate(selectedRecord.joiningDate)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50/50">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">PAN & Aadhaar Number</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {selectedRecord.formData?.pan || 'ABCDE1234F'} / {selectedRecord.formData?.aadhaar || '•••• •••• 9812'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Bank Account & IFSC</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {selectedRecord.formData?.bankName || 'State Bank of India'} (
                    {selectedRecord.formData?.accountNumber ? `••••${selectedRecord.formData.accountNumber.slice(-4)}` : '••••5812'})
                  </span>
                </div>
              </div>
            </div>

            {/* Salary Structure Configuration */}
            <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-slate-50">
              <span className="font-bold text-slate-800 block text-xs">Initial Salary Structure Setup</span>
              <div className="grid grid-cols-3 gap-3 items-center">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Basic Pay (₹) *</label>
                  <input
                    type="number"
                    value={proposedBasic}
                    onChange={(e) => setProposedBasic(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">HRA (50% Basic):</span>
                  <span className="font-mono font-bold text-slate-800">{formatINR(proposedBasic * 0.5)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Calculated Gross Pay:</span>
                  <span className="font-mono font-extrabold text-emerald-700 text-sm">
                    {formatINR(proposedBasic * 1.8)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button size="sm" variant="outline" onClick={() => setSelectedRecord(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="success"
                icon={CheckCircle2}
                loading={completing}
                onClick={() => handleCompleteJoining(selectedRecord.id)}
                className="shadow-sm"
              >
                Provision Active Employee (Execute Rule 1)
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default JoiningListPage;
