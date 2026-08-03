import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Button, Card, Badge } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { DarkTheme, LightTheme } from '../../../theme/colors';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? DarkTheme : LightTheme;

  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotificationStore();

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'subscription_renewal':
        return { icon: 'card-outline', color: '#3B82F6', bg: '#EFF6FF' };
      case 'task_reminder':
        return { icon: 'checkbox-outline', color: '#10B981', bg: '#ECFDF5' };
      case 'habit_reminder':
        return { icon: 'flame-outline', color: '#F59E0B', bg: '#FEF3C7' };
      default:
        return { icon: 'notifications-outline', color: '#8B5CF6', bg: '#F5F3FF' };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header bar */}
      <View style={styles.topHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Notifications</Text>
          {unreadCount > 0 && <Badge size={22}>{unreadCount}</Badge>}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={[styles.markAllText, { color: theme.colors.primary }]}>Mark all read</Text>
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity onPress={useNotificationStore.getState().clearAll}>
              <Text style={[styles.markAllText, { color: '#EF4444' }]}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color={theme.colors.textMuted} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No notifications yet</Text>
          </View>
        }
        renderItem={({ item }) => {
          const config = getNotifIcon(item.type);
          return (
            <TouchableOpacity onPress={() => markAsRead(item.id)}>
              <Card
                style={[
                  styles.card,
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder },
                  !item.is_read && { borderWidth: 1.5, borderColor: theme.colors.primary },
                ]}
              >
                <Card.Content style={styles.cardContent}>
                  <View style={[styles.iconBg, { backgroundColor: config.bg }]}>
                    <Ionicons name={config.icon as any} size={22} color={config.color} />
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.notifTitle, { color: theme.colors.text }]}>{item.title}</Text>
                    <Text style={[styles.notifMessage, { color: theme.colors.textSecondary }]}>
                      {item.message}
                    </Text>
                    <Text style={[styles.timeText, { color: theme.colors.textMuted }]}>
                      {new Date(item.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {!item.is_read && <View style={styles.unreadDot} />}
                    <TouchableOpacity onPress={() => deleteNotification(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="close-circle-outline" size={20} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  notifMessage: {
    fontSize: 12,
    marginTop: 2,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4F46E5',
    marginLeft: 8,
  },
});
