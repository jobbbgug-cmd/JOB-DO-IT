import create from 'zustand';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useTaskStore = create((set, get) => ({
  tasks: [],
  selectedTask: null,
  loading: false,

  fetchTasks: async (filters = {}) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await axios.get(`${API_BASE_URL}/tasks?${params}`);
      set({ tasks: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ loading: false });
      console.error('Failed to fetch tasks:', error);
    }
  },

  createTask: async (taskData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tasks`, taskData);
      set({ tasks: [...get().tasks, response.data] });
      return response.data;
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  },

  updateTask: async (taskId, updates) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/tasks/${taskId}`, updates);
      set({
        tasks: get().tasks.map((t) => (t._id === taskId ? response.data : t)),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  },

  deleteTask: async (taskId) => {
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);
      set({ tasks: get().tasks.filter((t) => t._id !== taskId) });
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  },

  addComment: async (taskId, userId, text) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tasks/${taskId}/comments`, {
        userId,
        text,
      });
      set({
        tasks: get().tasks.map((t) => (t._id === taskId ? response.data : t)),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  },

  setSelectedTask: (task) => set({ selectedTask: task }),
}));
