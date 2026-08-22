import api from './api';
import { STORAGE_KEYS } from '../utils/constants';
import { mockUsers } from '../utils/mockData';
import { flattenEmployee, flattenLoginUser, isNetworkError, shouldUseMockFallback } from '../utils/apiMappers';

export const authService = {
  async login(email, password) {
    try {
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
    } catch (err) {
      if (err.status === 401 || err.status === 400) {
        throw new Error(err.message || 'Invalid email or password');
      }
      if (!isNetworkError(err)) {
        throw new Error(err.message || 'Invalid email or password');
      }

      const found = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        const fakeToken = `mock_jwt_token_${found.role.toLowerCase()}`;
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, fakeToken);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(found));
        return found;
      }
      throw new Error(err.message || 'Invalid email or password');
    }
  },

  async register(userData) {
    try {
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
    } catch (err) {
      if (!shouldUseMockFallback(err)) {
        throw err;
      }

      const newUser = {
        id: Date.now(),
        employee_id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role || 'EMPLOYEE',
        department: userData.department || 'General',
        job_title: userData.job_title || 'Associate',
        phone: userData.phone || '',
        hire_date: new Date().toISOString().split('T')[0],
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        is_active: true,
      };
      mockUsers.push(newUser);
      return newUser;
    }
  },

  async getProfile() {
    try {
      const profile = await api.get('/auth/me');
      const normalized = flattenEmployee(profile);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(normalized));
      return normalized;
    } catch (err) {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (stored) return JSON.parse(stored);
      if (shouldUseMockFallback(err)) return mockUsers[2];
      throw err;
    }
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },
};

export default authService;
