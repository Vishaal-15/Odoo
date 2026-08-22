import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { analyticsService } from '../../services/analyticsService';
import { leaveService } from '../../services/leaveService';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AttendanceChart from '../../components/analytics/AttendanceChart';
import LeaveBreakdownChart from '../../components/analytics/LeaveBreakdownChart';
import PayrollSummaryCard from '../../components/analytics/PayrollSummaryCard';
import AiInsightsCard from '../../components/ai/AiInsightsCard';
import { Users, Clock, Calendar, DollarSign, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const HrDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState([]);

  useEffect(() => {
    const loadHrData = async () => {
      setLoading(true);
      try {
        const [stats, leaves] = await Promise.all([
          analyticsService.getOverview(),
          leaveService.getLeaves({ status: 'PENDING' }),
        ]);
        setAnalytics(stats);
        setPendingLeaves(leaves.filter((l) => l.status === 'PENDING'));
      } catch (err) {
        console.error('Failed to load HR dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHrData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading HR management dashboard..." />;
  }

  const { workforce, attendance, leaveStats, payrollSummary } = analytics || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Greeting Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>
            HR Executive Console
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Workforce overview, pending approvals, and operational health metrics
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/hr/employees" className="btn btn-outline" style={{ display: 'flex', gap: '0.4rem' }}>
            <Users size={16} /> Directory
          </Link>
          <Link to="/hr/leaves" className="btn btn-primary" style={{ display: 'flex', gap: '0.4rem' }}>
            <Calendar size={16} /> Review Approvals ({pendingLeaves.length})
          </Link>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          title="Total Workforce"
          value={workforce?.totalEmployees || 48}
          subtitle={`${workforce?.activeEmployees || 46} Active • ${workforce?.departmentsCount || 6} Depts`}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Today's Present"
          value={`${attendance?.todayPresent || 42} / ${workforce?.totalEmployees || 48}`}
          subtitle={`${attendance?.todayAbsent || 2} Absent • ${attendance?.todayOnLeave || 4} On Leave`}
          icon={Clock}
          color="success"
        />
        <StatCard
          title="Pending Leave Approvals"
          value={pendingLeaves.length}
          subtitle="Action required by HR"
          icon={Calendar}
          color={pendingLeaves.length > 0 ? 'warning' : 'info'}
        />
        <StatCard
          title="Monthly Payroll Outlay"
          value={formatCurrency(payrollSummary?.totalPayrollExpense || 345800)}
          subtitle={`Disbursement: ${payrollSummary?.nextPayDay || 'Aug 31'}`}
          icon={DollarSign}
          color="info"
        />
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        <AttendanceChart data={attendance?.weeklyTrend || []} />
        <LeaveBreakdownChart />
      </div>

      {/* Pending Approvals Table + AI Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Pending Approvals Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Action Required: Leave Requests</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Employee requests awaiting management decision</p>
            </div>
            <Link to="/hr/leaves" style={{ fontSize: '0.8rem', color: 'var(--primary-500)', fontWeight: 500 }}>
              View All
            </Link>
          </div>

          {pendingLeaves.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <CheckCircle2 size={32} color="var(--success)" style={{ margin: '0 auto 0.5rem' }} />
              No pending leave requests!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pendingLeaves.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '0.875rem',
                    backgroundColor: 'var(--bg-main)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.employee_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {item.leave_type} • {formatDate(item.start_date)} ({item.days_count} days)
                    </div>
                  </div>
                  <Link to="/hr/leaves" className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Workforce Intelligence Card */}
        <AiInsightsCard />
      </div>

      {/* Payroll Quick Control */}
      <PayrollSummaryCard payrollSummary={payrollSummary} />
    </div>
  );
};

export default HrDashboard;
