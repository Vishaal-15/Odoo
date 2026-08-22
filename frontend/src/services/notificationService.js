import api from './api';
import { mockNotifications } from '../utils/mockData';

export const notificationService = {
  async getNotifications() {
    try {
      const data = await api.get('/notifications');
      // Backend returns { unread_count, items } (not { notifications })
      return Array.isArray(data?.items) ? data.items : mockNotifications;
    } catch (err) {
      return mockNotifications;
    }
  },

  async markAsRead(id) {
    try {
      // Backend: PATCH /notifications/{id}/read (not PUT)
      await api.patch(`/notifications/${id}/read`, {});
    } catch (err) {
      const target = mockNotifications.find((n) => n.id === Number(id));
      if (target) target.is_read = true;
    }
  },

  async markAllAsRead() {
    try {
      // Backend: PATCH /notifications/read-all (not PUT)
      await api.patch('/notifications/read-all', {});
    } catch (err) {
      mockNotifications.forEach((n) => (n.is_read = true));
    }
  },
};

export default notificationService;
