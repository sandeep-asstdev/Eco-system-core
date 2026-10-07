import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  UserPlus,
  Banknote,
  Clock,
  CheckSquare,
  BarChart3,
  ShieldCheck,
  CreditCard,
  Building2,
  FileCheck,
  UserCheck,
  Layers,
  Network,
  CalendarDays,
  Receipt,
  Package,
  LifeBuoy,
  FileText,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose, isCollapsed, toggleCollapse }) => {
  const { user } = useAuth();

  // Role-based navigation catalog grouped by functional sections
  const getNavSections = () => {
    const role = user?.role || 'EMPLOYEE';

    if (role === 'PLATFORM_ADMIN') {
      return [
        {
          title: 'System Control',
          items: [
            { label: 'Command Center', to: '/dashboard', icon: LayoutDashboard },
            { label: 'Dealership Groups', to: '/platform/tenants', icon: Building2 },
            { label: 'Global Audit Trail', to: '/audit', icon: ShieldCheck }
          ]
        },
        {
          title: 'Configuration',
          items: [
            { label: 'Dealership Settings', to: '/tenant/settings', icon: Layers },
            { label: 'Organization Masters', to: '/tenant/organization-masters', icon: Building2 }
          ]
        }
      ];
    }

    if (role === 'HR') {
      return [
        {
          title: 'Overview',
          items: [
            { label: 'HR Dashboard', to: '/dashboard', icon: LayoutDashboard }
          ]
        },
        {
          title: 'Workforce',
          items: [
            { label: 'Employee Master', to: '/employees', icon: Users },
            { label: 'Organization Chart', to: '/employees/org-chart', icon: Network },
            { label: 'Document Requests', to: '/employees/document-requests', icon: FileText },
            { label: 'Levels & Designations', to: '/tenant/organization-masters', icon: Layers },
            { label: 'Dealership Settings', to: '/tenant/settings', icon: Building2 }
          ]
        },
        {
          title: 'Talent Acquisition',
          items: [
            { label: 'Vacancy Master', to: '/vacancies', icon: Briefcase },
            { label: 'Recruitment (ATS)', to: '/recruitment', icon: UserPlus },
            { label: 'Digital Onboarding', to: '/joining', icon: FileCheck }
          ]
        },
        {
          title: 'Time & Leaves',
          items: [
            { label: 'Attendance & Punches', to: '/attendance', icon: Clock },
            { label: 'Leave Management', to: '/leave', icon: CalendarDays }
          ]
        },
        {
          title: 'Compensation',
          items: [
            { label: 'Salary & Payroll', to: '/payroll', icon: Banknote },
            { label: 'Payment Advice', to: '/payroll/advice', icon: FileSpreadsheet },
            { label: 'Salary Advances', to: '/advances', icon: CreditCard },
            { label: 'Claims & Expenses', to: '/claims', icon: Receipt }
          ]
        },
        {
          title: 'Facilities & Exit',
          items: [
            { label: 'Asset Management', to: '/assets', icon: Package },
            { label: 'HR Helpdesk', to: '/helpdesk', icon: LifeBuoy },
            { label: 'Exit Clearance & F&F', to: '/exit', icon: UserCheck }
          ]
        },
        {
          title: 'Governance',
          items: [
            { label: 'Approvals Center', to: '/approvals', icon: CheckSquare, badge: 'Active' },
            { label: 'Reports & Analytics', to: '/reports', icon: BarChart3 },
            { label: 'Audit Trail', to: '/audit', icon: ShieldCheck }
          ]
        }
      ];
    }

    if (role === 'BM') {
      return [
        {
          title: 'Branch Ops',
          items: [
            { label: 'Branch Dashboard', to: '/dashboard', icon: LayoutDashboard },
            { label: 'Branch Employees', to: '/employees', icon: Users },
            { label: 'Org Chart', to: '/employees/org-chart', icon: Network },
            { label: 'Branch Vacancies', to: '/vacancies', icon: Briefcase },
            { label: 'Recruitment & Interviews', to: '/recruitment', icon: UserPlus }
          ]
        },
        {
          title: 'Roster & Approvals',
          items: [
            { label: 'Attendance Review', to: '/attendance', icon: Clock },
            { label: 'Leave Requests', to: '/leave', icon: CalendarDays },
            { label: 'Branch Approvals', to: '/approvals', icon: CheckSquare, badge: 'Pending' },
            { label: 'Payment Advice', to: '/payroll/advice', icon: FileSpreadsheet },
            { label: 'Salary Advances', to: '/advances', icon: CreditCard },
            { label: 'Claims Approvals', to: '/claims', icon: Receipt }
          ]
        },
        {
          title: 'Facilities & Exit',
          items: [
            { label: 'Branch Assets', to: '/assets', icon: Package },
            { label: 'HR Helpdesk', to: '/helpdesk', icon: LifeBuoy },
            { label: 'Exit & LWI Reports', to: '/exit', icon: UserCheck }
          ]
        }
      ];
    }

    // Default: EMPLOYEE
    return [
      {
        title: 'Personal Workspace',
        items: [
          { label: 'My Dashboard', to: '/dashboard', icon: LayoutDashboard },
          { label: 'My Profile & Digital ID', to: `/employees/${user?.employeeId || 'me'}`, icon: Users },
          { label: 'My Attendance & Punches', to: '/attendance', icon: Clock },
          { label: 'Apply Leave', to: '/leave', icon: CalendarDays }
        ]
      },
      {
        title: 'Compensation & Claims',
        items: [
          { label: 'My Payslips', to: '/payroll', icon: Banknote },
          { label: 'Salary Advance Request', to: '/advances', icon: CreditCard },
          { label: 'Travel & Expense Claims', to: '/claims', icon: Receipt }
        ]
      },
      {
        title: 'Services & Support',
        items: [
          { label: 'Assigned Assets', to: '/assets', icon: Package },
          { label: 'HR Helpdesk Ticket', to: '/helpdesk', icon: LifeBuoy },
          { label: 'Resignation & Clearance', to: '/exit', icon: FileCheck }
        ]
      }
    ];
  };

  const sections = getNavSections();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-slate-200/90 flex flex-col transition-all duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-64'} w-64`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/80 bg-white shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white shadow-xs shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-slate-900 tracking-tight">HRFlow</span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                    SaaS
                  </span>
                </div>
                <span className="text-[10px] block font-medium text-slate-500 truncate">
                  {user?.tenant?.organizationName || 'Automobile Dealership'}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!isCollapsed ? (
                <div className="px-3 pb-1 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                  {section.title}
                </div>
              ) : (
                <div className="w-4 h-0.5 bg-slate-200 mx-auto my-2 rounded"></div>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    title={isCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center ${
                        isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2'
                      } rounded-xl text-xs font-medium transition-all group relative ${
                        isActive
                          ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/20'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                    {!isCollapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        {item.badge}
                      </span>
                    )}

                    {/* Tooltip in collapsed mode */}
                    {isCollapsed && (
                      <div className="hidden lg:group-hover:block absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-md whitespace-nowrap shadow-xl z-50 pointer-events-none">
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer: User role & Desktop Collapse Toggle */}
        <div className="p-3 border-t border-slate-200/80 bg-slate-50/80 shrink-0">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="truncate">
                <p className="text-[11px] font-bold text-slate-800 truncate">{user?.name || user?.email}</p>
                <p className="text-[10px] text-slate-500 font-medium capitalize">
                  {user?.role === 'PLATFORM_ADMIN' ? 'Platform SuperAdmin' : user?.role === 'HR' ? 'Tenant HR' : user?.role === 'BM' ? 'Branch Manager' : 'Employee'}
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={toggleCollapse}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white border border-transparent hover:border-slate-200 shadow-2xs transition"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
