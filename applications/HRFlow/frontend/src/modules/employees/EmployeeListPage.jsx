import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Building2,
  Phone,
  Mail,
  ArrowRight,
  Filter,
  LayoutList,
  LayoutGrid,
  Download,
  ExternalLink,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

export const EmployeeListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [levels, setLevels] = useState([]);
  const [allDesignations, setAllDesignations] = useState([]);
  const [potentialManagers, setPotentialManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Views
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  // Add Employee Modal (HR Only)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmp, setNewEmp] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'Male',
    dob: '',
    branchId: '',
    department: 'Sales',
    levelId: '',
    designationId: '',
    designation: '',
    reportingManagerId: '',
    dateOfJoining: '',
    employmentType: 'FULL_TIME',
    basic: 35000,
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const [empRes, brRes, lvlRes, desigRes] = await Promise.all([
        api.get('/employees', {
          params: {
            search: searchTerm || undefined,
            status: statusFilter || undefined,
            branchId: branchFilter || undefined,
            department: deptFilter || undefined,
          },
        }),
        api.get('/branches'),
        api.get('/organization-masters/levels'),
        api.get('/organization-masters/designations?limit=500&isActive=true'),
      ]);
      const empList = empRes.data.data.employees || [];
      setEmployees(empList);
      setPotentialManagers(empList);
      setBranches(brRes.data.data || []);
      setLevels(lvlRes.data.data || []);
      setAllDesignations(desigRes.data.data || []);

      if (brRes.data.data.length > 0 && !newEmp.branchId) {
        setNewEmp((prev) => ({ ...prev, branchId: brRes.data.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [statusFilter, branchFilter, deptFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEmployees();
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const res = await api.get('/employees/export', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed, generating client fallback CSV:', err);
      const headers = ['EmployeeCode,FirstName,LastName,Email,Phone,Department,Designation,Branch,Status'];
      const rows = employees.map(
        (e) =>
          `"${e.employeeCode}","${e.firstName}","${e.lastName}","${e.email}","${e.phone || ''}","${e.department}","${e.designation}","${e.branch?.name || ''}","${e.status}"`
      );
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setExportLoading(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    if (levelFilter) {
      if (emp.level?.levelNumber && String(emp.level.levelNumber) !== String(levelFilter)) return false;
      if (!emp.level && emp.levelId !== levelFilter) return false;
    }
    return true;
  });

  const handleLevelChange = (lvlId) => {
    const currentDesig = allDesignations.find((d) => d.id === newEmp.designationId);
    const isStillValid = currentDesig && currentDesig.levelId === lvlId;
    setNewEmp((prev) => ({
      ...prev,
      levelId: lvlId,
      designationId: isStillValid ? prev.designationId : '',
      designation: isStillValid ? prev.designation : '',
    }));
  };

  const filteredDesignations = newEmp.levelId
    ? allDesignations.filter((d) => d.levelId === newEmp.levelId && d.isActive)
    : allDesignations.filter((d) => d.isActive);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError('');
    try {
      const res = await api.post('/employees', newEmp);
      setShowAddModal(false);
      fetchEmployees();
      navigate(`/employees/${res.data.data.id}`);
    } catch (err) {
      setAddError(err.response?.data?.error || 'Failed to create employee profile');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Employee Master Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Central repository of workforce profiles, statutory compliance, assets, and service history
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={exportLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{exportLoading ? 'Exporting...' : 'Export Workforce'}</span>
          </button>

          {user?.role === 'HR' && (
            <Button
              size="sm"
              variant="primary"
              icon={Plus}
              onClick={() => setShowAddModal(true)}
            >
              Add New Employee
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar with Horilla View Switcher */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, code, email, designation..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Bellad Levels Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Levels (1–10)</option>
            <option value="1">Level 1 - Executive / MD</option>
            <option value="2">Level 2 - CEO / Director</option>
            <option value="3">Level 3 - CSO / Vice President</option>
            <option value="4">Level 4 - Service Head / GM</option>
            <option value="5">Level 5 - Branch Manager</option>
            <option value="6">Level 6 - Service / Sales Manager</option>
            <option value="7">Level 7 - Service Advisor</option>
            <option value="8">Level 8 - Master Technician</option>
            <option value="9">Level 9 - Technician Trainee</option>
            <option value="10">Level 10 - Support / Washers</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="RESIGNED">Resigned</option>
            <option value="LEFT_WITHOUT_INTIMATION">Left Without Intimation</option>
            <option value="TERMINATED">Terminated</option>
          </select>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Departments</option>
            <option value="Executive Board">Executive Board</option>
            <option value="Service">Service</option>
            <option value="Sales">Sales</option>
            <option value="Bodyshop">Bodyshop</option>
            <option value="Spares & Parts">Spares & Parts</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Accounts & Finance">Accounts & Finance</option>
            <option value="Customer Care">Customer Care</option>
          </select>

          {/* Branch Filter (HR only) */}
          {user?.role === 'HR' && (
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          {/* Horilla List / Card View Mode Toggle */}
          <div className="bg-slate-100 p-0.5 rounded-lg flex items-center border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs transition ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table List View (HLV)"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs transition ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Visual Card Grid (HCV)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Employees Content: Table View (HLV) or Card Grid View (HCV) */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Designation & Dept</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Date of Joining</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">KYC Verified</th>
                  <th className="py-3 px-4 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12">
                      <EmptyState
                        icon={Users}
                        title="No employees found"
                        description="Try adjusting your search criteria or filters."
                      />
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      onClick={() => navigate(`/employees/${emp.id}`)}
                      className="hover:bg-slate-50/80 cursor-pointer transition"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200 shrink-0">
                            {emp.firstName[0]}
                            {emp.lastName[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {emp.firstName} {emp.lastName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {emp.employeeCode} • {emp.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {emp.level && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                              L{emp.level.levelNumber}
                            </span>
                          )}
                          <span className="font-medium text-slate-800">{emp.designation}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{emp.department}</span>
                          {emp.reportingManager && (
                            <span className="text-slate-400">
                              • Mgr: {emp.reportingManager.firstName} {emp.reportingManager.lastName}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{emp.branch?.name}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(emp.dateOfJoining)}</td>
                      <td className="py-3 px-4">
                        <Badge status={emp.status} />
                      </td>
                      <td className="py-3 px-4">
                        {emp.kyc?.verified ? (
                          <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Verified ✓
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-indigo-600 font-semibold text-[11px] inline-flex items-center gap-1 hover:underline">
                          View <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Horilla Card Grid View (HCV) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredEmployees.length === 0 ? (
            <div className="col-span-full py-12 bg-white rounded-xl border border-slate-200">
              <EmptyState
                icon={Users}
                title="No employees found"
                description="Try adjusting your search criteria or filters."
              />
            </div>
          ) : (
            filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                onClick={() => navigate(`/employees/${emp.id}`)}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                      {emp.firstName[0]}
                      {emp.lastName[0]}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge status={emp.status} />
                      {emp.level && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Level {emp.level.levelNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">{emp.employeeCode}</span>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition truncate">
                      {emp.firstName} {emp.lastName}
                    </h3>
                    <p className="text-xs text-indigo-700 font-semibold truncate">{emp.designation}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {emp.department} • {emp.branch?.name}
                    </p>
                  </div>

                  {emp.reportingManager && (
                    <div className="p-2 rounded-lg bg-slate-50 text-[10px] text-slate-600 border border-slate-100 truncate">
                      <span className="text-slate-400">Reports to: </span>
                      <span className="font-semibold text-slate-800">
                        {emp.reportingManager.firstName} {emp.reportingManager.lastName}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-slate-400">
                    {emp.phone && (
                      <a
                        href={`tel:${emp.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 hover:text-indigo-600 hover:bg-slate-100 rounded"
                        title={emp.phone}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {emp.email && (
                      <a
                        href={`mailto:${emp.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 hover:text-indigo-600 hover:bg-slate-100 rounded"
                        title={emp.email}
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <span className="text-indigo-600 font-semibold text-[11px] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Profile <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Employee Modal (HR Only) */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New Employee Profile"
      >
        <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs">
          {addError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{addError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={newEmp.firstName}
                onChange={(e) => setNewEmp({ ...newEmp, firstName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={newEmp.lastName}
                onChange={(e) => setNewEmp({ ...newEmp, lastName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Work Email *</label>
              <input
                type="email"
                required
                placeholder="name@dealership.com"
                value={newEmp.email}
                onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number (10 digits) *</label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                required
                placeholder="9876543210"
                value={newEmp.phone}
                onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Branch *</label>
              <select
                value={newEmp.branchId}
                onChange={(e) => setNewEmp({ ...newEmp, branchId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department *</label>
              <select
                value={newEmp.department}
                onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Sales">Sales</option>
                <option value="Service">Service</option>
                <option value="Spares">Spares</option>
                <option value="Bodyshop">Bodyshop</option>
                <option value="Accounts">Accounts</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Customer Relations">Customer Relations</option>
                <option value="Executive Board">Executive Board</option>
                <option value="Engineering">Engineering</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
          </div>

          {/* Cascading Level and Designation Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Employee Level *</label>
              <select
                required
                value={newEmp.levelId}
                onChange={(e) => handleLevelChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">Select Level</option>
                {levels.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    Level {lvl.levelNumber} — {lvl.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Designation *</label>
              <select
                required
                value={newEmp.designationId}
                onChange={(e) => {
                  const sel = filteredDesignations.find((d) => d.id === e.target.value);
                  setNewEmp({
                    ...newEmp,
                    designationId: e.target.value,
                    designation: sel ? sel.name : '',
                  });
                }}
                disabled={!newEmp.levelId && filteredDesignations.length === 0}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">
                  {newEmp.levelId
                    ? filteredDesignations.length > 0
                      ? 'Select Designation'
                      : 'No designations for this level'
                    : 'Select Level First'}
                </option>
                {filteredDesignations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.code ? `(${d.code})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reporting Manager Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reporting Manager (Hierarchy)</label>
            <select
              value={newEmp.reportingManagerId}
              onChange={(e) => setNewEmp({ ...newEmp, reportingManagerId: e.target.value || null })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">None (Top Executive / Direct to Board)</option>
              {potentialManagers.map((mgr) => (
                <option key={mgr.id} value={mgr.id}>
                  {mgr.firstName} {mgr.lastName} ({mgr.designation || 'Staff'}) — {mgr.employeeCode}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date of Joining</label>
              <input
                type="date"
                value={newEmp.dateOfJoining}
                onChange={(e) => setNewEmp({ ...newEmp, dateOfJoining: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Monthly Basic Salary (₹)</label>
              <input
                type="number"
                value={newEmp.basic}
                onChange={(e) => setNewEmp({ ...newEmp, basic: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button size="sm" variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" loading={addLoading}>
              Create Employee Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeListPage;
