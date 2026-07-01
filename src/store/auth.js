import { create } from 'zustand';
import { api } from '../lib/api';

const TOKEN_KEY = 'ci_guardian_token';

const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  setToken: (token) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch { /* localStorage unavailable */ }
  },
  clearToken: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch { /* localStorage unavailable */ }
  },
  checkAuth: async () => {
    try {
      const user = await api.get('/auth/me');
      set({ user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
  logout: async () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch { /* ignore */ }
    await api.post('/auth/logout');
    set({ user: null });
  },
}));

export default useAuthStore;
