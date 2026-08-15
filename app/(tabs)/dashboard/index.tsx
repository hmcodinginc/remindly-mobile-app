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
import GlassModal from '../../../components/GlassModal';
import AddReminderModal from '../../../components/AddReminderModal';
import { confirmDelete } from '../../../utils/confirmDelete';
import { formatCleanName } from '../../../utils/formatName';
import { GenericReminder, ReminderType } from '../../../types';

type DashboardTab = 'all' | 'today' | 'upcoming' | 'overdue' | 'recurring';

export default function DashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [demoNoticeVisible, setDemoNoticeVisible] = useState(false);
  const [modalInitialType, setModalInitialType] = useState<ReminderType>('task');
  const [editingReminder, setEditingReminder] = useState<GenericReminder | null>(null);

  const { user, isDemoMode } = useAuthStore();
  const {
    getUserReminders,
    toggleComplete,
    deleteReminder,
    getTodayReminders,
    getUpcomingReminders,
    getOverdueReminders,
    getRecurringReminders,
  } = useReminderStore();

  const userReminders = getUserReminders();

  const { getTotalMonthlySpend } = useSubscriptionStore();
  const unreadNotifs = useNotificationStore((state) => state.unreadCount);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 400);
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
        return userReminders;
    }
  };

  const currentList = getFilteredList();

  const handleProtectedAction = (action: () => void) => {
    if (isDemoMode) {
      setDemoNoticeVisible(true);
      return;
    }
    action();
  };

  const openCreate = (t: ReminderType = 'task') => {
    handleProtectedAction(() => {
      setEditingReminder(null);
      setModalInitialType(t);
      setModalVisible(true);
    });
  };

  const openEdit = (rem: GenericReminder) => {
    handleProtectedAction(() => {
      setEditingReminder(rem);
      setModalVisible(true);
    });
  };

  const handleDelete = (id: string, title: string) => {
    handleProtectedAction(() => {
      confirmDelete('Delete Reminder', `Delete "${title}"?`, () => {
        deleteReminder(id);
      });
    });
  };

  const handleToggleCheck = (id: string) => {
    handleProtectedAction(() => {
      toggleComplete(id);
    });
  };

  const formattedName = formatCleanName(user?.name, user?.email);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#5B5CE2" />}
      >
        {/* Read-Only Demo Showcase Banner */}
        {isDemoMode && (
          <GlassCard style={styles.demoBanner}>
            <View style={styles.demoRow}>
              <Ionicons name="sparkles" size={18} color="#5B5CE2" />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.demoTitle}>✨ Product Showcase Mode (Read-Only)</Text>
                <Text style={styles.demoSub}>
                  Sign in or create an account to create, edit, or delete reminders.
                </Text>
              </View>
              <GlassButton
                title="Sign In"
                onPress={() => router.push('/(auth)/login')}
                variant="primary"
                style={{ height: 32, paddingHorizontal: 12 }}
              />
            </View>
          </GlassCard>
        )}

        {/* Minimal Mobile Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerTitleGroup}>
            <RemindlyLogo size={42} showBackground={true} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.headerTitle}>Daily Organizer </Text>
              <Text style={styles.headerSubtitle}>Hi, {formattedName}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push('/(tabs)/notifications')}
          >
            <Ionicons name="notifications-outline" size={20} color="#171717" />
            {unreadNotifs > 0 && (
              <View style={styles.badgeDot}>
                <Text style={styles.badgeText}>{unreadNotifs}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Compact Summary Cards Grid */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <Text style={styles.summaryLabel}>Monthly subscriptions</Text>
              <Ionicons name="card-outline" size={16} color="#5B5CE2" />
            </View>
            <Text style={styles.summaryValue}>${monthlyTotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <Text style={styles.summaryLabel}>Upcoming</Text>
              <Ionicons name="calendar-outline" size={16} color="#3B82F6" />
            </View>
            <Text style={styles.summaryValue}>{upcomingReminders.length}</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <Text style={styles.summaryLabel}>Overdue</Text>
              <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
            </View>
            <Text style={[styles.summaryValue, overdueReminders.length > 0 && { color: '#EF4444' }]}>
              {overdueReminders.length}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <Text style={styles.summaryLabel}>Due today</Text>
              <Ionicons name="time-outline" size={16} color="#16A34A" />
            </View>
            <Text style={styles.summaryValue}>{todayReminders.length}</Text>
          </View>
        </View>

        {/* Compact Quick Add Button */}
        <View style={styles.actionRow}>
          <GlassButton
            title=" Add Reminder"
            onPress={() => openCreate('task')}
            variant="primary"
            icon="add-circle-outline"
            style={styles.addBtn}
          />
        </View>

        {/* Filter Pills */}
        <View style={styles.tabsContainer}>
          {(['all', 'today', 'upcoming', 'overdue', 'recurring'] as DashboardTab[]).map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.filterTab, isSelected && styles.filterTabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.filterTabText, isSelected && styles.filterTabTextActive]}>
                  {tab === 'all'
                    ? 'All'
                    : tab === 'today'
                    ? 'Due Today'
                    : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Reminders List */}
        {currentList.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Ionicons name="checkmark-done-circle-outline" size={36} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No reminders in {activeTab}</Text>
            <Text style={styles.emptySub}>Tap "+ Add Reminder" to set up a task, bill, or appointment.</Text>
          </GlassCard>
        ) : (
          currentList.map((rem) => {
            const isCompleted = rem.status === 'completed';
            const isOverdue = rem.due_date < new Date().toISOString().split('T')[0] && !isCompleted;

            return (
              <GlassCard key={rem.id} style={[styles.itemCard, isOverdue && styles.overdueCard]}>
                <View style={styles.itemRow}>
                  <TouchableOpacity onPress={() => handleToggleCheck(rem.id)} style={styles.checkBtn}>
                    <Ionicons
                      name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={isCompleted ? '#16A34A' : isOverdue ? '#EF4444' : '#9CA3AF'}
                    />
                  </TouchableOpacity>

                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.itemTitle, isCompleted && styles.completedTitle]}>
                        {rem.title}
                      </Text>
                      <Text style={styles.typeTag}>{rem.type.toUpperCase()}</Text>
                    </View>

                    <Text style={[styles.itemMeta, isOverdue && { color: '#EF4444', fontWeight: '600' }]}>
                      {isOverdue ? 'Overdue • ' : ''}Due: {rem.due_date} • {rem.category}
                    </Text>

                    {rem.amount ? (
                      <Text style={styles.amountText}>
                        {rem.currency || '$'}{rem.amount.toFixed(2)}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.actionCol}>
                    <TouchableOpacity onPress={() => openEdit(rem)} style={styles.iconBtn}>
                      <Ionicons name="pencil" size={16} color="#6B7280" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(rem.id, rem.title)} style={styles.iconBtn}>
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </GlassCard>
            );
          })
        )}
      </ScrollView>

      {/* Creation / Edit Modal */}
      <AddReminderModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        initialType={modalInitialType}
        editingReminder={editingReminder}
      />

      {/* Demo Showcase Notice Modal */}
      <GlassModal
        visible={demoNoticeVisible}
        onClose={() => setDemoNoticeVisible(false)}
        title="Demo Showcase Mode"
      >
        <View style={{ alignItems: 'center', paddingVertical: 10 }}>
          <Ionicons name="lock-closed-outline" size={40} color="#5B5CE2" style={{ marginBottom: 10 }} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#171717', marginBottom: 6 }}>
            Read-Only Product Preview
          </Text>
          <Text style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 18, lineHeight: 18 }}>
            Explore Demo Mode is a product showcase. To add, edit, or delete reminders, please sign in or create your free account!
          </Text>

          <GlassButton
            title="Sign In to Your Account"
            onPress={() => {
              setDemoNoticeVisible(false);
              router.push('/(auth)/login');
            }}
            variant="primary"
            style={{ width: '100%', marginBottom: 8 }}
          />

          <GlassButton
            title="Create Free Account"
            onPress={() => {
              setDemoNoticeVisible(false);
              router.push('/(auth)/register');
            }}
            variant="secondary"
            style={{ width: '100%' }}
          />
        </View>
      </GlassModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    width: '100%',
  },
  demoBanner: {
    marginBottom: 14,
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
    padding: 10,
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5B5CE2',
  },
  demoSub: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 4,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#171717',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 1,
  },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F7F8FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#171717',
  },
  actionRow: {
    marginBottom: 16,
  },
  addBtn: {
    height: 44,
  },
  tabsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterTabActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#5B5CE2',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#5B5CE2',
    fontWeight: '700',
  },
  emptyCard: {
    padding: 28,
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
  itemCard: {
    marginBottom: 10,
    padding: 14,
  },
  overdueCard: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkBtn: {
    padding: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#171717',
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  typeTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5B5CE2',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  amountText: {
    fontSize: 13,
    color: '#5B5CE2',
    fontWeight: '600',
    marginTop: 2,
  },
  actionCol: {
    gap: 8,
    marginLeft: 10,
  },
  iconBtn: {
    padding: 4,
  },
});
