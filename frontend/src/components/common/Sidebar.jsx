import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Clock,
  Calendar,
  DollarSign,
  Bell,
  Users,
  Shield,
  BarChart3,
  FileText,
  LogOut,
  Settings,
  Briefcase,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = ({ mobileOpen = false, onCloseMobile = () => {} }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'EMPLOYEE';

  const getNavSections = () => {
    switch (role) {
      case 'ADMIN':
        return [
          {
            section: 'Administration',
            items: [
              { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
              { label: 'User Directory', path: '/admin/users', icon: Shield },
              { label: 'System Settings', path: '/admin/system', icon: Settings },
            ],
          },
          {
            section: 'HR Operations',
            items: [
              { label: 'Employee Profiles', path: '/hr/employees', icon: Users },
              { label: 'Attendance Monitor', path: '/hr/attendance', icon: Clock },
              { label: 'Leave Approvals', path: '/hr/leaves', icon: Calendar },
              { label: 'Payroll Controls', path: '/hr/payroll', icon: DollarSign },
            ],
          },
          {
            section: 'Intelligence',
            items: [
              { label: 'Analytics Insights', path: '/analytics', icon: BarChart3 },
              { label: 'Reports Generator', path: '/reports', icon: FileText },
            ],
          },
        ];
      case 'HR':
        return [
          {
            section: 'HR Core',
            items: [
              { label: 'HR Dashboard', path: '/hr/dashboard', icon: LayoutDashboard },
              { label: 'Employee Records', path: '/hr/employees', icon: Users },
              { label: 'Attendance Logs', path: '/hr/attendance', icon: Clock },
              { label: 'Leave Approvals', path: '/hr/leaves', icon: Calendar },
              { label: 'Payroll Overview', path: '/hr/payroll', icon: DollarSign },
            ],
          },
          {
            section: 'Intelligence & Comms',
            items: [
              { label: 'Workforce Analytics', path: '/analytics', icon: BarChart3 },
              { label: 'Reports Export', path: '/reports', icon: FileText },
              { label: 'HR Notifications', path: '/hr/notifications', icon: Bell },
            ],
          },
        ];
      case 'EMPLOYEE':
      default:
        return [
          {
            section: 'Workspace',
            items: [
              { label: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
              { label: 'My Profile', path: '/employee/profile', icon: User },
              { label: 'Attendance', path: '/employee/attendance', icon: Clock },
              { label: 'Leave Requests', path: '/employee/leave', icon: Calendar },
              { label: 'Payslip & Salary', path: '/employee/payroll', icon: DollarSign },
              { label: 'Notifications', path: '/employee/notifications', icon: Bell },
            ],
          },
        ];
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navSections = getNavSections();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900/95 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center font-extrabold text-sm text-white shadow-glow-brand">
              DF
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-slate-100 flex items-center gap-1.5">
                Dayflow HRMS
              </div>
              <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                {role} Console
              </div>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Sections */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {navSections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {sec.section}
              </div>
              {sec.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 group relative ${
                        isActive
                          ? 'bg-brand-600/90 text-white font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                        {isActive && (
                          <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-white" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Info & Sign Out Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {user?.first_name || 'User'} {user?.last_name || ''}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {user?.email || 'user@dayflow.com'}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
