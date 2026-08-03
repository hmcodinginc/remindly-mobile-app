import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { FAB, Card, ProgressBar, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRoutineStore } from '../../../store/useRoutineStore';
import { DarkTheme, LightTheme } from '../../../theme/colors';

export default function RoutinesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? DarkTheme : LightTheme;

  const [activeTab, setActiveTab] = useState<'habits' | 'routines'>('habits');

  const {
    routines,
    habits,
    toggleRoutineCompleted,
    toggleHabitCompletion,
    deleteHabit,
    deleteRoutine,
  } = useRoutineStore();

  const today = new Date().toISOString().split('T')[0];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Segment Switcher */}
      <View style={styles.segmentContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as 'habits' | 'routines')}
          buttons={[
            { value: 'habits', label: `Habits (${habits.length})`, icon: 'fire' },
            { value: 'routines', label: `Routines (${routines.length})`, icon: 'clock-outline' },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'habits' ? (
          <>
            {/* Weekly Habit Completion Summary Banner */}
            <View style={[styles.summaryBanner, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
              <View style={styles.summaryHeader}>
                <Ionicons name="trophy" size={24} color="#F59E0B" />
                <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Habit Consistency</Text>
              </View>
              <Text style={[styles.summaryDesc, { color: theme.colors.textSecondary }]}>
                Stay consistent! Keep your daily streaks active to build long-lasting habits.
              </Text>
            </View>

            {habits.map((h) => {
              const isDoneToday = h.last_completed_date === today;
              const progressRatio = Math.min(1, h.streak_count / Math.max(1, h.best_streak || 10));

              return (
                <Card
                  key={h.id}
                  style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}
                >
                  <Card.Content>
                    <View style={styles.habitRow}>
                      <TouchableOpacity onPress={() => toggleHabitCompletion(h.id)}>
                        <View
                          style={[
                            styles.checkBtn,
                            isDoneToday
                              ? { backgroundColor: '#10B981', borderColor: '#10B981' }
                              : { borderColor: theme.colors.border },
                          ]}
                        >
                          <Ionicons
                            name={isDoneToday ? 'checkmark' : 'ellipse-outline'}
                            size={20}
                            color={isDoneToday ? '#FFF' : theme.colors.textMuted}
                          />
                        </View>
                      </TouchableOpacity>

                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.habitTitle, { color: theme.colors.text }]}>{h.title}</Text>
                        {h.description ? (
                          <Text style={[styles.habitDesc, { color: theme.colors.textSecondary }]}>
                            {h.description}
                          </Text>
                        ) : null}
                      </View>

                      <View style={styles.streakBox}>
                        <Ionicons name="flame" size={20} color="#F59E0B" />
                        <Text style={styles.streakText}>{h.streak_count}d</Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressRow}>
                      <ProgressBar
                        progress={progressRatio}
                        color={isDoneToday ? '#10B981' : theme.colors.primary}
                        style={styles.progressBar}
                      />
                      <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                        Best: {h.best_streak} days
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              );
            })}
          </>
        ) : (
          /* Routines Tab */
          routines.map((r) => (
            <Card
              key={r.id}
              style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}
            >
              <Card.Content style={styles.routineContent}>
                <TouchableOpacity onPress={() => toggleRoutineCompleted(r.id)}>
                  <Ionicons
                    name={r.completed_today ? 'checkmark-circle' : 'time-outline'}
                    size={28}
                    color={r.completed_today ? '#10B981' : theme.colors.primary}
                  />
                </TouchableOpacity>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.habitTitle, { color: theme.colors.text }]}>{r.title}</Text>
                  {r.description ? (
                    <Text style={[styles.habitDesc, { color: theme.colors.textSecondary }]}>
                      {r.description}
                    </Text>
                  ) : null}
                  <Text style={[styles.routineMeta, { color: theme.colors.textSecondary }]}>
                    Frequency: {r.frequency.toUpperCase()} • {r.category}
                  </Text>
                </View>

                <TouchableOpacity onPress={() => deleteRoutine(r.id)} style={{ padding: 4 }}>
                  <Ionicons name="trash-outline" size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#FFF"
        onPress={() =>
          activeTab === 'habits' ? router.push('/habit/create') : router.push('/routine/create')
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  segmentContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  summaryBanner: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryDesc: {
    fontSize: 12,
    marginTop: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  habitDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  streakBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D97706',
  },
  progressRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
  },
  routineContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routineMeta: {
    fontSize: 11,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    borderRadius: 28,
  },
});
