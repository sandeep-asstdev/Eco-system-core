import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Box, QrCode, Plus, Search, Filter, AlertTriangle, ShieldCheck,
  CheckCircle2, Clock, Wrench, X, Eye, Printer, ArrowRight,
  TrendingUp, Calendar, AlertCircle, Camera
} from 'lucide-react';
import { TicketBadge, WorkStatusBadge } from '../components/StatusBadge.jsx';

export default function Assets() {
  const { role, activeBranchId, branches } = useAuth();
  const [searchParams] = useSearchParams();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCriticality, setSelectedCriticality] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showQRCardModal, setShowQRCardModal] = useState(false);

  const [activeAsset, setActiveAsset] = useState(null);
  const [scannerCode, setScannerCode] = useState('');
  const [scannerResult, setScannerResult] = useState(null);
  const [scannerLoading, setScannerLoading] = useState(false);

  // New Asset form
  const [newAssetData, setNewAssetData] = useState({
    name: '',
    category: 'Hydraulic Lift',
    manufacturer: '',
    model: '',
    serialNumber: '',
    branchId: activeBranchId || (branches[0]?.id || ''),
    location: '',
    criticality: 'MEDIUM',
    maintenanceFrequencyDays: 30,
    installationDate: '',
    warrantyExpiry: '',
    notes: ''
  });

  const categories = [
    'Hydraulic Lift',
    'Wheel Aligner',
    'Air Compressor',
    'Paint Booth',
    'Generator',
    'Diagnostic Tool',
    'HVAC Chiller',
    'Car Washer',
    'General Machinery'
  ];

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeBranchId) params.branchId = activeBranchId;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedCriticality) params.criticality = selectedCriticality;
      if (selectedStatus) params.status = selectedStatus;
      if (search) params.search = search;

      const res = await api.get('/assets', { params });
      setAssets(res.data.data || []);
    } catch (err) {
      console.error('Failed to load assets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [activeBranchId, selectedCategory, selectedCriticality, selectedStatus]);

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'new') setShowCreateModal(true);
    if (action === 'scanner') setShowScannerModal(true);
  }, [searchParams]);

  const handleOpenDetails = async (assetId) => {
    try {
      const res = await api.get(`/assets/${assetId}`);
      setActiveAsset(res.data.data);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Failed to load asset details', err);
    }
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assets', newAssetData);
      setShowCreateModal(false);
      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create asset');
    }
  };

  const handleScanLookup = async (codeToSearch) => {
    const code = codeToSearch || scannerCode;
    if (!code) return;
    setScannerLoading(true);
    try {
      const res = await api.get(`/assets/qr/${encodeURIComponent(code)}`);
      setScannerResult(res.data.data);
    } catch (err) {
      alert(`No asset found matching "${code}". Try entering an Asset ID (e.g. AST-BELL-HYD-0001) or serial number.`);
    } finally {
      setScannerLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Enterprise Equipment Registry</span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">Asset Register & QR Access</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete lifecycle management, printable QR codes, PM schedules, and breakdown telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => { setScannerResult(null); setScannerCode(''); setShowScannerModal(true); }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-800 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition-colors"
          >
            <QrCode className="w-4 h-4" />
            <span>QR Scanner</span>
          </button>

          {(role === 'PLATFORM_ADMIN' || role === 'TENANT_ADMIN' || role === 'MANAGER') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Register Asset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchAssets()}
            placeholder="Search asset name, code, serial number, bay..."
            className="w-full bg-transparent text-xs text-slate-800 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={selectedCriticality}
            onChange={(e) => setSelectedCriticality(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Criticality</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="OPERATIONAL">Operational</option>
            <option value="DEGRADED">Degraded</option>
            <option value="UNDER_MAINTENANCE">Maintenance</option>
            <option value="BREAKDOWN">Breakdown</option>
          </select>
        </div>
      </div>

      {/* Asset Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">
            Registered Assets ({assets.length})
          </span>
          <span className="text-[11px] text-slate-400">
            Click any row to inspect maintenance history and risk score
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading equipment register...</div>
        ) : assets.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No assets found matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Asset Code & Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Branch & Location</th>
                  <th className="py-3 px-4">Criticality</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Active Tickets</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.map((asset) => (
                  <tr
                    key={asset.id}
                    onClick={() => handleOpenDetails(asset.id)}
                    className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-mono text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {asset.assetCode}
                      </div>
                      <div className="text-xs font-semibold text-slate-800">{asset.name}</div>
                      <div className="text-[10px] text-slate-400">{asset.manufacturer} {asset.model}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{asset.category}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{asset.branch?.name}</div>
                      <div className="text-[11px] text-slate-400">{asset.location}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        asset.criticality === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                        asset.criticality === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {asset.criticality}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        asset.status === 'OPERATIONAL' ? 'bg-emerald-100 text-emerald-800' :
                        asset.status === 'DEGRADED' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${asset.openIssuesCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {asset.openIssuesCount} Open
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveAsset(asset);
                          setShowQRCardModal(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg mr-1"
                        title="View & Print QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetails(asset.id);
                        }}
                        className="px-2.5 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Asset Details Workspace */}
      {showDetailsModal && activeAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600">{activeAsset.assetCode}</span>
                <h2 className="text-base font-bold text-slate-900">{activeAsset.name}</h2>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Asset Risk Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Calculated Asset Risk</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-base font-black ${
                      activeAsset.computedRisk === 'HIGH' ? 'text-rose-600' : activeAsset.computedRisk === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {activeAsset.computedRisk} RISK
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-slate-600">
                    {activeAsset.riskFactors?.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setShowQRCardModal(true)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl flex items-center gap-1.5 shadow-2xs"
                >
                  <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                  Print QR
                </button>
              </div>

              {/* Maintenance History */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Maintenance History ({activeAsset.requests?.length || 0} Incidents)
                </h3>
                {activeAsset.requests?.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    No breakdown incidents logged for this asset.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {activeAsset.requests?.map((req) => (
                      <div key={req.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <TicketBadge requestNumber={req.requestNumber} showFull={true} />
                            <span className="text-[10px] text-slate-400">
                              {new Date(req.createdAt).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="font-medium text-slate-700 mt-1 truncate">{req.subject}</div>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end gap-1">
                          <span className="font-bold text-slate-900 block">₹{(req.actualCost || 0).toLocaleString('en-IN')}</span>
                          <WorkStatusBadge status={req.workStatus} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Interactive QR Scanner Emulation */}
      {showScannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">QR Asset Scanner</h3>
              </div>
              <button onClick={() => setShowScannerModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Simulated Camera Viewfinder */}
              <div className="relative h-48 bg-slate-950 rounded-xl overflow-hidden flex flex-col items-center justify-center text-white border-2 border-dashed border-indigo-400/50">
                <Camera className="w-8 h-8 text-indigo-400 mb-2 animate-pulse" />
                <span className="text-xs text-slate-300">Point device camera at asset QR code</span>
                <span className="text-[10px] text-slate-500 mt-1">Or input Asset Code / Serial manually below</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={scannerCode}
                  onChange={(e) => setScannerCode(e.target.value)}
                  placeholder="e.g. AST-BELL-HYD-0001 or serial"
                  className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  onClick={() => handleScanLookup()}
                  disabled={scannerLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
                >
                  {scannerLoading ? 'Scanning...' : 'Scan'}
                </button>
              </div>

              {/* Sample QR presets for quick 1-click test */}
              {assets.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Quick Demo QR Scans:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {assets.slice(0, 3).map(a => (
                      <button
                        key={a.id}
                        onClick={() => { setScannerCode(a.assetCode); handleScanLookup(a.assetCode); }}
                        className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-[10px] font-mono font-bold text-slate-700 transition-colors"
                      >
                        {a.assetCode}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Scanner Match Results */}
              {scannerResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-emerald-900">{scannerResult.asset?.assetCode}</span>
                      <h4 className="text-xs font-bold text-slate-900">{scannerResult.asset?.name}</h4>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-800 text-[10px] font-bold rounded-full">
                      {scannerResult.currentStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-200/60">
                    <button
                      onClick={() => { setShowScannerModal(false); handleOpenDetails(scannerResult.asset.id); }}
                      className="px-2 py-1.5 bg-white border border-emerald-300 rounded-lg text-[11px] font-bold text-slate-800 hover:bg-emerald-50 text-center"
                    >
                      History
                    </button>
                    <button
                      onClick={() => { setShowScannerModal(false); }}
                      className="px-2 py-1.5 bg-white border border-emerald-300 rounded-lg text-[11px] font-bold text-slate-800 hover:bg-emerald-50 text-center"
                    >
                      Inspect
                    </button>
                    <button
                      onClick={() => { setShowScannerModal(false); }}
                      className="px-2 py-1.5 bg-indigo-600 text-white rounded-lg text-[11px] font-bold text-center"
                    >
                      Report Issue
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Printable QR Card */}
      {showQRCardModal && activeAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-center space-y-4">
            <button
              onClick={() => setShowQRCardModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
              MAINTLY ASSET IDENTITY TAG
            </span>

            {/* Generated QR Card Graphic */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center">
              <div className="w-36 h-36 bg-white p-2 border border-slate-300 rounded-xl flex items-center justify-center shadow-xs">
                {/* SVG QR Code Simulation */}
                <svg viewBox="0 0 100 100" className="w-32 h-32">
                  <rect x="5" y="5" width="30" height="30" fill="#1e293b" />
                  <rect x="10" y="10" width="20" height="20" fill="white" />
                  <rect x="15" y="15" width="10" height="10" fill="#1e293b" />
                  <rect x="65" y="5" width="30" height="30" fill="#1e293b" />
                  <rect x="70" y="10" width="20" height="20" fill="white" />
                  <rect x="75" y="15" width="10" height="10" fill="#1e293b" />
                  <rect x="5" y="65" width="30" height="30" fill="#1e293b" />
                  <rect x="10" y="70" width="20" height="20" fill="white" />
                  <rect x="15" y="75" width="10" height="10" fill="#1e293b" />
                  <rect x="45" y="45" width="15" height="15" fill="#4f46e5" />
                  <rect x="40" y="10" width="10" height="10" fill="#1e293b" />
                  <rect x="10" y="40" width="10" height="10" fill="#1e293b" />
                  <rect x="65" y="65" width="25" height="25" fill="#1e293b" />
                </svg>
              </div>

              <div className="mt-3 font-mono font-black text-sm text-slate-900">
                {activeAsset.assetCode}
              </div>
              <div className="text-xs font-bold text-slate-700 mt-0.5">{activeAsset.name}</div>
              <div className="text-[11px] text-slate-500">{activeAsset.branch?.name} • {activeAsset.location}</div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Asset QR Tag</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: Create Asset Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">Register New Asset</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Asset Name *</label>
                <input
                  type="text"
                  required
                  value={newAssetData.name}
                  onChange={(e) => setNewAssetData({ ...newAssetData, name: e.target.value })}
                  placeholder="e.g. Rotary 2-Post Hydraulic Lift 4.5T"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newAssetData.category}
                    onChange={(e) => setNewAssetData({ ...newAssetData, category: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Branch *</label>
                  <select
                    value={newAssetData.branchId}
                    onChange={(e) => setNewAssetData({ ...newAssetData, branchId: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                  >
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.code})</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location / Bay *</label>
                  <input
                    type="text"
                    required
                    value={newAssetData.location}
                    onChange={(e) => setNewAssetData({ ...newAssetData, location: e.target.value })}
                    placeholder="Bay 1, Service Floor"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Criticality *</label>
                  <select
                    value={newAssetData.criticality}
                    onChange={(e) => setNewAssetData({ ...newAssetData, criticality: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={newAssetData.manufacturer}
                    onChange={(e) => setNewAssetData({ ...newAssetData, manufacturer: e.target.value })}
                    placeholder="e.g. Rotary Lift Corp"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={newAssetData.serialNumber}
                    onChange={(e) => setNewAssetData({ ...newAssetData, serialNumber: e.target.value })}
                    placeholder="e.g. ROT-2024-88392"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
                >
                  Register & Generate QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
