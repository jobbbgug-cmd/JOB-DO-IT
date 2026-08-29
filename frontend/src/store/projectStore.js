import create from 'zustand';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useProjectStore = create((set, get) => ({
  projects: [],
  selectedProject: null,
  loading: false,

  fetchProjects: async () => {
    set({ loading: true });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ projects: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ loading: false });
      console.error('Failed to fetch projects:', error);
    }
  },

  createProject: async (projectData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/projects`, projectData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ projects: [...get().projects, response.data] });
      return response.data;
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  },

  updateProject: async (projectId, updates) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/projects/${projectId}`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({
        projects: get().projects.map((p) => (p._id === projectId ? response.data : p)),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  },

  deleteProject: async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ projects: get().projects.filter((p) => p._id !== projectId) });
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  },

  setSelectedProject: (project) => set({ selectedProject: project }),
}));
