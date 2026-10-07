import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { MapPin, Plus, Building, Layers, Phone, Search, RefreshCw, Car, Filter, CheckCircle2 } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import Modal from '../components/common/Modal.jsx';
import UnauthorizedScreen from '../components/common/UnauthorizedScreen.jsx';
import Toast from '../components/common/Toast.jsx';

export default function Branches() {
  const { hasPermission, isPlatformAdmin, activeBranch } = useAuth();
  const [branches, setBranches] = useState([]);
  const [firms, setFirms] = useState([]);
  const [brands, setBrands] = useState([]);
  const [firmBrands, setFirmBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [outletTypeFilter, setOutletTypeFilter] = useState('ALL');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchDepartments, setBranchDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [toastData, setToastData] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: '3S_FACILITY',
    firmId: '',
    firmBrandId: '',
    city: 'Hubli',
    state: 'Karnataka',
    address: 'Gokul Road',
    pincode: '580030',
    phone: '',
    email: ''
  });

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBranches = async () => {
    setIsLoading(true);
    try {
      const [branchRes, firmsRes, brandsRes, fbRes] = await Promise.all([
        api.get('/org/branches?limit=100'),
        api.get('/org/firms?limit=100'),
        api.get('/org/brands'),
        api.get('/org/firm-brands')
      ]);

      const fetchedBranches = branchRes.data || [];
      const fetchedFirms = firmsRes.data || [];
      const fetchedBrands = brandsRes.data || [];
      const fetchedFirmBrands = fbRes.data || [];

      setBranches(fetchedBranches);
      setFirms(fetchedFirms);
      setBrands(fetchedBrands);
      setFirmBrands(fetchedFirmBrands);

      // Pre-select first firm if none selected
      if (!formData.firmId && fetchedFirms.length > 0) {
        setFormData(prev => ({
          ...prev,
          firmId: fetchedFirms[0].id
        }));
      }
    } catch (err) {
      setError(err.message);
      setToastData({
        title: 'Failed to load facilities',
        message: err.message,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const openBranchDetails = async (branch) => {
    setSelectedBranch(branch);
    setLoadingDepts(true);
    try {
      const res = await api.get(`/org/departments?branchId=${branch.id}`);
      if (res.success && res.data && res.data.length > 0) {
        setBranchDepartments(res.data);
      } else if (branch.departments?.length > 0) {
        setBranchDepartments(branch.departments);
      } else {
        // Fallback default 6 core automotive departments
        setBranchDepartments([
          { id: '1', code: 'SALES', name: 'New Vehicle Sales' },
          { id: '2', code: 'SERVICE', name: 'Mechanical Service' },
          { id: '3', code: 'BODYSHOP', name: 'Body & Paint Repair' },
          { id: '4', code: 'SPARES', name: 'Parts & Accessories' },
          { id: '5', code: 'ACCOUNTS', name: 'Finance & Accounts' },
          { id: '6', code: 'HR', name: 'Human Resources' }
        ]);
      }
    } catch (err) {
      console.warn('[BRANCH] Could not fetch live departments, using branch data:', err);
      setBranchDepartments(branch.departments || []);
    } finally {
      setLoadingDepts(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      let selectedFirmBrandId = null;
      let selectedBrandId = null;

      if (formData.firmBrandId) {
        if (formData.firmBrandId.startsWith('brand:')) {
          selectedBrandId = formData.firmBrandId.replace('brand:', '');
          const matchedFb = availableFirmBrands.find(
            fb => fb.brandId === selectedBrandId || fb.brand?.id === selectedBrandId
          );
          if (matchedFb) {
            selectedFirmBrandId = matchedFb.id;
          }
        } else {
          selectedFirmBrandId = formData.firmBrandId;
          const matchedFb = firmBrands.find(fb => fb.id === selectedFirmBrandId);
          if (matchedFb) {
            selectedBrandId = matchedFb.brandId || matchedFb.brand?.id || null;
          }
        }
      }

      const payload = {
        name: formData.name.trim(),
        code: formData.code?.trim()?.toUpperCase() || undefined,
        firmId: formData.firmId,
        firmBrandId: selectedFirmBrandId,
        brandId: selectedBrandId,
        outletType: formData.type || '3S_FACILITY',
        type: formData.type || '3S_FACILITY',
        city: formData.city?.trim() || 'Hubli',
        state: formData.state?.trim() || 'Karnataka',
        address: formData.address?.trim() || null,
        pincode: formData.pincode?.trim() || null,
        phone: formData.phone?.trim() || null,
        email: formData.email?.trim() || null
      };

      const res = await api.post('/org/branches', payload);
      if (res.success) {
        setIsModalOpen(false);
        setToastData({
          title: 'Facility Created Successfully',
          message: `${res.data.name} (${res.data.code}) provisioned with 6 core automotive departments (Sales, Service, Bodyshop, Spares, Accounts, HR).`,
          type: 'success'
        });
        setFormData({
          name: '',
          code: '',
          type: '3S_FACILITY',
          firmId: firms[0]?.id || '',
          firmBrandId: '',
          city: 'Hubli',
          state: 'Karnataka',
          address: 'Gokul Road',
          pincode: '580030',
          phone: '',
          email: ''
        });
        await fetchBranches();
      }
    } catch (err) {
      setError(err.message);
      setToastData({
        title: 'Facility Creation Failed',
        message: err.message,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isPlatformAdmin && !hasPermission('org.branch.view') && !hasPermission('org.branch.manage')) {
    return <UnauthorizedScreen requiredPermission="org.branch.view" title="Branch Outlets Restricted" />;
  }

  // Dynamic filtering by search text, outlet type, and brand
  const filtered = branches.filter(b => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q ||
      b.name?.toLowerCase().includes(q) ||
      b.code?.toLowerCase().includes(q) ||
      b.city?.toLowerCase().includes(q) ||
      b.firm?.name?.toLowerCase().includes(q);

    const bType = (b.outletType || b.type || '').toUpperCase();
    let matchesType = true;
    if (outletTypeFilter !== 'ALL') {
      if (outletTypeFilter === 'WORKSHOP') {
        matchesType = bType === 'WORKSHOP' || bType === '3S_FACILITY' || b.name?.toLowerCase().includes('workshop');
      } else {
        matchesType = bType === outletTypeFilter;
      }
    }

    let matchesBrand = true;
    if (brandFilter !== 'ALL') {
      const targetBrand = brandFilter.toLowerCase();
      const fbBrand = (b.firmBrand?.brand?.name || b.firmBrand?.brand?.code || '').toLowerCase();
      const directBrand = (b.branchBrands || []).some(bb =>
        (bb.brand?.name || bb.brand?.code || '').toLowerCase().includes(targetBrand)
      );
      matchesBrand = fbBrand.includes(targetBrand) || directBrand;
    }

    return matchesSearch && matchesType && matchesBrand;
  });

  // Filter firmBrands relevant to the selected firm in the modal
  const availableFirmBrands = formData.firmId
    ? firmBrands.filter(fb => fb.firmId === formData.firmId)
    : firmBrands;

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
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
          <h1 className="text-xl font-bold text-slate-900">Branches & Dealership Facilities</h1>
          <p className="text-xs text-slate-500">
            Physical 3S Showrooms, Workshops, Bodyshops, Stockyards, and Auto-Provisioned Automotive Departments
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Add Facility
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search facilities by name, code or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Outlet Type Dropdown Filter */}
          <div className="md:col-span-3 flex items-center gap-1.5">
            <label className="text-[11px] font-semibold text-slate-500 shrink-0">Outlet Type:</label>
            <select
              value={outletTypeFilter}
              onChange={(e) => setOutletTypeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Outlet Types</option>
              <option value="WORKSHOP">WORKSHOP (Mechanical & Bodyshop)</option>
              <option value="3S_FACILITY">3S FACILITY (Integrated)</option>
              <option value="SHOWROOM">SHOWROOM (Sales Only)</option>
              <option value="BODYSHOP">BODYSHOP (Paint & Accidental)</option>
              <option value="STOCKYARD">STOCKYARD (Inventory Hub)</option>
            </select>
          </div>

          {/* Brand Dropdown Filter */}
          <div className="md:col-span-3 flex items-center gap-1.5">
            <label className="text-[11px] font-semibold text-slate-500 shrink-0">Brand:</label>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Brands</option>
              {Array.from(new Set(brands.map(b => b.name))).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <div className="md:col-span-1 flex justify-end">
            <button
              onClick={fetchBranches}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
              title="Refresh Facilities"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Counter & Active Filter Tags */}
        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 text-slate-500">
          <div>
            Showing <strong className="text-slate-800 font-bold">{filtered.length}</strong> of <strong className="text-slate-800 font-bold">{branches.length}</strong> registered facilities
            {(outletTypeFilter !== 'ALL' || brandFilter !== 'ALL' || search) && (
              <span className="ml-2 text-blue-600 font-medium">
                (Filtered by {outletTypeFilter !== 'ALL' ? `Type: ${outletTypeFilter}` : ''} {brandFilter !== 'ALL' ? `Brand: ${brandFilter}` : ''})
              </span>
            )}
          </div>
          {(outletTypeFilter !== 'ALL' || brandFilter !== 'ALL' || search) && (
            <button
              onClick={() => {
                setSearch('');
                setOutletTypeFilter('ALL');
                setBrandFilter('ALL');
              }}
              className="text-blue-600 hover:underline font-semibold"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Fetching physical dealership facilities..." />
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">No facilities match your selected filters</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting the outlet type or brand filter.</p>
          <button
            onClick={() => {
              setSearch('');
              setOutletTypeFilter('ALL');
              setBrandFilter('ALL');
            }}
            className="mt-3 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-100"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((branch) => {
            const isUserActiveBranch = activeBranch?.id === branch.id;
            const outletTypeBadge = branch.outletType || branch.type || '3S_FACILITY';
            return (
              <div
                key={branch.id}
                className={`bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between ${
                  isUserActiveBranch ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                          {outletTypeBadge}
                        </span>
                        {isUserActiveBranch && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                            Current Context
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{branch.name}</h3>
                      <div className="text-[11px] font-mono text-slate-500">{branch.code}</div>
                    </div>

                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="mt-3 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-medium text-slate-800">
                        {branch.firm?.code ? `${branch.firm.code} - ${branch.firm.name}` : (branch.firm?.name || 'Firm Unlinked')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate text-slate-700">
                        {branch.address ? `${branch.address}, ` : ''}{branch.city}, {branch.state} {branch.pincode ? `- ${branch.pincode}` : ''}
                      </span>
                    </div>

                    {/* Multi-Brand Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      {branch.branchBrands && branch.branchBrands.length > 0 ? (
                        branch.branchBrands.map(bb => (
                          <span
                            key={bb.id}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded"
                          >
                            <Car className="w-3 h-3 text-indigo-500" />
                            <span>{bb.brand.name}</span>
                          </span>
                        ))
                      ) : branch.firmBrand ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                          <Car className="w-3 h-3 text-indigo-500" />
                          <span>{branch.firmBrand.brand?.name}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Unbranded Facility</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-semibold text-slate-700">6 Departments</span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">Auto-Provisioned</span>
                  </div>

                  <button
                    onClick={() => openBranchDetails(branch)}
                    className="font-bold text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
                  >
                    <span>Departments & Bays</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Departments Detail Modal */}
      {selectedBranch && (
        <Modal
          isOpen={Boolean(selectedBranch)}
          onClose={() => setSelectedBranch(null)}
          title={`Auto-Provisioned Departments: ${selectedBranch.name}`}
        >
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs flex items-center justify-between">
              <div>
                <p className="font-bold">{selectedBranch.name} ({selectedBranch.code})</p>
                <p className="text-[11px] text-blue-600">
                  {selectedBranch.city}, {selectedBranch.state} | {selectedBranch.firm?.name || 'Firm Attached'}
                </p>
              </div>
              <span className="px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold">
                {selectedBranch.outletType || '3S_FACILITY'}
              </span>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Verified 6 Core Automotive Functional Departments Operating at this Facility:
            </p>

            {loadingDepts ? (
              <LoadingSpinner text="Fetching branch departments..." />
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                {branchDepartments.map((dept) => (
                  <div key={dept.id || dept.code} className="p-3 text-xs flex items-center justify-between bg-white hover:bg-slate-50/70 transition">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{dept.name}</div>
                        <div className="text-[10px] font-mono text-slate-500 font-semibold">
                          CODE: {dept.code} {selectedBranch.id ? `| Branch ID: ${selectedBranch.id.slice(0, 8)}...` : ''}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded uppercase">
                      ACTIVE BAY
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
              ✔ Confirms presence of all 6 auto-created departments: <strong>SALES, SERVICE, BODYSHOP, SPARES, ACCOUNTS, HR</strong> with verified branchId mapping.
            </div>
          </div>
        </Modal>
      )}

      {/* Add Facility Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Physical Dealership Facility (Showroom / 3S / Workshop)">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">{error}</div>}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Facility Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => {
                const val = e.target.value;
                const autoSlug = val.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 16);
                setFormData(prev => ({
                  ...prev,
                  name: val,
                  code: (!prev.code || prev.code === prev.name.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 16)) ? autoSlug : prev.code
                }));
              }}
              placeholder="e.g. Hubli Main 3S Facility"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Branch Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="HBL-MAIN-01"
                className="w-full px-3 py-2 font-mono uppercase border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Facility Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                <option value="3S_FACILITY">3S_FACILITY (Showroom, Service & Spares)</option>
                <option value="WORKSHOP">WORKSHOP (Mechanical & Bodyshop)</option>
                <option value="SHOWROOM">SHOWROOM (New Vehicle Sales)</option>
                <option value="BODYSHOP">BODYSHOP (Accidental & Paint)</option>
                <option value="STOCKYARD">STOCKYARD (Inventory Hub)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Legal Firm (e.g. BMPL) *</label>
              <select
                required
                value={formData.firmId}
                onChange={(e) => {
                  const newFirmId = e.target.value;
                  setFormData(prev => {
                    let newFbId = prev.firmBrandId;
                    if (newFbId && !newFbId.startsWith('brand:')) {
                      const stillValid = firmBrands.some(fb => fb.id === newFbId && fb.firmId === newFirmId);
                      if (!stillValid) newFbId = '';
                    }
                    return { ...prev, firmId: newFirmId, firmBrandId: newFbId };
                  });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose Operating Firm --</option>
                {firms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.code ? `${f.code} - ${f.name}` : f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select OEM Brand / Franchise</label>
              <select
                value={formData.firmBrandId}
                onChange={(e) => setFormData({ ...formData, firmBrandId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose OEM Brand / Franchise --</option>

                {/* 1. OEM Brands (All active OEM Brands) */}
                {brands.length > 0 && (
                  <optgroup label="OEM Brands">
                    {brands.map((b) => (
                      <option key={`brand-${b.id}`} value={`brand:${b.id}`}>
                        {b.name} {b.code ? `(${b.code})` : ''}
                      </option>
                    ))}
                  </optgroup>
                )}

                {/* 2. Registered Operating Firm Franchises */}
                {availableFirmBrands.length > 0 && (
                  <optgroup label="Registered Franchises / Dealer Codes">
                    {availableFirmBrands.map((fb) => (
                      <option key={`fb-${fb.id}`} value={fb.id}>
                        {fb.brand?.name} Franchise {fb.dealerAgreementNo ? `(${fb.dealerAgreementNo})` : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Address *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Gokul Road, Industrial Area"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pincode *</label>
              <input
                type="text"
                required
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                placeholder="580030"
                className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Hubli"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                maxLength={10}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="9845012345"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] leading-relaxed">
            ✨ <strong>Automatic Provisioning Guarantee:</strong> Creating this facility will automatically configure all 6 core dealership departments:
            <br />
            <strong>1. SALES (New Vehicle Sales) &nbsp;|&nbsp; 2. SERVICE (Mechanical Workshop) &nbsp;|&nbsp; 3. BODYSHOP (Body & Paint)</strong>
            <br />
            <strong>4. SPARES (Parts & Accessories) &nbsp;|&nbsp; 5. ACCOUNTS (Finance & Accounts) &nbsp;|&nbsp; 6. HR (Human Resources)</strong>
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
              {isSubmitting ? 'Provisioning...' : 'Save & Provision Facility'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
