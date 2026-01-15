import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { getCurrentUser, signIn, signUp, signOut, onAuthStateChange } from '../services/authService';

interface AuthStore {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => {
  // Initialize auth state listener
  onAuthStateChange((user) => {
    set({ user, initialized: true });
  });

  return {
    user: null,
    loading: false,
    initialized: false,

    checkAuth: async () => {
      set({ loading: true });
      const user = await getCurrentUser();
      set({ user, loading: false, initialized: true });
    },

    login: async (email: string, password: string) => {
      set({ loading: true });
      const { user, error } = await signIn(email, password);
      set({ user, loading: false });
      return !error;
    },

    register: async (email: string, password: string) => {
      set({ loading: true });
      const { user, error } = await signUp(email, password);
      set({ user, loading: false });
      return !error;
    },

    logout: async () => {
      set({ loading: true });
      await signOut();
      set({ user: null, loading: false });
    },
  };
});
