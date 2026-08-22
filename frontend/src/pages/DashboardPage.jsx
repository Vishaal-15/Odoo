import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const DashboardPage = () => {
  const { user } = useAuth();

  const moduleStatus = [
    { name: 'Authentication & RBAC', status: 'Ready (Foundation)', dev: 'Lead Architect / Dev 1' },
    { name: 'Employee Management', status: 'In Progress', dev: 'Developer 1' },
    { name: 'Attendance Management', status: 'Planned', dev: 'Developer 1 / 3' },
    { name: 'Leave Management', status: 'Planned', dev: 'Developer 1' },
    { name: 'Payroll Processing', status: 'Planned', dev: 'Developer 1 / 3' },
    { name: 'Notifications Center', status: 'Planned', dev: 'Developer 4' },
    { name: 'Analytics & Reporting', status: 'Planned', dev: 'Developer 4' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          Welcome back, {user?.first_name || 'Team Member'} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Dayflow HRMS Collaborative Workspace & Module Overview
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Current Role
          </h3>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
            <span className={`badge badge-${user?.role?.toLowerCase() || 'employee'}`} style={{ fontSize: '1rem', padding: '0.35rem 0.75rem' }}>
              {user?.role || 'EMPLOYEE'}
            </span>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Backend API Health
          </h3>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
            API Connected (/api/v1)
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Branch / Strategy
          </h3>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>
            <code>main</code> branch
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
          HRMS Module Allocation Matrix
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
              <th style={{ padding: '0.75rem 0' }}>Module</th>
              <th style={{ padding: '0.75rem 0' }}>Status</th>
              <th style={{ padding: '0.75rem 0' }}>Assigned Developer</th>
            </tr>
          </thead>
          <tbody>
            {moduleStatus.map((m, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.875rem' }}>
                <td style={{ padding: '0.75rem 0', fontWeight: 500 }}>{m.name}</td>
                <td style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>{m.status}</td>
                <td style={{ padding: '0.75rem 0', color: 'var(--primary-100)' }}>{m.dev}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardPage;
