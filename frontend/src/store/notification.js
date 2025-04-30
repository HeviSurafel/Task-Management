import { create } from 'zustand';
import axios from '../lib/axios';

const useNotificationStore = create((set) => ({
  notifications: [],
  loading: false,
  error: null,

  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/notifications');
      set({ notifications: response.data.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch notifications', loading: false });
    }
  },

  fetchNotificationsByEmployee: async (employeeId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`/notifications/${employeeId}`);
      set({ notifications: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch notifications by employee', loading: false });
    }
  },

  createNotification: async (notificationData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/notifications', notificationData);
      set((state) => ({
        notifications: [...state.notifications, response.data.data],
        loading: false,
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create notification', loading: false });
    }
  },

  markNotificationAsRead: async (notificationId) => {
    set({ loading: true, error: null });
    try {
      await axios.put(`/notifications/${notificationId}/read`);
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to mark notification as read', loading: false });
    }
  },

  deleteNotification: async (notificationId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/notifications/${notificationId}`);
      set((state) => ({
        notifications: state.notifications.filter((notification) => notification._id !== notificationId),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete notification', loading: false });
    }
  },
}));

export default useNotificationStore;
