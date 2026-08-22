import api from './api';
import { mockLeaveRequests } from '../utils/mockData';

export const leaveService = {
  async getLeaves(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const endpoint = query ? `/leave?${query}` : '/leave';
      const data = await api.get(endpoint);
      return Array.isArray(data) ? data : mockLeaveRequests;
    } catch (err) {
      return mockLeaveRequests;
    }
  },

  async applyLeave(leaveData) {
    try {
      const data = await api.post('/leave/apply', leaveData);
      return data;
    } catch (err) {
      const newLeave = {
        id: Date.now(),
        employee_id: leaveData.employee_id || 'EMP-003',
        employee_name: leaveData.employee_name || 'Evan Miller',
        leave_type: leaveData.leave_type || 'Paid Leave',
        start_date: leaveData.start_date,
        end_date: leaveData.end_date,
        days_count: leaveData.days_count || 1,
        reason: leaveData.reason,
        status: 'PENDING',
        applied_at: new Date().toISOString(),
        reviewed_by: null,
        admin_comments: null,
      };
      mockLeaveRequests.unshift(newLeave);
      return newLeave;
    }
  },

  async updateLeaveStatus(leaveId, status, comments = '') {
    try {
      const data = await api.put(`/leave/${leaveId}/status`, { status, comments });
      return data;
    } catch (err) {
      const leave = mockLeaveRequests.find((l) => l.id === Number(leaveId));
      if (leave) {
        leave.status = status;
        leave.reviewed_by = 'Helen Vance (HR)';
        leave.admin_comments = comments;
        return leave;
      }
      throw new Error('Leave request not found');
    }
  },

  async getLeaveBalances() {
    try {
      const data = await api.get('/leave/balance');
      return data;
    } catch (err) {
      return [
        { type: 'Paid Leave', total: 18, used: 4, remaining: 14 },
        { type: 'Sick Leave', total: 12, used: 2, remaining: 10 },
        { type: 'Casual Leave', total: 10, used: 1, remaining: 9 },
        { type: 'Unpaid Leave', total: 30, used: 0, remaining: 30 },
      ];
    }
  },
};

export default leaveService;
