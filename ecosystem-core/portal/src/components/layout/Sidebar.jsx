import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Briefcase, 
  MapPin, 
  Users, 
  ShieldCheck, 
  Boxes, 
  Grid, 
  History, 
  User,
  Car,
  ArrowRightLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Sidebar({ currentPath, onNavigate }) {
  const { isPlatformAdmin, hasPermission } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      path: '/'
    },
    {
      id: 'launcher',
      label: 'Application Launcher',
      icon: Grid,
      path: '/launcher'
    },
    {
      section: 'ORGANIZATION MASTER'
    },
    {
      id: 'tenants',
      label: 'Dealership Groups',
      icon: Building2,
      path: '/tenants',
      visible: isPlatformAdmin || hasPermission('org.tenant.manage')
    },
    {
      id: 'firms-brands',
      label: 'Legal Firms & Brands',
      icon: Briefcase,
      path: '/firms-brands',
      visible: isPlatformAdmin || hasPermission('org.firm.view') || hasPermission('org.firm.manage')
    },
    {
      id: 'branches',
      label: 'Branches & Facilities',
      icon: MapPin,
      path: '/branches',
      visible: isPlatformAdmin || hasPermission('org.branch.view') || hasPermission('org.branch.manage')
    },
    {
      section: 'ACCESS & GOVERNANCE'
    },
    {
      id: 'users',
      label: 'Staff Directory',
      icon: Users,
      path: '/users',
      visible: isPlatformAdmin || hasPermission('org.user.view') || hasPermission('org.user.manage')
    },
    {
      id: 'roles',
      label: 'Roles & Scopes',
      icon: ShieldCheck,
      path: '/roles',
      visible: isPlatformAdmin || hasPermission('rbac.role.manage') || hasPermission('org.user.manage')
    },
    {
      id: 'applications',
      label: 'App Subscriptions',
      icon: Boxes,
      path: '/applications',
      visible: isPlatformAdmin || hasPermission('org.tenant.manage')
    },
    {
      id: 'audit-logs',
      label: 'Audit Trails',
      icon: History,
      path: '/audit-logs',
      visible: isPlatformAdmin || hasPermission('org.audit.view')
    },
    {
      id: 'sync-monitor',
      label: 'Sync & Event Bus',
      icon: ArrowRightLeft,
      path: '/sync-monitor',
      visible: isPlatformAdmin || hasPermission('org.tenant.manage') || hasPermission('org.audit.view')
    },
    {
      section: 'ACCOUNT'
    },
    {
      id: 'profile',
      label: 'Profile & Settings',
      icon: User,
      path: '/profile'
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 bg-slate-950 border-b border-slate-800">
        <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
          <Car className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-white text-sm tracking-tight leading-none">AutoEcosystem</h1>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Central Management</p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item, idx) => {
          if (item.section) {
            return (
              <div key={idx} className="pt-4 pb-1 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {item.section}
              </div>
            );
          }

          if (item.visible === false) return null;

          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                isActive 
                  ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/30' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Ecosystem v1.0.0</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </div>
    </aside>
  );
}
