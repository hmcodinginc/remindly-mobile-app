import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';

export default function RootLayout() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, []);

  const theme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: '#5B5CE2',
      background: '#FFFFFF',
      surface: '#FFFFFF',
    },
  };

  return (
    <SafeAreaProvider style={{ backgroundColor: '#FFFFFF' }}>
      <PaperProvider theme={theme}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: '#FFFFFF' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="settings/index" options={{ headerShown: false }} />
          <Stack.Screen name="analytics/index" options={{ headerShown: false }} />
          <Stack.Screen name="subscription/create" options={{ headerShown: false }} />
          <Stack.Screen name="subscription/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="task/create" options={{ headerShown: false }} />
          <Stack.Screen name="task/[id]" options={{ headerShown: false }} />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
