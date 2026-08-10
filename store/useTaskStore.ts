import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import pb from '../services/pocketbase';
import { Task, TaskPriority, TaskStatus } from '../types';

const INITIAL_MOCK_TASKS: Task[] = [
  {
    id: 'task-1',
    user: 'user-1',
    title: 'Review Monthly Budget & Subscriptions',
    description: 'Check active subscriptions and optimize recurring expenses',
    priority: 'high',
    due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    status: 'in_progress',
    labels: ['Finance', 'Monthly'],
    reminder: true,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
  {
    id: 'task-2',
    user: 'user-1',
    title: 'Sync Mobile App Database Schema',
    description: 'Verify collection permissions and index rules for glass UI',
    priority: 'urgent',
    due_date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Overdue task sample!
    status: 'todo',
    labels: ['Development', 'Backend'],
    reminder: true,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
  {
    id: 'task-3',
    user: 'user-1',
    title: 'Complete Weekly Workout & Cardio Log',
    description: 'Log strength training progress and set goals',
    priority: 'medium',
    due_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    status: 'todo',
    labels: ['Fitness', 'Health'],
    reminder: false,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
];

export const isTaskOverdue = (task: Task): boolean => {
  if (task.status === 'completed' || task.status === 'archived') return false;
  if (!task.due_date) return false;
  const today = new Date().toISOString().split('T')[0];
  return task.due_date < today;
};

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  searchQuery: string;
  selectedPriority: TaskPriority | 'all';
  selectedStatus: TaskStatus | 'all' | 'overdue' | 'pending';

  // Actions
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'created' | 'updated'>) => Promise<boolean>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<boolean>;
  toggleTaskStatus: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<boolean>;
  setSearchQuery: (query: string) => void;
  setSelectedPriority: (priority: TaskPriority | 'all') => void;
  setSelectedStatus: (status: TaskStatus | 'all' | 'overdue' | 'pending') => void;

  // Helpers
  getOverdueTasksCount: () => number;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: INITIAL_MOCK_TASKS,
      isLoading: false,
      searchQuery: '',
      selectedPriority: 'all',
      selectedStatus: 'all',

      fetchTasks: async () => {
        set({ isLoading: true });
        try {
          if (pb.authStore.isValid) {
            const records = await pb.collection('tasks').getFullList({ sort: '-created' });
            if (records.length > 0) {
              set({ tasks: records as unknown as Task[], isLoading: false });
              return;
            }
          }
          set({ isLoading: false });
        } catch (e) {
          console.warn('PocketBase fetchTasks error (using local store):', e);
          set({ isLoading: false });
        }
      },

      addTask: async (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        };

        set((state) => ({ tasks: [newTask, ...state.tasks] }));

        if (pb.authStore.isValid) {
          try {
            const rec = await pb.collection('tasks').create(taskData);
            set((state) => ({
              tasks: state.tasks.map((t) => (t.id === newTask.id ? (rec as unknown as Task) : t)),
            }));
          } catch (e) {
            console.warn('Failed to sync added task to PocketBase:', e);
          }
        }
        return true;
      },

      updateTask: async (id, taskData) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...taskData, updated: new Date().toISOString() } : t
          ),
        }));

        if (pb.authStore.isValid) {
          try {
            await pb.collection('tasks').update(id, taskData);
          } catch (e) {
            console.warn('Failed to update task in PocketBase:', e);
          }
        }
        return true;
      },

      toggleTaskStatus: async (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;
        const newStatus: TaskStatus = task.status === 'completed' ? 'todo' : 'completed';
        await get().updateTask(id, { status: newStatus });
      },

      deleteTask: async (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));

        if (pb.authStore.isValid) {
          try {
            await pb.collection('tasks').delete(id);
          } catch (e) {
            console.warn('Failed to delete task from PocketBase:', e);
          }
        }
        return true;
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedPriority: (priority) => set({ selectedPriority: priority }),
      setSelectedStatus: (status) => set({ selectedStatus: status }),

      getOverdueTasksCount: () => {
        return get().tasks.filter((t) => isTaskOverdue(t)).length;
      },
    }),
    {
      name: 'remindly-tasks-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ tasks: state.tasks }),
    }
  )
);
