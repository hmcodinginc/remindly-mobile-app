import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { Card, ProgressBar, Chip, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Text as SvgText, G } from 'react-native-svg';
import { useSubscriptionStore } from '../../store/useSubscriptionStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useRoutineStore } from '../../store/useRoutineStore';
import { DarkTheme, LightTheme } from '../../theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width - 64;

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? DarkTheme : LightTheme;

  const { subscriptions, getTotalMonthlySpend } = useSubscriptionStore();
  const { tasks } = useTaskStore();
  const { habits, routines } = useRoutineStore();

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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Spending Overview Cards */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Spending Reports</Text>
      <View style={styles.spendingRow}>
        <Card style={[styles.statBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <Card.Content>
            <Ionicons name="wallet-outline" size={24} color={theme.colors.primary} />
            <Text style={[styles.statAmount, { color: theme.colors.text }]}>${monthlySpend.toFixed(2)}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Monthly Spend</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <Card.Content>
            <Ionicons name="calendar-outline" size={24} color="#10B981" />
            <Text style={[styles.statAmount, { color: theme.colors.text }]}>${yearlySpend.toFixed(2)}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Projected Yearly</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Category Analysis Chart */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Category Analysis</Text>
      <Card style={[styles.chartCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
        <Card.Content>
          {categories.length === 0 ? (
            <Text style={{ color: theme.colors.textSecondary }}>No subscription data available</Text>
          ) : (
            categories.map((cat) => {
              const amount = categoryMap[cat];
              const ratio = amount / maxCategoryAmount;
              return (
                <View key={cat} style={styles.catRow}>
                  <View style={styles.catInfo}>
                    <Text style={[styles.catName, { color: theme.colors.text }]}>{cat}</Text>
                    <Text style={[styles.catAmount, { color: theme.colors.textSecondary }]}>${amount.toFixed(2)}/mo</Text>
                  </View>
                  <ProgressBar progress={ratio} color={theme.colors.primary} style={styles.progressBar} />
                </View>
              );
            })
          )}
        </Card.Content>
      </Card>

      {/* Task & Habit Completion Stats */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Completion Statistics</Text>
      <View style={styles.spendingRow}>
        <Card style={[styles.statBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <Card.Content>
            <Ionicons name="checkbox-outline" size={24} color="#3B82F6" />
            <Text style={[styles.statAmount, { color: theme.colors.text }]}>{taskCompletionRate.toFixed(0)}%</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Task Done ({completedTasks}/{totalTasks})
            </Text>
            <ProgressBar progress={taskCompletionRate / 100} color="#3B82F6" style={{ marginTop: 8 }} />
          </Card.Content>
        </Card>

        <Card style={[styles.statBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <Card.Content>
            <Ionicons name="flame-outline" size={24} color="#F59E0B" />
            <Text style={[styles.statAmount, { color: theme.colors.text }]}>{habitCompletionRate.toFixed(0)}%</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Habits Today ({completedHabitsToday}/{totalHabits})
            </Text>
            <ProgressBar progress={habitCompletionRate / 100} color="#F59E0B" style={{ marginTop: 8 }} />
          </Card.Content>
        </Card>
      </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
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
    borderRadius: 16,
    borderWidth: 1,
  },
  statAmount: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  chartCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
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
  },
  catAmount: {
    fontSize: 13,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
});
