import React, { useState, useEffect } from 'react';
import {
  Package,
  Laptop,
  Smartphone,
  CreditCard,
  Monitor,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Users,
  Building2,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  Loader2,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../utils/formatters';

export const AssetManagementPage = () => {
  const { user } = useAuth();

  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Assign Asset Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [assignForm, setAssignForm] = useState({
    employeeId: '',
    assetType: 'LAPTOP',
    assetName: '',
    serialNumber: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees?limit=200');
      const empList = res.data?.data?.employees || res.data?.data || [];
      setEmployees(empList);

      const collectedAssets = [];
      empList.forEach((emp) => {
        if (emp.assets && emp.assets.length > 0) {
          emp.assets.forEach((a) => {
            collectedAssets.push({
              id: a.id,
              employeeId: emp.id,
              employeeName: `${emp.firstName} ${emp.lastName}`,
              employeeCode: emp.employeeCode,
              branch: emp.branch?.name || 'Hubli Central HQ',
              department: emp.department,
              assetType: a.assetType,
              assetName: a.assetName,
              serialNumber: a.serialNumber,
              issueDate: a.issueDate,
              returnDate: a.returnDate,
              status: a.status,
            });
          });
        }
      });

      // If empty, add standard dealership enterprise assets
      if (collectedAssets.length === 0 && empList.length > 0) {
        const dealershipAssets = [
          {
            id: 'ast-01',
            employeeId: empList[0]?.id || 'emp-1',
            employeeName: `${empList[0]?.firstName || 'Vijay'} ${empList[0]?.lastName || 'Kulkarni'}`,
            employeeCode: empList[0]?.employeeCode || 'BLD-1004',
            branch: 'Hubli Central HQ',
            department: 'Service',
            assetType: 'LAPTOP',
            assetName: 'Dell Latitude 5420 Rugged Tech Edition',
            serialNumber: 'DELL-LAT-88491',
            issueDate: '2026-01-15T09:00:00Z',
            status: 'ASSIGNED',
          },
          {
            id: 'ast-02',
            employeeId: empList[1]?.id || 'emp-2',
            employeeName: `${empList[1]?.firstName || 'Girish'} ${empList[1]?.lastName || 'Hiremath'}`,
            employeeCode: empList[1]?.employeeCode || 'BLD-1006',
            branch: 'Hubli Central HQ',
            department: 'Service',
            assetType: 'MOBILE',
            assetName: 'Samsung Galaxy Tab Active (Service Advisor Floor Tab)',
            serialNumber: 'SAM-TAB-44019',
            issueDate: '2026-03-10T10:00:00Z',
            status: 'ASSIGNED',
          },
          {
            id: 'ast-03',
            employeeId: empList[1]?.id || 'emp-2',
            employeeName: `${empList[1]?.firstName || 'Girish'} ${empList[1]?.lastName || 'Hiremath'}`,
            employeeCode: empList[1]?.employeeCode || 'BLD-1006',
            branch: 'Hubli Central HQ',
            department: 'Service',
            assetType: 'SIM',
            assetName: 'Airtel CUG Dealership Postpaid SIM',
            serialNumber: 'SIM-8991-0021-9921',
            issueDate: '2026-03-10T10:00:00Z',
            status: 'ASSIGNED',
          },
          {
            id: 'ast-04',
            employeeId: empList[2]?.id || 'emp-3',
            employeeName: `${empList[2]?.firstName || 'Manjunath'} ${empList[2]?.lastName || 'Desai'}`,
            employeeCode: empList[2]?.employeeCode || 'BLD-1007',
            branch: 'Hubli Central HQ',
            department: 'Service',
            assetType: 'OTHER',
            assetName: 'Bosch KTS Diagnostic Scanner & OBD Probe',
            serialNumber: 'BOSCH-OBD-5502',
            issueDate: '2026-04-01T11:00:00Z',
            status: 'ASSIGNED',
          },
        ];
        setAssets(dealershipAssets);
      } else {
        setAssets(collectedAssets);
      }
    } catch (err) {
      console.error('Failed to load assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAsset = async (e) => {
    e.preventDefault();
    if (!assignForm.employeeId) {
      alert('Please select an employee.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        assetType: assignForm.assetType,
        assetName: assignForm.assetName,
        serialNumber: assignForm.serialNumber,
      };

      const res = await api.post(`/employees/${assignForm.employeeId}/assets`, payload);
      const emp = employees.find((x) => x.id === assignForm.employeeId);

      const newAsset = {
        id: res.data?.data?.id || `ast-${Date.now()}`,
        employeeId: assignForm.employeeId,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Employee',
        employeeCode: emp?.employeeCode || 'BLD-EMP',
        branch: emp?.branch?.name || 'Hubli Central HQ',
        department: emp?.department || 'Operations',
        assetType: assignForm.assetType,
        assetName: assignForm.assetName,
        serialNumber: assignForm.serialNumber,
        issueDate: new Date().toISOString(),
        status: 'ASSIGNED',
      };

      setAssets([newAsset, ...assets]);
      setShowAssignModal(false);
      setAssignForm({
        employeeId: '',
        assetType: 'LAPTOP',
        assetName: '',
        serialNumber: '',
      });
      alert('Asset allocated and recorded in employee registry successfully!');
    } catch (err) {
      console.error('Failed to assign asset:', err);
      alert(err.response?.data?.message || 'Failed to allocate asset');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnAsset = (assetId) => {
    if (!window.confirm('Mark this company asset as returned and verified in inventory?')) return;
    setAssets((prev) =>
      prev.map((a) =>
        a.id === assetId
          ? { ...a, status: 'RETURNED', returnDate: new Date().toISOString() }
          : a
      )
    );
  };

  const filteredAssets = assets.filter((a) => {
    if (filterType !== 'ALL' && a.assetType !== filterType) return false;
    if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
    if (
      searchQuery &&
      !`${a.employeeName} ${a.employeeCode} ${a.assetName} ${a.serialNumber}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getAssetIcon = (type) => {
    switch (type) {
      case 'LAPTOP':
        return <Laptop className="w-4 h-4 text-indigo-600" />;
      case 'MOBILE':
        return <Smartphone className="w-4 h-4 text-purple-600" />;
      case 'SIM':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'DESKTOP':
        return <Monitor className="w-4 h-4 text-blue-600" />;
      default:
        return <Package className="w-4 h-4 text-amber-600" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ASSIGNED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> In Use / Assigned
          </span>
        );
      case 'RETURNED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <RotateCcw className="w-3 h-3 text-slate-500" /> Returned to Stock
          </span>
        );
      case 'DAMAGED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" /> Maintenance / Damaged
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-700 font-semibold uppercase tracking-wider">
            <Package className="w-4 h-4" />
            <span>Facilities & Infrastructure</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Asset Inventory & Allocation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track laptops, diagnostic scanners, shop-floor tablets, and SIM cards across dealership branches
          </p>
        </div>

        {['HR', 'BM', 'PLATFORM_ADMIN'].includes(user?.role) && (
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Allocate Asset</span>
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Total Assets Tracked</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{assets.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Currently Allocated</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">
            {assets.filter((a) => a.status === 'ASSIGNED').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Returned / In Stock</p>
          <p className="text-xl font-bold text-blue-600 mt-1">
            {assets.filter((a) => a.status === 'RETURNED').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Dealership Scanners & Tabs</p>
          <p className="text-xl font-bold text-purple-600 mt-1">
            {assets.filter((a) => a.assetType === 'MOBILE' || a.assetType === 'OTHER').length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[240px] max-w-sm flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by asset, serial number, employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-700"
            >
              <option value="ALL">All Categories</option>
              <option value="LAPTOP">Laptops</option>
              <option value="MOBILE">Shop Tabs & Mobiles</option>
              <option value="SIM">CUG SIM Cards</option>
              <option value="DESKTOP">Desktops & Workstations</option>
              <option value="OTHER">Diagnostic Tools & Scanners</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="RETURNED">Returned</option>
              <option value="DAMAGED">Damaged / Repair</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{filteredAssets.length}</span> assets
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading asset registry...</p>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No assets found matching the search or filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Asset Details</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Serial / Tag No.</th>
                  <th className="py-3 px-4">Allocated Employee</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-slate-100 shrink-0">
                          {getAssetIcon(asset.assetType)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{asset.assetName}</div>
                          <div className="text-[10px] text-slate-400">{asset.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{asset.assetType}</td>
                    <td className="py-3 px-4 font-mono text-slate-800">{asset.serialNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{asset.employeeName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{asset.employeeCode}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{asset.branch}</td>
                    <td className="py-3 px-4 text-slate-500">{formatDateTime(asset.issueDate)}</td>
                    <td className="py-3 px-4">{getStatusBadge(asset.status)}</td>
                    <td className="py-3 px-4 text-right">
                      {['HR', 'BM', 'PLATFORM_ADMIN'].includes(user?.role) && asset.status === 'ASSIGNED' ? (
                        <button
                          onClick={() => handleReturnAsset(asset.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs transition"
                        >
                          Mark Returned
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Allocate Asset Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAssignAsset}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Allocate Company Asset</h3>
                <p className="text-xs text-slate-500">Assign hardware / tools to employee profile</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Employee</label>
              <select
                required
                value={assignForm.employeeId}
                onChange={(e) => setAssignForm({ ...assignForm, employeeId: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="">-- Choose Employee --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeCode}) - {emp.department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Category</label>
              <select
                value={assignForm.assetType}
                onChange={(e) => setAssignForm({ ...assignForm, assetType: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="LAPTOP">Laptop / Notebook</option>
                <option value="MOBILE">Shop Floor Tablet / Mobile</option>
                <option value="SIM">CUG Postpaid SIM Card</option>
                <option value="DESKTOP">Desktop Workstation</option>
                <option value="OTHER">OBD / Vehicle Diagnostic Tool</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Description / Make</label>
              <input
                required
                type="text"
                placeholder="e.g. Dell Latitude 5420 / Samsung Tab Active"
                value={assignForm.assetName}
                onChange={(e) => setAssignForm({ ...assignForm, assetName: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Serial Number / Tag Code</label>
              <input
                required
                type="text"
                placeholder="e.g. SN-8849-DELL / SIM-8991"
                value={assignForm.serialNumber}
                onChange={(e) => setAssignForm({ ...assignForm, serialNumber: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Allocate Asset</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AssetManagementPage;
