import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import pb from '../services/pocketbase';
import { Subscription } from '../types';
import { useAuthStore } from './useAuthStore';

export const DEMO_SHOWCASE_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-1',
    user: 'demo-user-1',
    name: 'Netflix Premium',
    amount: 19.99,
    currency: '$',
    billing_cycle: 'monthly',
    renewal_date: '2026-08-15',
    category: 'Entertainment',
    auto_renew: true,
    payment_method: 'Credit Card (**** 4242)',
    status: 'active',
    description: '4K Ultra HD Streaming Plan',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
  {
    id: 'sub-2',
    user: 'demo-user-1',
    name: 'Spotify Family',
    amount: 16.99,
    currency: '$',
    billing_cycle: 'monthly',
    renewal_date: '2026-08-20',
    category: 'Music',
    auto_renew: true,
    payment_method: 'PayPal',
    status: 'active',
    description: '6 Premium accounts',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
  {
    id: 'sub-3',
    user: 'demo-user-1',
    name: 'GitHub Pro',
    amount: 4.00,
    currency: '$',
    billing_cycle: 'monthly',
    renewal_date: '2026-08-10',
    category: 'Developer Tools',
    auto_renew: true,
    payment_method: 'Credit Card (**** 9876)',
    status: 'active',
    description: 'Pro developer features & Copilot',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
  {
    id: 'sub-4',
    user: 'demo-user-1',
    name: 'iCloud+ 200GB',
    amount: 2.99,
    currency: '$',
    billing_cycle: 'monthly',
    renewal_date: '2026-08-28',
    category: 'Cloud Storage',
    auto_renew: true,
    payment_method: 'Apple Pay',
    status: 'active',
    description: 'Family cloud storage & Private Relay',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
];

interface SubscriptionState {
  subscriptions: Subscription[];
  isLoading: boolean;
  searchQuery: string;
  selectedCategory: string | null;
  error: string | null;

  // Actions
  fetchSubscriptions: () => Promise<void>;
  addSubscription: (sub: Omit<Subscription, 'id' | 'created' | 'updated'>) => Promise<boolean>;
  updateSubscription: (id: string, sub: Partial<Subscription>) => Promise<boolean>;
  deleteSubscription: (id: string) => Promise<boolean>;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;

  // Computed / Helpers (Strictly user-isolated)
  getUserSubscriptions: () => Subscription[];
  getTotalMonthlySpend: () => number;
  getUpcomingRenewals: (daysLimit?: number) => Subscription[];
  clearUserSubscriptions: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscriptions: [],
      isLoading: false,
      searchQuery: '',
      selectedCategory: null,
      error: null,

      fetchSubscriptions: async () => {
        const { user, isDemoMode } = useAuthStore.getState();
        if (isDemoMode) {
          set({ subscriptions: DEMO_SHOWCASE_SUBSCRIPTIONS, isLoading: false });
          return;
        }

        if (!user) {
          set({ subscriptions: [], isLoading: false });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          if (pb.authStore.isValid) {
            const records = await pb.collection('subscriptions').getFullList({
              filter: `user = "${user.id}"`,
              sort: 'renewal_date',
            });
            set({ subscriptions: records as unknown as Subscription[], isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch (e: any) {
          console.warn('PocketBase fetchSubscriptions error (using local state):', e?.message);
          set({ isLoading: false });
        }
      },

      addSubscription: async (subData) => {
        const { user } = useAuthStore.getState();
        const userId = user?.id || subData.user || 'user-1';

        const newSub: Subscription = {
          ...subData,
          user: userId,
          id: 'sub-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        };

        set((state) => ({ subscriptions: [newSub, ...state.subscriptions] }));

        if (pb.authStore.isValid && user && !user.id.startsWith('demo-')) {
          try {
            const rec = await pb.collection('subscriptions').create({ ...subData, user: user.id });
            set((state) => ({
              subscriptions: state.subscriptions.map((s) => (s.id === newSub.id ? (rec as unknown as Subscription) : s)),
            }));
          } catch (e) {
            console.warn('Failed to sync new subscription to PocketBase:', e);
          }
        }
        return true;
      },

      updateSubscription: async (id, subData) => {
        set((state) => ({
          subscriptions: state.subscriptions.map((s) =>
            s.id === id ? { ...s, ...subData, updated: new Date().toISOString() } : s
          ),
        }));

        if (pb.authStore.isValid) {
          try {
            await pb.collection('subscriptions').update(id, subData);
          } catch (e) {
            console.warn('Failed to update subscription in PocketBase:', e);
          }
        }
        return true;
      },

      deleteSubscription: async (id) => {
        set((state) => ({
          subscriptions: state.subscriptions.filter((s) => s.id !== id),
        }));

        if (pb.authStore.isValid) {
          try {
            await pb.collection('subscriptions').delete(id);
          } catch (e) {
            console.warn('Failed to delete subscription in PocketBase:', e);
          }
        }
        return true;
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      clearUserSubscriptions: () => set({ subscriptions: [] }),

      getUserSubscriptions: () => {
        const { user, isDemoMode } = useAuthStore.getState();
        if (isDemoMode) return DEMO_SHOWCASE_SUBSCRIPTIONS;
        if (!user) return [];
        return get().subscriptions.filter((s) => s.user === user.id || !s.user);
      },

      getTotalMonthlySpend: () => {
        const subs = get().getUserSubscriptions().filter((s) => s.status !== 'cancelled');
        return subs.reduce((total, sub) => {
          const amt = Number(sub.amount) || 0;
          if (sub.billing_cycle === 'monthly') return total + amt;
          if (sub.billing_cycle === 'yearly') return total + amt / 12;
          if (sub.billing_cycle === 'weekly') return total + amt * 4.33;
          if (sub.billing_cycle === 'quarterly') return total + amt / 3;
          return total + amt;
        }, 0);
      },

      getUpcomingRenewals: (daysLimit = 14) => {
        const subs = get().getUserSubscriptions().filter((s) => s.status === 'active');
        const now = new Date();
        const limitDate = new Date();
        limitDate.setDate(now.getDate() + daysLimit);

        return subs
          .filter((sub) => {
            const rDate = new Date(sub.renewal_date);
            return rDate >= now && rDate <= limitDate;
          })
          .sort((a, b) => new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime());
      },
    }),
    {
      name: 'remindly-subscriptions-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ subscriptions: state.subscriptions }),
    }
  )
);
