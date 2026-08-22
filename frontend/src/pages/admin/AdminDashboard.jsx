import React from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';
import WorkforceStats from '../../components/analytics/WorkforceStats';
import { ShieldCheck, Users, Server, Activity, Key, Database, ArrowRight, ShieldAlert, Cpu } from 'lucide-react';

export const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="System Administration & Governance"
        subtitle="Global RBAC security policies, infrastructure telemetry, and enterprise user provisioning"
        breadcrumbs={['Administration', 'Overview']}
        actions={
          <div className="flex items-center gap-2.5">
            <Link to="/admin/users">
              <Button variant="primary" size="sm" icon={Users}>
                User Directory & Roles
              </Button>
            </Link>
            <Link to="/admin/system">
              <Button variant="secondary" size="sm" icon={Server}>
                System Diagnostics
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered Accounts"
          value="52 Users"
          subtitle="3 Admins • 6 HR • 43 Staff"
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Security & RBAC"
          value="Enforced"
          subtitle="JWT HS256 Token Rotation"
          icon={Key}
          color="success"
        />
        <StatCard
          title="Database State"
          value="Healthy"
          subtitle="SQLite/PostgreSQL Connection Pool"
          icon={Database}
          color="info"
        />
        <StatCard
          title="FastAPI Microservices"
          value="18 ms"
          subtitle="Zero degraded endpoints"
          icon={Activity}
          color="success"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Roles Card */}
        <Card
          title="Role-Based Access Control (RBAC) Matrix"
          subtitle="Global permissions per authorization tier"
          headerIcon={ShieldCheck}
          action={
            <Link to="/admin/users" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
              Manage Roles
            </Link>
          }
        >
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between gap-3">
              <div className="space-y-1">
                <Badge variant="warning" size="xs">ADMINISTRATOR</Badge>
                <p className="text-xs text-slate-400">
                  Full root controls, user provisioning, global payroll & system configuration.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-700/60 shrink-0">
                3 Active
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between gap-3">
              <div className="space-y-1">
                <Badge variant="success" size="xs">HR OFFICER</Badge>
                <p className="text-xs text-slate-400">
                  Employee records, leave approvals, attendance tracking, and payroll execution.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-700/60 shrink-0">
                6 Active
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between gap-3">
              <div className="space-y-1">
                <Badge variant="info" size="xs">EMPLOYEE</Badge>
                <p className="text-xs text-slate-400">
                  Self-service portal, check-in/out, leave requests, read-only payslips.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-700/60 shrink-0">
                43 Active
              </span>
            </div>
          </div>
        </Card>

        {/* Workforce Department Distribution */}
        <WorkforceStats />
      </div>
    </div>
  );
};

export default AdminDashboard;
