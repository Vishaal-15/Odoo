import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { attendanceService } from '../../services/attendanceService';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Clock, Calendar, CheckCircle2, XCircle, AlertCircle, LogOut, Search, Filter } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/formatters';

export const EmployeeAttendance = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [todayRecord, setTodayRecord] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const records = await attendanceService.getAttendance();
      setAttendanceList(records);
      const todayStr = new Date().toISOString().split('T')[0];
      const today = records.find((r) => r.date === todayStr);
      setTodayRecord(today || null);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const record = await attendanceService.checkIn();
      setTodayRecord(record);
      setAttendanceList((prev) => [record, ...prev.filter((r) => r.date !== record.date)]);
      addToast('Check-in recorded for today!', 'success');
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
      setTodayRecord((prev) => ({ ...prev, ...record }));
      loadAttendance();
      addToast('Check-out recorded successfully.', 'success');
    } catch (err) {
      addToast(err.message || 'Check-out failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRecords = attendanceList.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  const isCheckedIn = todayRecord?.check_in && !todayRecord?.check_out;
  const isCheckedOut = todayRecord?.check_out;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Live Check-in Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700 }}>Attendance Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Daily check-in / out timestamps, weekly view, and attendance logs
          </p>
        </div>

        {/* Live Attendance Clock Action */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {!isCheckedIn && !isCheckedOut && (
            <button
              onClick={handleCheckIn}
              disabled={actionLoading}
              className="btn btn-primary"
              style={{ display: 'flex', gap: '0.5rem', padding: '0.625rem 1.25rem' }}
            >
              <Clock size={18} /> Record Check-In
            </button>
          )}

          {isCheckedIn && (
            <button
              onClick={handleCheckOut}
              disabled={actionLoading}
              className="btn btn-outline"
              style={{ display: 'flex', gap: '0.5rem', borderColor: 'var(--warning)', color: '#fbbf24' }}
            >
              <LogOut size={18} /> Record Check-Out
            </button>
          )}

          {isCheckedOut && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: 600, fontSize: '0.875rem' }}>
              <CheckCircle2 size={18} /> Shift Completed for Today
            </div>
          )}
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <StatCard
          title="Today's Check-In"
          value={todayRecord?.check_in ? formatTime(todayRecord.check_in) : 'Not Logged'}
          subtitle={todayRecord ? `Status: ${todayRecord.status}` : 'Pending morning arrival'}
          icon={Clock}
          color={isCheckedIn ? 'success' : 'warning'}
        />
        <StatCard
          title="Today's Check-Out"
          value={todayRecord?.check_out ? formatTime(todayRecord.check_out) : 'Active Shift'}
          subtitle={todayRecord?.hours_worked || '0h recorded'}
          icon={LogOut}
          color="info"
        />
        <StatCard
          title="Monthly Presence Rate"
          value="95.2%"
          subtitle="20 Days Present • 1 Half Day"
          icon={Calendar}
          color="primary"
        />
      </div>

      {/* Attendance History Table Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Attendance History & Timesheets</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Detailed logs of check-ins, check-outs, and duration</p>
          </div>

          {/* Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--text-dim)" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="HALF_DAY">Half-Day</option>
              <option value="LEAVE">Leave</option>
              <option value="ABSENT">Absent</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching attendance records..." />
        ) : filteredRecords.length === 0 ? (
          <EmptyState title="No attendance logs found" description="No logs match your selected filter." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Check In</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Check Out</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Duration</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {formatDate(item.date)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                      {item.check_in ? formatTime(item.check_in) : '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                      {item.check_out ? formatTime(item.check_out) : item.check_in ? 'In Progress' : '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                      {item.hours_worked || '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <Badge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeAttendance;
