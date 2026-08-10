import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { router } from 'expo-router';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const requestNotificationPermissions = async () => {
  if (Platform.OS === 'web') return true;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
};

export const scheduleLocalNotification = async (
  title: string,
  body: string,
  data?: Record<string, any>,
  triggerSeconds: number = 2
) => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission && Platform.OS !== 'web') return null;

    if (Platform.OS === 'web') {
      // In web browser environment, show standard notification if supported or fallback cleanly
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, data });
      }
    }

    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data: data || {},
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, triggerSeconds),
      },
    });
  } catch (error) {
    console.warn('Failed to schedule local notification:', error);
    return null;
  }
};

// 1 Week Before Subscription Renewal Alert
export const scheduleOneWeekRenewalAlert = async (subscriptionId: string, subscriptionName: string, renewalDate: string, amount: number) => {
  return await scheduleLocalNotification(
    '📅 1 Week Advance Renewal Notice',
    `Your ${subscriptionName} subscription ($${amount.toFixed(2)}) will renew in 7 days on ${renewalDate}.`,
    { target_type: 'subscription', target_id: subscriptionId, deep_link: '/(tabs)/subscriptions' },
    3
  );
};

export const scheduleSubscriptionRenewalAlert = async (subscriptionId: string, subscriptionName: string, renewalDate: string, amount: number) => {
  return await scheduleLocalNotification(
    '🔔 Subscription Renewal Alert',
    `Your ${subscriptionName} subscription ($${amount.toFixed(2)}) is renewing on ${renewalDate}.`,
    { target_type: 'subscription', target_id: subscriptionId, deep_link: '/(tabs)/subscriptions' },
    5
  );
};

export const scheduleTaskReminderAlert = async (taskId: string, taskTitle: string, dueDate: string) => {
  return await scheduleLocalNotification(
    '⏰ Task Reminder',
    `Task due soon: "${taskTitle}" (Due ${dueDate})`,
    { target_type: 'task', target_id: taskId, deep_link: '/(tabs)/tasks' },
    5
  );
};

export const scheduleOverdueTaskAlert = async (taskId: string, taskTitle: string) => {
  return await scheduleLocalNotification(
    '⚠️ Overdue Task Alert',
    `Attention! Task "${taskTitle}" is now overdue. Click to mark complete or reschedule.`,
    { target_type: 'task', target_id: taskId, deep_link: '/(tabs)/tasks' },
    2
  );
};

export const scheduleHabitReminderAlert = async (habitId: string, habitTitle: string, currentStreak: number) => {
  return await scheduleLocalNotification(
    '🔥 Keep Your Streak Alive!',
    `Don't forget to check in on "${habitTitle}". Current streak: ${currentStreak} days!`,
    { target_type: 'habit', target_id: habitId, deep_link: '/(tabs)/routines' },
    4
  );
};

// Setup deep link response listener
export const setupNotificationResponseListener = () => {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    if (data?.deep_link) {
      router.push(data.deep_link as any);
    }
  });

  return () => {
    subscription.remove();
  };
};
