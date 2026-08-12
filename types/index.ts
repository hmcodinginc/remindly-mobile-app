export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  emailVerified?: boolean;
  created: string;
  updated: string;
}

export type BillingCycle = 'monthly' | 'yearly' | 'weekly' | 'quarterly' | 'daily' | 'custom';
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
  reminder_days_before?: number; // e.g. 7 for 1 week before
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

export type ReminderType = 'task' | 'subscription' | 'payment' | 'appointment' | 'renewal' | 'custom';

export type ReminderCategory =
  | 'Entertainment'
  | 'Bills'
  | 'Health'
  | 'Work'
  | 'Personal'
  | 'Vehicle & Service'
  | 'Birthdays'
  | 'Subscriptions'
  | 'Payments'
  | 'General';

export type PaymentMethodOption =
  | 'Credit Card (**** 4242)'
  | 'Debit Card'
  | 'Bank Transfer'
  | 'Cash'
  | 'UPI'
  | 'Apple / Google Pay';

export type RepeatCycleOption = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface GenericReminder {
  id: string;
  user: string;
  title: string;
  type: ReminderType;
  category: ReminderCategory | string;
  due_date: string;
  due_time?: string;
  amount?: number;
  currency?: string;
  billing_cycle?: BillingCycle;
  payment_method?: PaymentMethodOption | string;
  priority?: TaskPriority;
  reminder_enabled: boolean;
  advance_notice_days?: number; // e.g. 7 for 1 week before, 1 for 1 day before
  auto_pay?: boolean;
  status: 'pending' | 'completed' | 'overdue' | 'cancelled';
  description?: string;
  created: string;
  updated: string;
}

export interface Routine {
  id: string;
  user: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  target_days?: string[];
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
  completions_history: string[];
  category?: string;
  icon?: string;
  created: string;
  updated: string;
}

export type NotificationType = 'subscription_renewal' | 'task_reminder' | 'habit_reminder' | 'routine_reminder' | 'system' | 'overdue_task' | 'general_reminder';

export interface NotificationItem {
  id: string;
  user: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  scheduled_for?: string;
  target_type?: 'subscription' | 'task' | 'habit' | 'routine' | 'system' | 'reminder';
  target_id?: string;
  deep_link?: string;
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
    overdue_alerts: boolean;
    one_week_renewal_alerts: boolean;
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
