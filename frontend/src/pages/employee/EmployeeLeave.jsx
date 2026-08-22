import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { leaveService } from '../../services/leaveService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';
import { 
  Calendar, 
  Plus, 
  Search, 
  UploadCloud, 
  Check, 
  X, 
  FileText,
  Clock,
  HeartPulse,
  Sun
} from 'lucide-react';
import { formatDate, calculateDaysBetween } from '../../utils/formatters';

export const EmployeeLeave = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('time_off'); // 'time_off' | 'allocation'
  const [searchTerm, setSearchTerm] = useState('');

  // Request modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    leave_type: 'Paid Time off',
    start_date: '2025-05-13',
    end_date: '2025-05-14',
    attachment_name: '',
  });

  const isHrOrAdmin = user?.role === 'ADMIN' || user?.role === 'HR';

  const loadData = async () => {
    setLoading(true);
    try {
      const leaves = isHrOrAdmin ? await leaveService.getLeaves() : await leaveService.getMyLeaves();
      setLeaveRequests(leaves);
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
      addToast('Please specify valid start and end dates.', 'warning');
      return;
    }

    const duration = calculateDaysBetween(formData.start_date, formData.end_date) || 1;
    setSubmitting(true);

    try {
      const newLeave = await leaveService.applyLeave({
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: `${formData.leave_type} request ${formData.attachment_name ? '(Certificate attached)' : ''}`,
        employee_id: user?.employee_id || 'OI...',
        employee_name: `${user?.first_name} ${user?.last_name}`,
        days_count: duration,
      });

      setLeaveRequests((prev) => [newLeave, ...prev]);
      setIsApplyModalOpen(false);
      addToast('Time off request submitted successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to submit time off request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminDecision = async (leaveId, decision) => {
    try {
      const updated = await leaveService.updateLeaveStatus(
        leaveId, 
        decision, 
        decision === 'APPROVED' ? 'Approved by HR' : 'Rejected'
      );
      setLeaveRequests((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      addToast(`Time off request ${decision.toLowerCase()}!`, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update request', 'error');
    }
  };

  const calculatedDays =
    formData.start_date && formData.end_date
      ? calculateDaysBetween(formData.start_date, formData.end_date)
      : 1;

  const filteredRequests = leaveRequests.filter((l) => {
    const search = searchTerm.toLowerCase();
    return (
      (l.employee_name && l.employee_name.toLowerCase().includes(search)) ||
      (l.leave_type && l.leave_type.toLowerCase().includes(search)) ||
      (l.employee_id && l.employee_id.toLowerCase().includes(search))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Top Secondary Nav & Action Bar (Wireframe 7 & 8) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-4">
        
        {/* Subtabs: [Time Off] | [Allocation] */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveSubTab('time_off')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'time_off'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            Time Off
          </button>
          <button
            onClick={() => setActiveSubTab('allocation')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'allocation'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            Allocation
          </button>
        </div>

        {/* Action Bar: [NEW] Button + Searchbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            onClick={() => setIsApplyModalOpen(true)}
            variant="primary"
            size="md"
            icon={Plus}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md px-6 w-full sm:w-auto"
          >
            NEW
          </Button>

          <div className="w-full sm:w-80">
            <Input
              placeholder="Search time off records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
              className="bg-slate-950/80 border-slate-700"
            />
          </div>
        </div>

        {/* Wireframe Balance Summary Cards: Paid Time Off (24 Days Available) | Sick Time Off (07 Days Available) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Paid Time Off Card */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center font-bold">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
                  Paid time Off
                </span>
                <span className="text-xl font-black text-white font-mono">
                  24 Days Available
                </span>
              </div>
            </div>
          </div>

          {/* Sick Time Off Card */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center font-bold">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
                  Sick time off
                </span>
                <span className="text-xl font-black text-white font-mono">
                  07 Days Available
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Wireframe 7 & 8 Time Off Requests Table */}
      <Card
        title="Time Off Applications & Approvals"
        subtitle={isHrOrAdmin ? 'Manage and decide employee time off requests' : 'Your personal time off applications'}
      >
        {loading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : filteredRequests.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No time off records"
            description="Click [NEW] to submit a time off request."
            actionLabel="NEW Time Off"
            onAction={() => setIsApplyModalOpen(true)}
            actionIcon={Plus}
          />
        ) : (
          <div className="saas-table-container">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Time off Type</th>
                  <th className="text-right">Status / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRequests.map((l) => (
                  <tr key={l.id}>
                    {/* Employee Name */}
                    <td className="font-bold text-slate-100">
                      {l.employee_name || `${user?.first_name} ${user?.last_name}`}
                    </td>

                    {/* Start Date */}
                    <td className="font-mono text-xs text-slate-300">
                      {formatDate(l.start_date || '2025-10-28')}
                    </td>

                    {/* End Date */}
                    <td className="font-mono text-xs text-slate-300">
                      {formatDate(l.end_date || '2025-10-28')}
                    </td>

                    {/* Time off Type */}
                    <td className="font-semibold text-sky-400 text-xs">
                      {l.leave_type || 'Paid time Off'}
                    </td>

                    {/* Status & Instant Action Buttons for Admin/HR */}
                    <td className="text-right">
                      {isHrOrAdmin && l.status === 'PENDING' ? (
                        <div className="inline-flex items-center gap-2">
                          {/* 🔴 Red Reject Button */}
                          <button
                            onClick={() => handleAdminDecision(l.id, 'REJECTED')}
                            className="w-7 h-7 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow transition-colors"
                            title="Reject Request"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          {/* 🟢 Green Approve Button */}
                          <button
                            onClick={() => handleAdminDecision(l.id, 'APPROVED')}
                            className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow transition-colors"
                            title="Approve Request"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <Badge status={l.status} size="xs" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Wireframe 8 Time Off Type Request Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Time off Type Request"
      >
        <form onSubmit={handleApplyLeave} className="space-y-4">
          
          {/* Employee Name (Read-Only) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Employee</label>
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-700 text-xs font-bold text-sky-400">
              {user?.first_name} {user?.last_name} ({user?.employee_id})
            </div>
          </div>

          {/* Time off Type Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Time off Type</label>
            <Select
              value={formData.leave_type}
              onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
            >
              <option value="Paid Time off">Paid Time off</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Unpaid Leaves">Unpaid Leaves</option>
            </Select>
          </div>

          {/* Validity Period: Start Date To End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="From"
              type="date"
              required
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
            <Input
              label="To"
              type="date"
              required
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
          </div>

          {/* Allocation Duration (Auto Calculated) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Allocation</label>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs font-bold text-sky-400 font-mono">
              {String(calculatedDays).padStart(2, '0')}.00 Days
            </div>
          </div>

          {/* Attachment Upload (For sick leave certificate) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Attachment:</label>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 hover:border-purple-500 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-slate-200 block">
                  {formData.attachment_name || 'Upload Certificate'}
                </span>
                <span className="text-[11px] text-slate-400">
                  (For sick leave certificate or doctor note)
                </span>
              </div>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setFormData({ ...formData, attachment_name: e.target.files[0].name });
                  }
                }}
              />
            </label>
          </div>

          {/* Action Buttons: [Submit] (purple) & [Discard] (gray) */}
          <div className="flex items-center gap-2.5 pt-3">
            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold"
            >
              Submit
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsApplyModalOpen(false)}
            >
              Discard
            </Button>
          </div>

        </form>
      </Modal>

    </div>
  );
};

export default EmployeeLeave;
