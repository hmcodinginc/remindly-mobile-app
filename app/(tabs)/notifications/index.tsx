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
import { NotificationItem } from '../../../types';
import GlassCard from '../../../components/GlassCard';
import GlassButton from '../../../components/GlassButton';

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotificationStore();

  const handleNotificationPress = (item: NotificationItem) => {
    markAsRead(item.id);
    if (item.deep_link) {
      router.push(item.deep_link as any);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'subscription_renewal':
        return { name: 'card', color: '#5B5CE2', bg: '#EEF2FF' };
      case 'overdue_task':
        return { name: 'warning', color: '#DC2626', bg: '#FEF2F2' };
      case 'task_reminder':
        return { name: 'checkbox', color: '#2563EB', bg: '#EFF6FF' };
      default:
        return { name: 'notifications', color: '#059669', bg: '#ECFDF5' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Actions */}
      <View style={styles.actionHeader}>
        <Text style={styles.headerTitle}>
          Alerts {unreadCount > 0 && `(${unreadCount} Unread)`}
        </Text>
        <View style={styles.actionRow}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.actionBtn}>
              <Ionicons name="checkmark-done-outline" size={16} color="#5B5CE2" />
              <Text style={styles.actionBtnText}>Read All</Text>
            </TouchableOpacity>
          )}

          {notifications.length > 0 && (
            <TouchableOpacity onPress={clearAll} style={styles.actionBtn}>
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
              <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <GlassCard style={styles.emptyCard}>
            <Ionicons name="notifications-off-outline" size={40} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Alerts</Text>
            <Text style={styles.emptySub}>You have no unread notifications or advance alerts.</Text>
          </GlassCard>
        }
        renderItem={({ item }) => {
          const iconMeta = getNotificationIcon(item.type);
          return (
            <GlassCard
              style={[styles.notifCard, !item.is_read && styles.unreadCard]}
              onPress={() => handleNotificationPress(item)}
            >
              <View style={styles.cardRow}>
                <View style={[styles.iconBg, { backgroundColor: iconMeta.bg }]}>
                  <Ionicons name={iconMeta.name as any} size={20} color={iconMeta.color} />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.notifTitle, !item.is_read && styles.unreadTitle]}>
                      {item.title}
                    </Text>
                    {!item.is_read && <View style={styles.unreadDot} />}
                  </View>

                  <Text style={styles.messageText}>{item.message}</Text>
                  <Text style={styles.timeText}>{item.created ? item.created.slice(0, 10) : 'Today'}</Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    deleteNotification(item.id);
                  }}
                >
                  <Ionicons name="close-circle-outline" size={18} color="#9CA3AF" />
                </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#171717',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5B5CE2',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#171717',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
  },
  emptySub: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  notifCard: {
    marginBottom: 10,
  },
  unreadCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#C7D2FE',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#171717',
  },
  unreadTitle: {
    color: '#5B5CE2',
    fontWeight: '700',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5B5CE2',
  },
  messageText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  timeText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 6,
  },
});
