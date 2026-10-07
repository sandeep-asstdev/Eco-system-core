import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  AlertOctagon,
  Settings,
  Shield,
  Layers,
  MapPin,
  Mail,
  Phone,
  UserPlus,
  Save,
  X,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';

export const TenantsPage = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);

  // New Tenant Form State
  const [formData, setFormData] = useState({
    organizationName: '',
    legalName: '',
    code: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    subscriptionPlan: 'ENTERPRISE',
    initialBranchName: '',
    initialBranchCode: '',
    initialBranchCity: '',
    initialBranchState: '',
    hrEmail: '',
    hrPassword: '',
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Manage Features / Status Form State
  const [managePlan, setManagePlan] = useState('ENTERPRISE');
  const [manageFeatures, setManageFeatures] = useState({});
  const [manageStatus, setManageStatus] = useState('ACTIVE');
  const [savingChanges, setSavingChanges] = useState(false);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/tenants', { params });
      setTenants(res.data.data);
    } catch (err) {
      console.error('Error fetching tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [search, statusFilter]);

  const handleOpenManage = (tenant) => {
    setSelectedTenant(tenant);
    setManagePlan(tenant.subscriptionPlan || 'ENTERPRISE');
    setManageStatus(tenant.status || 'ACTIVE');
    setManageFeatures({
      vacancies: tenant.features?.vacancies ?? true,
      joining: tenant.features?.joining ?? true,
      employees: tenant.features?.employees ?? true,
      payroll: tenant.features?.payroll ?? true,
      advances: tenant.features?.advances ?? true,
      attendance: tenant.features?.attendance ?? true,
      exit: tenant.features?.exit ?? true,
      approvals: tenant.features?.approvals ?? true,
      reports: tenant.features?.reports ?? true,
      audit: tenant.features?.audit ?? true,
    });
    setShowManageModal(true);
  };

  const handleToggleFeature = (key) => {
    setManageFeatures((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveManage = async () => {
    if (!selectedTenant) return;
    setSavingChanges(true);
    try {
      // 1. Update status if changed
      if (manageStatus !== selectedTenant.status) {
        await api.patch(`/tenants/${selectedTenant.id}/status`, {
          status: manageStatus,
        });
      }
      // 2. Update plan and features
      await api.patch(`/tenants/${selectedTenant.id}/plan`, {
        subscriptionPlan: managePlan,
        features: manageFeatures,
      });

      setShowManageModal(false);
      fetchTenants();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update tenant configuration');
    } finally {
      setSavingChanges(false);
    }
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');

    try {
      await api.post('/tenants', {
        organizationName: formData.organizationName,
        legalName: formData.legalName,
        code: formData.code.toUpperCase().trim(),
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        address: formData.address,
        subscriptionPlan: formData.subscriptionPlan,
        initialBranch: {
          name: formData.initialBranchName || `${formData.organizationName} Corporate HQ`,
          code: formData.initialBranchCode || `${formData.code.toUpperCase()}-HQ`,
          city: formData.initialBranchCity || 'Corporate HQ',
          state: formData.initialBranchState || 'State',
          address: formData.address,
        },
        hrAdmin: {
          email: formData.hrEmail || `hr@${formData.code.toLowerCase()}.com`,
          password: formData.hrPassword || 'hr123456',
        },
      });

      setShowCreateModal(false);
      setFormData({
        organizationName: '',
        legalName: '',
        code: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        subscriptionPlan: 'ENTERPRISE',
        initialBranchName: '',
        initialBranchCode: '',
        initialBranchCity: '',
        initialBranchState: '',
        hrEmail: '',
        hrPassword: '',
      });
      fetchTenants();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to onboard dealership organization');
    } finally {
      setCreating(false);
    }
  };

  const FEATURE_LIST = [
    { key: 'vacancies', label: 'Vacancies & Recruitment' },
    { key: 'joining', label: 'Candidate Onboarding & Form 11' },
    { key: 'employees', label: 'Employee Master & Assets' },
    { key: 'payroll', label: 'Salary Calculation & Payroll Engine' },
    { key: 'advances', label: 'Salary Advance Management' },
    { key: 'attendance', label: 'Attendance & Punches' },
    { key: 'exit', label: 'Exit Formalities & F&F Settlement' },
    { key: 'approvals', label: 'Approvals & Workflows' },
    { key: 'reports', label: 'Reports & Export MIS' },
    { key: 'audit', label: 'Security Audit Trail' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Dealership Organizations & Multi-Tenancy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure dealership accounts, subscription tiers, plan feature gates, and account status
          </p>
        </div>
        <a
          href="http://localhost:3000/tenants"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
        >
          <Building2 className="w-4 h-4 text-indigo-400" />
          <span>Onboard in Central Ecosystem</span>
        </a>
      </div>

      {/* Centralized Onboarding Notice */}
      <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-3.5 flex items-start gap-3">
        <Building2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold text-indigo-950">Centralized Dealership Onboarding & Identity</p>
          <p className="text-indigo-700 mt-0.5 leading-relaxed">
            Dealership organizations and holding groups are onboarded strictly via <strong>Ecosystem Core (Central Portal)</strong>. HRFlow consumes canonical tenant context and does not permit independent customer creation.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by organization name, legal entity, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
      </div>

      {/* Dealership Cards / Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          <div className="h-48 bg-slate-200 rounded-xl"></div>
          <div className="h-48 bg-slate-200 rounded-xl"></div>
        </div>
      ) : tenants.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
          No dealership organizations found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {tenants.map((tenant) => (
            <div
              key={tenant.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 hover:shadow-xs transition space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                    {tenant.code?.slice(0, 3) || 'TEN'}
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                      {tenant.organizationName}
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">{tenant.legalName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-semibold">
                        {tenant.code}
                      </span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold border border-indigo-100">
                        {tenant.subscriptionPlan}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      tenant.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {tenant.status}
                  </span>
                </div>
              </div>

              {/* Counts & Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 border-y border-slate-100 text-center text-xs">
                <div className="p-2 bg-slate-50/70 rounded-lg">
                  <div className="font-bold text-slate-900 text-sm">{tenant._count?.branches || 0}</div>
                  <div className="text-[10px] text-slate-400">Branches</div>
                </div>
                <div className="p-2 bg-slate-50/70 rounded-lg">
                  <div className="font-bold text-slate-900 text-sm">{tenant._count?.employees || 0}</div>
                  <div className="text-[10px] text-slate-400">Employees</div>
                </div>
                <div className="p-2 bg-slate-50/70 rounded-lg">
                  <div className="font-bold text-slate-900 text-sm">{tenant._count?.users || 0}</div>
                  <div className="text-[10px] text-slate-400">Logins</div>
                </div>
                <div className="p-2 bg-slate-50/70 rounded-lg">
                  <div className="font-bold text-slate-900 text-sm">
                    {Object.values(tenant.features || {}).filter(Boolean).length} / 10
                  </div>
                  <div className="text-[10px] text-slate-400">Modules Active</div>
                </div>
              </div>

              {/* Contact info & actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
                <div className="space-y-0.5 text-slate-500 text-[11px]">
                  {tenant.contactEmail && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{tenant.contactEmail}</span>
                    </div>
                  )}
                  {tenant.contactPhone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{tenant.contactPhone}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="xs"
                    variant="outline"
                    icon={Settings}
                    onClick={() => handleOpenManage(tenant)}
                  >
                    Configure Plan & Access
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Onboard Dealership Organization */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Onboard New Automobile Dealership Organization"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateTenant} className="space-y-4 text-xs">
          {createError && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-lg border border-rose-200">
              {createError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Dealership Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Honda Auto Group"
                value={formData.organizationName}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Legal Entity Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Automotive Pvt Ltd"
                value={formData.legalName}
                onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Unique Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ROYAL-HONDA"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Subscription Plan
              </label>
              <select
                value={formData.subscriptionPlan}
                onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ENTERPRISE">ENTERPRISE</option>
                <option value="PRO">PRO</option>
                <option value="STARTER">STARTER</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Contact Phone (10 digits)
              </label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="9876543210"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Corporate Registered Address
            </label>
            <input
              type="text"
              placeholder="Full office or showroom hub address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Initial Branch */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
            <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              Initial Branch / Headquarters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Branch Name (e.g. Royal Honda Central HQ)"
                value={formData.initialBranchName}
                onChange={(e) => setFormData({ ...formData, initialBranchName: e.target.value })}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none"
              />
              <input
                type="text"
                placeholder="City (e.g. Ahmedabad)"
                value={formData.initialBranchCity}
                onChange={(e) => setFormData({ ...formData, initialBranchCity: e.target.value })}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none"
              />
            </div>
          </div>

          {/* Initial HR Admin */}
          <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 space-y-2">
            <h3 className="font-bold text-indigo-900 text-[11px] uppercase tracking-wider">
              Dealership HR Admin Credentials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="email"
                placeholder="HR Admin Email (e.g. hr@royalhonda.com)"
                value={formData.hrEmail}
                onChange={(e) => setFormData({ ...formData, hrEmail: e.target.value })}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none"
              />
              <input
                type="password"
                placeholder="Password (default: hr123456)"
                value={formData.hrPassword}
                onChange={(e) => setFormData({ ...formData, hrPassword: e.target.value })}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={creating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Complete Onboarding
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Configure Dealership Plan & Access */}
      {selectedTenant && (
        <Modal
          isOpen={showManageModal}
          onClose={() => setShowManageModal(false)}
          title={`Configure: ${selectedTenant.organizationName}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            {/* Status & Plan Selection */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tenant Status
                </label>
                <select
                  value={manageStatus}
                  onChange={(e) => setManageStatus(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg font-semibold border ${
                    manageStatus === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
                {manageStatus === 'SUSPENDED' && (
                  <p className="text-[10px] text-rose-600 mt-1">
                    Warning: All dealership logins and API access will be blocked immediately!
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Subscription Tier
                </label>
                <select
                  value={managePlan}
                  onChange={(e) => setManagePlan(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="ENTERPRISE">ENTERPRISE</option>
                  <option value="PRO">PRO</option>
                  <option value="STARTER">STARTER</option>
                </select>
              </div>
            </div>

            {/* Feature Modules Toggles */}
            <div>
              <h3 className="font-bold text-slate-900 text-xs mb-2 flex items-center justify-between">
                <span>Enabled Functional Modules</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  Toggle on/off per subscription package
                </span>
              </h3>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
                {FEATURE_LIST.map(({ key, label }) => {
                  const isEnabled = manageFeatures[key] !== false;
                  return (
                    <div
                      key={key}
                      className="px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50/60"
                    >
                      <span className="font-medium text-slate-800">{label}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleFeature(key)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                          isEnabled
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {isEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowManageModal(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                icon={Save}
                loading={savingChanges}
                onClick={handleSaveManage}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TenantsPage;
