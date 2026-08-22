import api from './api';
import { mockUsers } from '../utils/mockData';
import { extractItems, flattenEmployee, shouldUseMockFallback } from '../utils/apiMappers';

export const employeeService = {
  async getEmployees(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const endpoint = query ? `/employees?${query}` : '/employees';
      const data = await api.get(endpoint);
      return extractItems(data).map(flattenEmployee);
    } catch (err) {
      if (err.response?.status === 403) {
        try {
          const me = await this.getMyProfile();
          return me ? [me] : [];
        } catch {
          return [];
        }
      }
      if (shouldUseMockFallback(err)) return mockUsers;
      throw err;
    }
  },


  async getMyProfile() {
    try {
      const data = await api.get('/employees/me');
      return flattenEmployee(data);
    } catch (err) {
      if (shouldUseMockFallback(err)) return mockUsers[2];
      throw err;
    }
  },

  async getEmployeeById(id) {
    try {
      const data = await api.get(`/employees/${id}`);
      return flattenEmployee(data);
    } catch (err) {
      if (shouldUseMockFallback(err)) {
        const found = mockUsers.find((u) => u.id === Number(id) || u.employee_id === id);
        return found || mockUsers[2];
      }
      throw err;
    }
  },

  async updateMyProfile(updateData) {
    try {
      const payload = {
        phone: updateData.phone,
        address: updateData.address,
        profile_picture_url: updateData.avatar || updateData.profile_picture_url,
        emergency_contact: updateData.emergency_contact,
      };
      const data = await api.patch('/employees/me', payload);
      return flattenEmployee(data);
    } catch (err) {
      if (!shouldUseMockFallback(err)) throw err;

      const index = mockUsers.findIndex((u) => u.id === updateData.id);
      if (index !== -1) {
        mockUsers[index] = { ...mockUsers[index], ...updateData };
        return mockUsers[index];
      }
      return updateData;
    }
  },

  async updateEmployee(id, updateData) {
    try {
      const payload = {
        first_name: updateData.first_name,
        last_name: updateData.last_name,
        email: updateData.email,
        role: updateData.role,
        is_active: updateData.is_active,
        phone: updateData.phone,
        address: updateData.address,
        profile_picture_url: updateData.avatar || updateData.profile_picture_url,
        department: updateData.department,
        designation: updateData.designation || updateData.job_title,
        joining_date: updateData.hire_date || updateData.joining_date,
        emergency_contact: updateData.emergency_contact,
        basic_salary: updateData.basic_salary ?? updateData.salary,
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key];
      });

      const data = await api.patch(`/employees/${id}`, payload);
      return flattenEmployee(data);
    } catch (err) {
      if (!shouldUseMockFallback(err)) throw err;

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
      const payload = {
        employee_id: newEmployeeData.employee_id || `EMP${Date.now().toString().slice(-6)}`,
        email: newEmployeeData.email,
        password: newEmployeeData.password || 'Employee@123',
        first_name: newEmployeeData.first_name,
        last_name: newEmployeeData.last_name,
        role: newEmployeeData.role || 'EMPLOYEE',
        department: newEmployeeData.department || 'General',
        designation: newEmployeeData.designation || newEmployeeData.job_title || 'Employee',
        phone: newEmployeeData.phone || null,
        joining_date: newEmployeeData.hire_date || newEmployeeData.joining_date || undefined,
      };

      const data = await api.post('/auth/register', payload);
      return flattenEmployee(data);
    } catch (err) {
      if (!shouldUseMockFallback(err)) throw err;

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
