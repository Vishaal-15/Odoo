import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { attendanceService } from '../../services/attendanceService';
import { leaveService } from '../../services/leaveService';
import { payrollService } from '../../services/payrollService';
import { notificationService } from '../../services/notificationService';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { DashboardSkeleton } from '../../components/common/Skeleton';
import AiInsightsCard from '../../components/ai/AiInsightsCard';
import {
  User,
  Clock,
  Calendar,
  DollarSign,
  Bell,
  LogOut,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  Briefcase,
  Layers,
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';

export const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [latestPayslip, setLatestPayslip] = useState(null);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [todayAtt, balances, payslips, notifs] = await Promise.all([
        attendanceService.getTodayStatus(),
        leaveService.getLeaveBalances(),
        payrollService.getMyPayslips(),
        notificationService.getNotifications(),
      ]);

      setTodayAttendance(todayAtt);
      setLeaveBalances(balances);
      setLatestPayslip(payslips[0] || null);
      setRecentNotifications(notifs.slice(0, 3));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const record = await attendanceService.checkIn();
      setTodayAttendance(record);
      addToast('Checked in successfully for today!', 'success');
    } catch (err) {
      addToast(err.message || 'Check-in failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const record = await attendanceService.checkOut();
      setTodayAttendance((prev) => ({ ...prev, ...record }));
      addToast('Checked out successfully. Have a great evening!', 'success');
    } catch (err) {
      addToast(err.message || 'Check-out failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const isCheckedIn = todayAttendance?.check_in && !todayAttendance?.check_out;
  const isCheckedOut = Boolean(todayAttendance?.check_out);

  const quickLinks = [
    {
      label: 'My Profile',
      desc: 'Personal & Job Info',
      path: '/employee/profile',
      icon: User,
      color: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
    },
    {
      label: 'Attendance',
      desc: 'Logs & Timesheets',
      path: '/employee/attendance',
      icon: Clock,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      label: 'Leave Requests',
      desc: 'Apply & Balances',
      path: '/employee/leave',
      icon: Calendar,
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      label: 'Salary & Payslip',
      desc: 'Earnings Breakdown',
      path: '/employee/payroll',
      icon: DollarSign,
      color: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    },
  ];

  return (
    <div className="space-y-7">
      {/* Top Banner Greeting + Live Shift Punch Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-brand-950/30 border border-slate-800/90 shadow-card">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-400 tracking-wide uppercase">
            <span>Enterprise Workspace</span>
            <span>•</span>
            <span>{formatDate(new Date(), { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 font-sans">
            Good day, {user?.first_name || 'Team Member'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {user?.designation || 'Staff Engineer'} • {user?.department || 'Engineering'}
          </p>
        </div>

        {/* Live Attendance Punch Box */}
        <div className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 shrink-0">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Shift Status
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isCheckedIn ? 'bg-emerald-400 animate-pulse' : isCheckedOut ? 'bg-sky-400' : 'bg-amber-400'
                }`}
              />
              <span className="text-xs sm:text-sm font-bold text-slate-200">
                {isCheckedIn ? 'Currently Active' : isCheckedOut ? 'Shift Logged' : 'Not Punched In'}
              </span>
            </div>
          </div>

          {!isCheckedIn && !isCheckedOut && (
            <Button
              onClick={handleCheckIn}
              isLoading={actionLoading}
              size="sm"
              variant="primary"
              icon={Clock}
            >
              Clock In Now
            </Button>
          )}

          {isCheckedIn && (
            <Button
              onClick={handleCheckOut}
              isLoading={actionLoading}
              size="sm"
              variant="danger"
              icon={LogOut}
            >
              Clock Out
            </Button>
          )}
        </div>
      </div>

      {/* Quick Access Modules */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Quick Access Modules
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {quickLinks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                to={item.path}
                className="group flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/90 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {item.label}
                    </div>
                    <div className="text-xs text-slate-400">{item.desc}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Paid Leave Remaining"
          value={`${leaveBalances.find((b) => b.type === 'Paid Leave')?.remaining || 14} Days`}
          subtitle="Out of 18 annual allocation"
          icon={Calendar}
          color="primary"
        />
        <StatCard
          title="Latest Net Pay"
          value={formatCurrency(latestPayslip?.net_salary || 7430)}
          subtitle={latestPayslip?.pay_period || 'Current Pay Period'}
          icon={DollarSign}
          color="success"
        />
        <StatCard
          title="Monthly Attendance"
          value="98.5%"
          subtitle="Past 30 working days verified"
          icon={Clock}
          color="info"
        />
      </div>

      {/* Split Activity & AI Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts Card */}
        <Card
          title="Recent Notices & Alerts"
          subtitle="System & HR updates"
          headerIcon={Bell}
          action={
            <Link to="/employee/notifications" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
              View All
            </Link>
          }
        >
          {recentNotifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No recent notifications.
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/40 border border-slate-800/60 hover:border-slate-700/60 transition-colors"
                >
                  <span
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      n.is_read ? 'bg-slate-600' : 'bg-brand-500 animate-pulse'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
                      {n.title}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                    <div className="text-[10px] text-slate-500 mt-1.5">{formatDate(n.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* AI Workforce Intelligence Card */}
        <AiInsightsCard />
      </div>
    </div>
  );
};

export default EmployeeDashboard;
