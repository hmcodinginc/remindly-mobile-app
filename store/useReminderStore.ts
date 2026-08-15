import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GenericReminder, ReminderType } from '../types';
import { useAuthStore } from './useAuthStore';

export const DEMO_SHOWCASE_REMINDERS: GenericReminder[] = [
  {
    id: 'rem-1',
    user: 'demo-user-1',
    title: 'Netflix Premium Subscription',
    type: 'subscription',
    category: 'Entertainment',
    due_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    due_time: '09:00 AM',
    amount: 19.99,
    currency: '$',
    billing_cycle: 'monthly',
    payment_method: 'Credit Card (**** 4242)',
    reminder_enabled: true,
    advance_notice_days: 7,
    auto_pay: true,
    status: 'pending',
    description: '4K Ultra HD streaming family account',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
  {
    id: 'rem-2',
    user: 'demo-user-1',
    title: 'Electricity & Utility Bill',
    type: 'payment',
    category: 'Bills',
    due_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    due_time: '12:00 PM',
    amount: 85.50,
    currency: '$',
    payment_method: 'Bank Transfer',
    reminder_enabled: true,
    advance_notice_days: 3,
    status: 'pending',
    description: 'Monthly power grid utility payment',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
  {
    id: 'rem-3',
    user: 'demo-user-1',
    title: 'Car Oil Change & Vehicle Maintenance',
    type: 'renewal',
    category: 'Vehicle & Service',
    due_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    due_time: '10:00 AM',
    reminder_enabled: true,
    advance_notice_days: 7,
    status: 'overdue',
    description: 'Scheduled maintenance checkup at service center',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
  {
    id: 'rem-4',
    user: 'demo-user-1',
    title: 'Doctor Appointment & Health Check',
    type: 'appointment',
    category: 'Health',
    due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    due_time: '03:00 PM',
    reminder_enabled: true,
    advance_notice_days: 1,
    status: 'pending',
    description: 'Annual wellness checkup with Dr. Smith',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
];

interface ReminderState {
  reminders: GenericReminder[];
  searchQuery: string;
  selectedTypeFilter: ReminderType | 'all';
  selectedCategoryFilter: string | 'all';

  // Actions
  addReminder: (rem: Omit<GenericReminder, 'id' | 'created' | 'updated'>) => void;
  updateReminder: (id: string, rem: Partial<GenericReminder>) => void;
  deleteReminder: (id: string) => void;
  toggleComplete: (id: string) => void;
  setSearchQuery: (q: string) => void;
  setSelectedTypeFilter: (type: ReminderType | 'all') => void;
  setSelectedCategoryFilter: (cat: string | 'all') => void;

  // Helpers (User-Isolated)
  getUserReminders: () => GenericReminder[];
  getTodayReminders: () => GenericReminder[];
  getUpcomingReminders: (daysLimit?: number) => GenericReminder[];
  getOverdueReminders: () => GenericReminder[];
  getRecurringReminders: () => GenericReminder[];
  clearUserReminders: () => void;
}

export const useReminderStore = create<ReminderState>()(
  persist(
    (set, get) => ({
      reminders: [],
      searchQuery: '',
      selectedTypeFilter: 'all',
      selectedCategoryFilter: 'all',

      addReminder: (remData) => {
        const { user } = useAuthStore.getState();
        const userId = user?.id || remData.user || 'user-1';

        const newRem: GenericReminder = {
          ...remData,
          user: userId,
          id: 'rem-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        };
        set((state) => ({ reminders: [newRem, ...state.reminders] }));
      },

      updateReminder: (id, remData) => {
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, ...remData, updated: new Date().toISOString() } : r
          ),
        }));
      },

      deleteReminder: (id) => {
        set((state) => ({
          reminders: state.reminders.filter((r) => r.id !== id),
        }));
      },

      toggleComplete: (id) => {
        set((state) => ({
          reminders: state.reminders.map((r) => {
            if (r.id !== id) return r;
            const newStatus = r.status === 'completed' ? 'pending' : 'completed';
            return { ...r, status: newStatus, updated: new Date().toISOString() };
          }),
        }));
      },

      setSearchQuery: (q) => set({ searchQuery: q }),
      setSelectedTypeFilter: (t) => set({ selectedTypeFilter: t }),
      setSelectedCategoryFilter: (c) => set({ selectedCategoryFilter: c }),
      clearUserReminders: () => set({ reminders: [] }),

      getUserReminders: () => {
        const { user, isDemoMode } = useAuthStore.getState();
        if (isDemoMode) return DEMO_SHOWCASE_REMINDERS;
        if (!user) return [];
        return get().reminders.filter((r) => r.user === user.id || !r.user);
      },

      getTodayReminders: () => {
        const todayStr = new Date().toISOString().split('T')[0];
        return get().getUserReminders().filter((r) => r.due_date === todayStr);
      },

      getUpcomingReminders: (daysLimit = 14) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const limitDate = new Date();
        limitDate.setDate(limitDate.getDate() + daysLimit);
        const limitStr = limitDate.toISOString().split('T')[0];

        return get().getUserReminders().filter(
          (r) => r.due_date >= todayStr && r.due_date <= limitStr && r.status !== 'completed'
        );
      },

      getOverdueReminders: () => {
        const todayStr = new Date().toISOString().split('T')[0];
        return get().getUserReminders().filter(
          (r) => r.due_date < todayStr && r.status !== 'completed'
        );
      },

      getRecurringReminders: () => {
        return get().getUserReminders().filter((r) => r.billing_cycle && r.billing_cycle !== 'custom');
      },
    }),
    {
      name: 'remindly-unified-reminders-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
