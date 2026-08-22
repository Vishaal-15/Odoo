import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { leaveService } from '../../services/leaveService';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Calendar, CheckCircle2, XCircle, Clock, Filter, MessageSquare } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const HrLeaves = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Approval decision modal state
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [decisionType, setDecisionType] = useState('APPROVED'); // 'APPROVED' or 'REJECTED'
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const data = await leaveService.getLeaves();
      setLeaves(data);
    } catch (err) {
      console.error('Failed to load leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const openDecisionModal = (leave, type) => {
    setSelectedLeave(leave);
    setDecisionType(type);
    setComments(type === 'APPROVED' ? 'Approved as requested.' : 'Unable to approve due to team schedule coverage.');
  };

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updated = await leaveService.updateLeaveStatus(selectedLeave.id, decisionType, comments);
      setLeaves((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      setSelectedLeave(null);
      addToast(`Leave request marked as ${decisionType}!`, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update leave request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLeaves = leaves.filter((l) => {
    if (filterStatus === 'ALL') return true;
    return l.status === filterStatus;
  });

  const pendingCount = leaves.filter((l) => l.status === 'PENDING').length;
  const approvedCount = leaves.filter((l) => l.status === 'APPROVED').length;
  const rejectedCount = leaves.filter((l) => l.status === 'REJECTED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 700 }}>Leave & Time-Off Approval Console</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Review employee leave applications, submit manager decisions, and log feedback
        </p>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <StatCard
          title="Pending Approvals"
          value={pendingCount}
          subtitle="Awaiting decision"
          icon={Clock}
          color={pendingCount > 0 ? 'warning' : 'info'}
        />
        <StatCard
          title="Approved This Month"
          value={approvedCount}
          subtitle="Processed time-off"
          icon={CheckCircle2}
          color="success"
        />
        <StatCard
          title="Rejected Requests"
          value={rejectedCount}
          subtitle="Policy / conflict rejections"
          icon={XCircle}
          color="danger"
        />
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Filter Requests by Status:</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`btn ${filterStatus === st ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              >
                {st === 'ALL' ? 'All Requests' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leaves Table Card */}
      <div className="card">
        {loading ? (
          <LoadingSpinner message="Loading leave applications..." />
        ) : filteredLeaves.length === 0 ? (
          <EmptyState title="No leave applications" description="There are no leave requests under this filter category." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Employee</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Leave Type</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Requested Dates</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Duration</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Reason</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((l) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{l.employee_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{l.employee_id}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>
                      {l.leave_type}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                      {formatDate(l.start_date)} — {formatDate(l.end_date)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                      {l.days_count} days
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', maxWidth: '200px' }}>
                      {l.reason}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <Badge status={l.status} />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      {l.status === 'PENDING' ? (
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => openDecisionModal(l, 'APPROVED')}
                            className="btn btn-outline"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', borderColor: 'var(--success)', color: '#34d399' }}
                            title="Approve Request"
                          >
                            <CheckCircle2 size={14} /> Approve
                          </button>
                          <button
                            onClick={() => openDecisionModal(l, 'REJECTED')}
                            className="btn btn-outline"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', borderColor: 'var(--danger)', color: '#f87171' }}
                            title="Reject Request"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          Reviewed by {l.reviewed_by || 'HR'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decision Modal */}
      <Modal
        isOpen={!!selectedLeave}
        onClose={() => setSelectedLeave(null)}
        title={`${decisionType === 'APPROVED' ? 'Approve' : 'Reject'} Leave Request`}
      >
        {selectedLeave && (
          <form onSubmit={handleDecisionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
              <div>Employee: <strong>{selectedLeave.employee_name}</strong></div>
              <div>Leave Type: <strong>{selectedLeave.leave_type}</strong> ({selectedLeave.days_count} days)</div>
              <div>Reason: <em>{selectedLeave.reason}</em></div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                Reviewer Remarks / Feedback
              </label>
              <textarea
                rows={3}
                required
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setSelectedLeave(null)} className="btn btn-outline">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`btn ${decisionType === 'APPROVED' ? 'btn-primary' : 'btn-outline'}`}
                style={decisionType === 'REJECTED' ? { backgroundColor: 'var(--danger)', color: '#fff', border: 'none' } : {}}
              >
                {submitting ? 'Processing...' : `Confirm ${decisionType}`}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default HrLeaves;
