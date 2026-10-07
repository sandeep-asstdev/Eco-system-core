import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Calendar as CalendarIcon,
  LogIn,
  LogOut,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users,
  Building,
  Briefcase,
  AlertTriangle,
  FileCheck,
  Timer,
  Coffee,
  Sun,
  Moon,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

// Dealership Holiday Schedule (Bellad Group - Karnataka Operations)
const DEALERSHIP_HOLIDAYS_2026 = [
  { id: 'h1', name: 'New Year Day', date: '2026-01-01', type: 'Gazetted', day: 'Thursday' },
  { id: 'h2', name: 'Republic Day', date: '2026-01-26', type: 'National', day: 'Monday' },
  { id: 'h3', name: 'Maha Shivaratri', date: '2026-02-16', type: 'Festival', day: 'Monday' },
  { id: 'h4', name: 'Ugadi (Kannada New Year)', date: '2026-03-20', type: 'State', day: 'Friday' },
  { id: 'h5', name: 'May Day (Labour Day)', date: '2026-05-01', type: 'Gazetted', day: 'Friday' },
  { id: 'h6', name: 'Independence Day', date: '2026-08-15', type: 'National', day: 'Saturday' },
  { id: 'h7', name: 'Ganesh Chaturthi', date: '2026-09-14', type: 'Festival', day: 'Monday' },
  { id: 'h8', name: 'Mahatma Gandhi Jayanti', date: '2026-10-02', type: 'National', day: 'Friday' },
  { id: 'h9', name: 'Ayudha Pooja & Vijayadashami', date: '2026-10-20', type: 'Dealership Mandatory Blessing', day: 'Tuesday' },
  { id: 'h10', name: 'Deepavali (Laxmi Pooja)', date: '2026-11-08', type: 'Festival', day: 'Sunday' },
  { id: 'h11', name: 'Karnataka Rajyotsava', date: '2026-11-01', type: 'State Pride', day: 'Sunday' },
  { id: 'h12', name: 'Christmas Day', date: '2026-12-25', type: 'Gazetted', day: 'Friday' },
];

// Dealership Shift Master Roster
const DEALERSHIP_SHIFTS = [
  {
    id: 'shift-sales',
    name: 'Showroom Sales & Customer Experience',
    code: 'SH-SLS',
    startTime: '09:30 AM',
    endTime: '06:30 PM',
    gracePeriodMins: 15,
    breakDurationMins: 60,
    departments: ['New Car Sales', 'Pre-Owned (Certified)', 'Dealership CRM'],
    branch: 'All Showrooms',
    color: 'emerald',
    description: 'Customer-facing sales executives, evaluators, and test-drive consultants',
  },
  {
    id: 'shift-workshop',
    name: 'Workshop & Bodyshop Technical Crew',
    code: 'SH-WKS',
    startTime: '08:30 AM',
    endTime: '05:30 PM',
    gracePeriodMins: 10,
    breakDurationMins: 45,
    departments: ['Service & Mechanical', 'Bodyshop & Paint', 'PDI & Washing'],
    branch: 'Hubli & Belgaum Workshops',
    color: 'blue',
    description: 'Service advisors, diagnostic masters, and bodyshop technicians',
  },
  {
    id: 'shift-spares',
    name: 'Spare Parts & Inventory Logistics',
    code: 'SH-SPR',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    gracePeriodMins: 15,
    breakDurationMins: 45,
    departments: ['Spare Parts', 'Warehouse', 'Accessories Fitting'],
    branch: 'Central Parts Hub',
    color: 'purple',
    description: 'Inventory controllers, billing specialists, and warranty coordinators',
  },
  {
    id: 'shift-security',
    name: 'Security & Facility Night Watch',
    code: 'SH-SEC',
    startTime: '08:00 PM',
    endTime: '08:00 AM',
    gracePeriodMins: 5,
    breakDurationMins: 60,
    departments: ['Security', 'Facility Maintenance'],
    branch: 'Dealership Stockyard & Yard',
    color: 'amber',
    description: 'Stockyard surveillance, gatekeeper registers, and vehicle dispatch security',
  },
];

