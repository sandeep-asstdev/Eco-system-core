import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  ShieldCheck, Plus, CheckCircle2, AlertTriangle, Edit2, Trash2, X,
  Layers, ArrowRight, DollarSign, Clock, Users
} from 'lucide-react';

export default function ApprovalMatrix() {
  const { role } = useAuth();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    ruleType: 'COST_THRESHOLD',
    minAmount: '',
    maxAmount: '',
    approverRole: 'MAINTENANCE_MANAGER',
    priorityEscalation: false,
    orderIndex: 0
  });

  const approverRoles = [
    { value: 'MAINTENANCE_MANAGER', label: 'Maintenance Manager' },
    { value: 'BRANCH_MANAGER', label: 'Branch Manager' },
    { value: 'PURCHASE_MANAGER', label: 'Purchase Manager' },
    { value: 'FINANCE', label: 'Finance Controller' },
    { value: 'REGIONAL_MANAGER', label: 'Regional Operations Manager' },
    { value: 'MANAGEMENT', label: 'Executive Management / Director' }
  ];

  const ruleTypes = [
    { value: 'COST_THRESHOLD', label: 'Cost Amount Threshold (< X, X-Y, > Y)' },
    { value: 'EMERGENCY_REQUEST', label: 'Emergency Breakdown Request' },
    { value: 'PURCHASE_REQUEST', label: 'Purchase Requisition Signoff' },
    { value: 'ASSET_REPLACEMENT', label: 'Capital Asset Replacement' },
    { value: 'VENDOR_WORK', label: 'Third-Party Vendor Contractor' }
  ];

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await api.get('/approvals/rules');
      setRules(res.data.data || []);
    } catch (err) {
      console.error('Failed to load approval rules', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleOpenAdd = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      ruleType: 'COST_THRESHOLD',
      minAmount: '',
      maxAmount: '',
      approverRole: 'MAINTENANCE_MANAGER',
      priorityEscalation: false,
      orderIndex: rules.length + 1
    });
    setShowModal(true);
  };

  const handleOpenEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      ruleType: rule.ruleType,
      minAmount: rule.minAmount !== null ? rule.minAmount : '',
      maxAmount: rule.maxAmount !== null ? rule.maxAmount : '',
      approverRole: rule.approverRole,
      priorityEscalation: rule.priorityEscalation,
      orderIndex: rule.orderIndex
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingRule) {
        await api.put(`/approvals/rules/${editingRule.id}`, formData);
      } else {
        await api.post('/approvals/rules', formData);
      }
      setShowModal(false);
      fetchRules();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save approval rule');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this approval matrix rule?')) return;
    try {
      await api.delete(`/approvals/rules/${id}`);
      fetchRules();
    } catch (err) {
      alert('Failed to delete rule');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Administration & Governance</span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">Approval Matrix Rules</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure dynamic approval authority based on repair cost thresholds, emergency status, vendor work, or equipment replacement.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Approval Rule</span>
        </button>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">
            Active Approval Rules ({rules.length})
          </span>
          <span className="text-[11px] text-slate-400">
            Rules are evaluated in sequential order during request triage
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading approval matrix...</div>
        ) : rules.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No approval rules configured.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Rule Name</th>
                  <th className="py-3 px-4">Condition Type</th>
                  <th className="py-3 px-4">Threshold Range</th>
                  <th className="py-3 px-4">Authorized Approver</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">#{rule.orderIndex}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{rule.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-semibold text-[10px]">
                        {rule.ruleType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {rule.ruleType === 'COST_THRESHOLD' ? (
                        <span>
                          {rule.minAmount !== null ? `₹${rule.minAmount.toLocaleString('en-IN')}` : '₹0'}
                          {' — '}
                          {rule.maxAmount !== null ? `₹${rule.maxAmount.toLocaleString('en-IN')}` : 'No Limit'}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Criteria Based</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-indigo-600">
                      {approverRoles.find(r => r.value === rule.approverRole)?.label || rule.approverRole}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(rule)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Add/Edit Rule */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">
                {editingRule ? 'Edit Approval Rule' : 'Add Approval Rule'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rule Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Major Repairs Over ₹25,000"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Condition Trigger *</label>
                <select
                  value={formData.ruleType}
                  onChange={(e) => setFormData({ ...formData, ruleType: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  {ruleTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {formData.ruleType === 'COST_THRESHOLD' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Min Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.minAmount}
                      onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                      placeholder="0"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Max Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.maxAmount}
                      onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                      placeholder="e.g. 25000"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Required Approver Role *</label>
                <select
                  value={formData.approverRole}
                  onChange={(e) => setFormData({ ...formData, approverRole: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  {approverRoles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
