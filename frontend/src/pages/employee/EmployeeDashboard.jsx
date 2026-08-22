import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { attendanceService } from '../../services/attendanceService';
import { leaveService } from '../../services/leaveService';
import { payrollService } from '../../services/payrollService';
import { notificationService } from '../../services/notificationService';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
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
  ShieldCheck,
  AlertCircle
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <LoadingSpinner message="Loading your employee portal..." />;
  }

  const isCheckedIn = todayAttendance?.check_in && !todayAttendance?.check_out;
  const isCheckedOut = todayAttendance?.check_out;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Greeting */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Hello, {user?.first_name || 'Team Member'} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Welcome to your Dayflow self-service portal • {formatDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Quick Check-in / Check-out Action Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.875rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
              Shift Status
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isCheckedIn ? 'var(--success)' : isCheckedOut ? 'var(--info)' : 'var(--warning)',
                }}
              />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {isCheckedIn ? 'Currently Working' : isCheckedOut ? 'Shift Completed' : 'Not Checked In'}
              </span>
            </div>
          </div>

          {!isCheckedIn && !isCheckedOut && (
            <button
              onClick={handleCheckIn}
              disabled={actionLoading}
              className="btn btn-primary"
              style={{ padding: '0.5rem 1rem' }}
            >
              <Clock size={16} /> Check In Now
            </button>
          )}

          {isCheckedIn && (
            <button
              onClick={handleCheckOut}
              disabled={actionLoading}
              className="btn btn-outline"
              style={{ padding: '0.5rem 1rem', borderColor: 'var(--warning)', color: '#fbbf24' }}
            >
              <LogOut size={16} /> Check Out
            </button>
          )}
        </div>
      </div>

      {/* Quick Access Grid (Specified in Problem Statement 3.2.1) */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Quick Access Modules
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Link to="/employee/profile" className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.15s ease' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>My Profile</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Personal & Job info</div>
            </div>
          </Link>

          <Link to="/employee/attendance" className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Attendance</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Timesheets & logs</div>
            </div>
          </Link>

          <Link to="/employee/leave" className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Leave Requests</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Apply & balance</div>
            </div>
          </Link>

          <Link to="/employee/payroll" className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Salary & Payslip</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Earnings summary</div>
            </div>
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
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
          title="Attendance Rate"
          value="98.5%"
          subtitle="Past 30 workdays active"
          icon={Clock}
          color="info"
        />
      </div>

      {/* Main Content Layout: Activity / Alerts + AI Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Alerts / Activity */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent Alerts & Notifications</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Updates from HR and management</p>
            </div>
            <Link to="/employee/notifications" style={{ fontSize: '0.8rem', color: 'var(--primary-500)', fontWeight: 500 }}>
              View All
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {recentNotifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '0.875rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: n.is_read ? 'var(--text-dim)' : 'var(--primary-500)', marginTop: '6px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>{n.title}</div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>{n.message}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '6px' }}>{formatDate(n.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Workforce Insights Placeholder */}
        <AiInsightsCard />
      </div>
    </div>
  );
};

export default EmployeeDashboard;
