import React, { useState, useEffect } from 'react';
import {
  Layers,
  Award,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit2,
  Trash2,
  Users,
  Shield,
  ArrowUpDown,
  Building2,
  ChevronRight,
  Info,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';

export const OrganizationMastersPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('levels'); // 'levels' | 'designations'

  // Master Data States
  const [levels, setLevels] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filters for Designations
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'

  // Modal States - Level
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [levelForm, setLevelForm] = useState({
    levelNumber: 1,
    name: '',
    description: '',
    isActive: true,
  });
  const [levelSubmitting, setLevelSubmitting] = useState(false);

  // Modal States - Designation
  const [showDesigModal, setShowDesigModal] = useState(false);
  const [editingDesig, setEditingDesig] = useState(null);
  const [desigForm, setDesigForm] = useState({
    name: '',
    levelId: '',
    code: '',
    description: '',
    isActive: true,
  });
  const [desigSubmitting, setDesigSubmitting] = useState(false);

  // Delete Guard Modal
  const [deleteGuardModal, setDeleteGuardModal] = useState(null);

  const fetchMasters = async () => {
    setLoading(true);
    setError('');
    try {
      const [levelsRes, desigsRes] = await Promise.all([
        api.get('/organization-masters/levels'),
        api.get('/organization-masters/designations?limit=500'),
      ]);
      setLevels(levelsRes.data.data || []);
      setDesignations(desigsRes.data.data || []);
    } catch (err) {
      const errPayload = err.response?.data?.error;
      const errMsg = typeof errPayload === 'object'
        ? errPayload?.message || JSON.stringify(errPayload)
        : (errPayload || err.response?.data?.message || err.message || 'Failed to load organization masters');
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasters();
  }, []);

  // Quick Flash Notification
  const showToast = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // -------------------------------------------------------------
  // Level Form Handlers
  // -------------------------------------------------------------
  const handleOpenCreateLevel = () => {
    const nextNumber = levels.length > 0 ? Math.max(...levels.map((l) => l.levelNumber)) + 1 : 1;
    setEditingLevel(null);
    setLevelForm({
      levelNumber: nextNumber,
      name: '',
      description: '',
      isActive: true,
    });
    setShowLevelModal(true);
  };

  const handleOpenEditLevel = (lvl) => {
    setEditingLevel(lvl);
    setLevelForm({
      levelNumber: lvl.levelNumber,
      name: lvl.name,
      description: lvl.description || '',
      isActive: lvl.isActive,
    });
    setShowLevelModal(true);
  };

  const handleSaveLevel = async (e) => {
    e.preventDefault();
    setLevelSubmitting(true);
    setError('');
    try {
      if (editingLevel) {
        await api.put(`/organization-masters/levels/${editingLevel.id}`, {
          name: levelForm.name,
          description: levelForm.description,
          isActive: levelForm.isActive,
        });
        showToast(`Level ${editingLevel.levelNumber} updated successfully`);
      } else {
        await api.post('/organization-masters/levels', {
          levelNumber: parseInt(levelForm.levelNumber, 10),
          name: levelForm.name,
          description: levelForm.description,
        });
        showToast(`Level ${levelForm.levelNumber} created successfully`);
      }
      setShowLevelModal(false);
      fetchMasters();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save level');
    } finally {
      setLevelSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Designation Form Handlers
  // -------------------------------------------------------------
  const handleOpenCreateDesig = () => {
    setEditingDesig(null);
    setDesigForm({
      name: '',
      levelId: levels.length > 0 ? levels[0].id : '',
      code: '',
      description: '',
      isActive: true,
    });
    setShowDesigModal(true);
  };

  const handleOpenEditDesig = (desig) => {
    setEditingDesig(desig);
    setDesigForm({
      name: desig.name,
      levelId: desig.levelId,
      code: desig.code || '',
      description: desig.description || '',
      isActive: desig.isActive,
    });
    setShowDesigModal(true);
  };

  const handleSaveDesignation = async (e) => {
    e.preventDefault();
    setDesigSubmitting(true);
    setError('');
    try {
      if (editingDesig) {
        await api.put(`/organization-masters/designations/${editingDesig.id}`, {
          levelId: desigForm.levelId,
          name: desigForm.name,
          code: desigForm.code,
          description: desigForm.description,
          isActive: desigForm.isActive,
        });
        showToast(`Designation '${desigForm.name}' updated successfully`);
      } else {
        await api.post('/organization-masters/designations', {
          levelId: desigForm.levelId,
          name: desigForm.name,
          code: desigForm.code,
          description: desigForm.description,
        });
        showToast(`Designation '${desigForm.name}' created successfully`);
      }
      setShowDesigModal(false);
      fetchMasters();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save designation');
    } finally {
      setDesigSubmitting(false);
    }
  };

  const handleToggleDesigStatus = async (desig) => {
    try {
      await api.put(`/organization-masters/designations/${desig.id}`, {
        isActive: !desig.isActive,
      });
      showToast(`Designation marked ${!desig.isActive ? 'Active' : 'Inactive'}`);
      fetchMasters();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDeleteDesigClick = (desig) => {
    const assignedCount = desig._count?.employees || 0;
    if (assignedCount > 0) {
      // Show guard modal advising deactivation
      setDeleteGuardModal({
        desig,
        assignedCount,
      });
    } else {
      if (window.confirm(`Are you sure you want to permanently delete '${desig.name}'?`)) {
        confirmDeleteDesig(desig.id);
      }
    }
  };

  const confirmDeleteDesig = async (id) => {
    try {
      await api.delete(`/organization-masters/designations/${id}`);
      showToast('Designation deleted successfully');
      setDeleteGuardModal(null);
      fetchMasters();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete designation');
    }
  };

  // Filtered Designations
  const filteredDesignations = designations.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.code && d.code.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLevel = !selectedLevelFilter || d.levelId === selectedLevelFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && d.isActive) ||
      (statusFilter === 'INACTIVE' && !d.isActive);
    return matchesSearch && matchesLevel && matchesStatus;
  });

  // Calculate stats
  const totalEmployeesInLevels = levels.reduce((sum, l) => sum + (l._count?.employees || 0), 0);
  const activeLevelsCount = levels.filter((l) => l.isActive).length;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl shadow-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl shadow-xs flex items-center justify-between gap-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="text-sm font-medium">{typeof error === 'object' ? error?.message || JSON.stringify(error) : error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700 text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Organization Masters
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              {user?.tenant ? user.tenant.organizationName : 'Multi-Tenant'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure dealership hierarchy, 10-tier organizational levels, designations, and role taxonomy
          </p>
        </div>

        {user?.role === 'HR' && (
          <div className="flex items-center gap-2">
            {activeTab === 'levels' ? (
              <Button size="sm" variant="primary" icon={Plus} onClick={handleOpenCreateLevel}>
                Add Level
              </Button>
            ) : (
              <Button size="sm" variant="primary" icon={Plus} onClick={handleOpenCreateDesig}>
                Add Designation
              </Button>
            )}
          </div>
        )}
      </div>

      {/* High-Level Master Overview KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block">Configured Levels</span>
            <span className="text-lg font-bold text-slate-900">
              {levels.length} <span className="text-xs font-normal text-slate-400">({activeLevelsCount} active)</span>
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block">Total Designations</span>
            <span className="text-lg font-bold text-slate-900">{designations.length}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block">Employees Mapped</span>
            <span className="text-lg font-bold text-slate-900">{totalEmployeesInLevels}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block">Tenant Security</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
              Strictly Isolated
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('levels')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeTab === 'levels'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            Employee Levels
            <span className="ml-1.5 py-0.5 px-2 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {levels.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('designations')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeTab === 'designations'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Award className="w-4 h-4" />
            Designation Master
            <span className="ml-1.5 py-0.5 px-2 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
              {designations.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Tab 1: Employee Levels */}
      {activeTab === 'levels' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-800 text-sm">Organizational Level Hierarchy</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Used by Claims & Expenses policies, travel eligibility, and leadership hierarchy
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200/60 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Category / Level Name</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-center">Designations</th>
                    <th className="py-3 px-4 text-center">Assigned Employees</th>
                    <th className="py-3 px-4">Status</th>
                    {user?.role === 'HR' && <th className="py-3 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {levels.map((lvl) => {
                    const desigCount = lvl._count?.designations || 0;
                    const empCount = lvl._count?.employees || 0;

                    return (
                      <tr key={lvl.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                              lvl.levelNumber >= 8
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : lvl.levelNumber >= 5
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : 'bg-slate-100 text-slate-800 border border-slate-200'
                            }`}
                          >
                            Level {lvl.levelNumber}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                          {lvl.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                          {lvl.description || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedLevelFilter(lvl.id);
                              setActiveTab('designations');
                            }}
                            className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 hover:underline text-xs"
                          >
                            <span>{desigCount}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-center font-medium text-slate-700">
                          {empCount}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <Badge variant={lvl.isActive ? 'success' : 'neutral'}>
                            {lvl.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        {user?.role === 'HR' && (
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleOpenEditLevel(lvl)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                              title="Edit Level"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Designation Master */}
      {activeTab === 'designations' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search designation name or code..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={selectedLevelFilter}
                onChange={(e) => setSelectedLevelFilter(e.target.value)}
                className="w-full md:w-48 px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">All Levels ({levels.length})</option>
                {levels.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    Level {lvl.levelNumber} - {lvl.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-32 px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Table of Designations */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing <strong className="text-slate-800">{filteredDesignations.length}</strong> of{' '}
                <strong className="text-slate-800">{designations.length}</strong> designations
              </span>
              {selectedLevelFilter && (
                <button
                  onClick={() => setSelectedLevelFilter('')}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  Clear Level Filter
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200/60 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Designation Name</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4 text-center">Employees</th>
                    <th className="py-3 px-4">Status</th>
                    {user?.role === 'HR' && <th className="py-3 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredDesignations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400">
                        No designations matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredDesignations.map((desig) => {
                      const empCount = desig._count?.employees || 0;

                      return (
                        <tr key={desig.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                            {desig.name}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              Level {desig.level?.levelNumber} • {desig.level?.name}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                            {desig.code || '—'}
                          </td>
                          <td className="py-3.5 px-4 text-center font-medium text-slate-700">
                            {empCount > 0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                {empCount}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">0</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <Badge variant={desig.isActive ? 'success' : 'neutral'}>
                              {desig.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          {user?.role === 'HR' && (
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleToggleDesigStatus(desig)}
                                  className={`p-1.5 rounded-md transition-colors ${
                                    desig.isActive
                                      ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                      : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                  }`}
                                  title={desig.isActive ? 'Deactivate Designation' : 'Activate Designation'}
                                >
                                  {desig.isActive ? (
                                    <XCircle className="w-4 h-4" />
                                  ) : (
                                    <CheckCircle2 className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleOpenEditDesig(desig)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                                  title="Edit Designation"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDesigClick(desig)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                                  title="Delete Designation"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Level Modal */}
      <Modal
        isOpen={showLevelModal}
        onClose={() => setShowLevelModal(false)}
        title={editingLevel ? `Edit Level ${editingLevel.levelNumber}` : 'Create Employee Level'}
      >
        <form onSubmit={handleSaveLevel} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Level Number *</label>
            <input
              type="number"
              required
              disabled={Boolean(editingLevel)}
              min={1}
              max={20}
              value={levelForm.levelNumber}
              onChange={(e) => setLevelForm({ ...levelForm, levelNumber: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Level Category / Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Middle Management, Top Management, Staff"
              value={levelForm.name}
              onChange={(e) => setLevelForm({ ...levelForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Responsibilities, seniority band, policy eligibility"
              value={levelForm.description}
              onChange={(e) => setLevelForm({ ...levelForm, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          {editingLevel && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="lvl-active"
                checked={levelForm.isActive}
                onChange={(e) => setLevelForm({ ...levelForm, isActive: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <label htmlFor="lvl-active" className="text-sm font-medium text-slate-700">
                Active Level
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button size="sm" variant="outline" onClick={() => setShowLevelModal(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" loading={levelSubmitting}>
              {editingLevel ? 'Save Changes' : 'Create Level'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Designation Modal */}
      <Modal
        isOpen={showDesigModal}
        onClose={() => setShowDesigModal(false)}
        title={editingDesig ? `Edit Designation: ${editingDesig.name}` : 'Create New Designation'}
      >
        <form onSubmit={handleSaveDesignation} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Designation Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Branch Manager, Technician, Service Head"
              value={desigForm.name}
              onChange={(e) => setDesigForm({ ...desigForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Level *</label>
            <select
              required
              value={desigForm.levelId}
              onChange={(e) => setDesigForm({ ...desigForm, levelId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            >
              <option value="">Select Level</option>
              {levels.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  Level {lvl.levelNumber} - {lvl.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Code (Optional)</label>
              <input
                type="text"
                placeholder="e.g. BLD-L5-02"
                value={desigForm.code}
                onChange={(e) => setDesigForm({ ...desigForm, code: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <div className="flex items-center h-10">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={desigForm.isActive}
                    onChange={(e) => setDesigForm({ ...desigForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span>Active Designation</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Notes</label>
            <textarea
              rows={2}
              placeholder="Departmental context or functional scope"
              value={desigForm.description}
              onChange={(e) => setDesigForm({ ...desigForm, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button size="sm" variant="outline" onClick={() => setShowDesigModal(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" loading={desigSubmitting}>
              {editingDesig ? 'Save Designation' : 'Create Designation'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Guard Modal (When Employees are Assigned) */}
      <Modal
        isOpen={Boolean(deleteGuardModal)}
        onClose={() => setDeleteGuardModal(null)}
        title="Deletion Blocked: Active Employee Records"
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-800 leading-relaxed">
              <strong className="font-semibold block mb-1">Historical Record Protection</strong>
              Cannot delete designation{' '}
              <span className="font-bold underline">{deleteGuardModal?.desig?.name}</span> because it is
              currently linked to{' '}
              <strong className="font-bold">{deleteGuardModal?.assignedCount} active/historical employee record(s)</strong>.
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600">
            To prevent orphaned records and audit inconsistencies, please{' '}
            <strong>deactivate</strong> this designation instead. Deactivated designations will remain visible on
            existing employee profiles and historical payrolls, but cannot be assigned to new hires.
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button size="sm" variant="outline" onClick={() => setDeleteGuardModal(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                if (deleteGuardModal?.desig) {
                  handleToggleDesigStatus(deleteGuardModal.desig);
                  setDeleteGuardModal(null);
                }
              }}
            >
              Deactivate Designation Instead
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrganizationMastersPage;
