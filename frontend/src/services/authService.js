import api from './api';
import { STORAGE_KEYS } from '../utils/constants';
import { mockUsers } from '../utils/mockData';

export const authService = {
  async login(email, password) {
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const data = await api.post('/auth/login', formData, {
        isFormData: true,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (data?.access_token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.access_token);
        const profile = await this.getProfile();
        return profile;
      }
    } catch (err) {
      // Graceful local test fallback if backend is not running
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
      const data = await api.post('/auth/register', userData);
      return data;
    } catch (err) {
      // Mock registration fallback
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
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(profile));
      return profile;
    } catch (err) {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (stored) return JSON.parse(stored);
      // Default to employee mock
      return mockUsers[2];
    }
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },
};

export default authService;
