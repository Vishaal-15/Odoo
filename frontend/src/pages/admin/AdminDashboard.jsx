import React from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import WorkforceStats from '../../components/analytics/WorkforceStats';
import { ShieldCheck, Users, Server, Activity, Key, Database, ArrowRight } from 'lucide-react';

export const AdminDashboard = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>System Administration & Governance</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            System-level access control, RBAC policy enforcement, and infrastructure audit
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/users" className="btn btn-primary" style={{ display: 'flex', gap: '0.4rem' }}>
            <Users size={16} /> Manage Roles & Users
          </Link>
          <Link to="/admin/system" className="btn btn-outline" style={{ display: 'flex', gap: '0.4rem' }}>
            <Server size={16} /> System Diagnostics
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          title="Registered Accounts"
          value="52 Users"
          subtitle="3 Admins • 6 HR • 43 Employees"
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Security & RBAC"
          value="Enforced"
          subtitle="JWT HS256 Token Rotation Active"
          icon={Key}
          color="success"
        />
        <StatCard
          title="Database Cluster"
          value="PostgreSQL 16"
          subtitle="Connection Pool: Healthy"
          icon={Database}
          color="info"
        />
        <StatCard
          title="API Response Time"
          value="18 ms"
          subtitle="FastAPI v1 Services Live"
          icon={Activity}
          color="success"
        />
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* User Roles Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Role-Based Access Control (RBAC) Matrix</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Permissions breakdown per authorization tier</p>
            </div>
            <Link to="/admin/users" style={{ fontSize: '0.8rem', color: 'var(--primary-500)', fontWeight: 500 }}>
              Edit Roles
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Badge variant="warning">ADMIN</Badge>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Full root controls, user provisioning, global payroll & system settings</div>
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>3 Active</span>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Badge variant="success">HR OFFICER</Badge>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Employee management, leave approvals, attendance tracking, payroll execution</div>
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>6 Active</span>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Badge variant="info">EMPLOYEE</Badge>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Self-service portal, check-in/out, leave applications, read-only payslips</div>
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>43 Active</span>
            </div>
          </div>
        </div>

        {/* Workforce Department Breakdown */}
        <WorkforceStats />
      </div>
    </div>
  );
};

export default AdminDashboard;
