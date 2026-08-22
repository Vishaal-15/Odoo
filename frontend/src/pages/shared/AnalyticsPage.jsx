import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import AttendanceChart from '../../components/analytics/AttendanceChart';
import LeaveBreakdownChart from '../../components/analytics/LeaveBreakdownChart';
import WorkforceStats from '../../components/analytics/WorkforceStats';
import PayrollSummaryCard from '../../components/analytics/PayrollSummaryCard';
import AiInsightsCard from '../../components/ai/AiInsightsCard';
import { DashboardSkeleton } from '../../components/common/Skeleton';
import { BarChart3, Users, Calendar, DollarSign, TrendingUp, Download, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const stats = await analyticsService.getOverview();
        setData(stats);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const { workforce, attendance, leaveStats, payrollSummary } = data || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workforce Analytics & Intelligence Trends"
        subtitle="Real-time organizational telemetry, employee retention indicators, and compensation outlay"
        breadcrumbs={['Intelligence', 'Analytics']}
        actions={
          <Button variant="outline" size="sm" icon={Download}>
            Export Intelligence Report
          </Button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Workforce Retention"
          value={workforce?.retentionRate || '96.2%'}
          subtitle="Annualized stability index"
          icon={TrendingUp}
          color="success"
        />
        <StatCard
          title="Average Attendance Rate"
          value={`${attendance?.averageAttendanceRate || 94.8}%`}
          subtitle="Past 30 operational days"
          icon={Calendar}
          color="primary"
        />
        <StatCard
          title="Active Headcount"
          value={workforce?.activeEmployees || 46}
          subtitle={`Across ${workforce?.departmentsCount || 6} divisions`}
          icon={Users}
          color="info"
        />
        <StatCard
          title="Monthly Payroll Outlay"
          value={formatCurrency(payrollSummary?.totalPayrollExpense || 345800)}
          subtitle={`Avg: ${formatCurrency(payrollSummary?.averageSalary || 7204)}`}
          icon={DollarSign}
          color="warning"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart data={attendance?.weeklyTrend || []} />
        <LeaveBreakdownChart />
      </div>

      {/* Workforce Breakdown + AI Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkforceStats />
        <AiInsightsCard />
      </div>

      {/* Payroll Summary Card */}
      <PayrollSummaryCard payrollSummary={payrollSummary} />
    </div>
  );
};

export default AnalyticsPage;
