import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationStore } from '../../store/useNotificationStore';
import RemindlyLogo from '../../components/RemindlyLogo';
import { setupNotificationResponseListener } from '../../services/notifications';

export default function TabsLayout() {
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  useEffect(() => {
    const cleanup = setupNotificationResponseListener();
    return cleanup;
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#070A14',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(99, 102, 241, 0.2)',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          color: '#F8FAFC',
        },
        headerRight: () => (
          <View style={{ marginRight: 16 }}>
            <RemindlyLogo size={36} showBackground={false} />
          </View>
        ),
        tabBarStyle: {
          backgroundColor: 'rgba(7, 10, 20, 0.95)',
          borderTopColor: 'rgba(99, 102, 241, 0.25)',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 10,
        },
        tabBarActiveTintColor: '#A78BFA',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="dashboard/index"
        options={{
          title: 'Dashboard',
          headerTitle: 'Remindly Overview',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconGlow : null}>
              <Ionicons name={focused ? "grid" : "grid-outline"} size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="subscriptions/index"
        options={{
          title: 'Subscriptions',
          headerTitle: 'Subscription Manager',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconGlow : null}>
              <Ionicons name={focused ? "card" : "card-outline"} size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="tasks/index"
        options={{
          title: 'Tasks',
          headerTitle: 'Task Manager',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconGlow : null}>
              <Ionicons name={focused ? "checkbox" : "checkbox-outline"} size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="routines/index"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="notifications/index"
        options={{
          title: 'Alerts',
          headerTitle: 'Notifications Center',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#F87171',
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: '700',
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconGlow : null}>
              <Ionicons name={focused ? "notifications" : "notifications-outline"} size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          headerTitle: 'Profile & Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconGlow : null}>
              <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconGlow: {
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
});