export const AttendancePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('logs'); // 'logs' | 'calendar' | 'shifts' | 'holidays' | 'corrections'
  const [attendances, setAttendances] = useState([]);
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [filterDate, setFilterDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Punch actions
  const [punchLoading, setPunchLoading] = useState(false);
  const [punchMsg, setPunchMsg] = useState('');

  // Calendar State
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 0-indexed: 8 is September

  // Correction Modal
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [corrForm, setCorrForm] = useState({
    requestedDate: new Date().toISOString().split('T')[0],
    punchIn: '09:30 AM',
    punchOut: '06:30 PM',
    reason: '',
  });
  const [corrLoading, setCorrLoading] = useState(false);

  // Fetch Attendance Records
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const [attRes, corrRes] = await Promise.all([
        api.get('/attendance'),
        api.get('/attendance/corrections'),
      ]);
      setAttendances(attRes.data.data || []);
      setCorrections(corrRes.data.data || []);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handlePunch = async () => {
    setPunchLoading(true);
    setPunchMsg('');
    try {
      const res = await api.post('/attendance/punch');
      setPunchMsg(res.data.message);
      fetchAttendance();
    } catch (err) {
      alert(err.response?.data?.error || 'Punch failed');
    } finally {
      setPunchLoading(false);
    }
  };

  const handleCorrectionSubmit = async (e) => {
    e.preventDefault();
    setCorrLoading(true);
    try {
      await api.post('/attendance/correction', corrForm);
      setShowCorrectionModal(false);
      setCorrForm({
        requestedDate: new Date().toISOString().split('T')[0],
        punchIn: '09:30 AM',
        punchOut: '06:30 PM',
        reason: '',
      });
      fetchAttendance();
      alert('Attendance correction request submitted for BM approval.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit correction request');
    } finally {
      setCorrLoading(false);
    }
  };

  const handleApproveCorrection = async (corrId, status) => {
    try {
      // Find matching approval or patch directly
      const approvalsRes = await api.get('/approvals', { params: { type: 'ATTENDANCE_CORRECTION' } });
      const matching = (approvalsRes.data.data || []).find((a) => a.referenceId === corrId);
      if (matching) {
        await api.patch(`/approvals/${matching.id}/action`, {
          status,
          remarks: `Processed by ${user?.email}`,
        });
      }
      fetchAttendance();
      alert(`Attendance correction has been ${status.toLowerCase()}.`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update correction');
    }
  };

  // Filtered Daily Logs
  const filteredAttendances = attendances.filter((att) => {
    const empName = `${att.employee?.firstName || ''} ${att.employee?.lastName || ''}`.toLowerCase();
    const empCode = (att.employee?.employeeCode || '').toLowerCase();
    const matchesSearch =
      !searchTerm ||
      empName.includes(searchTerm.toLowerCase()) ||
      empCode.includes(searchTerm.toLowerCase());

    const matchesDate = !filterDate || att.date?.startsWith(filterDate);
    return matchesSearch && matchesDate;
  });

  // Today's punch state
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendances.find((a) => a.date?.startsWith(todayStr));

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-indigo-600" />
            <span>Attendance & Shift Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Biometric punch logs, shift rosters, dealership holiday calendar, and regularization requests
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user?.role === 'EMPLOYEE' && (
            <Button
              size="sm"
              variant="outline"
              icon={AlertCircle}
              onClick={() => setShowCorrectionModal(true)}
            >
              Request Regularization
            </Button>
          )}

          <Button
            size="sm"
            variant="primary"
            icon={todayRecord?.inTime && !todayRecord?.outTime ? LogOut : LogIn}
            loading={punchLoading}
            onClick={handlePunch}
            className={todayRecord?.inTime && !todayRecord?.outTime ? 'bg-amber-600 hover:bg-amber-700' : ''}
          >
            {todayRecord?.inTime && !todayRecord?.outTime ? 'Punch Out (Exit)' : 'Biometric Punch (Clock In)'}
          </Button>
        </div>
      </div>

      {punchMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{punchMsg}</span>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Today's Punch Status</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold text-slate-900">
              {todayRecord?.inTime ? (todayRecord?.outTime ? 'Punched Out' : 'Clocked In') : 'Not Clocked In'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {todayRecord?.inTime ? `Entry: ${todayRecord.inTime}` : 'Grace period till 09:45 AM'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Logged Hours (Recent)</span>
            <Timer className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold text-slate-900">
              {attendances.reduce((acc, curr) => acc + (curr.totalHours || 0), 0).toFixed(1)} hrs
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            Standard: 8.5 hrs/day
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Shift Timing</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-sm font-bold text-slate-900">09:30 AM – 06:30 PM</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Bellad Showroom Dealership Shift
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Correction Requests</span>
            <FileCheck className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold text-slate-900">
              {corrections.filter((c) => c.status === 'PENDING').length} Pending
            </span>
          </div>
          <span className="text-[11px] text-indigo-600 font-medium mt-1 block">
            BM approval required
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2 overflow-x-auto shadow-xs">
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Daily Punch Logs ({attendances.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'calendar'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Monthly Calendar Grid</span>
        </button>

        <button
          onClick={() => setActiveTab('shifts')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'shifts'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Dealership Shift Roster (4)</span>
        </button>

        <button
          onClick={() => setActiveTab('holidays')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'holidays'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Holiday Calendar 2026 ({DEALERSHIP_HOLIDAYS_2026.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('corrections')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'corrections'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4 text-purple-600" />
          <span>Regularization Queue ({corrections.length})</span>
        </button>
      </div>

      {/* TAB 1: DAILY PUNCH LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200/80 overflow-hidden shadow-xs">
          {/* Filter Bar */}
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search employee or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-48 sm:w-64"
              />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
              {filterDate && (
                <button
                  type="button"
                  onClick={() => setFilterDate('')}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Clear date
                </button>
              )}
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredAttendances.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  {user?.role !== 'EMPLOYEE' && <th className="py-3 px-4">Employee</th>}
                  <th className="py-3 px-4">Dealership Shift</th>
                  <th className="py-3 px-4">In Time</th>
                  <th className="py-3 px-4">Out Time</th>
                  <th className="py-3 px-4">Logged Hours</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendances.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12">
                      <EmptyState
                        icon={Clock}
                        title="No attendance entries found"
                        description="Try modifying search filters or record an attendance punch."
                      />
                    </td>
                  </tr>
                ) : (
                  filteredAttendances.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {formatDate(att.date)}
                      </td>
                      {user?.role !== 'EMPLOYEE' && (
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">
                            {att.employee?.firstName} {att.employee?.lastName}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {att.employee?.employeeCode} • {att.employee?.designation}
                          </span>
                        </td>
                      )}
                      <td className="py-3 px-4 text-slate-600">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          09:30 AM – 06:30 PM
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-700 font-semibold">
                        {att.inTime || '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-indigo-700 font-semibold">
                        {att.outTime || '—'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {att.totalHours ? `${att.totalHours} hrs` : att.inTime ? 'In Progress' : '0 hrs'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={att.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MONTHLY CALENDAR GRID */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-slate-900">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <span className="text-xs text-slate-400 font-medium">Dealership Attendance Grid</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear((y) => y - 1);
                  } else {
                    setCurrentMonth((m) => m - 1);
                  }
                }}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear((y) => y + 1);
                  } else {
                    setCurrentMonth((m) => m + 1);
                  }
                }}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid Header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider py-2 bg-slate-50 rounded-lg">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank leading cells */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`blank-${idx}`} className="h-24 bg-slate-50/40 rounded-xl border border-dashed border-slate-200/60" />
            ))}

            {/* Month Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayOfWeek = (firstDayOfWeek + idx) % 7;
              const isSunday = dayOfWeek === 0;

              // Check if holiday
              const holiday = DEALERSHIP_HOLIDAYS_2026.find((h) => h.date === dateStr);

              // Check if matching attendance
              const attForDay = attendances.find((a) => a.date?.startsWith(dateStr));

              return (
                <div
                  key={dayNum}
                  className={`h-24 p-2 rounded-xl border flex flex-col justify-between transition ${
                    isSunday
                      ? 'bg-slate-50/80 border-slate-200 text-slate-400'
                      : holiday
                      ? 'bg-blue-50/60 border-blue-200'
                      : attForDay
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-white border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-800">{dayNum}</span>
                    {isSunday ? (
                      <span className="text-[9px] font-semibold text-slate-400 bg-slate-200/60 px-1 rounded">
                        OFF
                      </span>
                    ) : holiday ? (
                      <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-1 rounded">
                        HOLIDAY
                      </span>
                    ) : attForDay ? (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded">
                        PRESENT
                      </span>
                    ) : null}
                  </div>

                  <div className="text-[10px]">
                    {holiday ? (
                      <div className="font-semibold text-blue-900 truncate" title={holiday.name}>
                        {holiday.name}
                      </div>
                    ) : attForDay ? (
                      <div className="space-y-0.5 font-mono">
                        <div className="text-emerald-700 font-semibold">{attForDay.inTime || '09:30 AM'}</div>
                        <div className="text-slate-500">{attForDay.totalHours || '8.5'} hrs</div>
                      </div>
                    ) : isSunday ? (
                      <div className="text-slate-400 italic">Weekly Rest</div>
                    ) : (
                      <div className="text-slate-300 italic">Rostered</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <span className="font-bold text-slate-700">Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
              <span>Present (Punched)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-100 border border-blue-300" />
              <span>Dealership Holiday</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-200 border border-slate-300" />
              <span>Weekly Off (Sunday)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
              <span>Grace Period Punch</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEALERSHIP SHIFTS ROSTER */}
      {activeTab === 'shifts' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Standard Dealership Working Shifts</h2>
              <p className="text-xs text-slate-500">
                Configured operational working hours across Showroom, Workshop, and Parts Warehouse
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Bellad Group Dealership Standard
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEALERSHIP_SHIFTS.map((shift) => (
              <div
                key={shift.id}
                className="p-5 rounded-xl border border-slate-200 bg-white hover:shadow-md transition space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {shift.code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1.5">{shift.name}</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-slate-900 text-white font-mono">
                    {shift.startTime} – {shift.endTime}
                  </span>
                </div>

                <p className="text-xs text-slate-600">{shift.description}</p>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Grace Allowance</span>
                    <span className="font-semibold text-slate-800">{shift.gracePeriodMins} Minutes</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Lunch / Rest Break</span>
                    <span className="font-semibold text-slate-800">{shift.breakDurationMins} Minutes</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                    Covered Departments:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {shift.departments.map((dept, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium"
                      >
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: HOLIDAY CALENDAR */}
      {activeTab === 'holidays' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Official Dealership Holiday Calendar (Year 2026)
              </h2>
              <p className="text-xs text-slate-500">
                Karnataka State & Automobile Dealership Gazetted Holidays (Bellad Group)
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 px-3 py-1 bg-slate-100 rounded-lg">
              12 Recognized Dealership Holidays
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {DEALERSHIP_HOLIDAYS_2026.map((h) => (
              <div
                key={h.id}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 transition flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">
                    {h.type}
                  </span>
                  <div className="text-xs font-bold text-slate-900">{h.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {formatDate(h.date)} • {h.day}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                  <Sun className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: REGULARIZATION & CORRECTIONS QUEUE */}
      {activeTab === 'corrections' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200/80 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Attendance Regularization / Correction Requests
              </h3>
              <p className="text-[11px] text-slate-500">
                Missed punch regularization requests submitted for BM / HR approval
              </p>
            </div>

            {user?.role === 'EMPLOYEE' && (
              <Button
                size="sm"
                variant="primary"
                icon={Plus}
                onClick={() => setShowCorrectionModal(true)}
              >
                Submit Regularization
              </Button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Missed Date</th>
                  <th className="py-3 px-4">Requested Punch</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4">Status</th>
                  {(user?.role === 'BM' || user?.role === 'HR') && (
                    <th className="py-3 px-4 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {corrections.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12">
                      <EmptyState
                        icon={FileCheck}
                        title="No regularization requests"
                        description="All biometric punches are up-to-date and regularized."
                      />
                    </td>
                  </tr>
                ) : (
                  corrections.map((corr) => (
                    <tr key={corr.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {corr.employee?.firstName} {corr.employee?.lastName}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {corr.employee?.employeeCode} • {corr.employee?.designation}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {formatDate(corr.requestedDate)}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className="text-emerald-700 font-bold">{corr.punchIn}</span>
                        <span className="text-slate-400 mx-1.5">→</span>
                        <span className="text-indigo-700 font-bold">{corr.punchOut}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={corr.reason}>
                        {corr.reason}
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={corr.status} />
                      </td>
                      {(user?.role === 'BM' || user?.role === 'HR') && (
                        <td className="py-3 px-4 text-right">
                          {corr.status === 'PENDING' ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleApproveCorrection(corr.id, 'APPROVED')}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleApproveCorrection(corr.id, 'REJECTED')}
                                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold transition"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">Completed</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Request Attendance Correction */}
      <Modal
        isOpen={showCorrectionModal}
        onClose={() => setShowCorrectionModal(false)}
        title="Attendance Regularization / Missed Punch Request"
      >
        <form onSubmit={handleCorrectionSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Date of Missed Punch *</label>
            <input
              type="date"
              required
              value={corrForm.requestedDate}
              onChange={(e) => setCorrForm({ ...corrForm, requestedDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Actual Punch In *</label>
              <input
                type="text"
                required
                placeholder="09:30 AM"
                value={corrForm.punchIn}
                onChange={(e) => setCorrForm({ ...corrForm, punchIn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Actual Punch Out *</label>
              <input
                type="text"
                required
                placeholder="06:30 PM"
                value={corrForm.punchOut}
                onChange={(e) => setCorrForm({ ...corrForm, punchOut: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason for Regularization *</label>
            <textarea
              required
              rows="3"
              placeholder="e.g. Biometric scanner offline at Workshop Bay 3, outdoor client test-drive, or card misplaced"
              value={corrForm.reason}
              onChange={(e) => setCorrForm({ ...corrForm, reason: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button size="sm" variant="outline" onClick={() => setShowCorrectionModal(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" loading={corrLoading}>
              Submit Request for Approval
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AttendancePage;
