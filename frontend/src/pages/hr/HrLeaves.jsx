import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { leaveService } from '../../services/leaveService';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Textarea from '../../components/common/Textarea';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';
import { Calendar, CheckCircle2, XCircle, Clock, Filter, MessageSquare, Check, X } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const HrLeaves = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Approval decision modal state
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [decisionType, setDecisionType] = useState('APPROVED');
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
    <div className="space-y-6">
      <PageHeader
        title="Leave & Time-Off Approvals"
        subtitle="Review employee leave applications, execute manager decisions, and log official feedback"
        breadcrumbs={['HR Operations', 'Leave Approvals']}
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Pending Approvals"
          value={pendingCount}
          subtitle="Awaiting management decision"
          icon={Clock}
          color={pendingCount > 0 ? 'warning' : 'info'}
        />
        <StatCard
          title="Approved This Month"
          value={approvedCount}
          subtitle="Processed leave applications"
          icon={CheckCircle2}
          color="success"
        />
        <StatCard
          title="Rejected Requests"
          value={rejectedCount}
          subtitle="Schedule conflict or quota limits"
          icon={XCircle}
          color="danger"
        />
      </div>

      {/* Table Card */}
      <Card
        title={`Leave Applications (${filteredLeaves.length})`}
        subtitle="Review, approve, or reject team leave requests"
        action={
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 rounded-lg border border-slate-800">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  filterStatus === st
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All' : st}
              </button>
            ))}
          </div>
        }
      >
        {loading ? (
          <TableSkeleton rows={4} cols={7} />
        ) : filteredLeaves.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No leave applications found"
            description="No requests match the selected status filter."
          />
        ) : (
          <div className="saas-table-container">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Requested Dates</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <div className="font-bold text-slate-100">{l.employee_name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{l.employee_id}</div>
                    </td>
                    <td className="font-medium text-slate-200">{l.leave_type}</td>
                    <td className="text-xs text-slate-300">
                      {formatDate(l.start_date)} <span className="text-slate-500">to</span> {formatDate(l.end_date)}
                    </td>
                    <td className="font-semibold text-slate-200">{l.days_count} days</td>
                    <td className="text-xs text-slate-400 max-w-xs truncate">{l.reason}</td>
                    <td>
                      <Badge status={l.status} size="xs" />
                    </td>
                    <td className="text-right">
                      {l.status === 'PENDING' ? (
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            onClick={() => openDecisionModal(l, 'APPROVED')}
                            variant="success"
                            size="xs"
                            icon={Check}
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={() => openDecisionModal(l, 'REJECTED')}
                            variant="danger"
                            size="xs"
                            icon={X}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">
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
      </Card>

      {/* Decision Modal */}
      <Modal
        isOpen={Boolean(selectedLeave)}
        onClose={() => setSelectedLeave(null)}
        title={`${decisionType === 'APPROVED' ? 'Approve' : 'Reject'} Leave Request`}
        subtitle="Submit management decision and optional feedback"
      >
        {selectedLeave && (
          <form onSubmit={handleDecisionSubmit} className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Employee:</span>
                <span className="font-bold text-slate-100">{selectedLeave.employee_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Leave Type:</span>
                <span className="font-semibold text-slate-200">{selectedLeave.leave_type} ({selectedLeave.days_count} days)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration:</span>
                <span className="text-slate-300">{formatDate(selectedLeave.start_date)} — {formatDate(selectedLeave.end_date)}</span>
              </div>
              <div className="pt-1.5 border-t border-slate-800 text-slate-300">
                <span className="text-slate-500 block mb-0.5">Reason:</span>
                <em>"{selectedLeave.reason}"</em>
              </div>
            </div>

            <Textarea
              label="Reviewer Comments & Feedback"
              required
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add review notes for the employee..."
            />

            <div className="flex justify-end gap-2.5 pt-3">
              <Button type="button" variant="outline" onClick={() => setSelectedLeave(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant={decisionType === 'APPROVED' ? 'success' : 'danger'}
                isLoading={submitting}
              >
                Confirm {decisionType === 'APPROVED' ? 'Approval' : 'Rejection'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default HrLeaves;
