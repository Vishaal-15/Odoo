import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { attendanceService } from '../../services/attendanceService';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';
import { Clock, Calendar, CheckCircle2, XCircle, LogOut, Filter, ShieldCheck } from 'lucide-react';
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
      const [records, today] = await Promise.all([
        attendanceService.getMyAttendance(),
        attendanceService.getTodayStatus(),
      ]);
      setAttendanceList(records);
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
  const isCheckedOut = Boolean(todayRecord?.check_out);

  const presentCount = attendanceList.filter((r) => r.status === 'PRESENT').length;
  const halfDayCount = attendanceList.filter((r) => r.status === 'HALF_DAY').length;
  const leaveCount = attendanceList.filter((r) => r.status === 'LEAVE').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance & Timesheets"
        subtitle="Track daily punch timestamps, total work hours, and presence records"
        breadcrumbs={['Workspace', 'Attendance']}
        actions={
          <div className="flex items-center gap-2.5">
            {!isCheckedIn && !isCheckedOut && (
              <Button onClick={handleCheckIn} isLoading={actionLoading} variant="primary" size="sm" icon={Clock}>
                Punch In
              </Button>
            )}
            {isCheckedIn && (
              <Button onClick={handleCheckOut} isLoading={actionLoading} variant="danger" size="sm" icon={LogOut}>
                Punch Out
              </Button>
            )}
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Full Days Present"
          value={presentCount}
          subtitle="Total verified regular shifts"
          icon={CheckCircle2}
          color="success"
        />
        <StatCard
          title="Half-Day Logs"
          value={halfDayCount}
          subtitle="Partial shifts completed"
          icon={Clock}
          color="warning"
        />
        <StatCard
          title="On-Leave Days"
          value={leaveCount}
          subtitle="Approved leaves taken"
          icon={Calendar}
          color="info"
        />
      </div>

      {/* Attendance History Table Card */}
      <Card
        title="Timesheet History"
        subtitle="Log of your daily clock-in and clock-out timestamps"
        action={
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
            >
              <option value="ALL">All Records</option>
              <option value="PRESENT">Present</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="LEAVE">On Leave</option>
              <option value="ABSENT">Absent</option>
            </select>
          </div>
        }
      >
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : filteredRecords.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No attendance records found"
            description="No logs match your selected filter criteria."
          />
        ) : (
          <div className="saas-table-container">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Total Hours</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r, idx) => (
                  <tr key={idx}>
                    <td className="font-medium text-slate-100">{formatDate(r.date)}</td>
                    <td className="font-mono text-xs text-slate-300">
                      {r.check_in ? formatTime(r.check_in) : '—'}
                    </td>
                    <td className="font-mono text-xs text-slate-300">
                      {r.check_out ? formatTime(r.check_out) : '—'}
                    </td>
                    <td className="font-semibold text-slate-200">
                      {r.work_hours ? `${r.work_hours} hrs` : r.status === 'LEAVE' ? '0.0 hrs' : 'In Progress'}
                    </td>
                    <td>
                      <Badge status={r.status} size="xs" />
                    </td>
                    <td className="text-xs text-slate-400 max-w-xs truncate">
                      {r.remarks || 'Regular workday'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EmployeeAttendance;
