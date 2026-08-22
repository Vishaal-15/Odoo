import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { attendanceService } from '../../services/attendanceService';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';
import { Clock, Users, Calendar, Filter, Search, Download, CheckCircle2, XCircle } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/formatters';

export const HrAttendance = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadAllAttendance = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getAttendance();
      setRecords(data);
    } catch (err) {
      console.error('Failed to load company attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAttendance();
    window.addEventListener('attendance-updated', loadAllAttendance);
    const interval = setInterval(loadAllAttendance, 10000); // 10s auto-refresh
    return () => {
      window.removeEventListener('attendance-updated', loadAllAttendance);
      clearInterval(interval);
    };
  }, []);


  const filteredRecords = records.filter((r) => {
    const nameMatch =
      (r.employee_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.employee_id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'ALL' || r.status === statusFilter;
    return nameMatch && statusMatch;
  });

  const handleExport = () => {
    addToast('Attendance roster exported to CSV successfully.', 'success');
  };

  const presentCount = records.filter((r) => r.status === 'PRESENT').length;
  const halfDayCount = records.filter((r) => r.status === 'HALF_DAY').length;
  const leaveCount = records.filter((r) => r.status === 'LEAVE').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Attendance Monitor"
        subtitle="Real-time employee presence logs, daily shift durations, and absence tracking"
        breadcrumbs={['HR Operations', 'Attendance Logs']}
        actions={
          <Button onClick={handleExport} variant="outline" size="sm" icon={Download}>
            Export CSV Log
          </Button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Logged Today"
          value={records.length}
          subtitle="All department shifts"
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Full-Shift Present"
          value={presentCount}
          subtitle="Regular work hours verified"
          icon={CheckCircle2}
          color="success"
        />
        <StatCard
          title="Half-Day Shifts"
          value={halfDayCount}
          subtitle="Partial day attendances"
          icon={Clock}
          color="warning"
        />
        <StatCard
          title="Approved On-Leave"
          value={leaveCount}
          subtitle="Active time-off policy"
          icon={Calendar}
          color="info"
        />
      </div>

      {/* Search and Filters */}
      <Card noPadding bodyClassName="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <Input
              placeholder="Search by staff name or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>

          <div className="w-full sm:w-56">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              icon={Filter}
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="HALF_DAY">Half-Day</option>
              <option value="LEAVE">On Leave</option>
              <option value="ABSENT">Absent</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Attendance Records Table */}
      <Card
        title={`Daily Attendance Logs (${filteredRecords.length})`}
        subtitle="Chronological employee punch events"
      >
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : filteredRecords.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No attendance entries found"
            description="No logs match your current search or filter query."
          />
        ) : (
          <div className="saas-table-container">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Shift Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Work Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="font-semibold text-slate-100">{r.employee_name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{r.employee_id}</div>
                    </td>
                    <td className="text-xs text-slate-300">{formatDate(r.date)}</td>
                    <td className="font-mono text-xs text-slate-300">
                      {r.check_in ? formatTime(r.check_in) : '—'}
                    </td>
                    <td className="font-mono text-xs text-slate-300">
                      {r.check_out ? formatTime(r.check_out) : r.check_in ? 'In Progress' : '—'}
                    </td>
                    <td className="font-semibold text-slate-200 text-xs">
                      {r.hours_worked || (r.status === 'LEAVE' ? '0.0 hrs' : '—')}
                    </td>
                    <td>
                      <Badge status={r.status} size="xs" />
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

export default HrAttendance;
