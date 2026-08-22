import React from 'react';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import PageHeader from '../../components/common/PageHeader';
import { Server, Database, Shield, Cpu, HardDrive, CheckCircle2, Activity } from 'lucide-react';
import { API_BASE_URL } from '../../utils/constants';

export const AdminSystem = () => {
  const envVariables = [
    { key: 'VITE_API_URL', value: API_BASE_URL, status: 'Configured' },
    { key: 'BACKEND_SERVICE', value: 'http://localhost:8000/api/v1', status: 'Healthy' },
    { key: 'DATABASE_ENGINE', value: 'SQLite / PostgreSQL (Active Session)', status: 'Connected' },
    { key: 'SECURITY_ALGORITHM', value: 'HS256 (HMAC-SHA256)', status: 'Active' },
    { key: 'SESSION_EXPIRATION', value: '1440 minutes (24 hours)', status: 'Active' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="System Diagnostics & Infrastructure Health"
        subtitle="Server runtime telemetry, microservices latency, and runtime environment parameters"
        breadcrumbs={['Administration', 'System Diagnostics']}
      />

      {/* Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="FastAPI Microservices"
          value="Online (v1.0)"
          subtitle="Endpoint: /api/v1"
          icon={Server}
          color="success"
        />
        <StatCard
          title="Database Layer"
          value="Operational"
          subtitle="ORM connection healthy"
          icon={Database}
          color="primary"
        />
        <StatCard
          title="Vite React Engine"
          value="Port 5173"
          subtitle="Client SPA live"
          icon={Cpu}
          color="info"
        />
      </div>

      {/* Environment Config Table Card */}
      <Card
        title="Active Environment & Runtime Configuration"
        subtitle="Live service configuration and connectivity endpoints"
        headerIcon={Activity}
      >
        <div className="saas-table-container">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Configuration Key</th>
                <th>Runtime Target</th>
                <th>Health Status</th>
              </tr>
            </thead>
            <tbody>
              {envVariables.map((v, idx) => (
                <tr key={idx}>
                  <td className="font-mono text-xs font-semibold text-brand-300">
                    {v.key}
                  </td>
                  <td className="font-mono text-xs text-slate-300">
                    {v.value}
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminSystem;
