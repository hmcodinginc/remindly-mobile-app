import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSubscriptionStore } from '../../store/useSubscriptionStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useRoutineStore } from '../../store/useRoutineStore';
import GlassCard from '../../components/GlassCard';

export default function AnalyticsScreen() {
  const router = useRouter();
  const { subscriptions, getTotalMonthlySpend } = useSubscriptionStore();
  const { tasks } = useTaskStore();
  const { habits } = useRoutineStore();

  const monthlySpend = getTotalMonthlySpend();
  const yearlySpend = monthlySpend * 12;

  // Task Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Habit Stats
  const totalHabits = habits.length;
  const today = new Date().toISOString().split('T')[0];
  const completedHabitsToday = habits.filter((h) => h.last_completed_date === today).length;
  const habitCompletionRate = totalHabits > 0 ? (completedHabitsToday / totalHabits) * 100 : 0;

  // Category breakdown
  const categoryMap: { [key: string]: number } = {};
  subscriptions.forEach((sub) => {
    categoryMap[sub.category] = (categoryMap[sub.category] || 0) + sub.amount;
  });

  const categories = Object.keys(categoryMap);
  const maxCategoryAmount = Math.max(...Object.values(categoryMap), 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color="#F8FAFC" />
        <Text style={styles.backText}>Back to Dashboard</Text>
      </TouchableOpacity>

      <Text style={styles.pageTitle}>Analytics & Reports</Text>
      <Text style={styles.pageSubtitle}>Insights across your subscriptions, tasks, and habit streaks</Text>

      {/* Spending Overview */}
      <Text style={styles.sectionTitle}>Financial Summary</Text>
      <View style={styles.spendingRow}>
        <GlassCard glow style={styles.statBox}>
          <Ionicons name="wallet" size={24} color="#818CF8" />
          <Text style={styles.statAmount}>${monthlySpend.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Monthly Recurring</Text>
        </GlassCard>

        <GlassCard glow style={styles.statBox}>
          <Ionicons name="calendar" size={24} color="#34D399" />
          <Text style={styles.statAmount}>${yearlySpend.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Projected Yearly</Text>
        </GlassCard>
      </View>

      {/* Category Analysis */}
      <Text style={styles.sectionTitle}>Category Spending Breakdown</Text>
      <GlassCard style={styles.chartCard}>
        {categories.length === 0 ? (
          <Text style={styles.emptyText}>No subscription data available</Text>
        ) : (
          categories.map((cat) => {
            const amount = categoryMap[cat];
            const ratio = (amount / maxCategoryAmount) * 100;
            return (
              <View key={cat} style={styles.catRow}>
                <View style={styles.catInfo}>
                  <Text style={styles.catName}>{cat}</Text>
                  <Text style={styles.catAmount}>${amount.toFixed(2)}/mo</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${Math.max(5, ratio)}%` }]} />
                </View>
              </View>
            );
          })
        )}
      </GlassCard>

      {/* Completion Performance Stats */}
      <Text style={styles.sectionTitle}>Performance Metrics</Text>
      <View style={styles.spendingRow}>
        <GlassCard style={styles.statBox}>
          <Ionicons name="checkbox" size={24} color="#60A5FA" />
          <Text style={styles.statAmount}>{taskCompletionRate.toFixed(0)}%</Text>
          <Text style={styles.statLabel}>Task Completion Rate</Text>
          <Text style={styles.statSubText}>{completedTasks} of {totalTasks} completed</Text>
        </GlassCard>

        <GlassCard style={styles.statBox}>
          <Ionicons name="flame" size={24} color="#FBBF24" />
          <Text style={styles.statAmount}>{habitCompletionRate.toFixed(0)}%</Text>
          <Text style={styles.statLabel}>Habits Done Today</Text>
          <Text style={styles.statSubText}>{completedHabitsToday} of {totalHabits} habits</Text>
        </GlassCard>
      </View>
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
    maxWidth: 700,
    width: '100%',
    alignSelf: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  backText: {
    color: '#818CF8',
    fontSize: 14,
    fontWeight: '700',
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
    marginTop: 8,
  },
  spendingRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    padding: 16,
  },
  statAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '600',
    marginTop: 2,
  },
  statSubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  chartCard: {
    marginBottom: 20,
    padding: 18,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  catRow: {
    marginBottom: 14,
  },
  catInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  catName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  catAmount: {
    fontSize: 13,
    color: '#818CF8',
    fontWeight: '700',
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#6366F1',
  },
});
