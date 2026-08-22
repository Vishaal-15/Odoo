import api from './api';
import { mockNotifications } from '../utils/mockData';

export const notificationService = {
  async getNotifications() {
    try {
      const data = await api.get('/notifications');
      return Array.isArray(data?.notifications) ? data.notifications : mockNotifications;
    } catch (err) {
      return mockNotifications;
    }
  },

  async markAsRead(id) {
    try {
      await api.put(`/notifications/${id}/read`, {});
    } catch (err) {
      const target = mockNotifications.find((n) => n.id === Number(id));
      if (target) target.is_read = true;
    }
  },

  async markAllAsRead() {
    try {
      await api.put('/notifications/read-all', {});
    } catch (err) {
      mockNotifications.forEach((n) => (n.is_read = true));
    }
  },
};

export default notificationService;
