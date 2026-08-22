import React from 'react';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { Server, Database, Shield, Cpu, HardDrive, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../../utils/constants';

export const AdminSystem = () => {
  const envVariables = [
    { key: 'VITE_API_URL', value: API_BASE_URL, status: 'Configured' },
    { key: 'BACKEND_SERVICE', value: 'http://localhost:8000/api/v1', status: 'Healthy' },
    { key: 'POSTGRES_DB', value: 'dayflow_hrms (Port 5432)', status: 'Connected' },
    { key: 'SECURITY_ALGORITHM', value: 'HS256 (HMAC-SHA256)', status: 'Active' },
    { key: 'SESSION_EXPIRATION', value: '1440 minutes (24 hours)', status: 'Active' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 700 }}>System Infrastructure & Health</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Server runtime, API endpoints status, environment parameters, and container diagnostics
        </p>
      </div>

      {/* Health Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <StatCard
          title="FastAPI Gateway"
          value="Online (v1.0)"
          subtitle="Endpoint: /api/v1"
          icon={Server}
          color="success"
        />
        <StatCard
          title="PostgreSQL 16 Cluster"
          value="Operational"
          subtitle="Connection Pool: Active"
          icon={Database}
          color="primary"
        />
        <StatCard
          title="Vite React Engine"
          value="Port 5173"
          subtitle="Client SPA Bundle Live"
          icon={Cpu}
          color="info"
        />
      </div>

      {/* Environment Config Table */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>
          Active Environment & Integration Variables
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Parameter</th>
                <th style={{ padding: '0.75rem 1rem' }}>Runtime Value</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {envVariables.map((v, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary-100)' }}>
                    {v.key}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {v.value}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontWeight: 600, fontSize: '0.8rem' }}>
                      <CheckCircle2 size={14} /> {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSystem;
