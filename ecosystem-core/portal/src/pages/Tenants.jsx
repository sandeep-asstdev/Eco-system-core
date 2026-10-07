import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Building2, Plus, Shield, CheckCircle, XCircle, Search, RefreshCw, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import Modal from '../components/common/Modal.jsx';
import UnauthorizedScreen from '../components/common/UnauthorizedScreen.jsx';
import Toast from '../components/common/Toast.jsx';

export default function Tenants({ onNavigate }) {
  const { isPlatformAdmin, hasPermission, switchTenant, tenant: currentTenant } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createdTenant, setCreatedTenant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    legalName: '',
    code: '',
    plan: 'ENTERPRISE',
    contactEmail: '',
    contactPhone: '',
    address: ''
  });
  const [error, setError] = useState(null);
  const [toastData, setToastData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEnterDashboard = (targetTenant) => {
    switchTenant(targetTenant);
    if (onNavigate) {
      onNavigate('/');
    } else {
      window.location.href = '/';
    }
  };

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/tenants');
      if (res.success && res.data) {
        setTenants(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);

    const nameTrimmed = formData.name.trim();
    const legalNameTrimmed = formData.legalName.trim();
    const codeTrimmed = formData.code.trim().toUpperCase();

    if (!nameTrimmed || !legalNameTrimmed || !codeTrimmed) {
      setError('Dealership Group Name, Legal Entity Name, and Tenant Code are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: nameTrimmed,
        legalName: legalNameTrimmed,
        code: codeTrimmed,
        subscriptionTier: formData.plan,
        primaryEmail: formData.contactEmail?.trim() || null,
        primaryPhone: formData.contactPhone?.trim() || null
      };

      const res = await api.post('/tenants', payload);
      if (res.success) {
        setIsModalOpen(false);
        setCreatedTenant(res.data);
        setToastData({
          title: 'Tenant Onboarded',
          message: `${res.data.name} (${res.data.code}) onboarded successfully.`,
          type: 'success'
        });
        setFormData({
          name: '',
          legalName: '',
          code: '',
          plan: 'ENTERPRISE',
          contactEmail: '',
          contactPhone: '',
          address: ''
        });
        await fetchTenants();
      }
    } catch (err) {
      setError(err.message);
      setToastData({
        title: 'Onboarding Failed',
        message: err.message,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.put(`/tenants/${id}/status`, { status: nextStatus });
      setToastData({
        title: nextStatus === 'SUSPENDED' ? 'Dealership Suspended' : 'Dealership Activated',
        message: `Dealership status updated to ${nextStatus}. Access ${nextStatus === 'SUSPENDED' ? 'revoked' : 'restored'}.`,
        type: nextStatus === 'SUSPENDED' ? 'suspended' : 'success'
      });
      await fetchTenants();
    } catch (err) {
      setToastData({
        title: 'Status Update Failed',
        message: err.message,
        type: 'error'
      });
    }
  };

  if (!isPlatformAdmin && !hasPermission('org.tenant.manage')) {
    return <UnauthorizedScreen requiredPermission="org.tenant.manage" title="Dealership Groups Restricted" />;
  }

  const filtered = tenants.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      {toastData && (
        <Toast
          title={toastData.title}
          message={toastData.message}
          type={toastData.type}
          onClose={() => setToastData(null)}
          duration={5000}
        />
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dealership Groups (Tenants)</h1>
          <p className="text-xs text-slate-500">Manage multi-dealer SaaS groups, subscriptions, and tenant isolation</p>
        </div>

        {isPlatformAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Dealership Group</span>
          </button>
        )}
      </div>

      {/* Search & Stats Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search dealership groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={fetchTenants}
          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Onboarding Success Banner */}
      {createdTenant && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-xs animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              ✓
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{createdTenant.name} Successfully Onboarded!</p>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Holding group context and 3S operational capabilities are active. Ready to manage corporate firms and dealership branches.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleEnterDashboard(createdTenant)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              <span>Enter {createdTenant.name} Dashboard Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCreatedTenant(null)}
              className="px-3 py-2 text-slate-500 hover:text-slate-700 text-xs font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Tenants Table */}
      {isLoading ? (
        <LoadingSpinner text="Fetching registered dealership tenants..." />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Dealership Group</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Subscription Plan</th>
                <th className="py-3 px-4">Operating Firms</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t) => {
                const isActiveTenant = currentTenant?.id === t.id;
                return (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {t.name[0]}
                        </div>
                        <div>
                          <div>{t.name}</div>
                          {t.legalName && t.legalName !== t.name && (
                            <div className="text-[11px] font-normal text-slate-400">{t.legalName}</div>
                          )}
                          {isActiveTenant && (
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                              Current Context
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-600">{t.code}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {t.subscriptionTier || t.plan || 'ENTERPRISE'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {t.firms?.length || 0} firms
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${t.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                        {t.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEnterDashboard(t)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
                          title={`Enter ${t.name} Dashboard`}
                        >
                          <span>Enter Dashboard</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        {isPlatformAdmin && (
                          <button
                            onClick={() => switchTenant(t)}
                            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                          >
                            Switch Context
                          </button>
                        )}
                        {isPlatformAdmin && (
                          <button
                            onClick={() => toggleStatus(t.id, t.status)}
                            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition ${t.status === 'ACTIVE'
                                ? 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                              }`}
                          >
                            {t.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Onboard Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Onboard New Dealership Group (Tenant)"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Dealership Group Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter Group name"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Legal Entity Name *</label>
            <input
              type="text"
              required
              value={formData.legalName}
              onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
              placeholder="Enter Legal Name"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Registered legal name of the dealership company/entity.</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tenant Code (Unique slug) *</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="Enter Code"
              className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                required
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="Enter Email"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone (10 digits)</label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="Enter Phone Number"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Plan Tier</label>
            <select
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="STARTER">STARTER</option>
              <option value="PROFESSIONAL">PROFESSIONAL</option>
              <option value="ENTERPRISE">ENTERPRISE (Full Dealership Suite)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Onboarding...' : 'Complete Onboarding'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
