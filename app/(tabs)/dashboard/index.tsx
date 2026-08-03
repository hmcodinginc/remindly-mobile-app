import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, ProgressBar, Checkbox } from 'react-native-paper';
import { useAuthStore } from '../../../store/useAuthStore';
import { useSubscriptionStore } from '../../../store/useSubscriptionStore';
import { useTaskStore } from '../../../store/useTaskStore';
import { useRoutineStore } from '../../../store/useRoutineStore';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { DarkTheme, LightTheme } from '../../../theme/colors';
import RemindlyLogo from '../../../components/RemindlyLogo';

export default function DashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? DarkTheme : LightTheme;

  const [refreshing, setRefreshing] = useState(false);

  const user = useAuthStore((state) => state.user);
  const { subscriptions, getTotalMonthlySpend, getUpcomingRenewals, fetchSubscriptions } = useSubscriptionStore();
  const { tasks, toggleTaskStatus, fetchTasks } = useTaskStore();
  const { routines, habits, toggleRoutineCompleted, toggleHabitCompletion, fetchRoutines } = useRoutineStore();
  const unreadNotifs = useNotificationStore((state) => state.unreadCount);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchSubscriptions(), fetchTasks(), fetchRoutines()]);
    setRefreshing(false);
  };

  const monthlyTotal = getTotalMonthlySpend();
  const upcomingRenewals = getUpcomingRenewals(14);
  const todayTasks = tasks.filter((t) => t.status !== 'completed').slice(0, 3);
  const todayRoutines = routines.slice(0, 3);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {/* Welcome Widget */}
      <View style={[styles.welcomeCard, { backgroundColor: theme.colors.primary }]}>
        <View style={{ marginRight: 12 }}>
          <RemindlyLogo size={52} showBackground={false} />
        </View>
        <View style={styles.welcomeTextGroup}>
          <Text style={styles.greetingText}>Hello, {user?.name || 'Friend'} 👋</Text>
          <Text style={styles.welcomeSubtext}>Remindly • Subscriptions & Tasks</Text>
        </View>
        <TouchableOpacity
          style={styles.notifBadgeBtn}
          onPress={() => router.push('/(tabs)/notifications')}
        >
          <Ionicons name="notifications" size={24} color="#FFF" />
          {unreadNotifs > 0 && <View style={styles.badgeDot} />}
        </TouchableOpacity>
      </View>

      {/* Monthly Spending & Analytics Overview */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <View style={[styles.statIconBg, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="wallet-outline" size={22} color={theme.colors.primary} />
          </View>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            ${monthlyTotal.toFixed(2)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Monthly Subscriptions</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <View style={[styles.statIconBg, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="time-outline" size={22} color="#D97706" />
          </View>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {upcomingRenewals.length} Due
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Renewals Next 14 Days</Text>
        </View>
      </View>

      {/* Quick Actions Widget */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={[styles.quickBtn, { backgroundColor: theme.colors.surface }]}
          onPress={() => router.push('/subscription/create')}
        >
          <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
          <Text style={[styles.quickBtnText, { color: theme.colors.text }]}>+ Sub</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickBtn, { backgroundColor: theme.colors.surface }]}
          onPress={() => router.push('/task/create')}
        >
          <Ionicons name="checkbox" size={24} color="#10B981" />
          <Text style={[styles.quickBtnText, { color: theme.colors.text }]}>+ Task</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickBtn, { backgroundColor: theme.colors.surface }]}
          onPress={() => router.push('/habit/create')}
        >
          <Ionicons name="flame" size={24} color="#F59E0B" />
          <Text style={[styles.quickBtnText, { color: theme.colors.text }]}>+ Habit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickBtn, { backgroundColor: theme.colors.surface }]}
          onPress={() => router.push('/analytics')}
        >
          <Ionicons name="stats-chart" size={24} color="#8B5CF6" />
          <Text style={[styles.quickBtnText, { color: theme.colors.text }]}>Reports</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming Subscription Renewals Widget */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Upcoming Renewals</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/subscriptions')}>
          <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>View All</Text>
        </TouchableOpacity>
      </View>
      {upcomingRenewals.length === 0 ? (
        <Card style={[styles.emptyCard, { backgroundColor: theme.colors.card }]}>
          <Text style={{ color: theme.colors.textSecondary }}>No renewals due in the next 14 days 🎉</Text>
        </Card>
      ) : (
        upcomingRenewals.map((sub) => (
          <TouchableOpacity
            key={sub.id}
            onPress={() => router.push(`/subscription/${sub.id}`)}
          >
            <Card style={[styles.itemCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
              <Card.Content style={styles.cardContentRow}>
                <View style={[styles.itemIcon, { backgroundColor: theme.colors.primaryContainer }]}>
                  <Ionicons name="card" size={22} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.itemName, { color: theme.colors.text }]}>{sub.name}</Text>
                  <Text style={[styles.itemMeta, { color: theme.colors.textSecondary }]}>
                    Renews: {sub.renewal_date} • {sub.payment_method}
                  </Text>
                </View>
                <Text style={[styles.itemPrice, { color: theme.colors.text }]}>
                  {sub.currency}{sub.amount.toFixed(2)}
                </Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))
      )}

      {/* Today's Tasks Widget */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Today's Priority Tasks</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/tasks')}>
          <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>View All</Text>
        </TouchableOpacity>
      </View>
      {todayTasks.length === 0 ? (
        <Card style={[styles.emptyCard, { backgroundColor: theme.colors.card }]}>
          <Text style={{ color: theme.colors.textSecondary }}>All tasks completed for today! ✨</Text>
        </Card>
      ) : (
        todayTasks.map((t) => (
          <Card key={t.id} style={[styles.itemCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
            <Card.Content style={styles.cardContentRow}>
              <Checkbox
                status={t.status === 'completed' ? 'checked' : 'unchecked'}
                onPress={() => toggleTaskStatus(t.id)}
                color={theme.colors.primary}
              />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.itemName, { color: theme.colors.text }]}>{t.title}</Text>
                <Text style={[styles.itemMeta, { color: theme.colors.textSecondary }]}>
                  Priority: {t.priority.toUpperCase()} • Due: {t.due_date}
                </Text>
              </View>
            </Card.Content>
          </Card>
        ))
      )}

      {/* Today's Routine & Habit Progress Widget */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Habits & Streaks</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/routines')}>
          <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>View All</Text>
        </TouchableOpacity>
      </View>
      {habits.map((h) => {
        const isDoneToday = h.last_completed_date === new Date().toISOString().split('T')[0];
        return (
          <Card key={h.id} style={[styles.itemCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
            <Card.Content style={styles.cardContentRow}>
              <TouchableOpacity onPress={() => toggleHabitCompletion(h.id)}>
                <Ionicons
                  name={isDoneToday ? 'checkmark-circle' : 'ellipse-outline'}
                  size={26}
                  color={isDoneToday ? '#10B981' : theme.colors.textMuted}
                />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.itemName, { color: theme.colors.text }]}>{h.title}</Text>
                <Text style={[styles.itemMeta, { color: theme.colors.textSecondary }]}>
                  {h.streak_count} day streak 🔥 (Best: {h.best_streak})
                </Text>
              </View>
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={16} color="#F59E0B" />
                <Text style={styles.streakCount}>{h.streak_count}</Text>
              </View>
            </Card.Content>
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  welcomeCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  welcomeTextGroup: {
    flex: 1,
  },
  greetingText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
  },
  welcomeSubtext: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    marginTop: 4,
  },
  notifBadgeBtn: {
    padding: 8,
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  statIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    marginTop: 8,
  },
  quickBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  quickBtnText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  itemCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
  },
  itemMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  streakCount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D97706',
  },
});
