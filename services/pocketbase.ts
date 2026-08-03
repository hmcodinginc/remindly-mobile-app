import PocketBase, { AsyncAuthStore } from 'pocketbase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Default PocketBase server URL (can be overridden via environment variables)
// Note: Android emulator uses 10.0.2.2 for host localhost, iOS/Web use localhost
const DEFAULT_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:8090' 
  : 'http://localhost:8090';

export const POCKETBASE_URL = process.env.EXPO_PUBLIC_POCKETBASE_URL || DEFAULT_URL;

// Custom AuthStore for PocketBase using AsyncStorage for token persistence
const store = new AsyncAuthStore({
  save: async (serialized) => {
    try {
      await AsyncStorage.setItem('pb_auth', serialized);
    } catch (e) {
      console.warn('Failed to save PocketBase auth token to storage:', e);
    }
  },
  clear: async () => {
    try {
      await AsyncStorage.removeItem('pb_auth');
    } catch (e) {
      console.warn('Failed to clear PocketBase auth token:', e);
    }
  },
});

// Initialize PocketBase instance
export const pb = new PocketBase(POCKETBASE_URL, store);

// Hydrate auth state on startup
export const hydrateAuth = async () => {
  try {
    const raw = await AsyncStorage.getItem('pb_auth');
    if (raw) {
      pb.authStore.save(pb.authStore.token, pb.authStore.record);
    }
  } catch (e) {
    console.warn('Error restoring PocketBase auth state:', e);
  }
};

export default pb;
