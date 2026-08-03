import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { DarkTheme, LightTheme } from '../theme/colors';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, []);

  const theme = isDark
    ? { ...MD3DarkTheme, colors: { ...MD3DarkTheme.colors, primary: DarkTheme.colors.primary } }
    : { ...MD3LightTheme, colors: { ...MD3LightTheme.colors, primary: LightTheme.colors.primary } };

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="settings/index" options={{ headerShown: true, title: 'Settings' }} />
          <Stack.Screen name="analytics/index" options={{ headerShown: true, title: 'Analytics & Reports' }} />
          <Stack.Screen name="subscription/create" options={{ headerShown: true, title: 'Add Subscription' }} />
          <Stack.Screen name="subscription/[id]" options={{ headerShown: true, title: 'Subscription Details' }} />
          <Stack.Screen name="task/create" options={{ headerShown: true, title: 'New Task' }} />
          <Stack.Screen name="task/[id]" options={{ headerShown: true, title: 'Task Details' }} />
          <Stack.Screen name="routine/create" options={{ headerShown: true, title: 'New Routine' }} />
          <Stack.Screen name="habit/create" options={{ headerShown: true, title: 'New Habit' }} />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
