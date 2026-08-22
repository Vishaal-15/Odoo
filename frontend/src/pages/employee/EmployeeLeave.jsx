import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { leaveService } from '../../services/leaveService';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Calendar, Plus, Clock, CheckCircle2, XCircle, AlertCircle, FileText } from 'lucide-react';
import { formatDate, calculateDaysBetween } from '../../utils/formatters';

export const EmployeeLeave = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applying, setApplying] = useState(false);

  const [formData, setFormData] = useState({
    leave_type: 'Paid Leave',
    start_date: '',
    end_date: '',
    reason: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [leaves, balances] = await Promise.all([
        leaveService.getLeaves(),
        leaveService.getLeaveBalances(),
      ]);
      setLeaveRequests(leaves);
      setLeaveBalances(balances);
    } catch (err) {
      console.error('Failed to load leave records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!formData.start_date || !formData.end_date) {
      addToast('Please select valid start and end dates', 'warning');
      return;
    }

    const days = calculateDaysBetween(formData.start_date, formData.end_date);
    setApplying(true);

    try {
      const newLeave = await leaveService.applyLeave({
        ...formData,
        employee_id: user?.employee_id || 'EMP-003',
        employee_name: `${user?.first_name} ${user?.last_name}`,
        days_count: days,
      });

      setLeaveRequests((prev) => [newLeave, ...prev]);
      setIsApplyModalOpen(false);
      setFormData({ leave_type: 'Paid Leave', start_date: '', end_date: '', reason: '' });
      addToast('Leave application submitted successfully for review!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to submit leave request', 'error');
    } finally {
      setApplying(false);
    }
  };

  const calculatedDays = (formData.start_date && formData.end_date)
    ? calculateDaysBetween(formData.start_date, formData.end_date)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700 }}>Leave & Time-Off Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Submit time-off applications, monitor balances, and track approval status
          </p>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', gap: '0.5rem' }}
        >
          <Plus size={18} /> Apply for Leave
        </button>
      </div>

      {/* Leave Balance Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {leaveBalances.map((b, idx) => (
          <div key={idx} className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{b.type}</span>
              <Calendar size={16} color="var(--primary-500)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{b.remaining}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>days left</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              {b.used} used of {b.total} allocated
            </div>
          </div>
        ))}
      </div>

      {/* Leave Requests Table */}
      <div className="card">
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>My Leave Applications</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Full history of your submitted time-off requests</p>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading leave applications..." />
        ) : leaveRequests.length === 0 ? (
          <EmptyState
            title="No leave requests submitted yet"
            description="You currently have no pending or past leave requests."
            actionLabel="Apply for Leave"
            onAction={() => setIsApplyModalOpen(true)}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Leave Type</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Dates</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Duration</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Reason</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Reviewer Remarks</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {item.leave_type}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                      {formatDate(item.start_date)} — {formatDate(item.end_date)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                      {item.days_count} {item.days_count === 1 ? 'day' : 'days'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', maxWidth: '240px' }}>
                      {item.reason}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <Badge status={item.status} />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                      {item.admin_comments || (item.status === 'PENDING' ? 'Awaiting HR Review' : '—')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Leave / Time-Off"
      >
        <form onSubmit={handleApplyLeave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
              Leave Type
            </label>
            <select
              value={formData.leave_type}
              onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
              style={{ width: '100%' }}
            >
              <option value="Paid Leave">Paid Vacation Leave</option>
              <option value="Sick Leave">Sick / Medical Leave</option>
              <option value="Casual Leave">Casual Personal Leave</option>
              <option value="Unpaid Leave">Unpaid Leave</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                Start Date
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                End Date
              </label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {calculatedDays > 0 && (
            <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--primary-100)' }}>
              Total Leave Requested: <strong>{calculatedDays} {calculatedDays === 1 ? 'day' : 'days'}</strong>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
              Reason / Remarks
            </label>
            <textarea
              rows={3}
              required
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Please provide details regarding your leave request..."
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={applying}
              className="btn btn-primary"
            >
              {applying ? 'Submitting...' : 'Submit Leave Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeLeave;
