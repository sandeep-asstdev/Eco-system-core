import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Building2,
  CheckCircle,
  PauseCircle,
  PlayCircle,
  BarChart2,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

export const VacancyListPage = () => {
  const { user } = useAuth();
  const [positions, setPositions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeTab, setActiveTab] = useState('positions'); // 'positions' | 'budgets'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  // Create Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    department: 'Sales',
    branchId: user?.branchId || '',
    requiredCount: 1,
    reasonForOpening: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [posRes, budRes, brRes] = await Promise.all([
        api.get('/vacancies/positions', {
          params: {
            status: statusFilter || undefined,
            branchIdQuery: branchFilter || undefined,
            search: searchTerm || undefined,
          },
        }),
        api.get('/vacancies/budgets'),
        api.get('/branches'),
      ]);
      setPositions(posRes.data.data);
      setBudgets(budRes.data.data);
      setBranches(brRes.data.data);
    } catch (err) {
      console.error('Failed to load vacancies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, branchFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleCreatePosition = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.post('/vacancies/positions', createForm);
      setShowCreateModal(false);
      setCreateForm({
        title: '',
        department: 'Sales',
        branchId: user?.branchId || '',
        requiredCount: 1,
        reasonForOpening: '',
      });
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to create position requisition');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (positionId, newStatus) => {
    try {
      await api.patch(`/vacancies/positions/${positionId}/status`, {
        status: newStatus,
        reason: `Status changed to ${newStatus} by ${user.role}`,
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update position status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Vacancy Master & Manpower
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage open requisitions, approvals, position holds, and manpower budgets
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user?.role !== 'EMPLOYEE' && (
            <Button
              size="sm"
              variant="primary"
              icon={Plus}
              onClick={() => {
                setCreateForm((prev) => ({ ...prev, branchId: user.branchId || branches[0]?.id || '' }));
                setShowCreateModal(true);
              }}
            >
              Requisition Position
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('positions')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
            activeTab === 'positions'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Positions ({positions.length})
        </button>
        <button
          onClick={() => setActiveTab('budgets')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'budgets'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Manpower Budget vs Actual ({budgets.length})
        </button>
      </div>

      {activeTab === 'positions' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search position title or code..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </form>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="FILLED">Filled</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="CLOSED">Closed</option>
              </select>

              {user?.role === 'HR' && (
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">All Branches</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Positions Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Position Title & Code</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Required</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {positions.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12">
                        <EmptyState
                          icon={Briefcase}
                          title="No positions found"
                          description="Try clearing your search or status filters."
                        />
                      </td>
                    </tr>
                  ) : (
                    positions.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{p.title}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400">{p.positionCode}</span>
                            {p.sourceResignationId && (
                              <span className="text-[9px] font-semibold bg-amber-100 text-amber-800 px-1 py-0.2 rounded">
                                Replacement Auto-Vacancy
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">{p.branch?.name}</td>
                        <td className="py-3 px-4 text-slate-600">{p.department}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{p.requiredCount}</td>
                        <td className="py-3 px-4">
                          <Badge status={p.status} />
                        </td>
                        <td className="py-3 px-4 text-slate-500">{formatDate(p.createdAt)}</td>
                        <td className="py-3 px-4 text-right">
                          {user?.role !== 'EMPLOYEE' && (
                            <div className="inline-flex items-center gap-1">
                              {p.status === 'OPEN' && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(p.id, 'ON_HOLD')}
                                  title="Put on Hold"
                                  className="p-1 rounded text-amber-600 hover:bg-amber-50"
                                >
                                  <PauseCircle className="w-4 h-4" />
                                </button>
                              )}
                              {p.status === 'ON_HOLD' && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(p.id, 'OPEN')}
                                  title="Reopen Vacancy"
                                  className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                                >
                                  <PlayCircle className="w-4 h-4" />
                                </button>
                              )}
                              {user?.role === 'HR' && p.status !== 'CLOSED' && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(p.id, 'CLOSED')}
                                  title="Close Vacancy"
                                  className="p-1 rounded text-slate-400 hover:bg-slate-100"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Manpower Budget Tab */}
      {activeTab === 'budgets' && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Departmental Manpower Variance Table
              </h2>
              <p className="text-xs text-slate-500">Sanctioned headcount limit vs live active staff</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
              FY 2026-2027
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Sanctioned Limit</th>
                  <th className="py-3 px-4">Active Staff</th>
                  <th className="py-3 px-4">Open Requisitions</th>
                  <th className="py-3 px-4">Budget Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {budgets.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-slate-900">{b.branch?.name}</td>
                    <td className="py-3 px-4 text-slate-700">{b.department}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{b.sanctionedPositions}</td>
                    <td className="py-3 px-4 text-emerald-700 font-semibold">{b.activeEmployees}</td>
                    <td className="py-3 px-4 text-blue-700 font-semibold">{b.openPositions}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${
                              b.utilizationPercent > 90
                                ? 'bg-rose-500'
                                : b.utilizationPercent > 70
                                ? 'bg-indigo-600'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, b.utilizationPercent)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-slate-700">{b.utilizationPercent}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Requisition */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Requisition New Position"
      >
        <form onSubmit={handleCreatePosition} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Position Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Sales Consultant — New Cars / Service Advisor"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department *</label>
              <select
                value={createForm.department}
                onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Sales">Sales</option>
                <option value="Service">Service</option>
                <option value="Spares">Spare Parts</option>
                <option value="Bodyshop">Bodyshop & Paint</option>
                <option value="CRM">Customer Relations (CRM)</option>
                <option value="Accounts">Accounts & Finance</option>
                <option value="PDI">PDI & Accessories</option>
                <option value="HR & Admin">HR & Dealership Admin</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Branch *</label>
              <select
                disabled={user?.role === 'BM'}
                value={createForm.branchId}
                onChange={(e) => setCreateForm({ ...createForm, branchId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-100"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Required Headcount</label>
            <input
              type="number"
              min="1"
              max="50"
              value={createForm.requiredCount}
              onChange={(e) => setCreateForm({ ...createForm, requiredCount: parseInt(e.target.value) })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason for Opening</label>
            <textarea
              rows="3"
              placeholder="e.g. Expansion of platform core team or replacement requirement"
              value={createForm.reasonForOpening}
              onChange={(e) => setCreateForm({ ...createForm, reasonForOpening: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button size="sm" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" loading={submitting}>
              Create Position
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VacancyListPage;
