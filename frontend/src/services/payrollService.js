import api from './api';
import { mockPayrollRecords } from '../utils/mockData';
import { extractItems, mapPayrollRecord, shouldUseMockFallback } from '../utils/apiMappers';

export const payrollService = {
  async getPayrollOverview(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const endpoint = query ? `/payroll?${query}` : '/payroll';
      const data = await api.get(endpoint);
      return extractItems(data).map(mapPayrollRecord);
    } catch (err) {
      if (shouldUseMockFallback(err)) return mockPayrollRecords;
      throw err;
    }
  },

  async getMyPayslips(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const endpoint = query ? `/payroll/me?${query}` : '/payroll/me';
      const data = await api.get(endpoint);
      const items = Array.isArray(data) ? data : extractItems(data);
      return items.map(mapPayrollRecord);
    } catch (err) {
      if (shouldUseMockFallback(err)) return mockPayrollRecords;
      throw err;
    }
  },

  async getPayslipDetails(id) {
    try {
      const data = await api.get(`/payroll/${id}`);
      return mapPayrollRecord(data);
    } catch (err) {
      if (shouldUseMockFallback(err)) {
        const found = mockPayrollRecords.find((p) => p.id === Number(id));
        return found || mockPayrollRecords[0];
      }
      throw err;
    }
  },

  async generatePayroll(payPeriod) {
    try {
      const data = await api.post('/payroll/generate', { pay_period: payPeriod });
      return data;
    } catch (err) {
      if (!shouldUseMockFallback(err)) throw err;
      return {
        message: `Payroll for ${payPeriod} generated successfully for all active employees.`,
        generated_count: 48,
      };
    }
  },
};

export default payrollService;
