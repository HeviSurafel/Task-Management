import { create } from 'zustand';
import axios from '../lib/axios';
import { io } from 'socket.io-client';
const socket = io('https://makallataskmanagement.lobborecords.com/api'); // Replace with your server URL

const useTaskStore = create((set) => {
  // Listen for real-time updates from the server
  socket.on('commentAdded', (data) => {
    set((state) => ({
      comments: {
        ...state.comments,
        [data.taskId]: [...(state.comments[data.taskId] || []), data.comment],
      },
    }));
  });

  socket.on('taskStatusUpdated', (data) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task._id === data.taskId ? { ...task, status: data.status } : task
      ),
    }));
  });

  return {
    tasks: [],
    comments: {},
    loading: false,
    error: null,
    dashboardData: null,

    fetchTasks: async (employeeId) => {
      set({ loading: true, error: null });
      try {
        const response = await axios.get(`/employees/${employeeId}/tasks`);
        set({ tasks: response.data.data, loading: false });
      } catch (error) {
        set({ error: error.response?.data?.message || 'Failed to fetch tasks', loading: false });
      }
    },

    updateTaskStatus: async (taskId, status) => {
      set({ loading: true, error: null });
      try {
        const response = await axios.put(`/api/tasks/${taskId}/status`, { status });
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task._id === taskId ? { ...task, status: response.data.data.newStatus } : task
          ),
          loading: false,
        }));
        // Emit an event to notify the server of the status update
        socket.emit('taskStatusUpdated', { taskId, status });
      } catch (error) {
        set({ error: error.response?.data?.message || 'Failed to update task status', loading: false });
      }
    },

    fetchComments: async (taskId) => {
      set({ loading: true, error: null });
      try {
        const response = await axios.get(`/tasks/${taskId}/comments`);
        set((state) => ({
          comments: { ...state.comments, [taskId]: response.data.data },
          loading: false,
        }));
      } catch (error) {
        set({ error: error.response?.data?.message || 'Failed to fetch comments', loading: false });
      }
    },
    
     
      fetchDashboardData: async (employeeId) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.get(`/${employeeId}`);
          set({ dashboardData: response.data.data, loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
        }
      },
   

    addComment: async (taskId, comment) => {
      set({ loading: true, error: null });
      try {
        const response = await axios.post(`/tasks/${taskId}/comments`, comment);
        set((state) => ({
          comments: {
            ...state.comments,
            [taskId]: [...(state.comments[taskId] || []), response.data.data],
          },
          loading: false,
        }));
        // Emit an event to notify the server of the new comment
        socket.emit('newComment', { taskId, comment: response.data.data });
      } catch (error) {
        set({ error: error.response?.data?.message || 'Failed to add comment', loading: false });
      }
    },
  };
});

export default useTaskStore;