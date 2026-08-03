import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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
  if (Platform.OS === 'web') return false;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
};

export const scheduleLocalNotification = async (title: string, body: string, triggerSeconds: number = 2) => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
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

export const scheduleSubscriptionRenewalAlert = async (subscriptionName: string, renewalDate: string, amount: number) => {
  return await scheduleLocalNotification(
    '🔔 Subscription Renewal Alert',
    `Your ${subscriptionName} subscription ($${amount.toFixed(2)}) is renewing on ${renewalDate}.`,
    5
  );
};

export const scheduleTaskReminderAlert = async (taskTitle: string, dueDate: string) => {
  return await scheduleLocalNotification(
    '⏰ Task Reminder',
    `Task due soon: "${taskTitle}" (Due ${dueDate})`,
    5
  );
};
