import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationStore } from '../../../store/useNotificationStore';
import GlassCard from '../../../components/GlassCard';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } =
    useNotificationStore();

  const handleNotifPress = (item: any) => {
    markAsRead(item.id);
    if (item.deep_link) {
      router.push(item.deep_link as any);
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'subscription_renewal':
        return { icon: 'card-outline', color: '#818CF8', bg: 'rgba(99, 102, 241, 0.2)' };
      case 'task_reminder':
        return { icon: 'checkbox-outline', color: '#34D399', bg: 'rgba(52, 211, 153, 0.2)' };
      case 'overdue_task':
        return { icon: 'warning-outline', color: '#F87171', bg: 'rgba(239, 68, 68, 0.2)' };
      case 'habit_reminder':
        return { icon: 'flame-outline', color: '#FBBF24', bg: 'rgba(245, 158, 11, 0.2)' };
      default:
        return { icon: 'notifications-outline', color: '#A78BFA', bg: 'rgba(167, 139, 250, 0.2)' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <GlassCard glow style={styles.topHeader}>
        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            <Text style={styles.headerTitle}>Notifications Center</Text>
            {unreadCount > 0 && (
              <View style={styles.badgeChip}>
                <Text style={styles.badgeText}>{unreadCount} new</Text>
              </View>
            )}
          </View>

          <View style={styles.actionsRow}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllAsRead}>
                <Text style={styles.actionText}>Mark all read</Text>
              </TouchableOpacity>
            )}
            {notifications.length > 0 && (
              <TouchableOpacity onPress={clearAll}>
                <Text style={[styles.actionText, { color: '#F87171' }]}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </GlassCard>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <GlassCard style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color="#64748B" />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </GlassCard>
        }
        renderItem={({ item }) => {
          const config = getNotifIcon(item.type);
          return (
            <GlassCard
              style={[
                styles.card,
                !item.is_read && styles.unreadCard,
              ]}
              onPress={() => handleNotifPress(item)}
            >
              <View style={styles.cardContent}>
                <View style={[styles.iconBg, { backgroundColor: config.bg }]}>
                  <Ionicons name={config.icon as any} size={22} color={config.color} />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  <Text style={styles.notifMessage}>{item.message}</Text>
                  <Text style={styles.timeText}>
                    {new Date(item.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Tap to view
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end', gap: 10 }}>
                  {!item.is_read && <View style={styles.unreadDot} />}
                  <TouchableOpacity
                    onPress={() => deleteNotification(item.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close-circle-outline" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>
            </GlassCard>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A14',
  },
  topHeader: {
    margin: 16,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  badgeChip: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    fontSize: 13,
    color: '#818CF8',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#94A3B8',
  },
  card: {
    marginBottom: 10,
  },
  unreadCard: {
    borderColor: 'rgba(99, 102, 241, 0.5)',
    backgroundColor: 'rgba(24, 34, 56, 0.85)',
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
    color: '#F8FAFC',
  },
  notifMessage: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 2,
  },
  timeText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#818CF8',
  },
});
