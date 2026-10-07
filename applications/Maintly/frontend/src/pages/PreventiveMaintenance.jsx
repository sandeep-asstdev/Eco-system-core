import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Calendar, CheckSquare, Clock, Plus, Search, AlertTriangle, CheckCircle2,
  X, Camera, FileText, ChevronRight, Wrench, Box, User, ArrowRight
} from 'lucide-react';

export default function PreventiveMaintenance({ initialTab }) {
  const { role, activeBranchId, branches } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab || 'upcoming'); // 'plans', 'upcoming', 'history'
  const [plans, setPlans] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [activeInspection, setActiveInspection] = useState(null);

  // Execution form state
  const [inspectionForm, setInspectionForm] = useState({
    checklistResults: {},
    remarks: '',
    signOffName: '',
    evidencePhotoUrl: ''
  });

  const [newPlan, setNewPlan] = useState({
    branchId: activeBranchId || (branches[0]?.id || ''),
    title: '',
    category: 'Hydraulic Lift',
    triggerType: 'FREQUENCY',
    frequencyDays: 30,
    nextDueDate: '',
    priority: 'MEDIUM',
    description: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeBranchId) params.branchId = activeBranchId;

      const [plansRes, upcomingRes] = await Promise.all([
        api.get('/pm/plans', { params }),
        api.get('/pm/upcoming', { params: { ...params, days: 60 } })
      ]);
      setPlans(plansRes.data.data || []);
      setUpcoming(upcomingRes.data.data || []);
    } catch (err) {
      console.error('Failed to load PM data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeBranchId]);

  const handleOpenInspection = (inspection) => {
    setActiveInspection(inspection);
    // Initialize results map with template defaults
    const initial = {};
    const template = inspection.plan?.checklistTemplate || [];
    template.forEach((item) => {
      initial[item.id] = {
        passed: item.type === 'CHECKBOX' ? false : true,
        value: item.type === 'NUMERIC' ? (item.min || 0) : null,
        notes: ''
      };
    });
    setInspectionForm({
      checklistResults: initial,
      remarks: '',
      signOffName: '',
      evidencePhotoUrl: ''
    });
    setShowInspectionModal(true);
  };

  const handleSubmitInspection = async (e) => {
    e.preventDefault();
    if (!activeInspection) return;

    try {
      await api.post(`/pm/inspections/${activeInspection.id}/execute`, inspectionForm);
      setShowInspectionModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit inspection');
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pm/plans', newPlan);
      setShowPlanModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create PM plan');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Preventive Maintenance Engine</span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">PM Plans & Inspections</h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated recurring service schedules, compliance tracking, and technician inspection signoffs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {(role === 'PLATFORM_ADMIN' || role === 'TENANT_ADMIN' || role === 'MANAGER') && (
            <button
              onClick={() => setShowPlanModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create PM Plan</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'upcoming'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Upcoming Inspections ({upcoming.length})
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'plans'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Maintenance Plans ({plans.length})
        </button>
      </div>

      {/* TAB 1: Upcoming Inspections */}
      {activeTab === 'upcoming' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Inspection Schedule</span>
            <span className="text-[11px] text-slate-400">Missed inspections automatically appear overdue</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading schedules...</div>
          ) : upcoming.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No scheduled PM inspections due.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcoming.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        item.isOverdue ? 'bg-rose-100 text-rose-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {item.isOverdue ? `OVERDUE (${item.daysOverdue}d)` : 'SCHEDULED'}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-900">{item.asset?.assetCode}</span>
                      <span className="text-xs text-slate-500">• {item.branch?.name}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800">{item.plan?.title}</h3>
                    <p className="text-xs text-slate-500">
                      Asset: <span className="font-semibold text-slate-700">{item.asset?.name}</span> ({item.asset?.location}) • Scheduled: {new Date(item.scheduledDate).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenInspection(item)}
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Execute Checklist →</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Maintenance Plans */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div key={p.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    Every {p.frequencyDays} Days
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">{p.category}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2">{p.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>

                <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Target Equipment:</span>
                    <span className="font-semibold text-slate-900">{p.asset?.name || 'Category Wide'}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Next Due Date:</span>
                    <span className={`font-bold ${p.isOverdue ? 'text-rose-600' : 'text-slate-900'}`}>
                      {new Date(p.nextDueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Checklist Items:</span>
                    <span className="font-semibold text-slate-900">{p.checklistTemplate?.length || 0} checks</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Branch: {p.branch?.name}</span>
                <span className="font-bold text-indigo-600">{p.executions?.length || 0} historical runs</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Execute PM Inspection Checklist */}
      {showInspectionModal && activeInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600">{activeInspection.asset?.assetCode}</span>
                <h3 className="text-sm font-bold text-slate-900">{activeInspection.plan?.title}</h3>
              </div>
              <button onClick={() => setShowInspectionModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitInspection} className="p-6 overflow-y-auto space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Standard Inspection Checklist
              </span>

              {/* Checklist items list */}
              <div className="space-y-3">
                {(activeInspection.plan?.checklistTemplate || []).map((item) => {
                  const state = inspectionForm.checklistResults[item.id] || {};
                  return (
                    <div key={item.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-semibold text-slate-800">{item.text}</span>
                        {item.type === 'CHECKBOX' ? (
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={state.passed || false}
                              onChange={(e) => {
                                setInspectionForm(prev => ({
                                  ...prev,
                                  checklistResults: {
                                    ...prev.checklistResults,
                                    [item.id]: { ...state, passed: e.target.checked }
                                  }
                                }));
                              }}
                              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <span className="text-[11px] font-bold text-slate-600">Pass</span>
                          </label>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="0.1"
                              value={state.value || ''}
                              onChange={(e) => {
                                setInspectionForm(prev => ({
                                  ...prev,
                                  checklistResults: {
                                    ...prev.checklistResults,
                                    [item.id]: { ...state, value: parseFloat(e.target.value) }
                                  }
                                }));
                              }}
                              placeholder={item.unit || 'Reading'}
                              className="w-24 text-xs px-2 py-1 border border-slate-300 rounded-lg bg-white"
                            />
                            <span className="text-xs text-slate-500">{item.unit}</span>
                          </div>
                        )}
                      </div>

                      <input
                        type="text"
                        placeholder="Observations / notes (optional)"
                        value={state.notes || ''}
                        onChange={(e) => {
                          setInspectionForm(prev => ({
                            ...prev,
                            checklistResults: {
                              ...prev.checklistResults,
                              [item.id]: { ...state, notes: e.target.value }
                            }
                          }));
                        }}
                        className="w-full text-[11px] px-2.5 py-1 bg-white border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Technician Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Overall Inspection Remarks *</label>
                <textarea
                  required
                  rows={2}
                  value={inspectionForm.remarks}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, remarks: e.target.value })}
                  placeholder="e.g. Completed periodic inspection. All hydraulic seals in optimal condition; minor surface oil cleaned."
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Sign-off Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Technician Sign-off Name *</label>
                <input
                  type="text"
                  required
                  value={inspectionForm.signOffName}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, signOffName: e.target.value })}
                  placeholder="e.g. Ramesh Kumar (Technician ID #401)"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowInspectionModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Submit Inspection & Sign-off ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Create New PM Plan */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">Configure Preventive Maintenance Plan</h3>
              <button onClick={() => setShowPlanModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Plan Title *</label>
                <input
                  type="text"
                  required
                  value={newPlan.title}
                  onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                  placeholder="e.g. Monthly 2-Post Lift Mechanical Service"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Equipment Category *</label>
                  <select
                    value={newPlan.category}
                    onChange={(e) => setNewPlan({ ...newPlan, category: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="Hydraulic Lift">Hydraulic Lift</option>
                    <option value="Wheel Aligner">Wheel Aligner</option>
                    <option value="Air Compressor">Air Compressor</option>
                    <option value="Paint Booth">Paint Booth</option>
                    <option value="Generator">Generator</option>
                    <option value="Car Washer">Car Washer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Frequency (Days) *</label>
                  <input
                    type="number"
                    required
                    value={newPlan.frequencyDays}
                    onChange={(e) => setNewPlan({ ...newPlan, frequencyDays: parseInt(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">First Scheduled Date *</label>
                  <input
                    type="date"
                    required
                    value={newPlan.nextDueDate}
                    onChange={(e) => setNewPlan({ ...newPlan, nextDueDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Branch *</label>
                  <select
                    value={newPlan.branchId}
                    onChange={(e) => setNewPlan({ ...newPlan, branchId: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  placeholder="Standard operating procedure summary..."
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Create Plan & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
