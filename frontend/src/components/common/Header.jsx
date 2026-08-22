import React from 'react';
import { Bell, Search, Clock, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Badge from './Badge';
import { NavLink } from 'react-router-dom';

export const Header = () => {
  const { user } = useAuth();
  const role = user?.role || 'EMPLOYEE';

  return (
    <header
      style={{
        height: '64px',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
          Dayflow Enterprise HRMS
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Role Badge */}
        <Badge status={role} variant={role === 'ADMIN' ? 'warning' : role === 'HR' ? 'success' : 'info'}>
          {role}
        </Badge>

        {/* Notifications Icon */}
        <NavLink
          to={role === 'EMPLOYEE' ? '/employee/notifications' : '/hr/notifications'}
          style={{
            position: 'relative',
            color: 'var(--text-muted)',
            padding: '6px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-main)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Notifications"
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-500)',
            }}
          />
        </NavLink>

        {/* User Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-600)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            {user?.first_name ? user.first_name[0] : 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {user?.first_name} {user?.last_name}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
              {user?.email}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
