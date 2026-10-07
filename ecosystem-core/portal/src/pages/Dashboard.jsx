import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { 
  Building2, 
  Car, 
  MapPin, 
  Users, 
  Boxes, 
  ExternalLink, 
  Activity, 
  CheckCircle2, 
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  Wrench,
  Paintbrush,
  ClipboardCheck,
  RefreshCw,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Filter
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export default function Dashboard({ onNavigate }) {
  const { user, tenant, isPlatformAdmin } = useAuth();
  const [orgData, setOrgData] = useState(null);
  const [apps, setApps] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFirmId, setSelectedFirmId] = useState('ALL');
  const [expandedFirms, setExpandedFirms] = useState({});

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const [treeRes, appsRes, logsRes] = await Promise.allSettled([
          api.get('/org/tree'),
          api.get('/applications'),
          api.get('/audit/logs?limit=5')
        ]);

        if (treeRes.status === 'fulfilled' && treeRes.value?.data) {
          setOrgData(treeRes.value.data);
          // Expand first firm by default
          if (treeRes.value.data.firms?.length > 0) {
            setExpandedFirms({ [treeRes.value.data.firms[0].id]: true });
          }
        }

        if (appsRes.status === 'fulfilled' && appsRes.value?.data) {
          setApps(appsRes.value.data);
        }

        if (logsRes.status === 'fulfilled' && logsRes.value?.data) {
          setRecentLogs(logsRes.value.data.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [tenant]);

  const toggleFirm = (firmId) => {
    setExpandedFirms(prev => ({ ...prev, [firmId]: !prev[firmId] }));
  };

  const handleLaunch = (app, e) => {
    if (e) e.preventDefault();
    const token = localStorage.getItem('ecosystem_token');
    const targetKey = (app.appKey || app.code || '').toLowerCase();
    if (token && (targetKey === 'hrflow' || targetKey === 'maintly')) {
      const tenantParam = tenant?.id ? `&tenantId=${encodeURIComponent(tenant.id)}` : '';
      const ssoUrl = `http://localhost:8080/realms/automobile-ecosystem/protocol/openid-connect/sso-launch?appKey=${targetKey}&token=${encodeURIComponent(token)}${tenantParam}`;
      window.open(ssoUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open(app.baseUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getCapabilityIcon = (code) => {
    switch (code) {
      case 'SALES': return <Car className="w-3 h-3 text-emerald-600" />;
      case 'SERVICE': return <Wrench className="w-3 h-3 text-blue-600" />;
      case 'SPARES': return <Boxes className="w-3 h-3 text-amber-600" />;
      case 'BODYSHOP': return <Paintbrush className="w-3 h-3 text-purple-600" />;
      case 'PDI': return <ClipboardCheck className="w-3 h-3 text-slate-600" />;
      case 'USED_CARS': return <RefreshCw className="w-3 h-3 text-orange-600" />;
      case 'INSURANCE_FINANCE': return <ShieldCheck className="w-3 h-3 text-cyan-600" />;
      default: return <Sparkles className="w-3 h-3 text-indigo-600" />;
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading dealership organization architecture & telemetry..." />;
  }

  const metrics = orgData?.metrics || {
    totalFirms: 0,
    totalLocations: 0,
    totalBranches: 0,
    totalBrands: 0,
    totalBusinessUnits: 0,
    totalActiveCapabilities: 0,
    totalStaff: 0
  };

  const filteredFirms = selectedFirmId === 'ALL'
    ? (orgData?.firms || [])
    : (orgData?.firms || []).filter(f => f.id === selectedFirmId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-blue-900/10 border border-slate-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Multi-Tenant Automotive Dealership Enterprise Platform</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {orgData?.tenant ? orgData.tenant.name : (tenant?.name || 'Dealership Holding Group')}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Real-world multi-firm corporate governance, physical real-estate campuses, authorized OEM brands, 3S operational business units, and cross-application single sign-on.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 shrink-0">
            <div>
              <div className="text-[11px] text-blue-200 font-medium">Logged in Administrator</div>
              <div className="text-xs font-bold text-white">{user?.firstName} {user?.lastName}</div>
            </div>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-blue-500 text-white rounded-full uppercase tracking-wide">
              {isPlatformAdmin ? 'SuperAdmin' : (orgData?.tenant?.subscriptionTier || 'ENTERPRISE')}
            </span>
          </div>
        </div>
      </div>

      {/* Real-World KPI Metrics Grid (6 Dimensions) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div 
          onClick={() => onNavigate('/firms-brands')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Firms</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalFirms}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Legal Corporate Entities</p>
        </div>

        <div 
          onClick={() => onNavigate('/branches')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Locations</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalLocations}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Physical Real Estate Sites</p>
        </div>

        <div 
          onClick={() => onNavigate('/branches')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Branches</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalBranches}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Dealership Outlets</p>
        </div>

        <div 
          onClick={() => onNavigate('/firms-brands')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-purple-400 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Brands</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Car className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalBrands}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Authorized OEM Franchises</p>
        </div>

        <div 
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-md transition"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Capabilities</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalActiveCapabilities}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Active 3S Operational Units</p>
        </div>

        <div 
          onClick={() => onNavigate('/users')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-cyan-400 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Staff</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalStaff}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Branch Personnel</p>
        </div>
      </div>

      {/* Real-World Dealership Organization Tree Visualizer */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Real-World Dealership Organization Hierarchy</h2>
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                Model V2 Live
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive relationship view: Firm (Legal) ➔ Location (Physical Campus) ➔ Branch (Outlet) ➔ OEM Brands & 3S Capabilities ➔ Departments
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedFirmId}
              onChange={(e) => setSelectedFirmId(e.target.value)}
              className="text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Legal Entities ({orgData?.firms?.length || 0})</option>
              {(orgData?.firms || []).map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tree Render */}
        <div className="space-y-4">
          {filteredFirms.length === 0 ? (
            <div className="text-center py-12 px-6 bg-slate-50/70 rounded-2xl border-2 border-dashed border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Welcome to {orgData?.tenant?.name || tenant?.name || 'Dealership Holding Group'} Dashboard!
              </h3>
              <p className="text-xs text-slate-500 max-w-lg mx-auto mt-1 mb-5 leading-relaxed">
                Your holding group context is established, enterprise applications (HRFlow, MAINTLY, DemoApp, Purchase) are subscribed, and 9 standard 3S business units (Sales, Service, Spares, Bodyshop, PDI) are initialized.
                Next, configure your first legal operating firm and authorized OEM franchise brands.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => onNavigate('/firms-brands')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Register First Operating Firm & Brand →</span>
                </button>
                <button
                  onClick={() => onNavigate('/branches')}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Set Up Dealership Outlets</span>
                </button>
              </div>
            </div>
          ) : (
            filteredFirms.map((firm) => {
              const isExpanded = expandedFirms[firm.id] !== false;

              return (
                <div key={firm.id} className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/40">
                  {/* Firm Header */}
                  <div 
                    onClick={() => toggleFirm(firm.id)}
                    className="p-4 bg-slate-100/70 hover:bg-slate-100 transition flex items-center justify-between cursor-pointer border-b border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <button className="text-slate-500 hover:text-slate-700">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                        {firm.code?.substring(0, 2) || 'FM'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{firm.name}</span>
                          <span className="text-[10px] font-mono font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                            {firm.code}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-0.5">
                          {firm.panNumber && <span>PAN: <strong className="text-slate-700">{firm.panNumber}</strong></span>}
                          {firm.gstin && <span>GSTIN: <strong className="text-slate-700">{firm.gstin}</strong></span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                        {firm.branches?.length || 0} Dealership Outlets
                      </span>
                    </div>
                  </div>

                  {/* Branches under this Firm */}
                  {isExpanded && (
                    <div className="p-4 space-y-3">
                      {firm.branches.length === 0 ? (
                        <div className="text-xs text-slate-400 italic py-2 pl-8">
                          No active dealership outlets registered under this corporate entity.
                        </div>
                      ) : (
                        firm.branches.map((branch) => (
                          <div 
                            key={branch.id}
                            className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-blue-300 transition"
                          >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-slate-900 text-sm">{branch.name}</h4>
                                  <span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                                    {branch.code}
                                  </span>
                                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                                    {branch.outletType}
                                  </span>
                                </div>

                                {/* Physical Campus Association */}
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span className="font-medium text-slate-700">
                                    {branch.location ? branch.location.name : `${branch.city}, ${branch.state}`}
                                  </span>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-slate-500">
                                    {branch.location?.addressLine1 || branch.address || 'Central Facility'}
                                  </span>
                                </div>
                              </div>

                              {/* Authorized Brands */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Brands:</span>
                                {branch.branchBrands && branch.branchBrands.length > 0 ? (
                                  branch.branchBrands.map(bb => (
                                    <span 
                                      key={bb.id} 
                                      className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md flex items-center gap-1"
                                    >
                                      <Car className="w-3 h-3" />
                                      <span>{bb.brand.name}</span>
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                    Standard OEM
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Active 3S Business Units (Capabilities) */}
                            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Operational Units:</span>
                                {branch.branchBusinessUnits && branch.branchBusinessUnits.length > 0 ? (
                                  branch.branchBusinessUnits.map(bbu => (
                                    <span 
                                      key={bbu.id}
                                      className="text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1"
                                      title={bbu.businessUnit.description}
                                    >
                                      {getCapabilityIcon(bbu.businessUnit.code)}
                                      <span>{bbu.businessUnit.name}</span>
                                      {bbu.capacityUnits && (
                                        <span className="text-[9px] text-slate-400 font-mono">({bbu.capacityUnits} bays)</span>
                                      )}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-slate-400">Sales, Service, Spares</span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-[11px] text-slate-500 shrink-0">
                                <span>{branch.departments?.length || 0} Teams</span>
                                <span>•</span>
                                <span className="font-semibold text-slate-700">{branch._count?.memberships || 0} Staff Members</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Application Launcher Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Enterprise Application Launcher</h2>
            <p className="text-xs text-slate-500">Access authorized multi-tenant SaaS modules with Single Sign-On</p>
          </div>
          <button 
            onClick={() => onNavigate('/launcher')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View Full Launcher</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apps.map((app) => {
            const initials = app.code ? app.code.substring(0, 2) : (app.name || 'AP').substring(0, 2).toUpperCase();

            return (
              <div 
                key={app.id} 
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm bg-blue-600">
                        {initials}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">{app.name}</h3>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Active Dealership Subscription
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-2">{app.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-medium flex items-center gap-1">
                    <span>🔐 Keycloak SSO Bridge Active</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleLaunch(app, e)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
                  >
                    <span>Launch</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Trails */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Governance & Audit Telemetry</h2>
          </div>
          <button 
            onClick={() => onNavigate('/audit-logs')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            View All Logs
          </button>
        </div>

        {recentLogs.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No recent audit trail entries recorded.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    <span>{log.action}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Entity: <span className="font-medium text-slate-700">{log.entityType}</span> ({log.entityId?.substring(0, 8)}...)
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 font-mono text-right">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
