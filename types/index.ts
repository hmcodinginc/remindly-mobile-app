export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  created: string;
  updated: string;
}

export type BillingCycle = 'monthly' | 'yearly' | 'weekly' | 'quarterly';
export type SubscriptionStatus = 'active' | 'cancelled' | 'paused' | 'expired';

export interface Subscription {
  id: string;
  user: string;
  name: string;
  amount: number;
  currency: string;
  billing_cycle: BillingCycle;
  renewal_date: string;
  category: string;
  auto_renew: boolean;
  payment_method: string;
  status: SubscriptionStatus;
  description?: string;
  icon?: string;
  created: string;
  updated: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'archived';

export interface Task {
  id: string;
  user: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  due_date: string;
  status: TaskStatus;
  labels: string[];
  reminder?: boolean;
  reminder_time?: string;
  created: string;
  updated: string;
}

export interface Routine {
  id: string;
  user: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  target_days?: string[]; // e.g. ['Mon', 'Tue', 'Wed']
  times_per_day: number;
  category?: string;
  completed_today?: boolean;
  created: string;
  updated: string;
}

export interface Habit {
  id: string;
  user: string;
  title: string;
  description?: string;
  streak_count: number;
  best_streak: number;
  last_completed_date?: string;
  completions_history: string[]; // ISO date strings
  category?: string;
  icon?: string;
  created: string;
  updated: string;
}

export type NotificationType = 'subscription_renewal' | 'task_reminder' | 'habit_reminder' | 'routine_reminder' | 'system';

export interface NotificationItem {
  id: string;
  user: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  scheduled_for?: string;
  created: string;
  updated: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: 'subscription' | 'task' | 'routine' | 'habit';
}

export interface UserSettings {
  id: string;
  user: string;
  theme: 'light' | 'dark' | 'system';
  currency: string;
  language: string;
  notification_preferences: {
    push_enabled: boolean;
    email_enabled: boolean;
    renewal_alerts: boolean;
    habit_reminders: boolean;
    task_reminders: boolean;
  };
  privacy_mode: boolean;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  details?: string;
  timestamp: string;
}
