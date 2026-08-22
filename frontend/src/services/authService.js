import api from './api';
import { STORAGE_KEYS } from '../utils/constants';
import { mockUsers } from '../utils/mockData';
import { flattenEmployee, flattenLoginUser, isNetworkError, shouldUseMockFallback } from '../utils/apiMappers';

export const authService = {
  async login(email, password) {
    const data = await api.post('/auth/login', { email, password });

    if (data?.access_token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.access_token);
      try {
        const profile = await this.getProfile();
        return profile;
      } catch {
        const profile = flattenLoginUser(data.user);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(profile));
        return profile;
      }
    }
    throw new Error('Authentication failed: No access token returned');
  },

  async register(userData) {
    const payload = {
      employee_id: userData.employee_id || `EMP${Date.now().toString().slice(-6)}`,
      email: userData.email,
      password: userData.password,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role || 'EMPLOYEE',
      department: userData.department || 'General',
      designation: userData.designation || userData.job_title || 'Employee',
      phone: userData.phone || null,
    };
    const data = await api.post('/auth/register', payload);
    return flattenEmployee(data);
  },

  async getProfile() {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      this.logout();
      throw new Error('No active session token found');
    }
    try {
      const profile = await api.get('/auth/me');
      const normalized = flattenEmployee(profile);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(normalized));
      return normalized;
    } catch (err) {
      this.logout();
      throw err;
    }
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },
};

export default authService;
