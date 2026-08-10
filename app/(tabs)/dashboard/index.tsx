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
import { useSubscriptionStore } from '../../../store/useSubscriptionStore';
import { useTaskStore, isTaskOverdue } from '../../../store/useTaskStore';
import { useRoutineStore } from '../../../store/useRoutineStore';
import { useNotificationStore } from '../../../store/useNotificationStore';
import RemindlyLogo from '../../../components/RemindlyLogo';
import GlassCard from '../../../components/GlassCard';
import GlassButton from '../../../components/GlassButton';

export default function DashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const user = useAuthStore((state) => state.user);
  const { subscriptions, getTotalMonthlySpend, getUpcomingRenewals, fetchSubscriptions } = useSubscriptionStore();
  const { tasks, toggleTaskStatus, getOverdueTasksCount, fetchTasks } = useTaskStore();
  const { routines, habits, toggleHabitCompletion, fetchRoutines } = useRoutineStore();
  const unreadNotifs = useNotificationStore((state) => state.unreadCount);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchSubscriptions(), fetchTasks(), fetchRoutines()]);
    setRefreshing(false);
  };

  const monthlyTotal = getTotalMonthlySpend();
  const annualTotal = monthlyTotal * 12;
  const upcomingRenewals = getUpcomingRenewals(14);
  const oneWeekRenewals = getUpcomingRenewals(7);
  const overdueCount = getOverdueTasksCount();
  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const todayHabits = habits.slice(0, 4);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#A78BFA" />}
    >
      {/* Header Welcome Glass Card */}
      <GlassCard glow style={styles.welcomeCard}>
        <View style={styles.welcomeRow}>
          <View style={styles.logoMargin}>
            <RemindlyLogo size={54} showBackground={true} />
          </View>
          <View style={styles.welcomeTextGroup}>
            <Text style={styles.greetingText}>Hello, {user?.name || 'User'} 👋</Text>
            <Text style={styles.welcomeSubtext}>
              {user?.emailVerified ? 'Verified Account' : 'Free Account'} • Timezone Aware Reminders
            </Text>
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

      {/* Alert Banner: 1-Week Renewal Warning */}
      {oneWeekRenewals.length > 0 && (
        <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/(tabs)/subscriptions')}>
          <GlassCard style={styles.alertBanner} glow>
            <View style={styles.alertBannerRow}>
              <View style={styles.alertIconWrapper}>
                <Ionicons name="alert-circle" size={22} color="#FBBF24" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.alertBannerTitle}>📅 1 Week Advance Renewal Alert!</Text>
                <Text style={styles.alertBannerText}>
                  {oneWeekRenewals[0].name} (${oneWeekRenewals[0].amount.toFixed(2)}) is renewing on {oneWeekRenewals[0].renewal_date}.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </View>
          </GlassCard>
        </TouchableOpacity>
      )}

      {/* Alert Banner: Overdue Tasks Warning */}
      {overdueCount > 0 && (
        <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/(tabs)/tasks')}>
          <GlassCard style={styles.overdueBanner} glow>
            <View style={styles.alertBannerRow}>
              <View style={styles.overdueIconWrapper}>
                <Ionicons name="warning" size={22} color="#F87171" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.overdueBannerTitle}>⚠️ {overdueCount} Task(s) Overdue</Text>
                <Text style={styles.overdueBannerText}>
                  Tap to view and mark complete or reschedule.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </View>
          </GlassCard>
        </TouchableOpacity>
      )}

      {/* Financial & Task Metrics Grid */}
      <View style={styles.statsRow}>
        <GlassCard style={styles.statCard}>
          <View style={[styles.statIconBg, { backgroundColor: 'rgba(99, 102, 241, 0.2)' }]}>
            <Ionicons name="wallet" size={20} color="#818CF8" />
          </View>
          <Text style={styles.statValue}>${monthlyTotal.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Monthly Cost</Text>
          <Text style={styles.statSublabel}>${annualTotal.toFixed(0)}/yr estimated</Text>
        </GlassCard>

        <GlassCard style={styles.statCard}>
          <View style={[styles.statIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
            <Ionicons name="time" size={20} color="#FBBF24" />
          </View>
          <Text style={styles.statValue}>{upcomingRenewals.length}</Text>
          <Text style={styles.statLabel}>14-Day Renewals</Text>
          <Text style={styles.statSublabel}>{subscriptions.length} active subs</Text>
        </GlassCard>

        <GlassCard style={styles.statCard}>
          <View style={[styles.statIconBg, { backgroundColor: 'rgba(52, 211, 153, 0.2)' }]}>
            <Ionicons name="checkbox" size={20} color="#34D399" />
          </View>
          <Text style={styles.statValue}>{pendingTasks.length}</Text>
          <Text style={styles.statLabel}>Pending Tasks</Text>
          <Text style={styles.statSublabel}>{overdueCount} overdue</Text>
        </GlassCard>
      </View>

      {/* Quick Action Navigation */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity style={styles.quickActionBtn} onPress={() => router.push('/(tabs)/subscriptions')}>
          <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(99, 102, 241, 0.25)' }]}>
            <Ionicons name="card-outline" size={22} color="#818CF8" />
          </View>
          <Text style={styles.quickActionLabel}>Subscriptions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionBtn} onPress={() => router.push('/(tabs)/tasks')}>
          <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(52, 211, 153, 0.25)' }]}>
            <Ionicons name="add-circle-outline" size={22} color="#34D399" />
          </View>
          <Text style={styles.quickActionLabel}>Add Task</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionBtn} onPress={() => router.push('/(tabs)/routines')}>
          <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.25)' }]}>
            <Ionicons name="flame-outline" size={22} color="#FBBF24" />
          </View>
          <Text style={styles.quickActionLabel}>Habits & Streaks</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionBtn} onPress={() => router.push('/analytics' as any)}>
          <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(167, 139, 250, 0.25)' }]}>
            <Ionicons name="bar-chart-outline" size={22} color="#A78BFA" />
          </View>
          <Text style={styles.quickActionLabel}>Reports</Text>
        </TouchableOpacity>
      </View>

      {/* Section: Upcoming Renewals */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Renewals</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/subscriptions')}>
          <Text style={styles.seeAllText}>Manage All ({subscriptions.length})</Text>
        </TouchableOpacity>
      </View>
      {upcomingRenewals.length === 0 ? (
        <GlassCard style={styles.emptyCard}>
          <Text style={styles.emptyText}>No renewals coming up in the next 14 days 🎉</Text>
        </GlassCard>
      ) : (
        upcomingRenewals.slice(0, 3).map((sub) => (
          <GlassCard key={sub.id} style={styles.itemCard} onPress={() => router.push('/(tabs)/subscriptions')}>
            <View style={styles.itemRow}>
              <View style={styles.subIconBg}>
                <Ionicons name="card" size={22} color="#818CF8" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.itemName}>{sub.name}</Text>
                <Text style={styles.itemMeta}>
                  Renews {sub.renewal_date} • {sub.billing_cycle.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.itemPrice}>
                {sub.currency}{sub.amount.toFixed(2)}
              </Text>
            </View>
          </GlassCard>
        ))
      )}

      {/* Section: Priority Tasks */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Priority Tasks</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/tasks')}>
          <Text style={styles.seeAllText}>View All ({tasks.length})</Text>
        </TouchableOpacity>
      </View>
      {pendingTasks.length === 0 ? (
        <GlassCard style={styles.emptyCard}>
          <Text style={styles.emptyText}>All tasks completed for today! ✨</Text>
        </GlassCard>
      ) : (
        pendingTasks.slice(0, 3).map((t) => {
          const overdue = isTaskOverdue(t);
          return (
            <GlassCard key={t.id} style={styles.itemCard}>
              <View style={styles.itemRow}>
                <TouchableOpacity onPress={() => toggleTaskStatus(t.id)} style={styles.checkboxBtn}>
                  <Ionicons
                    name={t.status === 'completed' ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={t.status === 'completed' ? '#34D399' : '#94A3B8'}
                  />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.itemName, t.status === 'completed' && styles.completedText]}>
                    {t.title}
                  </Text>
                  <Text style={[styles.itemMeta, overdue && { color: '#F87171', fontWeight: '700' }]}>
                    {overdue ? '⚠️ OVERDUE • ' : ''}Due: {t.due_date} • Priority: {t.priority.toUpperCase()}
                  </Text>
                </View>
              </View>
            </GlassCard>
          );
        })
      )}

      {/* Section: Daily Habit Streaks */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Daily Habit Streaks</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/routines')}>
          <Text style={styles.seeAllText}>View All ({habits.length})</Text>
        </TouchableOpacity>
      </View>
      {todayHabits.map((h) => {
        const isDoneToday = h.last_completed_date === new Date().toISOString().split('T')[0];
        return (
          <GlassCard key={h.id} style={styles.itemCard}>
            <View style={styles.itemRow}>
              <TouchableOpacity onPress={() => toggleHabitCompletion(h.id)}>
                <Ionicons
                  name={isDoneToday ? 'checkmark-circle' : 'ellipse-outline'}
                  size={26}
                  color={isDoneToday ? '#34D399' : '#64748B'}
                />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.itemName}>{h.title}</Text>
                <Text style={styles.itemMeta}>
                  {h.streak_count} day streak • Best: {h.best_streak} days
                </Text>
              </View>
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={16} color="#FBBF24" />
                <Text style={styles.streakText}>{h.streak_count}</Text>
              </View>
            </View>
          </GlassCard>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A14',
  },
  content: {
    padding: 18,
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
    width: 44,
    height: 44,
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
  alertBanner: {
    marginBottom: 14,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  alertBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIconWrapper: {
    marginRight: 12,
  },
  alertBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FBBF24',
  },
  alertBannerText: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 2,
  },
  overdueBanner: {
    marginBottom: 14,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  overdueIconWrapper: {
    marginRight: 12,
  },
  overdueBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F87171',
  },
  overdueBannerText: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 14,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
    marginTop: 2,
  },
  statSublabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: 'rgba(18, 25, 42, 0.75)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    color: '#818CF8',
    fontWeight: '600',
  },
  emptyCard: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  itemCard: {
    marginBottom: 10,
    padding: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  itemMeta: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#818CF8',
  },
  checkboxBtn: {
    padding: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FBBF24',
  },
});
