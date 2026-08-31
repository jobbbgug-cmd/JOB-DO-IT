'use client';

import { create } from 'zustand';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, role: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      set({ user, token, error: null });
      return { success: true };
    } catch (error: any) {
      const data = error.response?.data;
      if (data?.needsVerification) {
        set({ error: 'Email not verified' });
        return { success: false, message: data.error, needsVerification: true, email: data.email };
      }
      const message = data?.error || 'Login failed';
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  register: async (name, email, password, role) => {
    set({ loading: true });
    try {
      const response = await axios.post('/api/auth/register', { name, email, password, role });
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      set({ user, token, error: null });
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed';
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  setUser: (user) => set({ user }),
}));
