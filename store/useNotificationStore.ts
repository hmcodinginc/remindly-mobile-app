import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationItem } from '../types';

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    user: 'user-1',
    title: 'Upcoming Subscription Renewal',
    message: 'Netflix Premium ($19.99) will renew in 3 days on Aug 15.',
    type: 'subscription_renewal',
    is_read: false,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
  {
    id: 'notif-2',
    user: 'user-1',
    title: 'Task Due Reminder',
    message: 'Sync PocketBase Mobile Database Schema is due today!',
    type: 'task_reminder',
    is_read: false,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
  {
    id: 'notif-3',
    user: 'user-1',
    title: 'Habit Streak Milestone! 🔥',
    message: 'Congratulations! You achieved a 7-day streak on Drink 2.5L Water.',
    type: 'habit_reminder',
    is_read: true,
    created: new Date(Date.now() - 86400000).toISOString(),
    updated: new Date(Date.now() - 86400000).toISOString(),
  },
];

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;

  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'created' | 'updated'>) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: INITIAL_NOTIFICATIONS,
      unreadCount: INITIAL_NOTIFICATIONS.filter((n) => !n.is_read).length,

      markAsRead: (id) => {
        set((state) => {
          const updated = state.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.is_read).length,
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
          unreadCount: 0,
        }));
      },

      deleteNotification: (id) => {
        set((state) => {
          const updated = state.notifications.filter((n) => n.id !== id);
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.is_read).length,
          };
        });
      },

      addNotification: (notifData) => {
        const newNotif: NotificationItem = {
          ...notifData,
          id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        };

        set((state) => {
          const updated = [newNotif, ...state.notifications];
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.is_read).length,
          };
        });
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },
    }),
    {
      name: 'remindly-notifications-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
