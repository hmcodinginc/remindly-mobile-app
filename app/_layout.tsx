import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';

export default function RootLayout() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, []);

  const theme = {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: '#6366F1',
      background: '#070A14',
      surface: '#0E1424',
    },
  };

  return (
    <SafeAreaProvider style={{ backgroundColor: '#070A14' }}>
      <PaperProvider theme={theme}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: '#070A14' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen
            name="settings/index"
            options={{
              headerShown: true,
              title: 'Settings',
              headerStyle: { backgroundColor: '#070A14' },
              headerTintColor: '#F8FAFC',
            }}
          />
          <Stack.Screen
            name="analytics/index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="subscription/create"
            options={{
              headerShown: true,
              title: 'Add Subscription',
              headerStyle: { backgroundColor: '#070A14' },
              headerTintColor: '#F8FAFC',
            }}
          />
          <Stack.Screen
            name="subscription/[id]"
            options={{
              headerShown: true,
              title: 'Subscription Details',
              headerStyle: { backgroundColor: '#070A14' },
              headerTintColor: '#F8FAFC',
            }}
          />
          <Stack.Screen
            name="task/create"
            options={{
              headerShown: true,
              title: 'New Task',
              headerStyle: { backgroundColor: '#070A14' },
              headerTintColor: '#F8FAFC',
            }}
          />
          <Stack.Screen
            name="task/[id]"
            options={{
              headerShown: true,
              title: 'Task Details',
              headerStyle: { backgroundColor: '#070A14' },
              headerTintColor: '#F8FAFC',
            }}
          />
          <Stack.Screen
            name="routine/create"
            options={{
              headerShown: true,
              title: 'New Routine',
              headerStyle: { backgroundColor: '#070A14' },
              headerTintColor: '#F8FAFC',
            }}
          />
          <Stack.Screen
            name="habit/create"
            options={{
              headerShown: true,
              title: 'New Habit',
              headerStyle: { backgroundColor: '#070A14' },
              headerTintColor: '#F8FAFC',
            }}
          />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
