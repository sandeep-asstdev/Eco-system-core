import React, { useState, useEffect } from 'react';
import {
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Users,
  Building2,
  FileText,
  DollarSign,
  Fuel,
  Hotel,
  Coffee,
  Car,
  Layers,
  Info,
  Check,
  X,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const BELLAD_POLICY_MATRIX = [
  {
    tier: 'Executive (Levels 1–2)',
    levels: 'Level 1: MD, Level 2: Director/CEO',
    travelMode: 'Air / 1st AC / Executive Cab',
    lodgingPerNight: 'Actuals / 5-Star Equivalent',
    dailyPerDiem: 'Actuals',
    fuelPerKm: 'Corporate Vehicle / Actuals',
  },
  {
    tier: 'Senior Management (Levels 3–4)',
    levels: 'Level 3: CSO, Level 4: Service Head / GM',
    travelMode: 'Flight (Economy) / 2nd AC Train / Intercity Cab',
    lodgingPerNight: '₹4,500 / night (Metro/Tier 1)',
    dailyPerDiem: '₹1,200 / day',
    fuelPerKm: '₹9.50 / km (4-Wheeler)',
  },
  {
    tier: 'Branch Operations (Levels 5–6)',
    levels: 'Level 5: Branch Manager, Level 6: Workshop Mgr',
    travelMode: 'AC 2-Tier / AC Bus / Intercity Taxi',
    lodgingPerNight: '₹2,800 / night',
    dailyPerDiem: '₹800 / day',
    fuelPerKm: '₹9.00 / km (4-Wheeler)',
  },
  {
    tier: 'Field & Service (Levels 7–8)',
    levels: 'Level 7: Service Advisor, Level 8: Senior Tech',
    travelMode: 'Train 3-Tier / Express Bus',
    lodgingPerNight: '₹1,800 / night',
    dailyPerDiem: '₹500 / day',
    fuelPerKm: '₹4.50 / km (2-Wheeler)',
  },
  {
    tier: 'Support & Operations (Levels 9–10)',
    levels: 'Level 9: Junior Tech, Level 10: Washer / Staff',
    travelMode: 'State Transport Bus / Train Sleeper',
    lodgingPerNight: '₹1,200 / night (Dorm/Guest House)',
    dailyPerDiem: '₹350 / day',
    fuelPerKm: '₹4.00 / km (2-Wheeler)',
  },
];

export const ClaimsPage = () => {
  const { user } = useAuth();

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  // Submit Claim Modal State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [claimForm, setClaimForm] = useState({
    category: 'FUEL',
    amount: '',
    claimDate: new Date().toISOString().split('T')[0],
    distanceKm: '',
    purpose: '',
    merchantName: '',
  });

  // Review Modal State
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      // Pre-seed realistic Bellad Group dealership travel & expense claims
      const initialClaims = [
        {
          id: 'clm-501',
          employeeName: 'Girish Hiremath',
          employeeCode: 'BLD-1006',
          levelNumber: 7,
          levelName: 'Staff / Service Advisor',
          branch: 'Hubli Central HQ',
          department: 'Service',
          category: 'FUEL',
          amount: 1450,
          distanceKm: 320,
          claimDate: '2026-09-24',
          purpose: 'Customer doorstep breakdown inspection & estimate at Dharwad outskirts',
          merchantName: 'Indian Oil Fuel Hubli',
          status: 'PENDING',
          receiptAttached: true,
          appliedAt: '2026-09-24T18:30:00Z',
        },
        {
          id: 'clm-502',
          employeeName: 'Vijay Kulkarni',
          employeeCode: 'BLD-1004',
          levelNumber: 4,
          levelName: 'Service Head',
          branch: 'Hubli Central HQ',
          department: 'Service',
          category: 'HOTEL',
          amount: 4200,
          claimDate: '2026-09-22',
          purpose: 'OEM Regional Dealer Conference lodging at The Fern Belagavi',
          merchantName: 'The Fern Belagavi',
          status: 'APPROVED',
          approvedBy: 'Kavitha Deshpande (HR Head)',
          receiptAttached: true,
          appliedAt: '2026-09-22T09:15:00Z',
        },
        {
          id: 'clm-503',
          employeeName: 'Basavaraj Korvi',
          employeeCode: 'BLD-1008',
          levelNumber: 10,
          levelName: 'Janitorial / Washers',
          branch: 'Hubli Central HQ',
          department: 'Service',
          category: 'FOOD',
          amount: 350,
          claimDate: '2026-09-21',
          purpose: 'Sunday mega car-wash festival overtime food allowance',
          merchantName: 'Hotel Naveen Hubli',
          status: 'APPROVED',
          approvedBy: 'Branch Manager Hubli',
          receiptAttached: true,
          appliedAt: '2026-09-21T20:00:00Z',
        },
        {
          id: 'clm-504',
          employeeName: 'Manjunath Desai',
          employeeCode: 'BLD-1007',
          levelNumber: 8,
          levelName: 'Technician',
          branch: 'Hubli Central HQ',
          department: 'Service',
          category: 'TOLL_PARKING',
          amount: 380,
          claimDate: '2026-09-20',
          purpose: 'Fastag toll plaza transit for transporting spare engine block from Belgaum Hub',
          merchantName: 'NH4 Toll Plaza Hirebagewadi',
          status: 'PENDING',
          receiptAttached: true,
          appliedAt: '2026-09-20T16:45:00Z',
        },
      ];

      setClaims(initialClaims);
    } catch (err) {
      console.error('Failed to load claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitClaim = (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newClaim = {
        id: `clm-${Date.now()}`,
        employeeName: user?.employee
          ? `${user.employee.firstName} ${user.employee.lastName}`
          : user?.name || user?.email.split('@')[0],
        employeeCode: user?.employee?.employeeCode || 'BLD-EMP',
        levelNumber: user?.employee?.level?.levelNumber || 7,
        levelName: user?.employee?.designation || 'Dealership Executive',
        branch: user?.branch?.name || 'Hubli Central HQ',
        department: user?.employee?.department || 'Operations',
        category: claimForm.category,
        amount: Number(claimForm.amount),
        distanceKm: claimForm.distanceKm ? Number(claimForm.distanceKm) : null,
        claimDate: claimForm.claimDate,
        purpose: claimForm.purpose,
        merchantName: claimForm.merchantName,
        status: 'PENDING',
        receiptAttached: true,
        appliedAt: new Date().toISOString(),
      };

      setClaims([newClaim, ...claims]);
      setShowSubmitModal(false);
      setClaimForm({
        category: 'FUEL',
        amount: '',
        claimDate: new Date().toISOString().split('T')[0],
        distanceKm: '',
        purpose: '',
        merchantName: '',
      });
      alert('Expense claim submitted successfully for manager approval!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewAction = (status) => {
    if (!selectedClaim) return;
    setActionLoading(true);
    try {
      setClaims((prev) =>
        prev.map((c) =>
          c.id === selectedClaim.id
            ? {
                ...c,
                status,
                approvedBy: user?.name || user?.email,
                remarks: reviewRemarks,
              }
            : c
        )
      );
      setSelectedClaim(null);
      setReviewRemarks('');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredClaims = claims.filter((c) => {
    if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
    if (filterCategory !== 'ALL' && c.category !== filterCategory) return false;
    if (
      searchQuery &&
      !`${c.employeeName} ${c.employeeCode} ${c.purpose} ${c.category}`.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Pending Review
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" /> Rejected
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'FUEL':
        return <Fuel className="w-4 h-4 text-amber-600" />;
      case 'HOTEL':
        return <Hotel className="w-4 h-4 text-purple-600" />;
      case 'FOOD':
        return <Coffee className="w-4 h-4 text-emerald-600" />;
      default:
        return <Car className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-700 font-semibold uppercase tracking-wider">
            <Receipt className="w-4 h-4" />
            <span>Compensation & Expenses</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Claims & Travel Expense Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Dealership field visits, fuel allowance, and lodging eligibility mapped to Bellad Levels 1–10
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPolicyModal(true)}
            className="px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition shadow-2xs flex items-center gap-1.5"
          >
            <Info className="w-4 h-4 text-indigo-600" />
            <span>Levels 1–10 Policy Matrix</span>
          </button>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Claim</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Total Claims</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{claims.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Pending Approval</p>
          <p className="text-xl font-bold text-amber-600 mt-1">
            {claims.filter((c) => c.status === 'PENDING').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Approved Value</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">
            {formatCurrency(
              claims.filter((c) => c.status === 'APPROVED').reduce((sum, c) => sum + c.amount, 0)
            )}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Pending Disbursal</p>
          <p className="text-xl font-bold text-indigo-600 mt-1">
            {formatCurrency(
              claims.filter((c) => c.status === 'PENDING').reduce((sum, c) => sum + c.amount, 0)
            )}
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
              placeholder="Search by employee, purpose, merchant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Receipt className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-700"
            >
              <option value="ALL">All Categories</option>
              <option value="FUEL">Fuel & Mileage</option>
              <option value="HOTEL">Lodging & Hotel</option>
              <option value="FOOD">Food & Daily Per Diem</option>
              <option value="TOLL_PARKING">Toll & Intercity Transit</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{filteredClaims.length}</span> claims
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading expense claims...</p>
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No expense claims found matching the current criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Claim Date</th>
                  <th className="py-3 px-4">Purpose & Merchant</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{claim.employeeName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{claim.employeeCode}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Level {claim.levelNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        {getCategoryIcon(claim.category)}
                        <span>{claim.category}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{claim.claimDate}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 max-w-xs truncate" title={claim.purpose}>
                        {claim.purpose}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {claim.merchantName} {claim.distanceKm ? `• ${claim.distanceKm} km` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(claim.amount)}</td>
                    <td className="py-3 px-4">{getStatusBadge(claim.status)}</td>
                    <td className="py-3 px-4 text-right">
                      {['HR', 'BM', 'PLATFORM_ADMIN'].includes(user?.role) && claim.status === 'PENDING' ? (
                        <button
                          onClick={() => setSelectedClaim(claim)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition"
                        >
                          Review
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

      {/* Policy Matrix Drawer Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-in fade-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Bellad Group Level 1–10 Travel & Expense Matrix
                </h3>
                <p className="text-xs text-slate-500">Official dealership policy limits per designation tier</p>
              </div>
              <button
                onClick={() => setShowPolicyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {BELLAD_POLICY_MATRIX.map((policy, idx) => (
                <div key={idx} className="py-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{policy.tier}</span>
                    <span className="text-[11px] font-semibold text-indigo-600">{policy.levels}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-slate-600">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Travel</p>
                      <p className="font-medium text-slate-800">{policy.travelMode}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Hotel / Lodging</p>
                      <p className="font-medium text-slate-800">{policy.lodgingPerNight}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Daily Per Diem</p>
                      <p className="font-medium text-slate-800">{policy.dailyPerDiem}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Mileage / Fuel</p>
                      <p className="font-medium text-slate-800">{policy.fuelPerKm}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowPolicyModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
              >
                Close Policy Matrix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Claim Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitClaim}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Submit Expense Claim</h3>
                <p className="text-xs text-slate-500">Submit for manager approval with bills</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Category</label>
              <select
                value={claimForm.category}
                onChange={(e) => setClaimForm({ ...claimForm, category: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="FUEL">Fuel & Mileage Reimbursement</option>
                <option value="HOTEL">Hotel & Lodging</option>
                <option value="FOOD">Food & Daily Per Diem</option>
                <option value="TOLL_PARKING">Fastag Toll & Intercity Parking</option>
                <option value="OTHER">Other Operational Expense</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹)</label>
                <input
                  required
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="e.g. 1500"
                  value={claimForm.amount}
                  onChange={(e) => setClaimForm({ ...claimForm, amount: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Expense</label>
                <input
                  required
                  type="date"
                  value={claimForm.claimDate}
                  onChange={(e) => setClaimForm({ ...claimForm, claimDate: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            {claimForm.category === 'FUEL' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Distance Travelled (KM)</label>
                <input
                  type="number"
                  placeholder="e.g. 150 km"
                  value={claimForm.distanceKm}
                  onChange={(e) => setClaimForm({ ...claimForm, distanceKm: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Merchant / Vendor Name</label>
              <input
                type="text"
                placeholder="e.g. HP Petrol Pump, Hotel Naveen Hubli"
                value={claimForm.merchantName}
                onChange={(e) => setClaimForm({ ...claimForm, merchantName: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose / Justification</label>
              <textarea
                required
                rows={2}
                placeholder="State dealership business reason..."
                value={claimForm.purpose}
                onChange={(e) => setClaimForm({ ...claimForm, purpose: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
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
                <span>Submit Claim</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Review Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Review Expense Claim</h3>
                <p className="text-xs text-slate-500">Check claim against Bellad Level eligibility</p>
              </div>
              <button
                onClick={() => setSelectedClaim(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Employee:</span>
                <span className="font-semibold text-slate-800">
                  {selectedClaim.employeeName} ({selectedClaim.employeeCode})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Level:</span>
                <span className="font-bold text-indigo-700">Level {selectedClaim.levelNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="font-semibold text-slate-800">{selectedClaim.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Claim Amount:</span>
                <span className="font-black text-slate-900 text-sm">{formatCurrency(selectedClaim.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Purpose:</span>
                <span className="text-slate-800">{selectedClaim.purpose}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Approval Remarks</label>
              <textarea
                rows={2}
                placeholder="e.g. Verified odometer readings & fuel slip. Recommended for payroll credit."
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleReviewAction('REJECTED')}
                disabled={actionLoading}
                className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
              <button
                onClick={() => handleReviewAction('APPROVED')}
                disabled={actionLoading}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-xs"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Approve & Disburse</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimsPage;
