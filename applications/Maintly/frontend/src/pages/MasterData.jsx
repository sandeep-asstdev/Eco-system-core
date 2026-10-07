import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../components/Modal.jsx';
import { Settings2, Plus, Building, Layers, CheckCircle, ArrowUpDown } from 'lucide-react';

export default function MasterData() {
  const { role } = useAuth();
  const [types, setTypes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Type Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [typeForm, setTypeForm] = useState({ name: '', code: '', color: '#4f46e5', icon: 'Wrench', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [tRes, bRes, dRes] = await Promise.all([
        api.get('/maintenance/types'),
        api.get('/org/branches'),
        api.get('/org/departments')
      ]);
      setTypes(tRes.data.data || []);
      setBranches(bRes.data.data || []);
      setDepartments(dRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateType = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/maintenance/types', typeForm);
      setIsModalOpen(false);
      setTypeForm({ name: '', code: '', color: '#4f46e5', icon: 'Wrench', description: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create maintenance type.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Master Data Configuration</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configurable maintenance work types, facility branch directory, and organizational departments
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Maintenance Type
        </button>
      </div>

      {/* 1. Maintenance Types */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Work Categories (Configurable Master Data)
          </h2>
          <span className="text-[11px] text-slate-400">{types.length} Defined Categories</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Order</th>
                <th className="py-2.5 px-4">Category Name</th>
                <th className="py-2.5 px-4">System Code</th>
                <th className="py-2.5 px-4">Color Palette</th>
                <th className="py-2.5 px-4">Description</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {types.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-400">#{t.sortOrder}</td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: t.color || '#4f46e5' }} />
                      <span className="font-bold text-slate-900">{t.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[11px] font-semibold text-indigo-700">{t.code}</td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">{t.color}</td>
                  <td className="py-2.5 px-4 text-slate-600 max-w-sm truncate">{t.description || '—'}</td>
                  <td className="py-2.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Branches & Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Branches */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-400" />
              <span>Company Branches ({branches.length})</span>
            </h3>
          </div>
          <div className="mt-4 space-y-2.5">
            {branches.map(b => (
              <div key={b.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{b.name}</div>
                  <div className="text-[11px] text-slate-500">{b.city}, {b.state} • {b.address}</div>
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  {b.code}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Departments */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Departments ({departments.length})</span>
            </h3>
          </div>
          <div className="mt-4 space-y-2.5">
            {departments.map(d => (
              <div key={d.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{d.name}</div>
                  <div className="text-[11px] text-slate-500">{d.description || 'Operations unit'}</div>
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                  {d.code}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CREATE TYPE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Configurable Maintenance Type"
      >
        <form onSubmit={handleCreateType} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Type Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Glass & Glazing, HVAC Ducting, Fleet Charging"
              value={typeForm.name}
              onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Code (Unique) *</label>
              <input
                type="text"
                required
                placeholder="e.g. GLASS, HVAC, FLEET"
                value={typeForm.code}
                onChange={(e) => setTypeForm({ ...typeForm, code: e.target.value.toUpperCase() })}
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Color Palette (HEX)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={typeForm.color}
                  onChange={(e) => setTypeForm({ ...typeForm, color: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={typeForm.color}
                  onChange={(e) => setTypeForm({ ...typeForm, color: e.target.value })}
                  className="flex-1 p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Scope of work falling under this category..."
              value={typeForm.description}
              onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {error && <div className="p-2 bg-rose-50 text-rose-700 rounded">{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 text-white bg-indigo-600 hover:bg-indigo-700 font-semibold rounded-lg shadow-sm"
            >
              {submitting ? 'Creating...' : 'Create Type'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
