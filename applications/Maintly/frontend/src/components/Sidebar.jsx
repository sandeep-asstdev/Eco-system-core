import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard, Wrench, PlusCircle, Clock,
  Users, Settings2, Shield, Layers, X, ChevronDown, ChevronRight,
  ClipboardList,
  Box, Calendar, ShoppingCart, Building2, BarChart3, FileText,
  Sliders
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { role, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isPlatformAdmin = role === 'PLATFORM_ADMIN';
  const isTenantAdmin = role === 'TENANT_ADMIN' || isPlatformAdmin;
  const isManager = role === 'MANAGER' || isTenantAdmin;

  const isRequestsRoute = location.pathname.startsWith('/requests') || location.pathname.startsWith('/work');

  const [openSections, setOpenSections] = useState({
    requests: true,
    admin: isManager
  });

  const toggleSection = (sec) => {
    setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const isViewActive = (targetView) => {
    if (!isRequestsRoute) return false;
    const params = new URLSearchParams(location.search);
    const currentView = params.get('view');

    if (!targetView || targetView === 'all') {
      return !currentView || currentView === 'all';
    }
    if (targetView === 'assigned') {
      return currentView === 'assigned' || currentView === 'assigned_to_me';
    }
    if (targetView === 'pending_approval') {
      return currentView === 'pending_approval' || currentView === 'waiting_approval';
    }
    return currentView === targetView;
  };

  const renderTopNavLink = (to, IconComponent, label, exact = false) => (
    <NavLink
      to={to}
      end={exact}
      onClick={onClose}
      className={({ isActive }) =>
        `group flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-0 ${
          isActive
            ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-200'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <IconComponent
            className={`w-4 h-4 shrink-0 transition-colors ${
              isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
            }`}
          />
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  );

  const renderSubNavButton = (viewKey, label) => {
    const active = isViewActive(viewKey);
    return (
      <button
        key={viewKey || 'all'}
        type="button"
        onClick={() => {
          navigate(viewKey ? `/requests?view=${viewKey}` : '/requests');
          if (onClose) onClose();
        }}
        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus:outline-none focus:ring-0 cursor-pointer ${
          active
            ? 'bg-indigo-50 text-indigo-700 font-semibold'
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <span className="truncate">{label}</span>
        {active && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />}
      </button>
    );
  };

  const renderAdminNavLink = (to, IconComponent, label) => (
    <NavLink
      to={to}
      onClick={onClose}
      className={({ isActive }) =>
        `group flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus:outline-none focus:ring-0 ${
          isActive
            ? 'bg-indigo-50 text-indigo-700 font-semibold'
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-2 min-w-0">
            <IconComponent
              className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
              }`}
            />
            <span className="truncate">{label}</span>
          </div>
          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />}
        </>
      )}
    </NavLink>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900">MAINTLY</span>
              <span className="block text-[9px] font-bold text-indigo-600 uppercase tracking-widest -mt-0.5">
                Maintenance Workflow
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action: New Request */}
        <div className="p-3 border-b border-slate-100">
          <button
            type="button"
            onClick={() => {
              navigate('/requests?action=new');
              if (onClose) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-xs shadow-indigo-200 transition-all cursor-pointer focus:outline-none focus:ring-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Request</span>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          {/* Dashboard */}
          <div>
            {renderTopNavLink('/dashboard', LayoutDashboard, 'Dashboard', true)}
          </div>

          {/* Requests Section */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('requests')}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer focus:outline-none focus:ring-0 ${
                isRequestsRoute
                  ? 'text-indigo-700 bg-indigo-50/50'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <ClipboardList className={`w-3.5 h-3.5 ${isRequestsRoute ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>Requests</span>
              </div>
              {openSections.requests ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openSections.requests && (
              <div className="mt-1 space-y-0.5 pl-2">
                {renderSubNavButton('my_requests', 'My Requests')}
                {renderSubNavButton('', 'All Requests')}
                {renderSubNavButton('pending_approval', 'Pending Approval')}
                {renderSubNavButton('assigned', 'Assigned')}
                {renderSubNavButton('in_progress', 'In Progress')}
                {renderSubNavButton('completed', 'Completed')}
                {renderSubNavButton('payment_pending', 'Payment Pending')}
                {renderSubNavButton('closed', 'Closed')}
              </div>
            )}
          </div>

          {/* Plant & Operations */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Operations & Plant
            </div>
            {renderTopNavLink('/assets', Box, 'Assets & Equipment')}
            {renderTopNavLink('/pm', Calendar, 'Preventive Maintenance')}
          </div>

          {/* Intelligence & Analytics */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Intelligence
            </div>
            {renderTopNavLink('/analytics', BarChart3, 'Analytics & SLA')}
            {renderTopNavLink('/reports', FileText, 'Reports & Telemetry')}
          </div>

          {/* Procurement & Vendors */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Procurement
            </div>
            {renderTopNavLink('/purchases', ShoppingCart, 'Purchase Orders')}
            {renderTopNavLink('/vendors', Building2, 'Vendors')}
          </div>

          {/* Administration Section */}
          {isManager && (
            <div>
              <button
                type="button"
                onClick={() => toggleSection('admin')}
                className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 cursor-pointer focus:outline-none focus:ring-0"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>Administration</span>
                </div>
                {openSections.admin ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {openSections.admin && (
                <div className="mt-1 space-y-0.5 pl-2">
                  {renderAdminNavLink('/approval-matrix', Sliders, 'Approval Matrix')}
                  {renderAdminNavLink('/users', Users, 'Users & Access')}
                  {renderAdminNavLink('/master-data', Layers, 'Categories')}
                  {renderAdminNavLink('/audit-logs', Clock, 'Audit Logs')}
                  {renderAdminNavLink('/settings', Settings2, 'Tenant Settings')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Card footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
              {user?.firstName?.[0] || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'User'}
              </p>
              <p className="text-[10px] text-slate-500 truncate capitalize">
                {role ? role.toLowerCase().replace('_', ' ') : 'Guest'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
