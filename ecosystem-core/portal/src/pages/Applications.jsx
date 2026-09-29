import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Boxes,
  Plus,
  Upload,
  Globe,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Settings,
  Trash2,
  Power,
  Eye,
  Radio,
  Sparkles,
  Filter,
  Search,
  ChevronRight,
  X,
  ArrowRight,
  Zap,
  Check,
  Lock,
  Building2,
  Layers,
  Activity,
  AppWindow,
  FileCode,
  Users,
  Wrench
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import Modal from '../components/common/Modal.jsx';

const CATEGORIES = ['ALL', 'HR', 'OPERATIONS', 'INVENTORY', 'SALES', 'CRM', 'FINANCE', 'DEMO'];

export default function Applications() {
  const { tenant, isPlatformAdmin, hasPermission } = useAuth();
  const [applications, setApplications] = useState([]);
  const [tenantsList, setTenantsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Health check statuses: { [appKey]: { isHealthy, latencyMs, loading } }
  const [healthStatuses, setHealthStatuses] = useState({});

  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerStep, setRegisterStep] = useState(1); // 1: Input, 2: Review & Approve
  const [registerTab, setRegisterTab] = useState('url'); // 'url', 'json', 'manual'
  const [manifestUrl, setManifestUrl] = useState('');
  const [rawJsonInput, setRawJsonInput] = useState('');
  const [manualForm, setManualForm] = useState({
    appKey: '',
    name: '',
    description: '',
    version: '1.0.0',
    category: 'INVENTORY',
    frontendUrl: '',
    apiUrl: '',
    healthUrl: '',
    permissions: '',
    publishes: '',
    subscribes: ''
  });
  const [validatedManifest, setValidatedManifest] = useState(null);
  const [isFetchingManifest, setIsFetchingManifest] = useState(false);
  const [registerError, setRegisterError] = useState(null);
  const [selectedTenantsForRegistration, setSelectedTenantsForRegistration] = useState([]);
  const [isSubmittingRegistration, setIsSubmittingRegistration] = useState(false);

  // Manage Application Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [activeManageTab, setActiveManageTab] = useState('overview'); // 'overview', 'tenants', 'permissions', 'events'
  const [appTenants, setAppTenants] = useState([]);
  const [appEventsData, setAppEventsData] = useState(null);
  const [loadingManageDetails, setLoadingManageDetails] = useState(false);
  const [newSubscribes, setNewSubscribes] = useState([]);
  const [actionSuccessMessage, setActionSuccessMessage] = useState(null);

  // Load applications & tenants
  const loadApps = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/applications');
      setApplications(res.data || []);

      if (isPlatformAdmin) {
        const tRes = await api.get('/tenants');
        setTenantsList(tRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, [tenant]);

  // Ping health for an app
  const pingHealth = async (appId, appKey) => {
    setHealthStatuses(prev => ({
      ...prev,
      [appKey]: { ...(prev[appKey] || {}), loading: true }
    }));
    try {
      const res = await api.get(`/applications/${appId}/health`);
      setHealthStatuses(prev => ({
        ...prev,
        [appKey]: {
          isHealthy: res.data?.isHealthy,
          latencyMs: res.data?.latencyMs,
          statusCode: res.data?.statusCode,
          loading: false
        }
      }));
    } catch (err) {
      setHealthStatuses(prev => ({
        ...prev,
        [appKey]: { isHealthy: false, error: err.message, loading: false }
      }));
    }
  };

  // Fetch Manifest from URL (with SSRF protection backend)
  const handleFetchManifest = async () => {
    if (!manifestUrl.trim()) {
      setRegisterError('Please provide a valid Manifest URL.');
      return;
    }
    setIsFetchingManifest(true);
    setRegisterError(null);
    try {
      const res = await api.post('/applications/manifest/fetch', { url: manifestUrl.trim() });
      if (res.success && res.data?.manifest) {
        setValidatedManifest(res.data.manifest);
        // Pre-select all active tenants by default for seamless setup
        setSelectedTenantsForRegistration(tenantsList.map(t => t.id));
        setRegisterStep(2);
      } else {
        const errorMsg = (Array.isArray(res.error?.details) ? res.error.details.join(' ') : null) || res.error?.message || 'Failed to fetch manifest.';
        setRegisterError(errorMsg);
      }
    } catch (err) {
      const errorMsg = (Array.isArray(err.details?.details) ? err.details.details.join(' ') : null) || err.message || 'Manifest fetch failed. Verify network connectivity.';
      setRegisterError(errorMsg);
    } finally {
      setIsFetchingManifest(false);
    }
  };

  // Validate JSON input
  const handleValidateJson = async () => {
    if (!rawJsonInput.trim()) {
      setRegisterError('Please paste a valid JSON manifest.');
      return;
    }
    setRegisterError(null);
    try {
      let parsed;
      try {
        parsed = JSON.parse(rawJsonInput);
      } catch (e) {
        setRegisterError(`Invalid JSON syntax: ${e.message}`);
        return;
      }

      const res = await api.post('/applications/manifest/validate', { manifest: parsed });
      if (res.success && res.data?.manifest) {
        setValidatedManifest(res.data.manifest);
        setSelectedTenantsForRegistration(tenantsList.map(t => t.id));
        setRegisterStep(2);
      } else {
        const errorMsg = (Array.isArray(res.error?.details) ? res.error.details.join(' ') : null) || res.error?.message || 'Manifest validation failed.';
        setRegisterError(errorMsg);
      }
    } catch (err) {
      const errorMsg = (Array.isArray(err.details?.details) ? err.details.details.join(' ') : null) || err.message || 'Validation request failed.';
      setRegisterError(errorMsg);
    }
  };

  // Convert manual form to manifest and proceed
  const handleValidateManual = async () => {
    setRegisterError(null);
    const parsedPermissions = manualForm.permissions
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);

    const parsedPublishes = manualForm.publishes
      .split(',')
      .map(e => e.trim())
      .filter(Boolean);

    const parsedSubscribes = manualForm.subscribes
      .split(',')
      .map(e => e.trim())
      .filter(Boolean);

    const manifestObj = {
      manifestVersion: '1.0',
      appKey: manualForm.appKey.toLowerCase().trim(),
      name: manualForm.name.trim(),
      description: manualForm.description.trim() || undefined,
      version: manualForm.version.trim() || '1.0.0',
      category: manualForm.category,
      frontendUrl: manualForm.frontendUrl.trim(),
      apiUrl: manualForm.apiUrl.trim(),
      healthUrl: manualForm.healthUrl.trim() || undefined,
      permissions: parsedPermissions,
      publishes: parsedPublishes,
      subscribes: parsedSubscribes
    };

    try {
      const res = await api.post('/applications/manifest/validate', { manifest: manifestObj });
      if (res.success && res.data?.manifest) {
        setValidatedManifest(res.data.manifest);
        setSelectedTenantsForRegistration(tenantsList.map(t => t.id));
        setRegisterStep(2);
      } else {
        const details = res.error?.details ? res.error.details.join(', ') : res.error?.message;
        setRegisterError(details || 'Validation failed. Check required fields.');
      }
    } catch (err) {
      setRegisterError(err.message || 'Validation failed.');
    }
  };

  // Submit approved registration
  const handleFinalRegistration = async () => {
    if (!validatedManifest) return;
    setIsSubmittingRegistration(true);
    setRegisterError(null);
    try {
      const res = await api.post('/applications', {
        manifest: validatedManifest,
        tenantIds: selectedTenantsForRegistration
      });

      if (res.success) {
        setIsRegisterModalOpen(false);
        setRegisterStep(1);
        setValidatedManifest(null);
        setManifestUrl('');
        setRawJsonInput('');
        await loadApps();
      } else {
        setRegisterError(res.error?.message || 'Application registration failed.');
      }
    } catch (err) {
      setRegisterError(err.message || 'Registration failed.');
    } finally {
      setIsSubmittingRegistration(false);
    }
  };

  // Open Manage Modal
  const openManageModal = async (app) => {
    setSelectedApp(app);
    setActiveManageTab('overview');
    setActionSuccessMessage(null);
    setLoadingManageDetails(true);
    try {
      const [tRes, evRes] = await Promise.all([
        api.get(`/applications/${app.id}/tenants`),
        api.get(`/applications/${app.id}/events`)
      ]);
      setAppTenants(tRes.data?.tenants || []);
      setAppEventsData(evRes.data || null);
      setNewSubscribes(evRes.data?.subscribes || []);
    } catch (err) {
      console.error('Error fetching app management details:', err);
    } finally {
      setLoadingManageDetails(false);
    }
  };

  // Toggle tenant subscription
  const toggleTenant = async (tenantId, currentStatus) => {
    if (!selectedApp) return;
    const enable = currentStatus !== 'ACTIVE';
    try {
      const res = await api.post(`/applications/${selectedApp.id}/tenants/${tenantId}/toggle`, { enable });
      if (res.success) {
        setAppTenants(prev =>
          prev.map(t => (t.tenantId === tenantId ? { ...t, isSubscribed: enable, subscriptionStatus: enable ? 'ACTIVE' : 'SUSPENDED' } : t))
        );
        setActionSuccessMessage(`Updated subscription for tenant.`);
      }
    } catch (err) {
      alert(`Failed to update subscription: ${err.message}`);
    }
  };

  // Save updated event subscriptions
  const handleSaveSubscriptions = async () => {
    if (!selectedApp) return;
    try {
      const res = await api.post(`/applications/${selectedApp.id}/events/subscriptions`, {
        subscribes: newSubscribes
      });
      if (res.success) {
        setActionSuccessMessage(`Successfully updated event subscriptions and active broker bindings.`);
        await loadApps();
      }
    } catch (err) {
      alert(`Failed to save subscriptions: ${err.message}`);
    }
  };

  // Suspend / Activate Application
  const toggleAppLifecycle = async (appId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await api.patch(`/applications/${appId}`, { status: nextStatus });
      if (res.success) {
        if (selectedApp) setSelectedApp(prev => ({ ...prev, status: nextStatus }));
        await loadApps();
      }
    } catch (err) {
      alert(`Lifecycle action failed: ${err.message}`);
    }
  };

  // Delete Application
  const handleDeleteApp = async (appId, appName) => {
    if (!window.confirm(`Are you sure you want to completely uninstall and unregister '${appName}'? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await api.delete(`/applications/${appId}`);
      if (res.success) {
        setSelectedApp(null);
        await loadApps();
      } else {
        alert(res.error?.message || 'Failed to delete application.');
      }
    } catch (err) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  // Filtering
  const filteredApps = applications.filter(app => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.appKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.description && app.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || app.category === selectedCategory;
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? app.status === 'ACTIVE' : app.status !== 'ACTIVE');

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Application Registry &amp; Integration Platform</h1>
              <p className="text-xs text-slate-500">
                Self-serve manifest registration, scoped RBAC permissions, and dynamic event subscription catalog
              </p>
            </div>
          </div>
        </div>

        {isPlatformAdmin && (
          <button
            onClick={() => {
              setIsRegisterModalOpen(true);
              setRegisterStep(1);
              setRegisterError(null);
              setValidatedManifest(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Application</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search applications by name or key..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                  selectedCategory === cat
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg outline-none text-slate-700 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="SUSPENDED">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Application Cards Grid */}
      {isLoading ? (
        <LoadingSpinner text="Loading Application Registry..." />
      ) : filteredApps.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Boxes className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No applications matched criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try modifying your search or filter options.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map(app => {
            const isSuspended = app.status === 'SUSPENDED';
            const health = healthStatuses[app.appKey];
            const tenantSubCount = app.tenantSubscriptions ? app.tenantSubscriptions.filter(s => s.status === 'ACTIVE').length : 0;

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
                        {app.code?.substring(0, 2) || app.appKey.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h2 className="text-sm font-bold text-slate-900 leading-tight">{app.name}</h2>
                          <span className="text-[10px] font-mono text-slate-400">v{app.version}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {app.appKey}
                          </span>
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                            {app.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isSuspended
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {app.description || 'Enterprise automobile ecosystem extension application.'}
                  </p>

                  {/* Endpoints & Health */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600 mb-4 font-mono text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Web:</span>
                      <span className="text-blue-600 truncate max-w-[200px]">{app.baseUrl}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">API:</span>
                      <span className="text-slate-700 truncate max-w-[200px]">{app.apiUrl}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-400">Health:</span>
                      <div className="flex items-center gap-1.5">
                        {health?.loading ? (
                          <span className="text-slate-400 text-[10px] flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 animate-spin" /> Ping...
                          </span>
                        ) : health?.isHealthy ? (
                          <span className="text-emerald-700 font-semibold text-[10px] flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Online ({health.latencyMs}ms)
                          </span>
                        ) : health?.isHealthy === false ? (
                          <span className="text-rose-600 font-semibold text-[10px] flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            Offline
                          </span>
                        ) : (
                          <button
                            onClick={() => pingHealth(app.id, app.appKey)}
                            className="text-slate-500 hover:text-blue-600 text-[10px] underline cursor-pointer"
                          >
                            Check Health
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Subscriptions badge & event tags */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-4">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{tenantSubCount} Dealership(s) Subscribed</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Radio className="w-3.5 h-3.5 text-blue-500" />
                      <span>{(app.supportedEvents || []).length} Pub / {(app.subscribes || []).length} Sub</span>
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {isPlatformAdmin ? (
                    <button
                      type="button"
                      onClick={() => openManageModal(app)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Configure</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <a
                    href={app.baseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition shadow-sm"
                  >
                    <span>Launch</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. REGISTER APPLICATION MODAL WIZARD                     */}
      {/* ========================================================= */}
      {isRegisterModalOpen && (
        <Modal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          title={registerStep === 1 ? 'Register New Application' : 'Review & Approve Application Manifest'}
        >
          {registerStep === 1 ? (
            <div className="space-y-5">
              {/* Method Tabs */}
              <div className="flex items-center border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => { setRegisterTab('url'); setRegisterError(null); }}
                  className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
                    registerTab === 'url'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Manifest URL (Live Discovery)</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setRegisterTab('json'); setRegisterError(null); }}
                  className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
                    registerTab === 'json'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Paste JSON Manifest</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setRegisterTab('manual'); setRegisterError(null); }}
                  className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
                    registerTab === 'manual'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Manual Form</span>
                </button>
              </div>

              {registerError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Registration Error:</span>
                    <p className="mt-0.5">{registerError}</p>
                  </div>
                </div>
              )}

              {/* Tab 1: Manifest URL */}
              {registerTab === 'url' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">SSO &amp; Metadata Isolation Active:</span>
                      <p className="mt-0.5 text-blue-700">
                        The Core API will safely fetch and validate the application manifest over HTTP/HTTPS, protecting against SSRF and arbitrary execution.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Application Manifest Endpoint URL
                    </label>
                    <input
                      type="url"
                      placeholder="e.g. http://localhost:5005/manifest.json or https://myapp.dealership.com/manifest.json"
                      value={manifestUrl}
                      onChange={e => setManifestUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white font-mono"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      disabled={isFetchingManifest}
                      onClick={handleFetchManifest}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
                    >
                      {isFetchingManifest ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Fetching &amp; Validating...</span>
                        </>
                      ) : (
                        <>
                          <span>Fetch &amp; Review Manifest</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Paste JSON */}
              {registerTab === 'json' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Paste the raw JSON content of your standardized application manifest specification.
                  </p>
                  <div>
                    <textarea
                      rows={10}
                      value={rawJsonInput}
                      onChange={e => setRawJsonInput(e.target.value)}
                      placeholder={`{\n  "manifestVersion": "1.0",\n  "appKey": "inventory",\n  "name": "Vehicle & Parts Inventory",\n  "version": "1.0.0",\n  "category": "INVENTORY",\n  "frontendUrl": "http://localhost:3003",\n  "apiUrl": "http://localhost:5003",\n  "permissions": ["inventory.stock.read"],\n  "publishes": ["inventory.stock.updated.v1"],\n  "subscribes": ["employee.created.v1"]\n}`}
                      className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleValidateJson}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
                    >
                      <span>Validate &amp; Review Manifest</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Manual Form */}
              {registerTab === 'manual' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Application Key (Unique)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. inventory"
                        value={manualForm.appKey}
                        onChange={e => setManualForm({ ...manualForm, appKey: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Vehicle Inventory"
                        value={manualForm.name}
                        onChange={e => setManualForm({ ...manualForm, name: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Category</label>
                      <select
                        value={manualForm.category}
                        onChange={e => setManualForm({ ...manualForm, category: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none"
                      >
                        {CATEGORIES.filter(c => c !== 'ALL').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Version</label>
                      <input
                        type="text"
                        value={manualForm.version}
                        onChange={e => setManualForm({ ...manualForm, version: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Frontend Web URL</label>
                      <input
                        type="url"
                        placeholder="http://localhost:3003"
                        value={manualForm.frontendUrl}
                        onChange={e => setManualForm({ ...manualForm, frontendUrl: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Backend API URL</label>
                      <input
                        type="url"
                        placeholder="http://localhost:5003"
                        value={manualForm.apiUrl}
                        onChange={e => setManualForm({ ...manualForm, apiUrl: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Declared Permissions (Comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="inventory.stock.read, inventory.order.create"
                      value={manualForm.permissions}
                      onChange={e => setManualForm({ ...manualForm, permissions: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono text-[11px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Publishes Events (Comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="inventory.stock.updated.v1"
                        value={manualForm.publishes}
                        onChange={e => setManualForm({ ...manualForm, publishes: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Subscribes To (Comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="employee.created.v1, employee.deactivated.v1"
                        value={manualForm.subscribes}
                        onChange={e => setManualForm({ ...manualForm, subscribes: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleValidateManual}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
                    >
                      <span>Validate &amp; Review</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* STEP 2: REVIEW & APPROVE MANIFEST */
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                      {validatedManifest.appKey.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{validatedManifest.name}</div>
                      <div className="text-[10px] font-mono text-slate-500">key: {validatedManifest.appKey}</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold text-[10px]">
                    v{validatedManifest.version} &bull; {validatedManifest.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-400">Web URL: </span>
                    <span className="text-blue-600">{validatedManifest.frontendUrl}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">API URL: </span>
                    <span className="text-slate-700">{validatedManifest.apiUrl}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Auth: </span>
                    <span className="text-slate-700">{validatedManifest.auth?.type || 'OIDC'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Callback: </span>
                    <span className="text-slate-700">{validatedManifest.auth?.redirectUris?.[0]}</span>
                  </div>
                </div>
              </div>

              {/* Security Review: Requested Permissions */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Requested Scoped Permissions ({(validatedManifest.permissions || []).length})</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                    Auto-provision on approval
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(validatedManifest.permissions || []).map((perm, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono rounded">
                      {perm}
                    </span>
                  ))}
                  {(validatedManifest.permissions || []).length === 0 && (
                    <span className="text-slate-400 text-xs italic">No specific permissions requested.</span>
                  )}
                </div>
              </div>

              {/* Event Integration Review */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-slate-200 rounded-xl p-3 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Radio className="w-3 h-3 text-emerald-600" />
                    <span>Publishes ({(validatedManifest.publishes || []).length})</span>
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(validatedManifest.publishes || []).map((ev, i) => (
                      <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded">
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-3 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-blue-600" />
                    <span>Subscribes ({(validatedManifest.subscribes || []).length})</span>
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(validatedManifest.subscribes || []).map((ev, i) => (
                      <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dealership Entitlement Selection */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Enable For Dealership Groups</span>
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {tenantsList.map(t => {
                    const checked = selectedTenantsForRegistration.includes(t.id);
                    return (
                      <label key={t.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedTenantsForRegistration([...selectedTenantsForRegistration, t.id]);
                            } else {
                              setSelectedTenantsForRegistration(selectedTenantsForRegistration.filter(id => id !== t.id));
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-semibold">{t.name}</span>
                        <span className="text-slate-400 font-mono text-[10px]">({t.code})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRegisterStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  &larr; Back
                </button>

                <button
                  type="button"
                  disabled={isSubmittingRegistration}
                  onClick={handleFinalRegistration}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {isSubmittingRegistration ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Provisioning Application &amp; Broker...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve &amp; Activate Application</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* ========================================================= */}
      {/* 2. MANAGE APPLICATION MODAL                              */}
      {/* ========================================================= */}
      {selectedApp && (
        <Modal
          isOpen={Boolean(selectedApp)}
          onClose={() => setSelectedApp(null)}
          title={`Configure: ${selectedApp.name}`}
        >
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex items-center border-b border-slate-200">
              {['overview', 'tenants', 'permissions', 'events'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => { setActiveManageTab(tab); setActionSuccessMessage(null); }}
                  className={`pb-2 px-3 text-xs font-semibold capitalize border-b-2 transition ${
                    activeManageTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab === 'tenants' ? 'Dealerships' : tab}
                </button>
              ))}
            </div>

            {actionSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionSuccessMessage}</span>
              </div>
            )}

            {/* TAB: OVERVIEW */}
            {activeManageTab === 'overview' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Application Key:</span>
                    <span className="font-mono font-semibold text-slate-800">{selectedApp.appKey}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span className="font-semibold text-slate-800">{selectedApp.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Version:</span>
                    <span className="font-mono text-slate-800">v{selectedApp.version}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Frontend URL:</span>
                    <span className="font-mono text-blue-600">{selectedApp.baseUrl}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">API URL:</span>
                    <span className="font-mono text-slate-700">{selectedApp.apiUrl}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => toggleAppLifecycle(selectedApp.id, selectedApp.status)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border transition ${
                      selectedApp.status === 'ACTIVE'
                        ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100'
                        : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{selectedApp.status === 'ACTIVE' ? 'Suspend Application' : 'Activate Application'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteApp(selectedApp.id, selectedApp.name)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Uninstall Application</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB: TENANTS */}
            {activeManageTab === 'tenants' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Control which dealership groups have authorized access to launch this module.
                </p>
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {appTenants.map(t => {
                    const isSubscribed = t.isSubscribed;
                    return (
                      <div key={t.tenantId} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-800">{t.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">code: {t.code} &bull; {t.city}</div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleTenant(t.tenantId, t.subscriptionStatus)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                            isSubscribed
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-rose-100 hover:text-rose-800'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800'
                          }`}
                        >
                          {isSubscribed ? 'Subscribed' : 'Disabled'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: PERMISSIONS */}
            {activeManageTab === 'permissions' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-500">
                  Granular permissions declared by this application registered in the central directory.
                </p>
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {(selectedApp.requiredPermissions || []).map((perm, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between font-mono text-[11px]">
                      <span className="text-blue-700 font-semibold">{perm}</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        Active
                      </span>
                    </div>
                  ))}
                  {(selectedApp.requiredPermissions || []).length === 0 && (
                    <div className="text-slate-400 italic">No permissions registered.</div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: EVENTS & SUBSCRIPTIONS */}
            {activeManageTab === 'events' && (
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Events Published</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(appEventsData?.publishes || []).map((ev, i) => (
                      <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-mono text-[11px]">
                        {ev}
                      </span>
                    ))}
                    {(appEventsData?.publishes || []).length === 0 && (
                      <span className="text-slate-400 italic">Does not publish any events.</span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                    <span>Event Subscriptions (Queue: <code>{appEventsData?.queueName}</code>)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Select events this application should subscribe to. The message broker will bind the queue dynamically.
                  </p>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto border border-slate-100 p-2 rounded-xl bg-slate-50">
                    {(appEventsData?.availableCatalog || []).map((item, idx) => {
                      const isSubbed = newSubscribes.includes(item.eventType);
                      return (
                        <label key={idx} className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-200 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSubbed}
                              onChange={e => {
                                if (e.target.checked) {
                                  setNewSubscribes([...newSubscribes, item.eventType]);
                                } else {
                                  setNewSubscribes(newSubscribes.filter(s => s !== item.eventType));
                                }
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="font-mono text-[11px] text-slate-800">{item.eventType}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{item.publisherName}</span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={handleSaveSubscriptions}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                    >
                      Update Subscriptions &amp; Bindings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
