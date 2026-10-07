import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  LogOut,
  User,
  Building2,
  ChevronDown,
  Menu,
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatDateTime } from '../../utils/formatters';
import api from '../../services/api';

export const Topbar = ({ onMenuClick }) => {
  const { user, logout, switchRole } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [showSearchDrop, setShowSearchDrop] = useState(false);

  // Quick Attendance Punch State
  const [punchState, setPunchState] = useState(null);
  const [punchLoading, setPunchLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchPunchStatus = async () => {
      try {
        const res = await api.get('/attendance');
        const list = res.data?.data || [];
        const todayStr = new Date().toISOString().split('T')[0];
        const todayRecord = list.find((rec) => {
          if (!rec.date) return false;
          return new Date(rec.date).toISOString().split('T')[0] === todayStr;
        });

        if (todayRecord) {
          if (todayRecord.inTime && !todayRecord.outTime) {
            setPunchState({ status: 'CLOCKED_IN', inTime: todayRecord.inTime, outTime: null, recordId: todayRecord.id });
          } else if (todayRecord.inTime && todayRecord.outTime) {
            setPunchState({ status: 'CLOCKED_OUT', inTime: todayRecord.inTime, outTime: todayRecord.outTime, recordId: todayRecord.id });
          } else {
            setPunchState({ status: 'NOT_STARTED' });
          }
        } else {
          setPunchState({ status: 'NOT_STARTED' });
        }
      } catch (err) {
        // Attendance might not be permitted for some non-employee roles
        setPunchState(null);
      }
    };
    fetchPunchStatus();
  }, [user]);

  const handlePunch = async () => {
    setPunchLoading(true);
    try {
      const res = await api.post('/attendance/punch');
      const data = res.data?.data;
      if (data) {
        if (data.inTime && !data.outTime) {
          setPunchState({ status: 'CLOCKED_IN', inTime: data.inTime, outTime: null, recordId: data.id });
        } else {
          setPunchState({ status: 'CLOCKED_OUT', inTime: data.inTime, outTime: data.outTime, recordId: data.id });
        }
      }
    } catch (err) {
      console.error('Punch failed:', err);
      alert(err.response?.data?.message || 'Attendance punch failed. Ensure you are an active employee.');
    } finally {
      setPunchLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'PLATFORM_ADMIN':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'HR':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'BM':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  const handleSearch = async (val) => {
    setSearchQuery(val);
    if (!val || val.trim().length < 2) {
      setSearchResults(null);
      setShowSearchDrop(false);
      return;
    }
    setSearching(true);
    setShowSearchDrop(true);
    try {
      const res = await api.get('/search', { params: { q: val } });
      setSearchResults(res.data?.data || null);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      {/* Left: Mobile Toggle, Search & Tenant/Branch Badges */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Multi-Tenant Search */}
        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => { if (searchResults) setShowSearchDrop(true); }}
            placeholder={user?.role === 'PLATFORM_ADMIN' ? 'Global system search...' : `Search in ${user?.tenant?.organizationName || 'Bellad Group'}...`}
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />

          {showSearchDrop && searchResults && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between px-2 py-1 text-[10px] text-slate-400 font-semibold border-b border-slate-100">
                <span>Search Results</span>
                <button onClick={() => setShowSearchDrop(false)} className="text-slate-400 hover:text-slate-600">Close</button>
              </div>
              {searchResults.employees?.length > 0 && (
                <div className="py-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">Employees</div>
                  {searchResults.employees.map((emp) => (
                    <a
                      key={emp.id}
                      href={`/employees/${emp.id}`}
                      className="px-2 py-1.5 rounded-lg hover:bg-indigo-50 flex items-center justify-between text-slate-800"
                    >
                      <span className="font-semibold">{emp.firstName} {emp.lastName} ({emp.employeeCode})</span>
                      <span className="text-[10px] text-slate-400">{emp.department} • {emp.branch?.name}</span>
                    </a>
                  ))}
                </div>
              )}
              {searchResults.branches?.length > 0 && (
                <div className="py-1 border-t border-slate-100">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">Branches</div>
                  {searchResults.branches.map((b) => (
                    <div key={b.id} className="px-2 py-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between text-slate-800">
                      <span className="font-medium">{b.name} ({b.code})</span>
                      <span className="text-[10px] text-slate-400">{b.city}</span>
                    </div>
                  ))}
                </div>
              )}
              {(!searchResults.employees?.length && !searchResults.branches?.length && !searchResults.positions?.length) && (
                <div className="p-4 text-center text-slate-400">No matching records found.</div>
              )}
            </div>
          )}
        </div>

        {/* Tenant badge */}
        {user?.tenant ? (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-md text-xs font-semibold border border-indigo-200/80 shrink-0">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>{user.tenant.organizationName}</span>
          </div>
        ) : user?.role === 'PLATFORM_ADMIN' ? (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-md text-xs font-semibold border border-amber-200/80 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Platform Administration</span>
          </div>
        ) : null}

        {/* Branch scope tag if assigned */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200 shrink-0">
          <MapPin className="w-3 h-3 text-slate-500" />
          <span>{user?.branch?.name || (user?.role === 'PLATFORM_ADMIN' ? 'All Dealer Groups' : 'Hubli Central HQ')}</span>
        </div>
      </div>

      {/* Right: Quick Punch, Demo Switcher, Notifications, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Horilla-style Quick Attendance Punch Widget */}
        {punchState && (
          <div className="hidden sm:flex items-center">
            {punchState.status === 'NOT_STARTED' && (
              <button
                type="button"
                onClick={handlePunch}
                disabled={punchLoading}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg shadow-2xs transition active:scale-95"
                title="Record Clock-In punch for today"
              >
                {punchLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-emerald-600" />}
                <span>Clock In</span>
              </button>
            )}

            {punchState.status === 'CLOCKED_IN' && (
              <button
                type="button"
                onClick={handlePunch}
                disabled={punchLoading}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg shadow-2xs transition active:scale-95 group"
                title="Click to Clock Out"
              >
                {punchLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                )}
                <span>In: {punchState.inTime}</span>
                <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider group-hover:underline pl-0.5">
                  • Clock Out
                </span>
              </button>
            )}

            {punchState.status === 'CLOCKED_OUT' && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-lg shadow-2xs"
                title={`Punched In at ${punchState.inTime}, Out at ${punchState.outTime}`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Punched Out ({punchState.outTime})</span>
              </div>
            )}
          </div>
        )}

        {/* Demo Role Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Role: </span>
            <span className="font-semibold uppercase">{user?.role}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {showDemoMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {/* Reference Tenant: Bellad Group */}
              <div className="p-1">
                <div className="px-2 py-1 text-[10px] font-bold text-indigo-800 uppercase tracking-wider bg-indigo-50/80 rounded flex items-center justify-between">
                  <span>Reference: Bellad Group</span>
                  <span className="text-[9px] bg-indigo-200 text-indigo-900 px-1 rounded">10 Levels</span>
                </div>
                <button
                  onClick={() => {
                    switchRole('HR_BELLAD');
                    setShowDemoMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 mt-0.5 rounded flex items-center justify-between hover:bg-slate-50 ${user?.email === 'hr.bellad@hrflow.com' ? 'font-bold text-indigo-700 bg-indigo-50/50' : 'text-slate-700'}`}
                >
                  <div>
                    <p className="font-semibold">Bellad HR Head</p>
                    <p className="text-[10px] text-slate-400">Kavitha Deshpande (Level 2)</p>
                  </div>
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-semibold">HR</span>
                </button>
                <button
                  onClick={() => {
                    switchRole('BM_HUBLI');
                    setShowDemoMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between hover:bg-slate-50 ${user?.email === 'bm.hubli@hrflow.com' ? 'font-bold text-indigo-700 bg-indigo-50/50' : 'text-slate-700'}`}
                >
                  <div>
                    <p className="font-semibold">BM — Hubli Central HQ</p>
                    <p className="text-[10px] text-slate-400">Branch Operations Lead</p>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">BM</span>
                </button>
                <button
                  onClick={() => {
                    switchRole('MD_BELLAD');
                    setShowDemoMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between hover:bg-slate-50 ${user?.email === 'md.bellad@hrflow.com' ? 'font-bold text-indigo-700 bg-indigo-50/50' : 'text-slate-700'}`}
                >
                  <div>
                    <p className="font-semibold">MD — Anand Bellad</p>
                    <p className="text-[10px] text-slate-400">Managing Director (Level 1)</p>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">EXEC</span>
                </button>
              </div>

              {/* Tenant A: Apex Auto Group */}
              <div className="p-1">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider bg-slate-50 rounded">
                  Dealer Group: Apex Auto
                </div>
                <button
                  onClick={() => {
                    switchRole('HR');
                    setShowDemoMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 mt-0.5 rounded flex items-center justify-between hover:bg-slate-50 ${user?.email === 'hr@hrflow.com' ? 'font-bold text-indigo-600 bg-indigo-50/50' : 'text-slate-700'}`}
                >
                  <span>Apex HR Admin</span>
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded">HR</span>
                </button>
                <button
                  onClick={() => {
                    switchRole('BM_MUMBAI');
                    setShowDemoMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between hover:bg-slate-50 ${user?.email === 'bm.mumbai@hrflow.com' ? 'font-bold text-indigo-600 bg-indigo-50/50' : 'text-slate-700'}`}
                >
                  <span>BM — Mumbai HQ</span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded">BM</span>
                </button>
                <button
                  onClick={() => {
                    switchRole('EMP_RAHUL');
                    setShowDemoMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between hover:bg-slate-50 ${user?.email === 'emp.rahul@hrflow.com' ? 'font-bold text-indigo-600 bg-indigo-50/50' : 'text-slate-700'}`}
                >
                  <span>Emp — Rahul (Tech)</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded">EMP</span>
                </button>
              </div>

              {/* Platform SuperAdmin */}
              <div className="p-1">
                <div className="px-2 py-1 text-[10px] font-bold text-amber-700 uppercase tracking-wider bg-amber-50 rounded">
                  SaaS Platform Level
                </div>
                <button
                  onClick={() => {
                    switchRole('PLATFORM_ADMIN');
                    setShowDemoMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 mt-0.5 rounded flex items-center justify-between hover:bg-slate-50 ${user?.role === 'PLATFORM_ADMIN' ? 'font-bold text-amber-700 bg-amber-50/50' : 'text-slate-700'}`}
                >
                  <span>Platform SuperAdmin</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">Platform</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 relative transition"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in">
              <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-800">Notifications ({unreadCount} new)</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition flex flex-col gap-0.5 ${!n.isRead ? 'bg-indigo-50/30' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{formatDateTime(n.createdAt)}</span>
                      </div>
                      <p className="text-slate-600">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-2 border-l border-slate-200"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-xs shadow-xs">
              {user?.employee
                ? `${user.employee.firstName[0]}${user.employee.lastName[0]}`
                : user?.role === 'HR'
                ? 'HR'
                : 'BM'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-900 leading-tight">
                {user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user?.email?.split('@')[0]}
              </p>
              <span className={`inline-block text-[10px] font-medium px-1.5 py-0.2 rounded border ${getRoleBadge(user?.role)}`}>
                {user?.role}
              </span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900 truncate">{user?.email}</p>
                <p className="text-[11px] text-slate-500">Role: {user?.role}</p>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
