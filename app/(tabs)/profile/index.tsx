import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Avatar, Button, Card, Switch, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/useAuthStore';
import { DarkTheme, LightTheme } from '../../../theme/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? DarkTheme : LightTheme;

  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Profile Card */}
      <Card style={[styles.profileCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
        <Card.Content style={styles.profileHeader}>
          <Avatar.Text
            size={72}
            label={user?.name ? user.name.substring(0, 2).toUpperCase() : 'RM'}
            style={{ backgroundColor: theme.colors.primary }}
            color="#FFF"
          />
          <View style={styles.profileDetails}>
            <Text style={[styles.userName, { color: theme.colors.text }]}>{user?.name || 'Remindly User'}</Text>
            <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
              {user?.email || 'user@example.com'}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: '#D1FAE5' }]}>
              <Text style={{ color: '#059669', fontSize: 11, fontWeight: '700' }}>PocketBase Synced</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Settings Navigation Menu */}
      <Text style={[styles.menuTitle, { color: theme.colors.text }]}>Account & Settings</Text>

      <Card style={[styles.menuCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/settings')}
        >
          <View style={[styles.menuIconBg, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="settings-outline" size={20} color={theme.colors.primary} />
          </View>
          <Text style={[styles.menuText, { color: theme.colors.text }]}>App Settings</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <Divider />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(tabs)/notifications')}
        >
          <View style={[styles.menuIconBg, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="notifications-outline" size={20} color="#D97706" />
          </View>
          <Text style={[styles.menuText, { color: theme.colors.text }]}>Notification Preferences</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <Divider />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(tabs)/subscriptions')}
        >
          <View style={[styles.menuIconBg, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="card-outline" size={20} color="#0284C7" />
          </View>
          <Text style={[styles.menuText, { color: theme.colors.text }]}>Manage Subscriptions</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </Card>

      {/* Logout button */}
      <Button
        mode="outlined"
        onPress={handleLogout}
        icon="logout"
        style={styles.logoutBtn}
        textColor="#EF4444"
      >
        Sign Out
      </Button>

      <Text style={[styles.versionText, { color: theme.colors.textMuted }]}>
        Remindly Mobile v1.0.0 • Expo SDK 57
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  profileCard: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  profileDetails: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 8,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  menuCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  logoutBtn: {
    borderRadius: 14,
    borderColor: '#FCA5A5',
    marginBottom: 16,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
  },
});
