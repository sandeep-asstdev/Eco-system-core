import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Users as UsersIcon, 
  Plus, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Search, 
  MapPin, 
  Building, 
  Briefcase,
  UserPlus,
  RefreshCw,
  MoreVertical
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import Modal from '../components/common/Modal.jsx';
import UnauthorizedScreen from '../components/common/UnauthorizedScreen.jsx';

export default function Users() {
  const { hasPermission, isPlatformAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [roles, setRoles] = useState([]);
  const [firms, setFirms] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Forms
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    primaryBranchId: ''
  });

  const [roleForm, setRoleForm] = useState({
    roleId: '',
    scopeType: 'BRANCH',
    firmId: '',
    brandId: '',
    branchId: '',
    departmentId: ''
  });

  const [membershipForm, setMembershipForm] = useState({
    branchId: '',
    departmentId: '',
    isPrimary: false
  });

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsersData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, branchesRes, rolesRes, firmsRes, brandsRes] = await Promise.all([
        api.get('/users'),
        api.get('/org/branches'),
        api.get('/users/roles'),
        api.get('/org/firms'),
        api.get('/org/brands')
      ]);

      setUsers(usersRes.data || []);
      setBranches(branchesRes.data || []);
      setRoles(rolesRes.data || []);
      setFirms(firmsRes.data || []);
      setBrands(brandsRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post('/users', createForm);
      setIsCreateModalOpen(false);
      setCreateForm({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        primaryBranchId: ''
      });
      await fetchUsersData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignRole = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post(`/users/${selectedUser.id}/roles`, roleForm);
      setIsRoleModalOpen(false);
      await fetchUsersData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMembership = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post(`/users/${selectedUser.id}/memberships`, membershipForm);
      setIsMembershipModalOpen(false);
      await fetchUsersData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (user) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.put(`/users/${user.id}/status`, { status: nextStatus });
      await fetchUsersData();
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  if (!isPlatformAdmin && !hasPermission('org.user.view') && !hasPermission('org.user.manage')) {
    return <UnauthorizedScreen requiredPermission="org.user.view" title="Staff Directory Restricted" />;
  }

  const filtered = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dealership Staff & Memberships</h1>
          <p className="text-xs text-slate-500">
            Central User Directory, Multi-Branch Floating Staff Memberships, and Scoped RBAC Role Assignments
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
        >
          <UserPlus className="w-4 h-4" /> Add Dealership Staff
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button 
          onClick={fetchUsersData}
          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Fetching dealership staff directory..." />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Branch Memberships</th>
                <th className="py-3 px-4">Scoped Roles</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => {
                const memberships = u.memberships || [];
                const rolesList = u.userRoleAssignments || [];

                return (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0">
                          {u.firstName?.[0] || 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">
                            {u.firstName} {u.lastName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {memberships.length === 0 ? (
                          <span className="text-[10px] text-slate-400">No Branch Assigned</span>
                        ) : (
                          memberships.map((m) => (
                            <span 
                              key={m.id}
                              className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 ${
                                m.isPrimary 
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold' 
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              <MapPin className="w-2.5 h-2.5" />
                              <span>{m.branch?.name}</span>
                              {m.isPrimary && <span className="text-[9px] uppercase font-bold text-blue-800">(Primary)</span>}
                            </span>
                          ))
                        )}
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setIsMembershipModalOpen(true);
                          }}
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold ml-1"
                        >
                          + Assign Branch
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {u.isPlatformAdmin && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            GLOBAL_ADMIN
                          </span>
                        )}
                        {rolesList.map((ura) => (
                          <span 
                            key={ura.id}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1"
                          >
                            <Shield className="w-2.5 h-2.5 text-emerald-600" />
                            <span>{ura.role?.code}</span>
                            <span className="text-[9px] uppercase font-bold text-emerald-900">({ura.scopeType})</span>
                          </span>
                        ))}
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setIsRoleModalOpen(true);
                          }}
                          className="text-[10px] text-emerald-600 hover:text-emerald-800 font-semibold ml-1"
                        >
                          + Add Role
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {u.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => toggleStatus(u)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
                          u.status === 'ACTIVE'
                            ? 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                            : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Create User */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add Dealership Staff Member">
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                required
                value={createForm.firstName}
                onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                placeholder="Ramesh"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={createForm.lastName}
                onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                placeholder="Patil"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Corporate Email Address</label>
            <input
              type="email"
              required
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              placeholder="ramesh.patil@belladgroup.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Temporary Password</label>
              <input
                type="password"
                required
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mobile Phone (10 digits)</label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="9845011223"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Primary Base Branch</label>
            <select
              value={createForm.primaryBranchId}
              onChange={(e) => setCreateForm({ ...createForm, primaryBranchId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- No Branch Assigned Initially --</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-3 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Staff Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Assign Scoped Role */}
      {selectedUser && (
        <Modal 
          isOpen={isRoleModalOpen} 
          onClose={() => setIsRoleModalOpen(false)} 
          title={`Assign Scoped Role to ${selectedUser.firstName} ${selectedUser.lastName}`}
        >
          <form onSubmit={handleAssignRole} className="space-y-4 text-xs">
            {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">{error}</div>}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Role</label>
              <select
                required
                value={roleForm.roleId}
                onChange={(e) => setRoleForm({ ...roleForm, roleId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose Role --</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Authorization Scope</label>
              <select
                value={roleForm.scopeType}
                onChange={(e) => setRoleForm({ ...roleForm, scopeType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TENANT">TENANT (Across Entire Dealership Group)</option>
                <option value="FIRM">FIRM (Restricted to Specific Legal Entity)</option>
                <option value="BRAND">BRAND (Restricted to OEM Franchise)</option>
                <option value="BRANCH">BRANCH (Restricted to Facility Location)</option>
                <option value="DEPARTMENT">DEPARTMENT (Restricted to Bay / Functional Unit)</option>
              </select>
            </div>

            {roleForm.scopeType === 'FIRM' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Firm</label>
                <select
                  required
                  value={roleForm.firmId}
                  onChange={(e) => setRoleForm({ ...roleForm, firmId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose Firm --</option>
                  {firms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
            )}

            {roleForm.scopeType === 'BRAND' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target OEM Brand</label>
                <select
                  required
                  value={roleForm.brandId}
                  onChange={(e) => setRoleForm({ ...roleForm, brandId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose Brand --</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            )}

            {roleForm.scopeType === 'BRANCH' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Branch</label>
                <select
                  required
                  value={roleForm.branchId}
                  onChange={(e) => setRoleForm({ ...roleForm, branchId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose Branch --</option>
                  {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(false)}
                className="px-3 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Assigning...' : 'Assign Role'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Floating Staff Multi-Branch Membership */}
      {selectedUser && (
        <Modal
          isOpen={isMembershipModalOpen}
          onClose={() => setIsMembershipModalOpen(false)}
          title={`Assign Branch Facility to ${selectedUser.firstName}`}
        >
          <form onSubmit={handleAddMembership} className="space-y-4 text-xs">
            {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">{error}</div>}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Facility Outlet</label>
              <select
                required
                value={membershipForm.branchId}
                onChange={(e) => setMembershipForm({ ...membershipForm, branchId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose Branch --</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isPrimary"
                checked={membershipForm.isPrimary}
                onChange={(e) => setMembershipForm({ ...membershipForm, isPrimary: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <label htmlFor="isPrimary" className="font-medium text-slate-700">
                Designate as Primary Base Branch
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsMembershipModalOpen(false)}
                className="px-3 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Linking...' : 'Link Branch Membership'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
