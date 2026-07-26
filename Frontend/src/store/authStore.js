import { create } from 'zustand';
import axiosInstance from '../api/axiosInstance';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setUser: (userData) => set({ user: userData }),


  login: (userData, token) => {
    localStorage.setItem('token', token);
    set({ user: userData, token, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false })
  },
  loadUserFromStorage: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    set({ token, isAuthenticated: true });

    try {
      const res = await axiosInstance.get('/auth/me');
      console.log("ME Success", res.data)
      set({ user: res.data.user });
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });

      }

    }
  },
}))


export default useAuthStore;