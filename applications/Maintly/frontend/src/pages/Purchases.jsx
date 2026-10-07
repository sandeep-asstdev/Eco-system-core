import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../components/Modal.jsx';
import {
  ShoppingCart, Plus, CheckCircle2, Clock, Truck,
  FileText, Building2, DollarSign, ArrowRight, RefreshCw,
  ExternalLink, Package, Check, Calendar, Globe, MapPin, Wrench
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PROCUREMENT_STAGES = [
  { key: 'NEED_PURCHASE', label: 'Need Purchase', step: 1 },
  { key: 'APPROVAL', label: 'Approval', step: 2 },
  { key: 'ORDERED', label: 'Ordered', step: 3 },
  { key: 'IN_TRANSIT', label: 'In Transit', step: 4 },
  { key: 'RECEIVED', label: 'Received', step: 5 }
];

const PURCHASE_SOURCES = [
  { value: 'INTERNAL_STOCK', label: 'Internal Stock' },
  { value: 'APPROVED_VENDOR', label: 'Approved Vendor' },
  { value: 'AMAZON_BUSINESS', label: 'Amazon Business' },
  { value: 'FLIPKART', label: 'Flipkart' },
  { value: 'LOCAL_PURCHASE', label: 'Local Purchase' },
  { value: 'OTHER_ONLINE', label: 'Other Online Marketplace' },
  { value: 'OTHER', label: 'Other' }
];

export default function Purchases() {
  const { role } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status & Quotation Modals
  const [selectedPr, setSelectedPr] = useState(null);
  const [modalType, setModalType] = useState(null); // 'status' or 'quote'
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Forms
  const [quoteForm, setQuoteForm] = useState({ vendorId: '', quoteNumber: '', amount: '', notes: '' });
  const [statusForm, setStatusForm] = useState({
    status: 'ORDERED',
    purchaseSource: 'APPROVED_VENDOR',
    poReference: '',
    orderUrl: '',
    expectedDeliveryDate: '',
    trackingNumber: '',
    carrier: '',
    actualTotal: '',
    remarks: ''
  });

  const isPurchaseUser = role === 'PURCHASE_USER' || role === 'MANAGER' || role === 'TENANT_ADMIN' || role === 'PLATFORM_ADMIN';

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const [prRes, venRes] = await Promise.all([
        api.get('/purchases'),
        api.get('/vendors')
      ]);
      setPurchases(prRes.data.data || []);
      setVendors(venRes.data.data || []);
      if (venRes.data.data?.length > 0) {
        setQuoteForm(prev => ({ ...prev, vendorId: venRes.data.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const openStatusModal = (pr, defaultStatus = 'ORDERED') => {
    setSelectedPr(pr);
    setStatusForm({
      status: defaultStatus,
      purchaseSource: pr.purchaseSource || 'APPROVED_VENDOR',
      poReference: pr.poReference || '',
      orderUrl: pr.orderUrl || '',
      expectedDeliveryDate: pr.expectedDeliveryDate ? pr.expectedDeliveryDate.split('T')[0] : '',
      trackingNumber: pr.trackingNumber || '',
      carrier: pr.carrier || '',
      actualTotal: pr.actualTotal || pr.estimatedTotal || '',
      remarks: ''
    });
    setModalType('status');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      await api.put(`/purchases/${selectedPr.id}/status`, statusForm);
      setModalType(null);
      fetchPurchases();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update procurement status.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddQuote = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      await api.post(`/purchases/${selectedPr.id}/quotations`, quoteForm);
      setModalType(null);
      fetchPurchases();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to add quotation.');
    } finally {
      setSubmitting(false);
    }
  };

  // Map backend status to 5-stage procurement lifecycle index
  const getStageStep = (status) => {
    switch (status) {
      case 'REQUESTED': return 1;
      case 'QUOTED':
      case 'QUOTATION_PENDING':
      case 'APPROVAL_PENDING':
      case 'APPROVED': return 2;
      case 'ORDERED': return 3;
      case 'PARTIALLY_RECEIVED': return 4;
      case 'RECEIVED':
      case 'COMPLETED': return 5;
      default: return 1;
    }
  };

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Procurement Workspace</span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">Purchasing & Vendor Logistics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Requisition pipeline linked to maintenance work orders. Track Amazon Business, Flipkart, local purchase, and approved vendor orders.
          </p>
        </div>

        <button
          onClick={fetchPurchases}
          className="p-2 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 hover:bg-slate-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 5-Stage Procurement Pipeline Guide */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Procurement Lifecycle Architecture
        </span>
        <div className="grid grid-cols-5 gap-2">
          {PROCUREMENT_STAGES.map((stg) => (
            <div key={stg.key} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                {stg.step}
              </div>
              <span className="text-xs font-bold text-slate-700 truncate">{stg.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Purchases Requisitions List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Active Material Requisitions</h2>
            <p className="text-xs text-slate-400">All procurement records linked to parent maintenance requests</p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-400">{purchases.length} Total PRs</span>
        </div>

        {purchases.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No purchase requisitions currently active. Stand by for technician material requests.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {purchases.map((pr) => {
              const currentStep = getStageStep(pr.status);

              return (
                <div key={pr.id} className="p-5 hover:bg-slate-50/80 transition-colors space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                          {pr.prNumber}
                        </span>

                        {/* Linked Parent Maintenance Request */}
                        <Link
                          to={`/requests/${pr.maintenanceRequest?.id}`}
                          className="font-mono text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 whitespace-nowrap"
                        >
                          <Wrench className="w-3 h-3" />
                          Parent: {pr.maintenanceRequest?.requestNumber}
                        </Link>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                          Source: {(pr.purchaseSource || 'APPROVED_VENDOR').replace(/_/g, ' ')}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-800">
                        {pr.maintenanceRequest?.subject || 'Requisition for Materials'}
                      </h3>

                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <span>Requested by {pr.requestedBy?.firstName} {pr.requestedBy?.lastName}</span>
                        <span>•</span>
                        <span>Est: <strong className="text-slate-700">₹{pr.estimatedTotal?.toLocaleString('en-IN') || 0}</strong></span>
                        {pr.actualTotal > 0 && (
                          <>
                            <span>•</span>
                            <span>Actual: <strong className="text-emerald-700">₹{pr.actualTotal?.toLocaleString('en-IN')}</strong></span>
                          </>
                        )}
                        {pr.poReference && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-slate-700">Ref: {pr.poReference}</span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Quick Procurement Action Buttons */}
                    {isPurchaseUser && (
                      <div className="flex items-center gap-2 shrink-0">
                        {pr.status === 'REQUESTED' && (
                          <button
                            onClick={() => openStatusModal(pr, 'APPROVED')}
                            className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                          >
                            Approve PR
                          </button>
                        )}

                        {pr.status === 'APPROVED' && (
                          <button
                            onClick={() => openStatusModal(pr, 'ORDERED')}
                            className="px-3.5 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Place Order
                          </button>
                        )}

                        {pr.status === 'ORDERED' && (
                          <button
                            onClick={() => openStatusModal(pr, 'RECEIVED')}
                            className="px-3.5 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Mark Received ✓
                          </button>
                        )}

                        {pr.orderUrl && (
                          <a
                            href={pr.orderUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg border border-slate-200"
                            title="Open Marketplace Order"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 5-Stage Visual Progress Bar for this Purchase Record */}
                  <div className="grid grid-cols-5 gap-1.5 pt-1">
                    {PROCUREMENT_STAGES.map((stg, sIdx) => {
                      const isDone = sIdx < currentStep;
                      const isCurrent = sIdx === currentStep - 1;

                      return (
                        <div key={stg.key} className="space-y-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              isDone ? 'bg-emerald-500' : isCurrent ? 'bg-purple-600 ring-2 ring-purple-200' : 'bg-slate-200'
                            }`}
                          />
                          <span className={`text-[10px] block font-semibold truncate ${isCurrent ? 'text-purple-700 font-bold' : isDone ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {stg.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Items List */}
                  {pr.items && pr.items.length > 0 && (
                    <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Requisitioned Items
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {pr.items.map(item => (
                          <div key={item.id} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                            <span className="font-semibold text-slate-800 truncate">{item.itemName}</span>
                            <span className="font-mono text-slate-500 shrink-0">{item.quantity} {item.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* UPDATE STATUS / ORDER MODAL */}
      <Modal
        isOpen={modalType === 'status'}
        onClose={() => setModalType(null)}
        title={statusForm.status === 'ORDERED' ? 'Place Material Order' : statusForm.status === 'RECEIVED' ? 'Confirm Delivery & Receipt' : 'Update Purchase Status'}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
          {modalError && <div className="p-3 rounded-lg bg-rose-50 text-rose-700">{modalError}</div>}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Procurement State *</label>
            <select
              value={statusForm.status}
              onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
              className="w-full p-2.5 border rounded-lg font-semibold"
            >
              <option value="APPROVED">APPROVED (Authorized for Purchase)</option>
              <option value="ORDERED">ORDERED (Order Placed / In Transit)</option>
              <option value="RECEIVED">RECEIVED (Materials Arrived at Facility)</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Purchase Source / Provider</label>
            <select
              value={statusForm.purchaseSource}
              onChange={(e) => setStatusForm({ ...statusForm, purchaseSource: e.target.value })}
              className="w-full p-2.5 border rounded-lg"
            >
              {PURCHASE_SOURCES.map(src => (
                <option key={src.value} value={src.value}>{src.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Order / PO Reference #</label>
              <input
                type="text"
                value={statusForm.poReference}
                onChange={(e) => setStatusForm({ ...statusForm, poReference: e.target.value })}
                placeholder="e.g. PO-8921 or Amazon #402-9182"
                className="w-full p-2.5 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Actual Amount Reconciled (₹)</label>
              <input
                type="number"
                value={statusForm.actualTotal}
                onChange={(e) => setStatusForm({ ...statusForm, actualTotal: e.target.value })}
                placeholder="e.g. 2400"
                className="w-full p-2.5 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Marketplace / Order URL</label>
            <input
              type="url"
              value={statusForm.orderUrl}
              onChange={(e) => setStatusForm({ ...statusForm, orderUrl: e.target.value })}
              placeholder="https://amazon.in/orders/... or vendor tracking URL"
              className="w-full p-2.5 border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expected Delivery Date</label>
              <input
                type="date"
                value={statusForm.expectedDeliveryDate}
                onChange={(e) => setStatusForm({ ...statusForm, expectedDeliveryDate: e.target.value })}
                className="w-full p-2.5 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tracking Number</label>
              <input
                type="text"
                value={statusForm.trackingNumber}
                onChange={(e) => setStatusForm({ ...statusForm, trackingNumber: e.target.value })}
                placeholder="e.g. AWB-9821820"
                className="w-full p-2.5 border rounded-lg"
              />
            </div>
          </div>

          {statusForm.status === 'RECEIVED' && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-teal-800">
              <span className="font-bold block mb-0.5">Automated Work Resumption</span>
              Marking materials as received will automatically transition the parent maintenance request back to <strong>IN_PROGRESS</strong> and alert the assigned technician.
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-3.5 py-2 border rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700"
            >
              {submitting ? 'Saving...' : 'Update Procurement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
