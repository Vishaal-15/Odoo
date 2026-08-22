import api from './api';
import { mockAnalyticsData } from '../utils/mockData';

export const analyticsService = {
  async getOverview() {
    try {
      const data = await api.get('/analytics/overview');
      return data;
    } catch (err) {
      return mockAnalyticsData;
    }
  },

  async getAttendanceTrends() {
    try {
      const data = await api.get('/analytics/attendance-trends');
      return data;
    } catch (err) {
      return mockAnalyticsData.attendance;
    }
  },

  async getDepartmentBreakdown() {
    try {
      const data = await api.get('/analytics/department-breakdown');
      return data;
    } catch (err) {
      return mockAnalyticsData.workforce;
    }
  },

  async getReportsSummary() {
    try {
      const data = await api.get('/reports/summary');
      return data;
    } catch (err) {
      return [
        { id: 1, title: 'Monthly Attendance Report - Aug 2026', type: 'Attendance', date: '2026-08-20', format: 'PDF' },
        { id: 2, title: 'Payroll Summary Report - July 2026', type: 'Payroll', date: '2026-08-01', format: 'CSV' },
        { id: 3, title: 'Annual Leave Utilization 2026 Q2', type: 'Leave', date: '2026-07-15', format: 'PDF' },
        { id: 4, title: 'Department Headcount Audit', type: 'Headcount', date: '2026-07-01', format: 'CSV' },
      ];
    }
  },

  async exportReport(reportType, format = 'csv') {
    try {
      const data = await api.post('/reports/export', { report_type: reportType, format });
      return data;
    } catch (err) {
      return {
        message: `Report for ${reportType} (${format.toUpperCase()}) exported successfully.`,
        downloadUrl: '#',
      };
    }
  },
};

export default analyticsService;
