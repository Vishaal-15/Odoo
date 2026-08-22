import api from './api';
import { mockAttendanceRecords } from '../utils/mockData';
import {
  extractItems,
  mapAttendanceRecord,
  buildEmployeeLookup,
  flattenEmployee,
  isNetworkError,
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

export const attendanceService = {
  async getAttendance(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const endpoint = query ? `/attendance?${query}` : '/attendance';
      const [data, employeeLookup] = await Promise.all([
        api.get(endpoint),
        fetchEmployeeLookup(),
      ]);
      const items = extractItems(data);
      return items.map((record) => mapAttendanceRecord(record, employeeLookup));
    } catch (err) {
      if (shouldUseMockFallback(err)) return mockAttendanceRecords;
      throw err;
    }
  },

  async getMyAttendance(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const endpoint = query ? `/attendance/me?${query}` : '/attendance/me';
      const data = await api.get(endpoint);
      const items = Array.isArray(data) ? data : extractItems(data);
      return items.map((record) => mapAttendanceRecord(record));
    } catch (err) {
      if (shouldUseMockFallback(err)) return mockAttendanceRecords;
      throw err;
    }
  },

  async checkIn() {
    try {
      const data = await api.post('/attendance/check-in', {});
      return mapAttendanceRecord(data);
    } catch (err) {
      if (!shouldUseMockFallback(err)) throw err;

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
      return mapAttendanceRecord(data);
    } catch (err) {
      if (!shouldUseMockFallback(err)) throw err;

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
    try {
      const data = await api.get('/attendance/me/today');
      return mapAttendanceRecord(data);
    } catch (err) {
      if (!shouldUseMockFallback(err)) throw err;

      const records = await this.getMyAttendance();
      const todayStr = new Date().toISOString().split('T')[0];
      return records.find((r) => r.date === todayStr) || null;
    }
  },
};

export default attendanceService;
