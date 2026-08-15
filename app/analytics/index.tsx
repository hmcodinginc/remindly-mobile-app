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
import { useTaskStore, isTaskOverdue } from '../../store/useTaskStore';
import GlassCard from '../../components/GlassCard';

export default function AnalyticsScreen() {
  const router = useRouter();
  const { getUserSubscriptions, getTotalMonthlySpend } = useSubscriptionStore();
  const { getUserTasks } = useTaskStore();

  const subscriptions = getUserSubscriptions();
  const tasks = getUserTasks();

  const monthlySpend = getTotalMonthlySpend();
  const yearlySpend = monthlySpend * 12;

  // Task Performance Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const overdueTasks = tasks.filter((t) => isTaskOverdue(t)).length;
  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Dynamic Category Spending Breakdown (Monthly Equivalent)
  const categoryMap: { [key: string]: number } = {};
  subscriptions.forEach((sub) => {
    const amt = Number(sub.amount) || 0;
    let monthlyEquiv = amt;
    if (sub.billing_cycle === 'yearly') monthlyEquiv = amt / 12;
    if (sub.billing_cycle === 'weekly') monthlyEquiv = amt * 4.33;
    if (sub.billing_cycle === 'quarterly') monthlyEquiv = amt / 3;

    categoryMap[sub.category] = (categoryMap[sub.category] || 0) + monthlyEquiv;
  });

  const categories = Object.keys(categoryMap);
  const maxCategoryAmount = Math.max(...Object.values(categoryMap), 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Back to Dashboard Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color="#5B5CE2" />
        <Text style={styles.backText}>Back to Dashboard</Text>
      </TouchableOpacity>

      <Text style={styles.pageTitle}>Analytics & Financial Reports</Text>
      <Text style={styles.pageSubtitle}>
        Real-time insights based on your active subscriptions and tasks
      </Text>

      {/* Dynamic Financial Summary Cards */}
      <Text style={styles.sectionTitle}>Financial Overview</Text>
      <View style={styles.spendingRow}>
        <GlassCard style={styles.statBox}>
          <View style={styles.iconCircle}>
            <Ionicons name="wallet-outline" size={20} color="#5B5CE2" />
          </View>
          <Text style={styles.statAmount}>${monthlySpend.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total Monthly Spend</Text>
          <Text style={styles.statSubText}>Calculated from user amounts</Text>
        </GlassCard>

        <GlassCard style={styles.statBox}>
          <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="calendar-outline" size={20} color="#16A34A" />
          </View>
          <Text style={styles.statAmount}>${yearlySpend.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Projected Yearly Spend</Text>
          <Text style={styles.statSubText}>12-month projection</Text>
        </GlassCard>
      </View>

      {/* Category Spending Breakdown */}
      <Text style={styles.sectionTitle}>Subscription Spending by Category</Text>
      <GlassCard style={styles.chartCard}>
        {categories.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="card-outline" size={32} color="#9CA3AF" />
            <Text style={styles.emptyText}>No active subscriptions to analyze</Text>
          </View>
        ) : (
          categories.map((cat) => {
            const amount = categoryMap[cat];
            const ratio = (amount / maxCategoryAmount) * 100;
            const percentage = monthlySpend > 0 ? ((amount / monthlySpend) * 100).toFixed(0) : '0';

            return (
              <View key={cat} style={styles.catRow}>
                <View style={styles.catInfo}>
                  <Text style={styles.catName}>{cat}</Text>
                  <Text style={styles.catAmount}>
                    ${amount.toFixed(2)}/mo <Text style={styles.catPercent}>({percentage}%)</Text>
                  </Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${Math.max(6, ratio)}%` }]} />
                </View>
              </View>
            );
          })
        )}
      </GlassCard>

      {/* Task Performance Metrics */}
      <Text style={styles.sectionTitle}>Task Performance Metrics</Text>
      <View style={styles.spendingRow}>
        <GlassCard style={styles.statBox}>
          <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="checkmark-done-outline" size={20} color="#2563EB" />
          </View>
          <Text style={styles.statAmount}>{taskCompletionRate.toFixed(0)}%</Text>
          <Text style={styles.statLabel}>Task Completion Rate</Text>
          <Text style={styles.statSubText}>{completedTasks} of {totalTasks} tasks completed</Text>
        </GlassCard>

        <GlassCard style={styles.statBox}>
          <View style={[styles.iconCircle, { backgroundColor: overdueTasks > 0 ? '#FEF2F2' : '#EEF2FF' }]}>
            <Ionicons
              name={overdueTasks > 0 ? 'warning-outline' : 'checkbox-outline'}
              size={20}
              color={overdueTasks > 0 ? '#DC2626' : '#5B5CE2'}
            />
          </View>
          <Text style={[styles.statAmount, overdueTasks > 0 && { color: '#DC2626' }]}>
            {overdueTasks}
          </Text>
          <Text style={styles.statLabel}>Overdue Tasks</Text>
          <Text style={styles.statSubText}>
            {overdueTasks > 0 ? 'Action required' : 'All tasks up to date'}
          </Text>
        </GlassCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 18,
    paddingTop: 14,
    paddingBottom: 40,
    width: '100%',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  backText: {
    color: '#5B5CE2',
    fontSize: 14,
    fontWeight: '600',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#171717',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#171717',
    marginBottom: 10,
    marginTop: 6,
  },
  spendingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    minWidth: 160,
    padding: 16,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#171717',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 2,
  },
  statSubText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  chartCard: {
    marginBottom: 16,
    padding: 16,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 6,
  },
  catRow: {
    marginBottom: 12,
  },
  catInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  catName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#171717',
  },
  catAmount: {
    fontSize: 13,
    color: '#5B5CE2',
    fontWeight: '700',
  },
  catPercent: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '400',
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#5B5CE2',
  },
});
