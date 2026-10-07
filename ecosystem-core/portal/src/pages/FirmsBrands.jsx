import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Briefcase, Car, Plus, ShieldCheck, CheckCircle2, Link2, ExternalLink } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import Modal from '../components/common/Modal.jsx';
import UnauthorizedScreen from '../components/common/UnauthorizedScreen.jsx';
import Toast from '../components/common/Toast.jsx';

export default function FirmsBrands() {
  const { hasPermission, isPlatformAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('firms'); // 'firms', 'brands', 'franchises'
  const [firms, setFirms] = useState([]);
  const [brands, setBrands] = useState([]);
  const [firmBrands, setFirmBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isFirmModalOpen, setIsFirmModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  // Form states
  const [firmForm, setFirmForm] = useState({
    name: '',
    code: '',
    legalName: '',
    pan: '',
    gstin: '',
    cin: '',
    state: 'Karnataka',
    registeredAddress: '',
    email: ''
  });

  const [brandForm, setBrandForm] = useState({
    name: '',
    code: '',
    oemCompany: '',
    country: 'India',
    logoUrl: '',
    description: ''
  });

  const [linkForm, setLinkForm] = useState({
    firmId: '',
    brandId: '',
    dealerCode: '',
    contractValidUntil: ''
  });

  const [error, setError] = useState(null);
  const [toastData, setToastData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [firmsRes, brandsRes, linksRes] = await Promise.all([
        api.get('/org/firms?limit=100'),
        api.get('/org/brands'),
        api.get('/org/firm-brands')
      ]);

      setFirms(firmsRes.data || []);
      setBrands(brandsRes.data || []);
      setFirmBrands(linksRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateFirm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: firmForm.name.trim(),
        code: firmForm.code ? firmForm.code.trim().toUpperCase() : undefined,
        panNumber: firmForm.pan?.trim()?.toUpperCase() || null,
        pan: firmForm.pan?.trim()?.toUpperCase() || null,
        gstin: firmForm.gstin?.trim()?.toUpperCase() || null,
        cin: firmForm.cin?.trim()?.toUpperCase() || null,
        state: firmForm.state?.trim() || 'Karnataka',
        registeredAt: firmForm.state?.trim() || 'Karnataka'
      };
      await api.post('/org/firms', payload);
      setIsFirmModalOpen(false);
      setFirmForm({
        name: '',
        code: '',
        legalName: '',
        pan: '',
        gstin: '',
        cin: '',
        state: 'Karnataka',
        registeredAddress: '',
        email: ''
      });
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBrand = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: brandForm.name.trim(),
        code: brandForm.code ? brandForm.code.trim().toUpperCase() : undefined,
        oemCompany: brandForm.oemCompany?.trim() || null,
        country: brandForm.country?.trim() || 'India',
        logoUrl: brandForm.logoUrl?.trim() || null,
        description: brandForm.description?.trim() || null
      };
      await api.post('/org/brands', payload);
      setIsBrandModalOpen(false);
      setBrandForm({ name: '', code: '', oemCompany: '', country: 'India', logoUrl: '', description: '' });
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateLink = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        firmId: linkForm.firmId,
        brandId: linkForm.brandId,
        dealerAgreementNo: linkForm.dealerCode?.trim() || null,
        dealerCode: linkForm.dealerCode?.trim() || null,
        agreementExpiry: linkForm.contractValidUntil || null,
        contractValidUntil: linkForm.contractValidUntil || null
      };
      await api.post('/org/firm-brands', payload);
      setIsLinkModalOpen(false);
      setToastData({
        title: 'Dealership Agreement Linked',
        message: `Successfully linked franchise agreement ${payload.dealerAgreementNo || ''} with legal firm.`,
        type: 'success'
      });
      setLinkForm({ firmId: '', brandId: '', dealerCode: '', contractValidUntil: '' });
      await fetchData();
    } catch (err) {
      setError(err.message);
      setToastData({
        title: 'Franchise Linking Failed',
        message: err.message,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isPlatformAdmin && !hasPermission('org.firm.view') && !hasPermission('org.firm.manage')) {
    return <UnauthorizedScreen requiredPermission="org.firm.view" title="Firm Governance Restricted" />;
  }

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
          <h1 className="text-xl font-bold text-slate-900">Legal Firms & OEM Brands</h1>
          <p className="text-xs text-slate-500">
            Multi-firm legal entities, OEM dealership franchise agreements, and GSTIN/PAN compliance
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'firms' && (
            <button
              onClick={() => setIsFirmModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" /> Add Legal Firm
            </button>
          )}

          {activeTab === 'brands' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLinkModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
              >
                <Link2 className="w-4 h-4" /> Bind Dealership Agreement
              </button>
              <button
                onClick={() => setIsBrandModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
              >
                <Plus className="w-4 h-4" /> Register OEM Brand
              </button>
            </div>
          )}

          {activeTab === 'franchises' && (
            <button
              onClick={() => setIsLinkModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
            >
              <Link2 className="w-4 h-4" /> Link Franchise Agreement
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('firms')}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition ${
            activeTab === 'firms'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Legal Firms ({firms.length})
        </button>
        <button
          onClick={() => setActiveTab('brands')}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition ${
            activeTab === 'brands'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          OEM Brands ({brands.length})
        </button>
        <button
          onClick={() => setActiveTab('franchises')}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition ${
            activeTab === 'franchises'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Franchise Allocations ({firmBrands.length})
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Fetching legal entities and brand franchises..." />
      ) : (
        <>
          {/* TAB 1: FIRMS */}
          {activeTab === 'firms' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Firm Name</th>
                    <th className="py-3 px-4">PAN Number</th>
                    <th className="py-3 px-4">GSTIN</th>
                    <th className="py-3 px-4">CIN / Reg ID</th>
                    <th className="py-3 px-4">State</th>
                    <th className="py-3 px-4">Branches</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {firms.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-blue-600" />
                          <div>
                            <div>{f.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{f.legalName || f.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{f.pan || '—'}</td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{f.gstin || '—'}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{f.cin || '—'}</td>
                      <td className="py-3.5 px-4 text-slate-600">{f.state || 'Karnataka'}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-semibold">
                          {f.branches?.length || 0} Facilities
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: BRANDS */}
          {activeTab === 'brands' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {brands.map((b) => (
                <div key={b.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between gap-4 hover:border-blue-300 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                      <Car className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{b.name}</h3>
                      <p className="text-[11px] text-slate-500 font-mono">{b.code || 'OEM BRAND'}</p>
                      <span className="text-[10px] text-slate-400">{b.country || 'India'}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-500">
                      {firmBrands.filter(fb => fb.brandId === b.id).length} Active Franchises
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setLinkForm(prev => ({ ...prev, brandId: b.id }));
                        setIsLinkModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] rounded-lg border border-blue-200 transition"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Bind Agreement</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: FRANCHISES */}
          {activeTab === 'franchises' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Legal Operating Firm</th>
                    <th className="py-3 px-4">OEM Brand Franchise</th>
                    <th className="py-3 px-4">Dealer OEM Code</th>
                    <th className="py-3 px-4">Contract Valid Until</th>
                    <th className="py-3 px-4">Branches</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {firmBrands.map((fb) => (
                    <tr key={fb.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{fb.firm?.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold">
                          {fb.brand?.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{fb.dealerCode || '—'}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {fb.contractValidUntil ? new Date(fb.contractValidUntil).toLocaleDateString() : 'Active Ongoing'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-semibold">
                          {fb.branches?.length || 0} Outlets
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Firm Modal */}
      <Modal isOpen={isFirmModalOpen} onClose={() => setIsFirmModalOpen(false)} title="Create Legal Operating Firm">
        <form onSubmit={handleCreateFirm} className="space-y-4 text-xs">
          {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Firm Display Name *</label>
              <input
                type="text"
                required
                value={firmForm.name}
                onChange={(e) => {
                  const val = e.target.value;
                  const autoCode = val.toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').slice(0, 20);
                  setFirmForm(prev => ({
                    ...prev,
                    name: val,
                    code: prev.code && prev.code !== prev.name.toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').slice(0, 20)
                      ? prev.code
                      : autoCode
                  }));
                }}
                placeholder="e.g. Advait Motors Pvt Ltd"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Firm Code (Identifier) *</label>
              <input
                type="text"
                required
                maxLength={20}
                value={firmForm.code}
                onChange={(e) => setFirmForm({ ...firmForm, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') })}
                placeholder="e.g. ADV_PVT_LTD"
                className="w-full px-3 py-2 font-mono uppercase bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">PAN (Indian Tax ID)</label>
              <input
                type="text"
                maxLength={10}
                value={firmForm.pan}
                onChange={(e) => setFirmForm({ ...firmForm, pan: e.target.value.toUpperCase() })}
                placeholder="ABCDE1234F"
                className="w-full px-3 py-2 font-mono uppercase border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">GSTIN</label>
              <input
                type="text"
                maxLength={15}
                value={firmForm.gstin}
                onChange={(e) => setFirmForm({ ...firmForm, gstin: e.target.value.toUpperCase() })}
                placeholder="29ABCDE1234F1Z5"
                className="w-full px-3 py-2 font-mono uppercase border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={firmForm.state}
                onChange={(e) => setFirmForm({ ...firmForm, state: e.target.value })}
                placeholder="Karnataka"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">CIN / Registration No</label>
              <input
                type="text"
                value={firmForm.cin}
                onChange={(e) => setFirmForm({ ...firmForm, cin: e.target.value })}
                placeholder="U50100KA2015PTC..."
                className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFirmModalOpen(false)}
              className="px-3 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Register Firm'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Brand Modal */}
      <Modal isOpen={isBrandModalOpen} onClose={() => setIsBrandModalOpen(false)} title="Register Authorized OEM Brand">
        <form onSubmit={handleCreateBrand} className="space-y-4 text-xs">
          {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand Name *</label>
              <input
                type="text"
                required
                value={brandForm.name}
                onChange={(e) => {
                  const val = e.target.value;
                  const autoCode = val.toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').slice(0, 15);
                  setBrandForm(prev => ({
                    ...prev,
                    name: val,
                    code: prev.code && prev.code !== prev.name.toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').slice(0, 15)
                      ? prev.code
                      : autoCode
                  }));
                }}
                placeholder="e.g. Tata Motors / Kia"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand Code *</label>
              <input
                type="text"
                required
                maxLength={15}
                value={brandForm.code}
                onChange={(e) => setBrandForm({ ...brandForm, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') })}
                placeholder="e.g. TATA / KIA"
                className="w-full px-3 py-2 font-mono uppercase bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">OEM Parent Corporation</label>
              <input
                type="text"
                value={brandForm.oemCompany}
                onChange={(e) => setBrandForm({ ...brandForm, oemCompany: e.target.value })}
                placeholder="e.g. Tata Motors Limited"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Country of Origin</label>
              <input
                type="text"
                value={brandForm.country}
                onChange={(e) => setBrandForm({ ...brandForm, country: e.target.value })}
                placeholder="India"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Brand Logo URL (Optional)</label>
            <input
              type="url"
              value={brandForm.logoUrl}
              onChange={(e) => setBrandForm({ ...brandForm, logoUrl: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBrandModalOpen(false)}
              className="px-3 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Register OEM Brand'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Link Franchise Modal */}
      <Modal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} title="Bind Dealership Agreement / Franchise Link">
        <form onSubmit={handleCreateLink} className="space-y-4 text-xs">
          {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">{error}</div>}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Legal Operating Firm *</label>
            <select
              required
              value={linkForm.firmId}
              onChange={(e) => setLinkForm({ ...linkForm, firmId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Choose Operating Firm --</option>
              {firms.map((f) => (
                <option key={f.id} value={f.id}>{f.code ? `${f.code} - ${f.name}` : f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select OEM Brand *</label>
            <select
              required
              value={linkForm.brandId}
              onChange={(e) => setLinkForm({ ...linkForm, brandId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Choose OEM Brand --</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.code ? `${b.name} (${b.code})` : b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Dealership Agreement Number (Contract Ref) *</label>
            <input
              type="text"
              required
              value={linkForm.dealerCode}
              onChange={(e) => setLinkForm({ ...linkForm, dealerCode: e.target.value })}
              placeholder="e.g. DA-HYU-2023-001"
              className="w-full px-3 py-2 font-mono uppercase border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Agreement Expiry / Valid Until (Optional)</label>
            <input
              type="date"
              value={linkForm.contractValidUntil}
              onChange={(e) => setLinkForm({ ...linkForm, contractValidUntil: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLinkModalOpen(false)}
              className="px-3 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Binding Agreement...' : 'Save Dealership Agreement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
