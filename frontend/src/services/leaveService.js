import api from './api';
import { mockLeaveRequests } from '../utils/mockData';
import {
  extractItems,
  mapLeaveRecord,
  mapLeaveTypeToBackend,
  buildEmployeeLookup,
  flattenEmployee,
  shouldUseMockFallback,
} from '../utils/apiMappers';

async function fetchEmployeeLookup() {
  try {
    const data = await api.get('/employees?limit=100');
    const employees = extractItems(data).map(flattenEmployee);
    return buildEmployeeLookup(employees);
  } catch {
    return {};
  }
}

export const leaveService = {
  async getLeaves(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const endpoint = query ? `/leaves?${query}` : '/leaves';
      const [data, employeeLookup] = await Promise.all([
        api.get(endpoint),
        fetchEmployeeLookup(),
      ]);
      const items = extractItems(data);
      return items.map((leave) => mapLeaveRecord(leave, employeeLookup));
    } catch (err) {
      if (shouldUseMockFallback(err)) return mockLeaveRequests;
      throw err;
    }
  },

  async getMyLeaves(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const endpoint = query ? `/leaves/me?${query}` : '/leaves/me';
      const data = await api.get(endpoint);
      const items = Array.isArray(data) ? data : extractItems(data);
      return items.map((leave) => mapLeaveRecord(leave));
    } catch (err) {
      if (shouldUseMockFallback(err)) return mockLeaveRequests;
      throw err;
    }
  },

  async applyLeave(leaveData) {
    try {
      const payload = {
        leave_type: mapLeaveTypeToBackend(leaveData.leave_type),
        start_date: leaveData.start_date,
        end_date: leaveData.end_date,
        reason: leaveData.reason,
      };
      const data = await api.post('/leaves', payload);
      return mapLeaveRecord(data);
    } catch (err) {
      if (!shouldUseMockFallback(err)) throw err;

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
      const data = await api.patch(`/leaves/${leaveId}/status`, {
        status,
        reviewer_comments: comments,
      });
      return mapLeaveRecord(data);
    } catch (err) {
      if (!shouldUseMockFallback(err)) throw err;

      const leave = mockLeaveRequests.find((l) => l.id === Number(leaveId));
      if (leave) {
        leave.status = status;
        leave.reviewed_by = 'Helen Vance (HR)';
        leave.admin_comments = comments;
        leave.reviewer_comments = comments;
        return leave;
      }
      throw new Error('Leave request not found');
    }
  },

  async getLeaveBalances() {
    try {
      const leaves = await this.getMyLeaves();
      const usedByType = leaves
        .filter((l) => l.status === 'APPROVED')
        .reduce((acc, leave) => {
          const key = leave.leave_type;
          acc[key] = (acc[key] || 0) + (leave.days_count || 0);
          return acc;
        }, {});

      return [
        { type: 'Paid Leave', total: 18, used: usedByType['Paid Leave'] || 0, remaining: 18 - (usedByType['Paid Leave'] || 0) },
        { type: 'Sick Leave', total: 12, used: usedByType['Sick Leave'] || 0, remaining: 12 - (usedByType['Sick Leave'] || 0) },
        { type: 'Casual Leave', total: 10, used: usedByType['Casual Leave'] || 0, remaining: 10 - (usedByType['Casual Leave'] || 0) },
        { type: 'Unpaid Leave', total: 30, used: usedByType['Unpaid Leave'] || 0, remaining: 30 - (usedByType['Unpaid Leave'] || 0) },
      ];
    } catch {
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
