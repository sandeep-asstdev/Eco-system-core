import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Settings, Building2, Layers, Clock, Shield, Plus,
  Save, Check, AlertCircle, RefreshCw, ChevronRight, MapPin
} from 'lucide-react';

export default function TenantSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Tenant General & SLA Settings
  const [settings, setSettings] = useState({
    name: '',
    slug: '',
    code: '',
    timezone: 'Asia/Kolkata',
    requestPrefix: 'MAIN',
    graceHours: 12.0,
    targetHoursHigh: 24.0,
    targetHoursMedium: 48.0,
    targetHoursLow: 72.0,
    approvalRequired: true,
    logoUrl: ''
  });

  // Master Data collections
  const [brands, setBrands] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [types, setTypes] = useState([]);

  // Selected branch for area & department mapping
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [branchAreas, setBranchAreas] = useState([]);
  const [branchDepts, setBranchDepts] = useState([]);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaCode, setNewAreaCode] = useState('');

  // Modal / Form states for quick master data adds
  const [newBrand, setNewBrand] = useState({ name: '', code: '' });
  const [newBranch, setNewBranch] = useState({ name: '', code: '', city: '' });
  const [newDept, setNewDept] = useState({ name: '', code: '' });

  const fetchTenantData = async () => {
    setLoading(true);
    try {
      const [tenantRes, brandsRes, branchesRes, deptsRes, typesRes] = await Promise.all([
        api.get('/org/tenant-settings'),
        api.get('/org/brands'),
        api.get('/org/branches'),
        api.get('/org/departments'),
        api.get('/maintenance/types')
      ]);

      if (tenantRes.data.data) {
        setSettings(tenantRes.data.data);
      }
      setBrands(brandsRes.data.data || []);
      const bList = branchesRes.data.data || [];
      setBranches(bList);
      setDepartments(deptsRes.data.data || []);
      setTypes(typesRes.data.data || []);

      if (bList.length > 0 && !selectedBranchId) {
        setSelectedBranchId(bList[0].id);
        fetchBranchDetails(bList[0].id);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load tenant settings.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranchDetails = async (branchId) => {
    if (!branchId) return;
    try {
      const [areasRes, deptsRes] = await Promise.all([
        api.get(`/org/branches/${branchId}/areas`),
        api.get(`/org/branches/${branchId}/departments`)
      ]);
      setBranchAreas(areasRes.data.data || []);
      setBranchDepts(deptsRes.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTenantData();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await api.put('/org/tenant-settings', settings);
      setMessage('Tenant configuration saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update tenant settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddArea = async (e) => {
    e.preventDefault();
    if (!newAreaName || !newAreaCode || !selectedBranchId) return;
    try {
      await api.post(`/org/branches/${selectedBranchId}/areas`, {
        name: newAreaName,
        code: newAreaCode
      });
      setNewAreaName('');
      setNewAreaCode('');
      fetchBranchDetails(selectedBranchId);
      setMessage('Branch area created successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create branch area.');
    }
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!newBrand.name || !newBrand.code) return;
    try {
      await api.post('/org/brands', newBrand);
      setNewBrand({ name: '', code: '' });
      fetchTenantData();
      setMessage('Brand added successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create brand.');
    }
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    if (!newBranch.name || !newBranch.code) return;
    try {
      await api.post('/org/branches', newBranch);
      setNewBranch({ name: '', code: '', city: '' });
      fetchTenantData();
      setMessage('Branch added successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create branch.');
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDept.name || !newDept.code) return;
    try {
      await api.post('/org/departments', newDept);
      setNewDept({ name: '', code: '' });
      fetchTenantData();
      setMessage('Department added successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create department.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Tenant Settings & Governance</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure company branding, SLA thresholds, 12-hour grace rules, branches, and custom area hierarchies
          </p>
        </div>

        <button
          onClick={fetchTenantData}
          className="inline-flex items-center gap-1.5 p-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reload</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-semibold">
        {[
          { id: 'general', label: 'General & Branding' },
          { id: 'sla', label: 'SLA & 12h Grace Rules' },
          { id: 'brands', label: `Brands (${brands.length})` },
          { id: 'branches', label: `Branches & Areas (${branches.length})` },
          { id: 'departments', label: `Departments (${departments.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: GENERAL & BRANDING */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 max-w-2xl">
          <h2 className="text-sm font-bold text-slate-800">Organization Identity & Workflow Configuration</h2>
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Tenant Name</label>
            <input
              type="text"
              required
              value={settings.name || ''}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tenant Code</label>
              <input
                type="text"
                disabled
                value={settings.code || ''}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Timezone</label>
              <input
                type="text"
                value={settings.timezone || 'Asia/Kolkata'}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Request ID Prefix (e.g. BELL-MAIN, MAIN)</label>
            <input
              type="text"
              required
              value={settings.requestPrefix || 'MAIN'}
              onChange={(e) => setSettings({ ...settings, requestPrefix: e.target.value.toUpperCase() })}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg font-mono font-bold"
            />
            <span className="text-[10px] text-slate-400">Generated IDs will format as: {settings.requestPrefix || 'MAIN'}-2026-000001</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Logo URL (Optional)</label>
            <input
              type="text"
              placeholder="https://company.com/logo.png"
              value={settings.logoUrl || ''}
              onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.approvalRequired}
                onChange={(e) => setSettings({ ...settings, approvalRequired: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-semibold text-slate-800">Require Manager Approval Before Work Assignment</span>
            </label>
            <span className="block text-[11px] text-slate-400 ml-6">
              When checked, new requests enter WAITING_FOR_APPROVAL. When unchecked, requests go directly to ASSIGNED.
            </span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </form>
      )}

      {/* TAB 2: SLA & 12-HOUR GRACE RULES */}
      {activeTab === 'sla' && (
        <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5 max-w-2xl">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Target Resolution Deadlines & Grace Thresholds</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Define the target resolution hours per priority and the allowable grace window before tasks breach SLA.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-lg">
              <label className="block text-xs font-bold text-rose-800 mb-1">High Priority Target (Hours)</label>
              <input
                type="number"
                min="1"
                required
                value={settings.targetHoursHigh || 24}
                onChange={(e) => setSettings({ ...settings, targetHoursHigh: parseFloat(e.target.value) })}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
              />
            </div>

            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
              <label className="block text-xs font-bold text-amber-800 mb-1">Medium Priority Target (Hours)</label>
              <input
                type="number"
                min="1"
                required
                value={settings.targetHoursMedium || 48}
                onChange={(e) => setSettings({ ...settings, targetHoursMedium: parseFloat(e.target.value) })}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
              />
            </div>

            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg">
              <label className="block text-xs font-bold text-emerald-800 mb-1">Low Priority Target (Hours)</label>
              <input
                type="number"
                min="1"
                required
                value={settings.targetHoursLow || 72}
                onChange={(e) => setSettings({ ...settings, targetHoursLow: parseFloat(e.target.value) })}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
              />
            </div>
          </div>

          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-indigo-900">Allowed Grace Period (Hours) — Default 12 Hours</label>
            <input
              type="number"
              min="0"
              required
              value={settings.graceHours !== undefined ? settings.graceHours : 12}
              onChange={(e) => setSettings({ ...settings, graceHours: parseFloat(e.target.value) })}
              className="w-full max-w-xs text-xs p-2 border border-slate-200 rounded-lg bg-white font-bold"
            />
            <p className="text-[11px] text-indigo-700">
              Tasks finished between Target and Target + Grace are classified as <strong>WITHIN GRACE</strong>. Only tasks exceeding Target + Grace are classified as <strong>OVERDUE</strong>.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save SLA Rules'}</span>
          </button>
        </form>
      )}

      {/* TAB 3: BRANDS */}
      {activeTab === 'brands' && (
        <div className="space-y-4">
          <form onSubmit={handleAddBrand} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <input
              type="text"
              required
              placeholder="Brand Name (e.g. Hero Moto Corp)"
              value={newBrand.name}
              onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
              className="text-xs p-2 border border-slate-200 rounded-lg flex-1"
            />
            <input
              type="text"
              required
              placeholder="Code (e.g. HERO)"
              value={newBrand.code}
              onChange={(e) => setNewBrand({ ...newBrand, code: e.target.value.toUpperCase() })}
              className="text-xs p-2 border border-slate-200 rounded-lg w-32"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Brand</span>
            </button>
          </form>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-4">Brand Name</th>
                  <th className="py-2.5 px-4">Code</th>
                  <th className="py-2.5 px-4">Associated Branches</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {brands.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{b.name}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">{b.code}</td>
                    <td className="py-2.5 px-4 text-slate-500">{b._count?.branches || 0} branches</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: BRANCHES & BRANCH AREAS */}
      {activeTab === 'branches' && (
        <div className="space-y-4">
          <form onSubmit={handleAddBranch} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <input
              type="text"
              required
              placeholder="Branch Name (e.g. Ather Hubli)"
              value={newBranch.name}
              onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
              className="text-xs p-2 border border-slate-200 rounded-lg flex-1"
            />
            <input
              type="text"
              required
              placeholder="Code (e.g. ATH-HBL)"
              value={newBranch.code}
              onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value.toUpperCase() })}
              className="text-xs p-2 border border-slate-200 rounded-lg w-32"
            />
            <input
              type="text"
              placeholder="City (e.g. Hubli)"
              value={newBranch.city}
              onChange={(e) => setNewBranch({ ...newBranch, city: e.target.value })}
              className="text-xs p-2 border border-slate-200 rounded-lg w-32"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Branch</span>
            </button>
          </form>

          {/* Branch Areas Manager */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Configurable Branch Areas</h3>
                <p className="text-[11px] text-slate-400">Select branch to manage specific facility areas (Section 13)</p>
              </div>

              <select
                value={selectedBranchId}
                onChange={(e) => {
                  setSelectedBranchId(e.target.value);
                  fetchBranchDetails(e.target.value);
                }}
                className="text-xs p-2 border border-slate-200 rounded-lg bg-white"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>

            <form onSubmit={handleAddArea} className="flex items-center gap-2">
              <input
                type="text"
                required
                placeholder="New Area Name (e.g. Mechanical Bay 2)"
                value={newAreaName}
                onChange={(e) => setNewAreaName(e.target.value)}
                className="text-xs p-2 border border-slate-200 rounded-lg flex-1"
              />
              <input
                type="text"
                required
                placeholder="Area Code (e.g. BAY-2)"
                value={newAreaCode}
                onChange={(e) => setNewAreaCode(e.target.value.toUpperCase())}
                className="text-xs p-2 border border-slate-200 rounded-lg w-28"
              />
              <button
                type="submit"
                className="px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Add Area
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-2">
              {branchAreas.length === 0 ? (
                <span className="text-xs text-slate-400">No specific areas configured for this branch yet. Free-form text will be accepted.</span>
              ) : (
                branchAreas.map(a => (
                  <span key={a.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium">
                    <MapPin className="w-3 h-3 text-indigo-500" />
                    <span>{a.name} ({a.code})</span>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          <form onSubmit={handleAddDepartment} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <input
              type="text"
              required
              placeholder="Department Name (e.g. Bodyshop)"
              value={newDept.name}
              onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
              className="text-xs p-2 border border-slate-200 rounded-lg flex-1"
            />
            <input
              type="text"
              required
              placeholder="Code (e.g. BSH)"
              value={newDept.code}
              onChange={(e) => setNewDept({ ...newDept, code: e.target.value.toUpperCase() })}
              className="text-xs p-2 border border-slate-200 rounded-lg w-32"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          </form>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-4">Department Name</th>
                  <th className="py-2.5 px-4">Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{d.name}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">{d.code}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
