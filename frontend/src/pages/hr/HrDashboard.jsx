import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { analyticsService } from '../../services/analyticsService';
import { leaveService } from '../../services/leaveService';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';
import { DashboardSkeleton } from '../../components/common/Skeleton';
import AttendanceChart from '../../components/analytics/AttendanceChart';
import LeaveBreakdownChart from '../../components/analytics/LeaveBreakdownChart';
import PayrollSummaryCard from '../../components/analytics/PayrollSummaryCard';
import AiInsightsCard from '../../components/ai/AiInsightsCard';
import { Users, Clock, Calendar, DollarSign, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
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
    return <DashboardSkeleton />;
  }

  const { workforce, attendance, leaveStats, payrollSummary } = analytics || {};

  return (
    <div className="space-y-7">
      <PageHeader
        title="HR Executive Console"
        subtitle="Workforce distribution, real-time presence, pending approval workflows, and operational metrics"
        breadcrumbs={['HR Management', 'Dashboard']}
        actions={
          <div className="flex items-center gap-2.5">
            <Link to="/hr/employees">
              <Button variant="secondary" size="sm" icon={Users}>
                Directory
              </Button>
            </Link>
            <Link to="/hr/leaves">
              <Button variant="primary" size="sm" icon={Calendar}>
                Review Approvals ({pendingLeaves.length})
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          title="Pending Approvals"
          value={pendingLeaves.length}
          subtitle="Time-off decisions required"
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart data={attendance?.weeklyTrend || []} />
        <LeaveBreakdownChart />
      </div>

      {/* Action Required & AI Intelligence Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals Card */}
        <Card
          title="Action Required: Leave Requests"
          subtitle="Employee requests awaiting management decision"
          headerIcon={Calendar}
          action={
            <Link to="/hr/leaves" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
              View All ({pendingLeaves.length})
            </Link>
          }
        >
          {pendingLeaves.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-200">No pending leave requests!</p>
              <p className="text-xs text-slate-400">All employee applications are up to date.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingLeaves.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs sm:text-sm font-bold text-slate-100">{item.employee_name}</div>
                    <div className="text-xs text-slate-400">
                      {item.leave_type} • {formatDate(item.start_date)} ({item.days_count} days)
                    </div>
                  </div>
                  <Link to="/hr/leaves">
                    <Button variant="outline" size="xs">
                      Review
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* AI Workforce Intelligence Card */}
        <AiInsightsCard />
      </div>

      {/* Payroll Control Card */}
      <PayrollSummaryCard payrollSummary={payrollSummary} />
    </div>
  );
};

export default HrDashboard;
