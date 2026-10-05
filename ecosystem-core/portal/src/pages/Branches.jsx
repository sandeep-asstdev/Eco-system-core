import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { MapPin, Plus, Building, Layers, Phone, Search, RefreshCw, Car } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import Modal from '../components/common/Modal.jsx';
import UnauthorizedScreen from '../components/common/UnauthorizedScreen.jsx';

export default function Branches() {
  const { hasPermission, isPlatformAdmin, activeBranch, memberships } = useAuth();
  const [branches, setBranches] = useState([]);
  const [firms, setFirms] = useState([]);
  const [firmBrands, setFirmBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'SHOWROOM',
    firmId: '',
    firmBrandId: '',
    city: 'Hubli',
    state: 'Karnataka',
    address: '',
    phone: '',
    email: ''
  });

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBranches = async () => {
    setIsLoading(true);
    try {
      const [branchRes, firmsRes, fbRes] = await Promise.all([
        api.get('/org/branches'),
        api.get('/org/firms'),
        api.get('/org/firm-brands')
      ]);

      setBranches(branchRes.data || []);
      setFirms(firmsRes.data || []);
      setFirmBrands(fbRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        code: formData.code?.trim()?.toUpperCase() || undefined,
        outletType: formData.type || 'SHOWROOM',
        type: formData.type || 'SHOWROOM'
      };
      await api.post('/org/branches', payload);
      setIsModalOpen(false);
      setFormData({
        name: '',
        code: '',
        type: 'SHOWROOM',
        firmId: '',
        firmBrandId: '',
        city: 'Hubli',
        state: 'Karnataka',
        address: '',
        phone: '',
        email: ''
      });
      await fetchBranches();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isPlatformAdmin && !hasPermission('org.branch.view') && !hasPermission('org.branch.manage')) {
    return <UnauthorizedScreen requiredPermission="org.branch.view" title="Branch Outlets Restricted" />;
  }

  const filtered = branches.filter(b => 
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.code?.toLowerCase().includes(search.toLowerCase()) ||
    b.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Branches & Dealership Facilities</h1>
          <p className="text-xs text-slate-500">
            Physical 3S Showrooms, Workshops, Bodyshops, Stockyards, and Auto-Provisioned Service Departments
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Add Dealership Facility
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search facilities by name, code or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button 
          onClick={fetchBranches}
          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Fetching physical dealership facilities..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((branch) => {
            const isUserActiveBranch = activeBranch?.id === branch.id;
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
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-700">
                          {branch.type}
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
                      <span className="truncate font-medium text-slate-800">{branch.firm?.name || 'Firm Unlinked'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate text-slate-700">
                        {branch.location?.name ? `${branch.location.name} (${branch.city})` : `${branch.city}, ${branch.state}`}
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
                      ) : null}
                    </div>

                    {/* 3S Capabilities Badges */}
                    {branch.branchBusinessUnits && branch.branchBusinessUnits.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap pt-1">
                        {branch.branchBusinessUnits.map(bbu => (
                          <span 
                            key={bbu.id}
                            className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200"
                            title={bbu.businessUnit.name}
                          >
                            {bbu.businessUnit.code}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-semibold text-slate-700">{branch.departments?.length || 5}</span>
                    <span>Departments</span>
                  </div>

                  <button
                    onClick={() => setSelectedBranch(branch)}
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View Departments →
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
          title={`Departments at ${selectedBranch.name}`}
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Auto-provisioned functional units and service bays operating inside this facility:
            </p>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {(selectedBranch.departments?.length ? selectedBranch.departments : [
                { id: '1', name: 'Sales Department', code: 'SALES', type: 'SALES' },
                { id: '2', name: 'Service Department', code: 'SERVICE', type: 'SERVICE' },
                { id: '3', name: 'Spares & Accessories', code: 'SPARES', type: 'SPARES' },
                { id: '4', name: 'Customer Relations (CRM)', code: 'CRM', type: 'CRM' },
                { id: '5', name: 'Facility Administration', code: 'ADMIN', type: 'ADMIN' }
              ]).map((dept) => (
                <div key={dept.id} className="p-3 text-xs flex items-center justify-between bg-white hover:bg-slate-50">
                  <div>
                    <div className="font-semibold text-slate-800">{dept.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{dept.code}</div>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded">
                    {dept.type || 'FUNCTIONAL'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Create Branch Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Dealership Facility / Branch">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">{error}</div>}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Facility Name</label>
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
              placeholder="e.g. Hubli Kia Experience Center"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Branch Code</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="KIA_HBL_01"
                className="w-full px-3 py-2 font-mono uppercase border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Facility Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SHOWROOM">SHOWROOM (Sales Facility)</option>
                <option value="WORKSHOP">WORKSHOP (Periodic Service)</option>
                <option value="BODYSHOP">BODYSHOP (Accidental & Paint)</option>
                <option value="SERVICE_CENTER">3S FACILITY (Integrated)</option>
                <option value="STOCKYARD">STOCKYARD (Inventory Hub)</option>
                <option value="CORPORATE_OFFICE">CORPORATE HEADQUARTERS</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operating Legal Firm</label>
              <select
                required
                value={formData.firmId}
                onChange={(e) => setFormData({ ...formData, firmId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose Firm --</option>
                {firms.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">OEM Brand Franchise</label>
              <select
                value={formData.firmBrandId}
                onChange={(e) => setFormData({ ...formData, firmBrandId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Unbranded / Multi-Brand --</option>
                {firmBrands.map((fb) => (
                  <option key={fb.id} value={fb.id}>{fb.brand?.name} ({fb.firm?.name})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City</label>
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
              <label className="block font-semibold text-slate-700 mb-1">Phone (10 digits)</label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="9845012345"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-[11px]">
            ℹ️ Creating this facility will automatically provision 5 core functional departments: 
            <strong> Sales, Service, Spares, Customer Relations (CRM), and Administration</strong>.
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
              {isSubmitting ? 'Provisioning...' : 'Provision Branch'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
