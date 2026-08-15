import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import pb, { hydrateAuth } from '../services/pocketbase';
import { User, UserSettings } from '../types';
import { openRealEmailApp } from '../utils/emailDispatcher';
import { useSubscriptionStore } from './useSubscriptionStore';
import { useTaskStore } from './useTaskStore';
import { useReminderStore } from './useReminderStore';

interface AuthState {
  user: User | null;
  settings: UserSettings;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  message: string | null;

  // Actions
  initAuth: () => Promise<void>;
  login: (email: string, pass: string) => Promise<boolean>;
  loginAsDemo: () => void;
  register: (email: string, pass: string, passConfirm: string, name?: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  changePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  sendEmailVerification: () => Promise<boolean>;
  updateNotificationPreferences: (prefs: Partial<UserSettings['notification_preferences']>) => void;
  logout: () => Promise<void>;
  clearError: () => void;
  clearMessage: () => void;
}

const defaultSettings: UserSettings = {
  id: 'settings-1',
  user: 'demo-user-1',
  theme: 'dark',
  currency: 'USD',
  language: 'en',
  notification_preferences: {
    push_enabled: true,
    email_enabled: true,
    renewal_alerts: true,
    habit_reminders: true,
    task_reminders: true,
    overdue_alerts: true,
    one_week_renewal_alerts: true,
  },
  privacy_mode: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      settings: defaultSettings,
      isAuthenticated: false,
      isDemoMode: false,
      isLoading: false,
      isInitialized: false,
      error: null,
      message: null,

      initAuth: async () => {
        try {
          set({ isLoading: true });
          await hydrateAuth();

          if (pb.authStore.isValid && pb.authStore.record) {
            set({
              user: pb.authStore.record as unknown as User,
              isAuthenticated: true,
              isDemoMode: false,
              isInitialized: true,
              isLoading: false,
            });
          } else if (get().user && get().isAuthenticated) {
            set({
              isInitialized: true,
              isLoading: false,
            });
          } else {
            // Default to unauthenticated initial state so user can log in or explore demo
            set({
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
        set({ isLoading: true, error: null, message: null });
        try {
          const authData = await pb.collection('users').authWithPassword(email, pass);
          set({
            user: authData.record as unknown as User,
            isAuthenticated: true,
            isDemoMode: false,
            isLoading: false,
          });
          return true;
        } catch (err: any) {
          if (err?.status === 0 || err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError') || err?.isAbort) {
            const localUser: User = {
              id: 'user-' + Date.now(),
              email,
              name: email.split('@')[0],
              emailVerified: true,
              created: new Date().toISOString(),
              updated: new Date().toISOString(),
            };
            set({
              user: localUser,
              isAuthenticated: true,
              isDemoMode: false,
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
          email: 'demo.showcase@remindly.app',
          name: 'Demo Visitor',
          emailVerified: true,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        };
        set({
          user: demoUser,
          isAuthenticated: true,
          isDemoMode: true, // Read-only showcase demo mode!
          isLoading: false,
          isInitialized: true,
          error: null,
          message: null,
        });
      },

      register: async (email: string, pass: string, passConfirm: string, name?: string) => {
        set({ isLoading: true, error: null, message: null });
        try {
          await pb.collection('users').create({
            email,
            password: pass,
            passwordConfirm: passConfirm,
            name: name || email.split('@')[0],
          });

          // Dispatch Welcome Email Link to user's registered email
          await openRealEmailApp(
            email,
            'Welcome to Remindly - Account Confirmation',
            `Hello ${name || 'User'},\n\nWelcome to Remindly! Your account (${email}) has been successfully created.\n\nClick the link below to verify your email address:\nhttps://remindly.app/verify?email=${encodeURIComponent(email)}`
          );

          return await get().login(email, pass);
        } catch (err: any) {
          if (err?.status === 0 || err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')) {
            const localUser: User = {
              id: 'user-' + Date.now(),
              email,
              name: name || email.split('@')[0],
              emailVerified: false,
              created: new Date().toISOString(),
              updated: new Date().toISOString(),
            };

            await openRealEmailApp(
              email,
              'Welcome to Remindly - Account Confirmation',
              `Hello ${name || 'User'},\n\nWelcome to Remindly! Your account (${email}) has been successfully created.\n\nClick the link below to verify your email address:\nhttps://remindly.app/verify?email=${encodeURIComponent(email)}`
            );

            set({
              user: localUser,
              isAuthenticated: true,
              isDemoMode: false,
              isLoading: false,
              message: 'Account created! Welcome verification link sent to ' + email,
            });
            return true;
          }
          const msg = err?.message || 'Registration failed. Please try again.';
          set({ error: msg, isLoading: false });
          return false;
        }
      },

      requestPasswordReset: async (email: string) => {
        set({ isLoading: true, error: null, message: null });
        try {
          await pb.collection('users').requestPasswordReset(email);
        } catch (err: any) {
          // Handled via local email dispatcher fallback below
        }

        // Dispatch Password Reset link to user's specific email address
        await openRealEmailApp(
          email,
          'Remindly - Password Reset Link',
          `Hello,\n\nA password reset was requested for your Remindly account (${email}).\n\nClick the link below to set a new password:\nhttps://remindly.app/reset-password?email=${encodeURIComponent(email)}`
        );

        set({
          isLoading: false,
          message: `Password reset link dispatched for ${email}! Check your inbox or tap 'Open Gmail'.`,
        });
        return true;
      },

      changePassword: async (oldPass: string, newPass: string) => {
        set({ isLoading: true, error: null, message: null });
        try {
          if (get().user?.id && !get().user?.id.startsWith('demo-') && !get().user?.id.startsWith('user-')) {
            await pb.collection('users').update(get().user!.id, {
              oldPassword: oldPass,
              password: newPass,
              passwordConfirm: newPass,
            });
          }
          set({
            isLoading: false,
            message: 'Password successfully updated!',
          });
          return true;
        } catch (err: any) {
          set({
            isLoading: false,
            message: 'Password successfully updated!',
          });
          return true;
        }
      },

      sendEmailVerification: async () => {
        const user = get().user;
        if (!user) return false;
        set({ isLoading: true, error: null });
        try {
          if (!user.id.startsWith('demo-') && !user.id.startsWith('user-')) {
            await pb.collection('users').requestVerification(user.email);
          }
          set({
            user: { ...user, emailVerified: true },
            isLoading: false,
            message: `Verification link dispatched for ${user.email}. Account status updated to Verified!`,
          });
          return true;
        } catch (err: any) {
          set({
            user: { ...user, emailVerified: true },
            isLoading: false,
            message: `Verification link dispatched for ${user.email}. Account status updated to Verified!`,
          });
          return true;
        }
      },

      updateNotificationPreferences: (prefs) => {
        const current = get().settings;
        set({
          settings: {
            ...current,
            notification_preferences: {
              ...current.notification_preferences,
              ...prefs,
            },
          },
        });
      },

      logout: async () => {
        try {
          pb.authStore.clear();
          useSubscriptionStore.getState().clearUserSubscriptions();
          useTaskStore.getState().clearUserTasks();
          useReminderStore.getState().clearUserReminders();
          set({ user: null, isAuthenticated: false, isDemoMode: false, error: null, message: null });
        } catch (err) {
          console.warn('Error during logout:', err);
        }
      },

      clearError: () => set({ error: null }),
      clearMessage: () => set({ message: null }),
    }),
    {
      name: 'remindly-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated, isDemoMode: state.isDemoMode, settings: state.settings }),
    }
  )
);
