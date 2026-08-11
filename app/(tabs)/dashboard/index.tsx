import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/useAuthStore';
import { useReminderStore } from '../../../store/useReminderStore';
import { useSubscriptionStore } from '../../../store/useSubscriptionStore';
import { useNotificationStore } from '../../../store/useNotificationStore';
import RemindlyLogo from '../../../components/RemindlyLogo';
import GlassCard from '../../../components/GlassCard';
import GlassButton from '../../../components/GlassButton';
import AddReminderModal from '../../../components/AddReminderModal';
import { confirmDelete } from '../../../utils/confirmDelete';
import { GenericReminder, ReminderType } from '../../../types';

type DashboardTab = 'today' | 'upcoming' | 'overdue' | 'recurring' | 'all';

export default function DashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>('today');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalInitialType, setModalInitialType] = useState<ReminderType>('task');
  const [editingReminder, setEditingReminder] = useState<GenericReminder | null>(null);

  const user = useAuthStore((state) => state.user);
  const {
    reminders,
    toggleComplete,
    deleteReminder,
    getTodayReminders,
    getUpcomingReminders,
    getOverdueReminders,
    getRecurringReminders,
  } = useReminderStore();

  const { getTotalMonthlySpend, subscriptions } = useSubscriptionStore();
  const unreadNotifs = useNotificationStore((state) => state.unreadCount);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const todayReminders = getTodayReminders();
  const upcomingReminders = getUpcomingReminders(14);
  const overdueReminders = getOverdueReminders();
  const recurringReminders = getRecurringReminders();
  const monthlyTotal = getTotalMonthlySpend();

  const getFilteredList = () => {
    switch (activeTab) {
      case 'today':
        return todayReminders;
      case 'upcoming':
        return upcomingReminders;
      case 'overdue':
        return overdueReminders;
      case 'recurring':
        return recurringReminders;
      default:
        return reminders;
    }
  };

  const currentList = getFilteredList();

  const openCreate = (t: ReminderType = 'task') => {
    setEditingReminder(null);
    setModalInitialType(t);
    setModalVisible(true);
  };

  const openEdit = (rem: GenericReminder) => {
    setEditingReminder(rem);
    setModalVisible(true);
  };

  const handleDelete = (id: string, title: string) => {
    confirmDelete('Delete Reminder', `Delete "${title}"?`, () => {
      deleteReminder(id);
    });
  };

  const getTypeBadgeColor = (type: ReminderType) => {
    switch (type) {
      case 'subscription':
        return { bg: 'rgba(99, 102, 241, 0.2)', text: '#818CF8', icon: 'card-outline' };
      case 'payment':
        return { bg: 'rgba(245, 158, 11, 0.2)', text: '#FBBF24', icon: 'cash-outline' };
      case 'appointment':
        return { bg: 'rgba(96, 165, 250, 0.2)', text: '#60A5FA', icon: 'calendar-outline' };
      case 'renewal':
        return { bg: 'rgba(248, 113, 113, 0.2)', text: '#F87171', icon: 'car-outline' };
      case 'custom':
        return { bg: 'rgba(167, 139, 250, 0.2)', text: '#A78BFA', icon: 'gift-outline' };
      default:
        return { bg: 'rgba(52, 211, 153, 0.2)', text: '#34D399', icon: 'checkbox-outline' };
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#A78BFA" />}
      >
        {/* Welcome Header Glass Card */}
        <GlassCard glow style={styles.welcomeCard}>
          <View style={styles.welcomeRow}>
            <View style={styles.logoMargin}>
              <RemindlyLogo size={52} showBackground={true} />
            </View>
            <View style={styles.welcomeTextGroup}>
              <Text style={styles.greetingText}>Hello, {user?.name || 'Friend'} 👋</Text>
              <Text style={styles.welcomeSubtext}>General Reminder & Subscription Hub</Text>
            </View>
            <TouchableOpacity
              style={styles.notifBadgeBtn}
              onPress={() => router.push('/(tabs)/notifications')}
            >
              <Ionicons name="notifications" size={24} color="#A78BFA" />
              {unreadNotifs > 0 && (
                <View style={styles.badgeDot}>
                  <Text style={styles.badgeText}>{unreadNotifs}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Top Financial & Task Overview Grid */}
        <View style={styles.statsGrid}>
          <GlassCard style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: 'rgba(99, 102, 241, 0.25)' }]}>
              <Ionicons name="wallet" size={20} color="#818CF8" />
            </View>
            <Text style={styles.statValue}>${monthlyTotal.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Monthly Subscriptions</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: 'rgba(239, 68, 68, 0.25)' }]}>
              <Ionicons name="warning" size={20} color="#F87171" />
            </View>
            <Text style={styles.statValue}>{overdueReminders.length}</Text>
            <Text style={styles.statLabel}>Overdue Alerts</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: 'rgba(52, 211, 153, 0.25)' }]}>
              <Ionicons name="today" size={20} color="#34D399" />
            </View>
            <Text style={styles.statValue}>{todayReminders.length}</Text>
            <Text style={styles.statLabel}>Due Today</Text>
          </GlassCard>
        </View>

        {/* Action Button & Quick Add Row */}
        <View style={styles.addBar}>
          <GlassButton
            title="+ Add New Reminder"
            onPress={() => openCreate('task')}
            variant="primary"
            icon="add-circle-outline"
            style={{ flex: 1 }}
          />
        </View>

        {/* Dynamic Filter Tabs: Today, Upcoming, Overdue, Recurring, All */}
        <View style={styles.tabsContainer}>
          {(['today', 'upcoming', 'overdue', 'recurring', 'all'] as DashboardTab[]).map((tab) => {
            const isSelected = activeTab === tab;
            let count = 0;
            if (tab === 'today') count = todayReminders.length;
            if (tab === 'upcoming') count = upcomingReminders.length;
            if (tab === 'overdue') count = overdueReminders.length;
            if (tab === 'recurring') count = recurringReminders.length;
            if (tab === 'all') count = reminders.length;

            return (
              <TouchableOpacity
                key={tab}
                style={[styles.filterTab, isSelected && styles.filterTabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.filterTabText, isSelected && styles.filterTabTextActive]}>
                  {tab.toUpperCase()} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Reminder Items List */}
        {currentList.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Ionicons name="checkmark-done-circle-outline" size={44} color="#64748B" />
            <Text style={styles.emptyTitle}>No reminders in {activeTab.toUpperCase()}</Text>
            <Text style={styles.emptySub}>Tap "+ Add New Reminder" to set a task, bill, or appointment.</Text>
          </GlassCard>
        ) : (
          currentList.map((rem) => {
            const isCompleted = rem.status === 'completed';
            const badge = getTypeBadgeColor(rem.type);
            const isOverdue = rem.due_date < new Date().toISOString().split('T')[0] && !isCompleted;

            return (
              <GlassCard
                key={rem.id}
                style={[styles.itemCard, isOverdue && styles.overdueCard]}
              >
                <View style={styles.itemRow}>
                  <TouchableOpacity onPress={() => toggleComplete(rem.id)} style={styles.checkBtn}>
                    <Ionicons
                      name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                      size={26}
                      color={isCompleted ? '#34D399' : isOverdue ? '#F87171' : '#94A3B8'}
                    />
                  </TouchableOpacity>

                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={styles.titleBadgeRow}>
                      <Text style={[styles.itemTitle, isCompleted && styles.completedTitle]}>
                        {rem.title}
                      </Text>
                      <View style={[styles.typeBadge, { backgroundColor: badge.bg }]}>
                        <Ionicons name={badge.icon as any} size={12} color={badge.text} />
                        <Text style={[styles.typeBadgeText, { color: badge.text }]}>
                          {rem.type.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.itemMeta, isOverdue && { color: '#F87171', fontWeight: '700' }]}>
                      {isOverdue ? '⚠️ OVERDUE • ' : ''}
                      Due: {rem.due_date} {rem.due_time ? `(${rem.due_time})` : ''} • {rem.category}
                    </Text>

                    {rem.amount ? (
                      <Text style={styles.amountText}>
                        {rem.currency || '$'}{rem.amount.toFixed(2)} {rem.billing_cycle ? `(${rem.billing_cycle})` : ''}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.actionCol}>
                    <TouchableOpacity onPress={() => openEdit(rem)} style={styles.iconBtn}>
                      <Ionicons name="pencil" size={18} color="#818CF8" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(rem.id, rem.title)} style={styles.iconBtn}>
                      <Ionicons name="trash-outline" size={18} color="#F87171" />
                    </TouchableOpacity>
                  </View>
                </View>
              </GlassCard>
            );
          })
        )}
      </ScrollView>

      {/* Dynamic Add / Edit Modal */}
      <AddReminderModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        initialType={modalInitialType}
        editingReminder={editingReminder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A14',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  welcomeCard: {
    marginBottom: 16,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoMargin: {
    marginRight: 12,
  },
  welcomeTextGroup: {
    flex: 1,
  },
  greetingText: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
  },
  welcomeSubtext: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  notifBadgeBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#F87171',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 12,
  },
  statIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  addBar: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  filterTabActive: {
    backgroundColor: '#6366F1',
    borderColor: '#8B5CF6',
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  emptySub: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  itemCard: {
    marginBottom: 10,
    padding: 14,
  },
  overdueCard: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkBtn: {
    padding: 2,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  itemMeta: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  amountText: {
    fontSize: 13,
    color: '#A78BFA',
    fontWeight: '700',
    marginTop: 2,
  },
  actionCol: {
    gap: 8,
    alignItems: 'center',
  },
  iconBtn: {
    padding: 4,
  },
});
