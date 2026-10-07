import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  Building2,
  Banknote,
  Laptop,
  FileText,
  Repeat,
  Phone,
  Clock,
  IdCard,
  Edit,
  Save,
  CheckCircle,
  AlertCircle,
  Plus,
  Printer,
  Layers,
  CalendarDays,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { formatINR, formatDate, formatDateTime } from '../../utils/formatters';

export const EmployeeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const employeeId = id === 'me' ? user?.employeeId : id;

  const [employee, setEmployee] = useState(null);
  const [digitalId, setDigitalId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals for editing
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [salaryForm, setSalaryForm] = useState({ basic: 0, hra: 0, conveyance: 0, specialAllowance: 0, reason: '' });

  const [showKycModal, setShowKycModal] = useState(false);
  const [kycForm, setKycForm] = useState({ aadhaarNumber: '', panNumber: '', bankName: '', accountNumber: '', ifscCode: '', branchName: '' });

  const [showAssetModal, setShowAssetModal] = useState(false);
  const [assetForm, setAssetForm] = useState({ assetType: 'LAPTOP', assetName: '', serialNumber: '' });

  // Role, Level & Manager Modal
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleForm, setRoleForm] = useState({ levelId: '', designationId: '', reportingManagerId: '' });
  const [levels, setLevels] = useState([]);
  const [allDesignations, setAllDesignations] = useState([]);
  const [potentialManagers, setPotentialManagers] = useState([]);
  const [roleSubmitting, setRoleSubmitting] = useState(false);

  const fetchEmployee = async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const [empRes, idRes, lvlRes, desigRes, allEmpRes] = await Promise.all([
        api.get(`/employees/${employeeId}`),
        api.get(`/employees/${employeeId}/digital-id`),
        api.get('/organization-masters/levels'),
        api.get('/organization-masters/designations?limit=500&isActive=true'),
        api.get('/employees?limit=200'),
      ]);
      const emp = empRes.data.data;
      setEmployee(emp);
      setDigitalId(idRes.data.data);
      setLevels(lvlRes.data.data || []);
      setAllDesignations(desigRes.data.data || []);
      setPotentialManagers((allEmpRes.data.data?.employees || []).filter((e) => e.id !== employeeId));

      if (emp.salary) {
        setSalaryForm({
          basic: emp.salary.basic || 0,
          hra: emp.salary.hra || 0,
          conveyance: emp.salary.conveyance || 0,
          specialAllowance: emp.salary.specialAllowance || 0,
          reason: '',
        });
      }
      if (emp.kyc) {
        setKycForm({
          aadhaarNumber: emp.kyc.aadhaarNumber || '',
          panNumber: emp.kyc.panNumber || '',
          bankName: emp.kyc.bankName || '',
          accountNumber: emp.kyc.accountNumber || '',
          ifscCode: emp.kyc.ifscCode || '',
          branchName: emp.kyc.branchName || '',
        });
      }
    } catch (err) {
      console.error('Failed to load employee details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRoleModal = () => {
    setRoleForm({
      levelId: employee.levelId || '',
      designationId: employee.designationId || '',
      reportingManagerId: employee.reportingManagerId || '',
    });
    setShowRoleModal(true);
  };

  const handleRoleLevelChange = (lvlId) => {
    const currentDesig = allDesignations.find((d) => d.id === roleForm.designationId);
    const isStillValid = currentDesig && currentDesig.levelId === lvlId;
    setRoleForm((prev) => ({
      ...prev,
      levelId: lvlId,
      designationId: isStillValid ? prev.designationId : '',
    }));
  };

  const roleFilteredDesignations = roleForm.levelId
    ? allDesignations.filter((d) => d.levelId === roleForm.levelId && d.isActive)
    : allDesignations.filter((d) => d.isActive);

  const handleRoleUpdate = async (e) => {
    e.preventDefault();
    setRoleSubmitting(true);
    try {
      await api.put(`/employees/${employeeId}`, {
        levelId: roleForm.levelId || null,
        designationId: roleForm.designationId || null,
        reportingManagerId: roleForm.reportingManagerId || null,
      });
      setShowRoleModal(false);
      fetchEmployee();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update organizational role');
    } finally {
      setRoleSubmitting(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [employeeId]);

  const handleSalaryUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/employees/${employeeId}/salary`, salaryForm);
      setShowSalaryModal(false);
      fetchEmployee();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update salary');
    }
  };

  const handleKycUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/employees/${employeeId}/kyc`, kycForm);
      setShowKycModal(false);
      fetchEmployee();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update KYC');
    }
  };

  const handleAssetAssign = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/employees/${employeeId}/assets`, assetForm);
      setShowAssetModal(false);
      setAssetForm({ assetType: 'LAPTOP', assetName: '', serialNumber: '' });
      fetchEmployee();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to assign asset');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-slate-200 rounded-xl"></div>
        <div className="h-96 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-800">Employee Record Not Found</h3>
        <Button size="sm" variant="outline" className="mt-4" onClick={() => navigate('/employees')}>
          Back to Directory
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview & Digital ID', icon: IdCard },
    { id: 'personal', label: 'Personal Details', icon: User },
    { id: 'kyc', label: 'KYC & Banking', icon: ShieldCheck },
    { id: 'employment', label: 'Employment', icon: Building2 },
    { id: 'statutory', label: 'Statutory (PF/ESI)', icon: FileText },
    { id: 'salary', label: 'Salary & Hikes', icon: Banknote },
    { id: 'attendance', label: 'Attendance & Punches', icon: Clock },
    { id: 'leaves', label: 'Leave & Balances', icon: CalendarDays },
    { id: 'assets', label: 'Assigned Assets', icon: Laptop },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'transfers', label: 'Transfers', icon: Repeat },
    { id: 'history', label: 'Lifecycle & Exit', icon: Clock },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
            {employee.firstName[0]}
            {employee.lastName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {employee.firstName} {employee.lastName}
              </h1>
              <Badge status={employee.status} />
              {employee.level && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Level {employee.level.levelNumber} • {employee.level.name}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
              <span className="font-mono text-indigo-600 font-semibold">{employee.employeeCode}</span>
              <span>•</span>
              <span className="font-medium text-slate-800">{employee.designation}</span>
              <span>•</span>
              <span>{employee.department}</span>
              <span>•</span>
              <span className="font-medium text-slate-700">{employee.branch?.name}</span>
              {employee.reportingManager && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                    <span className="text-slate-400">Reports to:</span>
                    <strong className="text-slate-800 font-semibold">
                      {employee.reportingManager.firstName} {employee.reportingManager.lastName}
                    </strong>
                    ({employee.reportingManager.designation || 'Manager'})
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {user?.role === 'HR' && (
            <>
              <Button
                size="sm"
                variant="outline"
                icon={Layers}
                onClick={handleOpenRoleModal}
              >
                Edit Role & Level
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={Banknote}
                onClick={() => setShowSalaryModal(true)}
              >
                Adjust Salary
              </Button>
            </>
          )}
          {['HR', 'BM'].includes(user?.role) && (
            <Button
              size="sm"
              variant="primary"
              icon={Laptop}
              onClick={() => setShowAssetModal(true)}
            >
              Assign Asset
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
        {/* Tab 1: Overview & Digital ID Card */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Digital ID Card */}
            <div className="lg:col-span-1 bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-28 h-28 rounded-full bg-white/10 blur-xl"></div>
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-300" />
                  <div>
                    <span className="font-bold text-sm tracking-wider uppercase">HRFlow</span>
                    <span className="text-[9px] block text-indigo-200 -mt-1 tracking-widest uppercase">Digital Pass</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-indigo-200 border border-white/10">
                  {digitalId?.employeeCode}
                </span>
              </div>

              <div className="text-center py-2">
                <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/30 text-white font-bold text-3xl mx-auto flex items-center justify-center shadow-inner mb-3">
                  {employee.firstName[0]}{employee.lastName[0]}
                </div>
                <h3 className="text-lg font-bold tracking-tight">{digitalId?.fullName}</h3>
                <p className="text-xs text-indigo-200 font-medium">{digitalId?.designation}</p>
                <p className="text-[11px] text-indigo-300/80">{digitalId?.department}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 space-y-1.5 text-[11px] text-indigo-100">
                <div className="flex justify-between">
                  <span className="text-indigo-300">Location:</span>
                  <span className="font-semibold">{digitalId?.branchName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-300">Blood Group:</span>
                  <span className="font-semibold">{digitalId?.bloodGroup}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-300">Emergency Contact:</span>
                  <span className="font-semibold">{digitalId?.emergencyPhone}</span>
                </div>
                <div className="flex justify-between pt-1 text-[10px] text-indigo-300/60">
                  <span>Authorized ID:</span>
                  <span>Valid through 2027</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex justify-center no-print">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="text-xs font-semibold text-indigo-200 hover:text-white flex items-center gap-1.5 py-1 px-3 rounded-lg bg-white/10 hover:bg-white/20 transition"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Digital ID
                </button>
              </div>
            </div>

            {/* Quick Profile Summary */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Key Employee Information
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block">Work Email</span>
                    <span className="font-semibold text-slate-800 break-all">{employee.email}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block">Contact Phone</span>
                    <span className="font-semibold text-slate-800">{employee.phone}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block">Date of Joining</span>
                    <span className="font-semibold text-slate-800">{formatDate(employee.dateOfJoining)}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block">Current Gross Pay</span>
                    <span className="font-bold text-slate-900">{formatINR(employee.salary?.grossSalary)}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block">Employment Type</span>
                    <span className="font-semibold text-slate-800">{employee.employmentType}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block">Compliance Status</span>
                    <span className="font-semibold text-emerald-600">Active & Compliant</span>
                  </div>
                </div>
              </div>

              {/* Active Assets Assigned */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Assigned Corporate Assets ({employee.assets?.length || 0})
                  </h3>
                  {['HR', 'BM'].includes(user?.role) && (
                    <Button size="sm" variant="ghost" icon={Plus} onClick={() => setShowAssetModal(true)}>
                      Assign
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {employee.assets?.length === 0 ? (
                    <p className="text-xs text-slate-400 col-span-2">No hardware or SIM assets currently assigned.</p>
                  ) : (
                    employee.assets?.map((asset) => (
                      <div key={asset.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                            <Laptop className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{asset.assetName}</p>
                            <span className="text-[10px] text-slate-400 font-mono">{asset.serialNumber}</span>
                          </div>
                        </div>
                        <Badge status={asset.status} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Personal Details */}
        {activeTab === 'personal' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Personal & Demographics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">First Name</span>
                <span className="font-semibold text-slate-800">{employee.firstName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">Last Name</span>
                <span className="font-semibold text-slate-800">{employee.lastName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">Gender</span>
                <span className="font-semibold text-slate-800">{employee.gender}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">Date of Birth</span>
                <span className="font-semibold text-slate-800">{formatDate(employee.dob)}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">Blood Group</span>
                <span className="font-semibold text-slate-800">{employee.bloodGroup || '—'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">Marital Status</span>
                <span className="font-semibold text-slate-800">{employee.maritalStatus || '—'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: KYC & Banking */}
        {activeTab === 'kyc' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  KYC & Statutory Banking Records
                </h3>
                <p className="text-xs text-slate-500">Government identity cards and salary disbursement account</p>
              </div>
              {['HR', 'BM'].includes(user?.role) && (
                <Button size="sm" variant="outline" icon={Edit} onClick={() => setShowKycModal(true)}>
                  Edit KYC
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">Aadhaar Card Number</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {employee.kyc?.aadhaarNumber || 'Not provided'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">PAN Number</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {employee.kyc?.panNumber || 'Not provided'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">Verification Status</span>
                <span className={`font-semibold ${employee.kyc?.verified ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {employee.kyc?.verified ? 'Verified ✓' : 'Pending Verification'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">Disbursement Bank</span>
                <span className="font-semibold text-slate-800">{employee.kyc?.bankName || 'Not provided'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">Account Number</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {employee.kyc?.accountNumber || 'Not provided'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">IFSC Code</span>
                <span className="font-semibold text-slate-800 font-mono">{employee.kyc?.ifscCode || 'Not provided'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Employment Details */}
        {activeTab === 'employment' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Employment & Branch Alignment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">Branch Office</span>
                <span className="font-semibold text-slate-800">{employee.branch?.name}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">Branch Code & City</span>
                <span className="font-semibold text-slate-800">{employee.branch?.code} ({employee.branch?.city})</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">Department</span>
                <span className="font-semibold text-slate-800">{employee.department}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">Official Designation</span>
                <span className="font-semibold text-slate-800">{employee.designation}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">Employment Status</span>
                <span className="font-semibold text-slate-800">{employee.employmentType}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">Date of Joining</span>
                <span className="font-semibold text-slate-800">{formatDate(employee.dateOfJoining)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Statutory (PF / ESI) */}
        {activeTab === 'statutory' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Statutory Compliance (Provident Fund & ESI)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2">Employees' Provident Fund (EPF)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">PF Status:</span>
                    <span className="font-semibold text-emerald-600">
                      {employee.statutory?.pfApplicable ? 'Enrolled (12% Deduction)' : 'Exempt'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">PF Number:</span>
                    <span className="font-mono font-semibold">{employee.statutory?.pfNumber || 'Pending'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Universal Account No (UAN):</span>
                    <span className="font-mono font-semibold">{employee.statutory?.uanNumber || 'Pending'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2">Employees' State Insurance (ESIC)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ESI Status:</span>
                    <span className="font-semibold text-slate-800">
                      {employee.statutory?.esiApplicable ? 'Eligible (0.75% Deduction)' : 'Not Applicable (Gross > ₹21,000)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ESI Insurance Number:</span>
                    <span className="font-mono font-semibold">{employee.statutory?.esiNumber || 'Pending'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Salary Structure & Hike History */}
        {activeTab === 'salary' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Monthly Compensation Structure
                </h3>
                <p className="text-xs text-slate-500">Breakdown of gross components and historical hikes</p>
              </div>
              {user?.role === 'HR' && (
                <Button size="sm" variant="primary" icon={Edit} onClick={() => setShowSalaryModal(true)}>
                  Revise Salary / Grant Hike
                </Button>
              )}
            </div>

            {/* Current Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                <span className="text-indigo-600 block">Basic Pay</span>
                <span className="text-sm font-bold text-slate-900">{formatINR(employee.salary?.basic)}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">HRA (50%)</span>
                <span className="text-sm font-bold text-slate-900">{formatINR(employee.salary?.hra)}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">Conveyance</span>
                <span className="text-sm font-bold text-slate-900">{formatINR(employee.salary?.conveyance)}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">Special Allowance</span>
                <span className="text-sm font-bold text-slate-900">{formatINR(employee.salary?.specialAllowance)}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <span className="text-emerald-700 block">Total Gross Salary</span>
                <span className="text-base font-bold text-emerald-800">{formatINR(employee.salary?.grossSalary)}</span>
              </div>
            </div>

            {/* Hike History Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Salary Revision & Hike History
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="py-2.5 px-3">Effective Date</th>
                      <th className="py-2.5 px-3">Previous Gross</th>
                      <th className="py-2.5 px-3">New Gross</th>
                      <th className="py-2.5 px-3">Hike %</th>
                      <th className="py-2.5 px-3">Reason</th>
                      <th className="py-2.5 px-3">Approved By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employee.salaryHikes?.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-4 text-center text-slate-400">
                          Initial salary structure active. No revisions logged.
                        </td>
                      </tr>
                    ) : (
                      employee.salaryHikes?.map((h) => (
                        <tr key={h.id}>
                          <td className="py-2 px-3">{formatDate(h.effectiveDate)}</td>
                          <td className="py-2 px-3 text-slate-500">{formatINR(h.previousSalary)}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{formatINR(h.newSalary)}</td>
                          <td className="py-2 px-3 font-bold text-emerald-600">+{h.percentage}%</td>
                          <td className="py-2 px-3 text-slate-600">{h.reason}</td>
                          <td className="py-2 px-3 text-slate-500">{h.approvedBy}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Assigned Assets */}
        {activeTab === 'assets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Corporate Asset Inventory
                </h3>
                <p className="text-xs text-slate-500">Hardware, SIM cards, and accessories allocated to this employee</p>
              </div>
              {['HR', 'BM'].includes(user?.role) && (
                <Button size="sm" variant="primary" icon={Plus} onClick={() => setShowAssetModal(true)}>
                  Allocate New Asset
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {employee.assets?.map((a) => (
                <div key={a.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-sm">{a.assetName}</span>
                    <Badge status={a.status} />
                  </div>
                  <div className="space-y-1 text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Asset Type:</span>
                      <span className="font-medium">{a.assetType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Serial Number:</span>
                      <span className="font-mono font-semibold">{a.serialNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Issue Date:</span>
                      <span>{formatDate(a.issueDate)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 8: Documents */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Employee Documents & Verification
            </h3>
            <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">Digital Document Vault</p>
              <p className="text-slate-400 mt-0.5">Aadhaar Card, PAN Card, and Offer Letters verified during onboarding.</p>
            </div>
          </div>
        )}

        {/* Tab 9: Transfers */}
        {activeTab === 'transfers' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Branch Transfer History
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3">Effective Date</th>
                    <th className="py-2.5 px-3">From Branch</th>
                    <th className="py-2.5 px-3">To Branch</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employee.transfers?.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-4 text-center text-slate-400">
                        Employee remains at originating branch ({employee.branch?.name}).
                      </td>
                    </tr>
                  ) : (
                    employee.transfers?.map((t) => (
                      <tr key={t.id}>
                        <td className="py-2 px-3">{formatDate(t.effectiveDate)}</td>
                        <td className="py-2 px-3">{t.fromBranch?.name}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{t.toBranch?.name}</td>
                        <td className="py-2 px-3 text-slate-600">{t.reason}</td>
                        <td className="py-2 px-3">
                          <Badge status={t.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 10: Lifecycle & Exit */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Lifecycle Events & Exit Records
            </h3>
            {employee.resignations?.length > 0 ? (
              employee.resignations.map((resig) => (
                <div key={resig.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900">Resignation Record Active</span>
                    <Badge status={resig.status} />
                  </div>
                  <p className="text-slate-700">Reason: {resig.reason}</p>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 pt-2 border-t border-amber-100">
                    <div>
                      <span>Resignation Date:</span>{' '}
                      <span className="font-semibold text-slate-800">{formatDate(resig.resignationDate)}</span>
                    </div>
                    <div>
                      <span>Salary Hold Status:</span>{' '}
                      <span className="font-bold text-rose-700">{resig.salaryHoldStatus}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">Employee is active in good standing with no exit proceedings.</p>
            )}
          </div>
        )}

        {/* Tab 11: Attendance & Punches */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Attendance Logs & Punch History
                </h3>
                <p className="text-xs text-slate-500">Live biometric and web clock-in/out records for this employee</p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Present Days</p>
                <p className="text-xl font-bold text-emerald-600 mt-1">
                  {employee.attendances?.filter((a) => a.status === 'PRESENT').length || 24} Days
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Working Hours Logged</p>
                <p className="text-xl font-bold text-slate-900 mt-1">192.5 Hrs</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Avg In-Time</p>
                <p className="text-xl font-bold text-indigo-600 mt-1">09:12 AM</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Attendance Rate</p>
                <p className="text-xl font-bold text-blue-600 mt-1">96.0%</p>
              </div>
            </div>

            {/* Punches Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Clock In</th>
                    <th className="py-2.5 px-3">Clock Out</th>
                    <th className="py-2.5 px-3">Hours Logged</th>
                    <th className="py-2.5 px-3">Shift Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {!employee.attendances || employee.attendances.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-slate-400">
                        No recent punches found. Employee can use the topbar Quick Punch button to record attendance.
                      </td>
                    </tr>
                  ) : (
                    employee.attendances.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-medium">{formatDate(att.date)}</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-700 font-semibold">{att.inTime || '—'}</td>
                        <td className="py-2.5 px-3 font-mono text-amber-700 font-semibold">{att.outTime || '—'}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">
                          {att.totalHours ? `${att.totalHours}h` : '8.5h'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {att.status || 'PRESENT'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 12: Leaves & Balances */}
        {activeTab === 'leaves' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Leave Entitlement Balances & Applications
              </h3>
              <p className="text-xs text-slate-500">Statutory and company leave quotas allotted for the financial year</p>
            </div>

            {/* Balances Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
                  <span>Casual Leave</span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-bold">CL</span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">9</span>
                  <span className="text-xs text-slate-400">/ 12 days</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-blue-600 h-1.5 rounded-full w-3/4"></div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
                  <span>Sick Leave</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-bold">SL</span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">6</span>
                  <span className="text-xs text-slate-400">/ 8 days</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-600 h-1.5 rounded-full w-3/4"></div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
                  <span>Earned Leave</span>
                  <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded font-bold">EL</span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">11</span>
                  <span className="text-xs text-slate-400">/ 15 days</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-purple-600 h-1.5 rounded-full w-2/3"></div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
                  <span>Compensatory Off</span>
                  <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded font-bold">OT</span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">2</span>
                  <span className="text-xs text-slate-400">earned</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-amber-600 h-1.5 rounded-full w-full"></div>
                </div>
              </div>
            </div>

            {/* Leave History Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Leave Type</th>
                    <th className="py-2.5 px-3">Date Range</th>
                    <th className="py-2.5 px-3">Days</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Approval Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Casual Leave (CL)</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">2026-09-28 to 2026-09-29</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">2 Days</td>
                    <td className="py-2.5 px-3 text-slate-600">Family function at native village</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved by Manager
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Sick Leave (SL)</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">2026-08-14 to 2026-08-14</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">1 Day</td>
                    <td className="py-2.5 px-3 text-slate-600">Viral fever & doctor consultation</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved by HR
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Salary Structure Update */}
      <Modal isOpen={showSalaryModal} onClose={() => setShowSalaryModal(false)} title="Update Salary Structure & Hike">
        <form onSubmit={handleSalaryUpdate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Basic Pay (₹) *</label>
              <input
                type="number"
                required
                value={salaryForm.basic}
                onChange={(e) => setSalaryForm({ ...salaryForm, basic: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">HRA (₹) *</label>
              <input
                type="number"
                required
                value={salaryForm.hra}
                onChange={(e) => setSalaryForm({ ...salaryForm, hra: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Conveyance (₹)</label>
              <input
                type="number"
                value={salaryForm.conveyance}
                onChange={(e) => setSalaryForm({ ...salaryForm, conveyance: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Special Allowance (₹)</label>
              <input
                type="number"
                value={salaryForm.specialAllowance}
                onChange={(e) => setSalaryForm({ ...salaryForm, specialAllowance: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason for Revision</label>
            <input
              type="text"
              placeholder="e.g. Annual Appraisal / Promotion"
              value={salaryForm.reason}
              onChange={(e) => setSalaryForm({ ...salaryForm, reason: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button size="sm" variant="outline" onClick={() => setShowSalaryModal(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              Save Revision
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: KYC Update */}
      <Modal isOpen={showKycModal} onClose={() => setShowKycModal(false)} title="Update KYC & Bank Account">
        <form onSubmit={handleKycUpdate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Aadhaar Number</label>
              <input
                type="text"
                value={kycForm.aadhaarNumber}
                onChange={(e) => setKycForm({ ...kycForm, aadhaarNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">PAN Number</label>
              <input
                type="text"
                value={kycForm.panNumber}
                onChange={(e) => setKycForm({ ...kycForm, panNumber: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={kycForm.bankName}
                onChange={(e) => setKycForm({ ...kycForm, bankName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Number</label>
              <input
                type="text"
                value={kycForm.accountNumber}
                onChange={(e) => setKycForm({ ...kycForm, accountNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text"
                value={kycForm.ifscCode}
                onChange={(e) => setKycForm({ ...kycForm, ifscCode: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button size="sm" variant="outline" onClick={() => setShowKycModal(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              Save KYC Details
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Asset Assignment */}
      <Modal isOpen={showAssetModal} onClose={() => setShowAssetModal(false)} title="Allocate Corporate Asset">
        <form onSubmit={handleAssetAssign} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Asset Type *</label>
            <select
              value={assetForm.assetType}
              onChange={(e) => setAssetForm({ ...assetForm, assetType: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value="LAPTOP">Laptop</option>
              <option value="SIM">SIM Card</option>
              <option value="DESKTOP">Desktop Computer</option>
              <option value="MOBILE">Mobile Handset</option>
              <option value="OTHER">Other Peripherals</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Asset Model / Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. MacBook Pro 14 M3 / Airtel 5G SIM"
              value={assetForm.assetName}
              onChange={(e) => setAssetForm({ ...assetForm, assetName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Serial Number / Unique Tag *</label>
            <input
              type="text"
              required
              placeholder="e.g. MBP-2024-9981"
              value={assetForm.serialNumber}
              onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button size="sm" variant="outline" onClick={() => setShowAssetModal(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              Confirm Asset Allocation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Role, Level & Reporting Manager */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title={`Edit Role & Placement: ${employee.firstName} ${employee.lastName}`}
      >
        <form onSubmit={handleRoleUpdate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Employee Level *</label>
            <select
              required
              value={roleForm.levelId}
              onChange={(e) => handleRoleLevelChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            >
              <option value="">Select Level</option>
              {levels.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  Level {lvl.levelNumber} — {lvl.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company Designation *</label>
            <select
              required
              value={roleForm.designationId}
              onChange={(e) => setRoleForm({ ...roleForm, designationId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            >
              <option value="">
                {roleForm.levelId
                  ? roleFilteredDesignations.length > 0
                    ? 'Select Designation'
                    : 'No designations for this level'
                  : 'Select Level First'}
              </option>
              {roleFilteredDesignations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.code ? `(${d.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reporting Manager (Hierarchy)</label>
            <select
              value={roleForm.reportingManagerId}
              onChange={(e) => setRoleForm({ ...roleForm, reportingManagerId: e.target.value || '' })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            >
              <option value="">None (Top Executive / Direct to Board)</option>
              {potentialManagers.map((mgr) => (
                <option key={mgr.id} value={mgr.id}>
                  {mgr.firstName} {mgr.lastName} ({mgr.designation || 'Staff'}) — {mgr.employeeCode}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Used for claim approvals, leave authorizations, and organizational hierarchy.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button size="sm" variant="outline" onClick={() => setShowRoleModal(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" loading={roleSubmitting}>
              Save Role Placement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeDetailPage;
