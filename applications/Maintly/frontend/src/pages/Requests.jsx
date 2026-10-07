import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../components/Modal.jsx';
import { WorkStatusBadge, PriorityBadge, TicketBadge } from '../components/StatusBadge.jsx';
import {
  Search, Plus, ChevronLeft, ChevronRight,
  Clock, CheckCircle2, AlertTriangle, RefreshCw,
  Building, Layers, MapPin, FileText, Check, AlertCircle, ArrowRight,
  ExternalLink, X, Image as ImageIcon
} from 'lucide-react';

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const WORKFLOW_TABS = [
  { id: 'all', label: 'All Requests' },
  { id: 'my_requests', label: 'My Requests' },
  { id: 'pending_approval', label: 'Pending Approval' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'payment_pending', label: 'Payment Pending' },
  { id: 'closed', label: 'Closed' }
];

export default function Requests({ defaultView }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { role, activeBranchId, branches } = useAuth();

  const currentView = searchParams.get('view') || defaultView || 'all';
  const actionParam = searchParams.get('action');

  // Query states
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('maintenanceTypeId') || '');
  const [successToast, setSuccessToast] = useState('');

  // New Request Modal state
  const [isModalOpen, setIsModalOpen] = useState(actionParam === 'new');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Master data
  const [masterData, setMasterData] = useState({ types: [], branches: [], departments: [] });
  const [branchDepartments, setBranchDepartments] = useState([]);
  const [loadingMasterData, setLoadingMasterData] = useState(true);

  // Form Fields
  const [formData, setFormData] = useState({
    branchId: '',
    departmentId: '',
    maintenanceTypeId: '',
    priority: 'MEDIUM',
    location: '',
    subject: '',
    description: '',
    requesterContact: '',
    requiredDate: ''
  });

  // Selected Problem Images
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Open modal on ?action=new
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsModalOpen(true);
      setFormError('');
    }
  }, [searchParams]);

  // Load master data
  useEffect(() => {
    async function loadMasterData() {
      setLoadingMasterData(true);
      try {
        const [typesRes, branchesRes, deptsRes] = await Promise.all([
          api.get('/maintenance/types'),
          api.get('/org/branches'),
          api.get('/org/departments')
        ]);

        const branchesList = branchesRes.data.data || [];
        const typesList = typesRes.data.data || [];
        const deptsList = deptsRes.data.data || [];

        setMasterData({ types: typesList, branches: branchesList, departments: deptsList });

        if (branchesList.length > 0) {
          const defaultBranch = activeBranchId
            ? branchesList.find(b => b.id === activeBranchId) || branchesList[0]
            : branchesList[0];

          setFormData(prev => ({
            ...prev,
            branchId: defaultBranch.id,
            maintenanceTypeId: typesList[0]?.id || ''
          }));
          loadBranchDepartments(defaultBranch.id, deptsList);
        }
      } catch (err) {
        console.error('Error loading master data:', err);
      } finally {
        setLoadingMasterData(false);
      }
    }
    loadMasterData();
  }, [activeBranchId]);

  const loadBranchDepartments = async (branchId, fallbackDepts = []) => {
    if (!branchId) return;
    try {
      const res = await api.get(`/org/branches/${branchId}/departments`);
      const depts = res.data.data || [];
      const finalDepts = depts.length > 0 ? depts : (fallbackDepts.length > 0 ? fallbackDepts : masterData.departments);
      setBranchDepartments(finalDepts);
      setFormData(prev => ({
        ...prev,
        departmentId: finalDepts[0]?.id || ''
      }));
    } catch {
      setBranchDepartments(masterData.departments);
    }
  };

  const handleBranchChange = (branchId) => {
    setFormData(prev => ({ ...prev, branchId }));
    loadBranchDepartments(branchId);
  };

  // Fetch Requests
  const fetchRequests = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
        view: currentView === 'all' ? undefined : currentView,
        search: searchTerm || undefined,
        priority: priorityFilter || undefined,
        maintenanceTypeId: typeFilter || undefined
      };

      if (activeBranchId) {
        params.branchId = activeBranchId;
      }

      const res = await api.get('/maintenance/requests', { params });
      const rawData = res.data?.data;
      const items = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.items) ? rawData.items : []);
      setRequests(items);
      const paginationData = rawData?.pagination || res.data?.pagination;
      if (paginationData) {
        setPagination(paginationData);
      }
    } catch (err) {
      console.error('Failed to fetch maintenance requests', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(1);
  }, [currentView, activeBranchId, priorityFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRequests(1);
  };

  const handleTabChange = (tabId) => {
    const nextParams = new URLSearchParams(searchParams);
    if (tabId === 'all') {
      nextParams.delete('view');
    } else {
      nextParams.set('view', tabId);
    }
    setSearchParams(nextParams);
  };

  const handleImageFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setSelectedImages(prev => [...prev, ...files]);
    const previews = files.map(f => ({
      name: f.name,
      url: URL.createObjectURL(f)
    }));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const removeImagePreview = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Submit Request
  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.branchId || !formData.departmentId || !formData.maintenanceTypeId || !formData.location || !formData.subject || !formData.description) {
      setFormError('Please fill in all mandatory fields: Branch, Department, Category, Location, Subject, and Description.');
      return;
    }

    setSubmitting(true);
    try {
      const body = new FormData();
      body.append('branchId', formData.branchId);
      body.append('departmentId', formData.departmentId);
      body.append('maintenanceTypeId', formData.maintenanceTypeId);
      body.append('location', formData.location);
      body.append('subject', formData.subject);
      body.append('description', formData.description);
      body.append('priority', formData.priority);
      if (formData.requesterContact) body.append('requesterContact', formData.requesterContact);
      if (formData.requiredDate) body.append('requiredDate', formData.requiredDate);

      selectedImages.forEach(file => {
        body.append('problemImages', file);
      });

      const res = await api.post('/maintenance/requests', body, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setIsModalOpen(false);
      setSelectedImages([]);
      setImagePreviews([]);
      setFormData({
        branchId: masterData.branches[0]?.id || '',
        departmentId: branchDepartments[0]?.id || '',
        maintenanceTypeId: masterData.types[0]?.id || '',
        priority: 'MEDIUM',
        location: '',
        subject: '',
        description: '',
        requesterContact: '',
        requiredDate: ''
      });

      // Navigate directly to the newly created request
      navigate(`/requests/${res.data.data.id}`);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit maintenance request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Maintenance Requests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational workflow from submission to completion, invoice, and closure.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchRequests(pagination.page)}
            className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              setIsModalOpen(true);
              setFormError('');
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-xs shadow-indigo-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* Workflow Tabs (Section 14 Spec) */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200">
        {WORKFLOW_TABS.map((tab) => {
          const currentViewParam = searchParams.get('view') || defaultView;
          const isActive = tab.id === 'all'
            ? (!currentViewParam || currentViewParam === 'all')
            : (tab.id === 'assigned'
                ? (currentViewParam === 'assigned' || currentViewParam === 'assigned_to_me')
                : (tab.id === 'pending_approval'
                    ? (currentViewParam === 'pending_approval' || currentViewParam === 'waiting_approval')
                    : currentViewParam === tab.id));

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer focus:outline-none focus:ring-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by request #, subject, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
          >
            <option value="">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
          >
            <option value="">All Categories</option>
            {masterData.types.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Request #</th>
                <th className="py-3 px-4">Problem / Issue</th>
                <th className="py-3 px-4">Branch & Dept</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading requests...
                  </td>
                </tr>
              ) : (!Array.isArray(requests) || requests.length === 0) ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No requests found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                (Array.isArray(requests) ? requests : []).map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => navigate(`/requests/${req.id}`)}
                    className="hover:bg-indigo-50/20 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <TicketBadge requestNumber={req.requestNumber} showFull={true} />
                      <span className="block text-[10px] text-slate-400 font-medium mt-1">
                        {new Date(req.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {req.subject}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{req.description}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{req.branch?.name || '-'}</div>
                      <div className="text-[11px] text-slate-400">{req.department?.name || '-'}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: req.maintenanceType?.color || '#3b82f6' }}
                        />
                        {req.maintenanceType?.name || 'General'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={req.priority} />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {req.assignedTo ? (
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {getInitials(`${req.assignedTo.firstName || ''} ${req.assignedTo.lastName || ''}`)}
                          </div>
                          <span className="font-medium truncate max-w-[120px]">
                            {`${req.assignedTo.firstName || ''} ${req.assignedTo.lastName || ''}`.trim()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <WorkStatusBadge status={req.workStatus} />
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="text-indigo-600 font-semibold group-hover:underline text-[11px] inline-flex items-center gap-1">
                        Details →
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing {requests.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => fetchRequests(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded border border-slate-200 hover:bg-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium">Page {pagination.page} of {pagination.pages || 1}</span>
            <button
              onClick={() => fetchRequests(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="p-1.5 rounded border border-slate-200 hover:bg-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= NEW MAINTENANCE REQUEST MODAL ================= */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Raise New Maintenance Request"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Branch <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.branchId}
                onChange={(e) => handleBranchChange(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
              >
                {masterData.branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
              >
                {branchDepartments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Category / Work Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.maintenanceTypeId}
                onChange={(e) => setFormData(prev => ({ ...prev, maintenanceTypeId: e.target.value }))}
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
              >
                {masterData.types.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Location in Branch <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Showroom washroom, Bay 3"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
              >
                <option value="HIGH">High (Urgent)</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Problem Title / Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Water leakage from ceiling washroom pipeline"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Problem Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="Describe the issue in detail..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          {/* Problem Images Multi-Upload (Section 5 Spec) */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <label className="block font-bold text-slate-700">
                Problem Images (Issue Proof)
              </label>
              <span className="text-[10px] text-slate-400">Multiple images supported</span>
            </div>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageFileChange}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />

            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mt-3">
                {imagePreviews.map((p, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImagePreview(idx)}
                      className="absolute top-1 right-1 p-0.5 bg-black/70 hover:bg-rose-600 text-white rounded-full transition-colors"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Expected Date (Optional)</label>
              <input
                type="date"
                value={formData.requiredDate}
                onChange={(e) => setFormData(prev => ({ ...prev, requiredDate: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Requester Contact (10 digits, Optional)</label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="9876543210"
                value={formData.requesterContact}
                onChange={(e) => setFormData(prev => ({ ...prev, requesterContact: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
