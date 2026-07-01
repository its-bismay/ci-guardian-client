import { create } from 'zustand';
import { api } from '../lib/api';

const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  checkAuth: async () => {
    try {
      const user = await api.get('/auth/me');
      set({ user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
  logout: async () => {
    await api.post('/auth/logout');
    set({ user: null });
  },
}));

export default useAuthStore;
