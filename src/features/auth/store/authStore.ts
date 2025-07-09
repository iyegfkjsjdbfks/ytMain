import { create } from 'zustand';

import { authService } from '../services/authService';
import { logger } from '../../../utils/logger';

import type { AuthState, LoginCredentials, RegisterData, User } from '../types';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
}

/**
 * Zustand store for authentication state management
 * Replaces the previous context-based approach with a more
 * efficient and easier to use state management solution
 */
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setUser: (user) => set({
    user,
    isAuthenticated: !!user,
    error: null,
  }),

  setError: (error) => set({ error }),

  setLoading: (isLoading) => set({ isLoading }),

  login: async (credentials) => {
    set({ isLoading: true, error: null });

    try {
      const user = await authService.login(credentials);
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to login';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const user = await authService.register(data);
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to register';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      await authService.logout();
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });

    try {
      const user = await authService.getCurrentUser();
      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });
    } catch (error) {
      logger.error('Auth check failed:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
