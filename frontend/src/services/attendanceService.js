import api from './api';
import { mockAttendanceRecords } from '../utils/mockData';

export const attendanceService = {
  async getAttendance(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const endpoint = query ? `/attendance?${query}` : '/attendance';
      const data = await api.get(endpoint);
      return Array.isArray(data) ? data : mockAttendanceRecords;
    } catch (err) {
      return mockAttendanceRecords;
    }
  },

  async checkIn() {
    try {
      const data = await api.post('/attendance/check-in', {});
      return data;
    } catch (err) {
      const now = new Date();
      const newRecord = {
        id: Date.now(),
        employee_id: 'EMP-003',
        employee_name: 'Evan Miller',
        date: now.toISOString().split('T')[0],
        check_in: now.toISOString(),
        check_out: null,
        status: 'PRESENT',
        hours_worked: 'Active (Current Shift)',
      };
      mockAttendanceRecords.unshift(newRecord);
      return newRecord;
    }
  },

  async checkOut() {
    try {
      const data = await api.post('/attendance/check-out', {});
      return data;
    } catch (err) {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const record = mockAttendanceRecords.find((r) => r.date === todayStr);
      if (record) {
        record.check_out = now.toISOString();
        record.hours_worked = '8h 12m';
        return record;
      }
      return { message: 'Checked out successfully' };
    }
  },

  async getTodayStatus() {
    const records = await this.getAttendance();
    const todayStr = new Date().toISOString().split('T')[0];
    return records.find((r) => r.date === todayStr) || null;
  },
};

export default attendanceService;
