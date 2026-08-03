import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import pb, { hydrateAuth } from '../services/pocketbase';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initAuth: () => Promise<void>;
  login: (email: string, pass: string) => Promise<boolean>;
  loginAsDemo: () => void;
  register: (email: string, pass: string, passConfirm: string, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      initAuth: async () => {
        try {
          set({ isLoading: true });
          await hydrateAuth();

          if (pb.authStore.isValid && pb.authStore.record) {
            set({
              user: pb.authStore.record as unknown as User,
              isAuthenticated: true,
              isInitialized: true,
              isLoading: false,
            });
          } else if (get().user && get().isAuthenticated) {
            // Retain local persisted user if offline/demo
            set({
              isInitialized: true,
              isLoading: false,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isInitialized: true,
              isLoading: false,
            });
          }
        } catch (err: any) {
          set({
            isInitialized: true,
            isLoading: false,
          });
        }
      },

      login: async (email: string, pass: string) => {
        set({ isLoading: true, error: null });
        try {
          const authData = await pb.collection('users').authWithPassword(email, pass);
          set({
            user: authData.record as unknown as User,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (err: any) {
          // If PocketBase server is unreachable, fall back to offline session for smooth offline usage
          if (err?.status === 0 || err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError') || err?.isAbort) {
            const localUser: User = {
              id: 'offline-user-1',
              email,
              name: email.split('@')[0],
              created: new Date().toISOString(),
              updated: new Date().toISOString(),
            };
            set({
              user: localUser,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
          const msg = err?.message || 'Login failed. Please check your credentials.';
          set({ error: msg, isLoading: false });
          return false;
        }
      },

      loginAsDemo: () => {
        const demoUser: User = {
          id: 'demo-user-1',
          email: 'demo@remindly.app',
          name: 'Demo User',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        };
        set({
          user: demoUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      register: async (email: string, pass: string, passConfirm: string, name?: string) => {
        set({ isLoading: true, error: null });
        try {
          await pb.collection('users').create({
            email,
            password: pass,
            passwordConfirm: passConfirm,
            name: name || email.split('@')[0],
          });

          return await get().login(email, pass);
        } catch (err: any) {
          if (err?.status === 0 || err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')) {
            const localUser: User = {
              id: 'offline-user-' + Date.now(),
              email,
              name: name || email.split('@')[0],
              created: new Date().toISOString(),
              updated: new Date().toISOString(),
            };
            set({
              user: localUser,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
          const msg = err?.message || 'Registration failed. Please try again.';
          set({ error: msg, isLoading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          pb.authStore.clear();
          set({ user: null, isAuthenticated: false, error: null });
        } catch (err) {
          console.warn('Error during logout:', err);
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'remindly-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
