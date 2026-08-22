import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { attendanceService } from '../../services/attendanceService';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Clock, Users, Calendar, Filter, Search, Download, CheckCircle2, XCircle } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/formatters';

export const HrAttendance = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
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

    loadAllAttendance();
  }, []);

  const filteredRecords = records.filter((r) => {
    const nameMatch = (r.employee_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (r.employee_id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'ALL' || r.status === statusFilter;
    return nameMatch && statusMatch;
  });

  const handleExport = () => {
    addToast('Exporting company attendance records to CSV...', 'info');
  };

  const presentCount = records.filter((r) => r.status === 'PRESENT').length;
  const halfDayCount = records.filter((r) => r.status === 'HALF_DAY').length;
  const leaveCount = records.filter((r) => r.status === 'LEAVE').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700 }}>Company-Wide Attendance Logs</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Monitor daily employee punch records, shift presence, and absence logs
          </p>
        </div>

        <button onClick={handleExport} className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem' }}>
          <Download size={16} /> Export Logs (CSV)
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <StatCard
          title="Total Logged Today"
          value={records.length}
          subtitle="All department rosters"
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Present On-Site / Remote"
          value={presentCount}
          subtitle="Normal Shift Logged"
          icon={CheckCircle2}
          color="success"
        />
        <StatCard
          title="Half-Day Logged"
          value={halfDayCount}
          subtitle="Partial shift duration"
          icon={Clock}
          color="warning"
        />
        <StatCard
          title="Approved On-Leave"
          value={leaveCount}
          subtitle="Leave policy active"
          icon={Calendar}
          color="info"
        />
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50)',
                color: 'var(--text-dim)',
              }}
            />
            <input
              type="text"
              placeholder="Search by employee name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--text-dim)" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="HALF_DAY">Half-Day</option>
              <option value="LEAVE">Leave</option>
              <option value="ABSENT">Absent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card">
        {loading ? (
          <LoadingSpinner message="Fetching attendance records..." />
        ) : filteredRecords.length === 0 ? (
          <EmptyState title="No logs found" description="No attendance entries match your filters." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Employee</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Check-In</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Check-Out</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Hours Logged</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{r.employee_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{r.employee_id}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                      {formatDate(r.date)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                      {r.check_in ? formatTime(r.check_in) : '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                      {r.check_out ? formatTime(r.check_out) : r.check_in ? 'In Progress' : '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                      {r.hours_worked || '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <Badge status={r.status} />
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

export default HrAttendance;
