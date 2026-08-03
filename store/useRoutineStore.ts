import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import pb from '../services/pocketbase';
import { Habit, Routine } from '../types';

const INITIAL_MOCK_ROUTINES: Routine[] = [
  {
    id: 'rot-1',
    user: 'user-1',
    title: 'Morning Focus & Planning',
    description: '15 mins mindfulness, review tasks, set daily top 3 goals',
    frequency: 'daily',
    times_per_day: 1,
    category: 'Productivity',
    completed_today: true,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
  {
    id: 'rot-2',
    user: 'user-1',
    title: 'Evening Reflection & Unwind',
    description: 'Journal highlights, turn off work notifications',
    frequency: 'daily',
    times_per_day: 1,
    category: 'Wellness',
    completed_today: false,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
];

const INITIAL_MOCK_HABITS: Habit[] = [
  {
    id: 'hab-1',
    user: 'user-1',
    title: 'Drink 2.5L Water',
    description: 'Stay hydrated throughout the workday',
    streak_count: 7,
    best_streak: 14,
    last_completed_date: new Date().toISOString().split('T')[0],
    completions_history: [
      new Date().toISOString().split('T')[0],
      new Date(Date.now() - 86400000).toISOString().split('T')[0],
      new Date(Date.now() - 172800000).toISOString().split('T')[0],
    ],
    category: 'Health',
    icon: 'water-outline',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
  {
    id: 'hab-2',
    user: 'user-1',
    title: 'Read 20 Pages',
    description: 'Non-fiction or technical book reading',
    streak_count: 4,
    best_streak: 10,
    last_completed_date: new Date().toISOString().split('T')[0],
    completions_history: [new Date().toISOString().split('T')[0]],
    category: 'Learning',
    icon: 'book-outline',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
  {
    id: 'hab-3',
    user: 'user-1',
    title: '30 min Exercise',
    description: 'Running, cycling, or weight training session',
    streak_count: 12,
    best_streak: 15,
    last_completed_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    completions_history: [new Date(Date.now() - 86400000).toISOString().split('T')[0]],
    category: 'Fitness',
    icon: 'fitness-outline',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
];

interface RoutineState {
  routines: Routine[];
  habits: Habit[];
  isLoading: boolean;

  // Routine Actions
  fetchRoutines: () => Promise<void>;
  addRoutine: (rot: Omit<Routine, 'id' | 'created' | 'updated'>) => Promise<boolean>;
  toggleRoutineCompleted: (id: string) => Promise<void>;
  deleteRoutine: (id: string) => Promise<boolean>;

  // Habit Actions
  addHabit: (hab: Omit<Habit, 'id' | 'created' | 'updated' | 'streak_count' | 'best_streak' | 'completions_history'>) => Promise<boolean>;
  toggleHabitCompletion: (id: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<boolean>;
}

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set, get) => ({
      routines: INITIAL_MOCK_ROUTINES,
      habits: INITIAL_MOCK_HABITS,
      isLoading: false,

      fetchRoutines: async () => {
        set({ isLoading: true });
        try {
          if (pb.authStore.isValid) {
            const rots = await pb.collection('routines').getFullList();
            const habs = await pb.collection('habits').getFullList();
            if (rots.length > 0) set({ routines: rots as unknown as Routine[] });
            if (habs.length > 0) set({ habits: habs as unknown as Habit[] });
          }
          set({ isLoading: false });
        } catch (e) {
          console.warn('PocketBase fetchRoutines error (using local store):', e);
          set({ isLoading: false });
        }
      },

      addRoutine: async (rotData) => {
        const newRot: Routine = {
          ...rotData,
          id: 'rot-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          completed_today: false,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        };
        set((state) => ({ routines: [...state.routines, newRot] }));

        if (pb.authStore.isValid) {
          try {
            await pb.collection('routines').create(rotData);
          } catch (e) {
            console.warn('Failed to sync new routine to PocketBase:', e);
          }
        }
        return true;
      },

      toggleRoutineCompleted: async (id) => {
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === id ? { ...r, completed_today: !r.completed_today } : r
          ),
        }));

        if (pb.authStore.isValid) {
          try {
            const rot = get().routines.find((r) => r.id === id);
            if (rot) {
              await pb.collection('routines').update(id, { completed_today: rot.completed_today });
            }
          } catch (e) {
            console.warn('Failed to sync routine toggle to PocketBase:', e);
          }
        }
      },

      deleteRoutine: async (id) => {
        set((state) => ({ routines: state.routines.filter((r) => r.id !== id) }));
        if (pb.authStore.isValid) {
          try {
            await pb.collection('routines').delete(id);
          } catch (e) {
            console.warn('Failed to delete routine from PocketBase:', e);
          }
        }
        return true;
      },

      addHabit: async (habData) => {
        const newHab: Habit = {
          ...habData,
          id: 'hab-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          streak_count: 0,
          best_streak: 0,
          completions_history: [],
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        };
        set((state) => ({ habits: [...state.habits, newHab] }));

        if (pb.authStore.isValid) {
          try {
            await pb.collection('habits').create(habData);
          } catch (e) {
            console.warn('Failed to sync new habit to PocketBase:', e);
          }
        }
        return true;
      },

      toggleHabitCompletion: async (id) => {
        const today = new Date().toISOString().split('T')[0];
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id !== id) return h;
            const alreadyDoneToday = h.last_completed_date === today;
            let newHistory = [...h.completions_history];
            let newStreak = h.streak_count;

            if (alreadyDoneToday) {
              // Uncheck
              newHistory = newHistory.filter((d) => d !== today);
              newStreak = Math.max(0, newStreak - 1);
              return {
                ...h,
                last_completed_date: newHistory[0] || undefined,
                streak_count: newStreak,
                completions_history: newHistory,
              };
            } else {
              // Check
              newHistory.unshift(today);
              newStreak += 1;
              const best = Math.max(h.best_streak, newStreak);
              return {
                ...h,
                last_completed_date: today,
                streak_count: newStreak,
                best_streak: best,
                completions_history: newHistory,
              };
            }
          }),
        }));

        if (pb.authStore.isValid) {
          try {
            const hab = get().habits.find((h) => h.id === id);
            if (hab) {
              await pb.collection('habits').update(id, {
                streak_count: hab.streak_count,
                best_streak: hab.best_streak,
                last_completed_date: hab.last_completed_date,
                completions_history: hab.completions_history,
              });
            }
          } catch (e) {
            console.warn('Failed to sync habit toggle to PocketBase:', e);
          }
        }
      },

      deleteHabit: async (id) => {
        set((state) => ({ habits: state.habits.filter((h) => h.id !== id) }));
        if (pb.authStore.isValid) {
          try {
            await pb.collection('habits').delete(id);
          } catch (e) {
            console.warn('Failed to delete habit from PocketBase:', e);
          }
        }
        return true;
      },
    }),
    {
      name: 'remindly-routines-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ routines: state.routines, habits: state.habits }),
    }
  )
);
