import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { leaveService } from '../../services/leaveService';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';
import { Calendar, Plus, Clock, CheckCircle2, XCircle, AlertCircle, FileText, Info } from 'lucide-react';
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
        employee_id: user?.employee_id || 'EMP003',
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

  const calculatedDays =
    formData.start_date && formData.end_date
      ? calculateDaysBetween(formData.start_date, formData.end_date)
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave & Time-Off Management"
        subtitle="Submit time-off requests, monitor leave quotas, and track approval status"
        breadcrumbs={['Workspace', 'Leave Requests']}
        actions={
          <Button onClick={() => setIsApplyModalOpen(true)} variant="primary" size="sm" icon={Plus}>
            Apply for Time Off
          </Button>
        }
      />

      {/* Leave Quota Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {leaveBalances.map((bal, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-card backdrop-blur-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">{bal.type}</span>
              <Calendar className="w-4 h-4 text-brand-400" />
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-100 font-sans">{bal.remaining}</span>
              <span className="text-xs text-slate-400">/ {bal.total} days remaining</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-950/80 h-1.5 rounded-full overflow-hidden border border-slate-800/60">
              <div
                style={{ width: `${Math.min(100, (bal.used / bal.total) * 100)}%` }}
                className="h-full bg-brand-500 rounded-full transition-all"
              />
            </div>
            <div className="text-[11px] text-slate-400 font-medium">{bal.used} days utilized this year</div>
          </div>
        ))}
      </div>

      {/* Leave Applications History */}
      <Card title="Time-Off Request History" subtitle="Record of all submitted leave requests and decisions">
        {loading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : leaveRequests.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No leave requests filed"
            description="You have not submitted any time-off applications yet."
            actionLabel="Apply for Leave"
            onAction={() => setIsApplyModalOpen(true)}
            actionIcon={Plus}
          />
        ) : (
          <div className="saas-table-container">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Duration / Dates</th>
                  <th>Days Count</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Manager Feedback</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((l, idx) => (
                  <tr key={idx}>
                    <td className="font-semibold text-slate-100">{l.leave_type}</td>
                    <td className="text-xs text-slate-300">
                      {formatDate(l.start_date)} <span className="text-slate-500">to</span> {formatDate(l.end_date)}
                    </td>
                    <td className="font-medium text-slate-200">{l.days_count} {l.days_count === 1 ? 'day' : 'days'}</td>
                    <td className="text-xs text-slate-400 max-w-xs truncate">{l.reason}</td>
                    <td>
                      <Badge status={l.status} size="xs" />
                    </td>
                    <td className="text-xs text-slate-400">
                      {l.reviewer_comments || (l.status === 'PENDING' ? 'Awaiting HR review' : 'None provided')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Time Off"
        subtitle="Submit your time-off request for HR/manager approval"
      >
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <Select
            label="Leave Type"
            value={formData.leave_type}
            onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
          >
            <option value="Paid Leave">Paid Annual Leave</option>
            <option value="Sick Leave">Medical / Sick Leave</option>
            <option value="Casual Leave">Casual Time-Off</option>
            <option value="Unpaid Leave">Unpaid Leave</option>
          </Select>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              required
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              required
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
          </div>

          {calculatedDays > 0 && (
            <div className="p-3 rounded-lg bg-brand-500/10 border border-brand-500/20 text-xs text-brand-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-brand-400 shrink-0" />
              <span>
                Total duration: <strong className="text-white">{calculatedDays} workdays</strong> requested
              </span>
            </div>
          )}

          <Textarea
            label="Reason for Leave"
            required
            rows={3}
            placeholder="Briefly state the reason for this time-off request..."
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          />

          <div className="flex justify-end gap-2.5 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={applying}>
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeLeave;
