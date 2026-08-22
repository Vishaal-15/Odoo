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
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'EMPLOYEE';

  const getNavItems = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'User Directory', path: '/admin/users', icon: Users },
          { label: 'Employee Profiles', path: '/hr/employees', icon: Briefcase },
          { label: 'Attendance Monitor', path: '/hr/attendance', icon: Clock },
          { label: 'Leave Approvals', path: '/hr/leaves', icon: Calendar },
          { label: 'Payroll Controls', path: '/hr/payroll', icon: DollarSign },
          { label: 'Analytics Insights', path: '/analytics', icon: BarChart3 },
          { label: 'Reports Generator', path: '/reports', icon: FileText },
          { label: 'System Settings', path: '/admin/system', icon: Settings },
        ];
      case 'HR':
        return [
          { label: 'HR Dashboard', path: '/hr/dashboard', icon: LayoutDashboard },
          { label: 'Employee Records', path: '/hr/employees', icon: Users },
          { label: 'Attendance Logs', path: '/hr/attendance', icon: Clock },
          { label: 'Leave Approvals', path: '/hr/leaves', icon: Calendar },
          { label: 'Payroll Overview', path: '/hr/payroll', icon: DollarSign },
          { label: 'HR Notifications', path: '/hr/notifications', icon: Bell },
          { label: 'Workforce Analytics', path: '/analytics', icon: BarChart3 },
          { label: 'Reports Export', path: '/reports', icon: FileText },
        ];
      case 'EMPLOYEE':
      default:
        return [
          { label: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
          { label: 'My Profile', path: '/employee/profile', icon: User },
          { label: 'Attendance Tracker', path: '/employee/attendance', icon: Clock },
          { label: 'Leave Requests', path: '/employee/leave', icon: Calendar },
          { label: 'Payslip & Salary', path: '/employee/payroll', icon: DollarSign },
          { label: 'Notifications', path: '/employee/notifications', icon: Bell },
        ];
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = getNavItems();

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '1.5rem 1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1rem',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
            }}
          >
            DF
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              Dayflow
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              HRMS Workspace
            </div>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav
        style={{
          padding: '1.25rem 0.875rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
          flex: 1,
          overflowY: 'auto',
        }}
      >
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-dim)', padding: '0.25rem 0.6rem', textTransform: 'uppercase' }}>
          Navigation ({role})
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                backgroundColor: isActive ? 'var(--primary-600)' : 'transparent',
                transition: 'all 0.15s ease',
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout Footer */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                color: 'var(--primary-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '0.8rem',
                flexShrink: 0,
              }}
            >
              {user?.first_name ? user.first_name[0] : 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user?.first_name} {user?.last_name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                {user?.role}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-outline"
          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8rem', display: 'flex', gap: '0.4rem', justifyContent: 'center' }}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
