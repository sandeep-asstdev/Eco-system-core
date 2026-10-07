import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Plus, Wrench, X, AlertTriangle, Image as ImageIcon
} from 'lucide-react';

export default function QuickActionModal({ isOpen, onClose }) {
  const { user, role, activeBranchId, branches } = useAuth();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form state for New Maintenance Request
  const [formData, setFormData] = useState({
    branchId: activeBranchId || (branches[0]?.id || ''),
    departmentId: '',
    maintenanceTypeId: '',
    location: '',
    subject: '',
    description: '',
    priority: 'MEDIUM',
    requiredDate: '',
    requesterContact: ''
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [masterData, setMasterData] = useState({
    departments: [],
    types: []
  });

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSelectedImages([]);
      setImagePreviews([]);
      loadMasterData();
    }
  }, [isOpen, activeBranchId]);

  const loadMasterData = async () => {
    try {
      const [deptRes, typesRes] = await Promise.all([
        api.get('/org/departments'),
        api.get('/maintenance/types')
      ]);
      const depts = deptRes.data.data || [];
      const types = typesRes.data.data || [];

      setMasterData({
        departments: depts,
        types: types
      });

      setFormData(prev => ({
        ...prev,
        branchId: activeBranchId || (branches[0]?.id || ''),
        departmentId: prev.departmentId || (depts[0]?.id || ''),
        maintenanceTypeId: prev.maintenanceTypeId || (types[0]?.id || '')
      }));
    } catch (err) {
      console.error('Master data load failed', err);
    }
  };

  if (!isOpen) return null;

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

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!formData.branchId || !formData.departmentId || !formData.maintenanceTypeId || !formData.location || !formData.subject || !formData.description) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const body = new FormData();
      body.append('branchId', formData.branchId);
      body.append('departmentId', formData.departmentId);
      body.append('maintenanceTypeId', formData.maintenanceTypeId);
      body.append('location', formData.location);
      body.append('subject', formData.subject);
      body.append('description', formData.description);
      body.append('priority', formData.priority);
      if (formData.requiredDate) body.append('requiredDate', formData.requiredDate);
      if (formData.requesterContact) body.append('requesterContact', formData.requesterContact);

      selectedImages.forEach(file => {
        body.append('problemImages', file);
      });

      const res = await api.post('/maintenance/requests', body, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onClose();
      navigate(`/requests/${res.data.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit maintenance request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Raise Maintenance Request
              </h2>
              <span className="text-[11px] text-slate-500">
                Log a maintenance issue with photo evidence
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Request Form */}
        <form onSubmit={handleSubmitRequest} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Branch <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.branchId}
                onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                required
              >
                {branches.map(b => (
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
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                required
              >
                {masterData.departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Category / Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.maintenanceTypeId}
                onChange={(e) => setFormData({ ...formData, maintenanceTypeId: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                required
              >
                {masterData.types.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Priority <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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
              Location in Facility <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Showroom Washroom, Bay 2, Customer Lounge"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Problem Title / Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Water leakage from washroom ceiling"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Problem Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Detailed description of the issue..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
              required
            />
          </div>

          {/* Problem Images Multi-Upload */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="block font-bold text-slate-700">
                Problem Images (Issue Proof)
              </label>
              <span className="text-[10px] text-slate-400">Multiple supported</span>
            </div>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageFileChange}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />

            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2.5">
                {imagePreviews.map((p, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImagePreview(idx)}
                      className="absolute top-1 right-1 p-0.5 bg-black/70 hover:bg-rose-600 text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
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
      </div>
    </div>
  );
}
