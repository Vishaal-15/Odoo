import api from './api';
import { mockUsers } from '../utils/mockData';

export const employeeService = {
  async getEmployees() {
    try {
      const data = await api.get('/employees');
      return Array.isArray(data) ? data : mockUsers;
    } catch (err) {
      return mockUsers;
    }
  },

  async getEmployeeById(id) {
    try {
      const data = await api.get(`/employees/${id}`);
      return data;
    } catch (err) {
      const found = mockUsers.find((u) => u.id === Number(id) || u.employee_id === id);
      return found || mockUsers[2];
    }
  },

  async updateEmployee(id, updateData) {
    try {
      const data = await api.put(`/employees/${id}`, updateData);
      return data;
    } catch (err) {
      const index = mockUsers.findIndex((u) => u.id === Number(id));
      if (index !== -1) {
        mockUsers[index] = { ...mockUsers[index], ...updateData };
        return mockUsers[index];
      }
      return updateData;
    }
  },

  async createEmployee(newEmployeeData) {
    try {
      const data = await api.post('/employees', newEmployeeData);
      return data;
    } catch (err) {
      const created = {
        id: Date.now(),
        employee_id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
        ...newEmployeeData,
        is_active: true,
      };
      mockUsers.push(created);
      return created;
    }
  },
};

export default employeeService;
