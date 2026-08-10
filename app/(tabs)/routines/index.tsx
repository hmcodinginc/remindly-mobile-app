import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoutineStore } from '../../../store/useRoutineStore';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { scheduleHabitReminderAlert } from '../../../services/notifications';
import { Habit } from '../../../types';
import GlassCard from '../../../components/GlassCard';
import GlassModal from '../../../components/GlassModal';
import GlassInput from '../../../components/GlassInput';
import GlassButton from '../../../components/GlassButton';

export default function RoutinesScreen() {
  const [activeTab, setActiveTab] = useState<'habits' | 'routines'>('habits');

  const {
    routines,
    habits,
    toggleRoutineCompleted,
    toggleHabitCompletion,
    addHabit,
    addRoutine,
    deleteHabit,
    deleteRoutine,
  } = useRoutineStore();

  const addNotification = useNotificationStore((state) => state.addNotification);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Health');

  const openAddModal = () => {
    setTitle('');
    setDescription('');
    setCategory('Health');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!title) return;

    if (activeTab === 'habits') {
      await addHabit({
        user: 'user-1',
        title: title.trim(),
        description: description.trim(),
        category,
        icon: 'flame-outline',
      });
      // Schedule reminder alert
      await scheduleHabitReminderAlert('hab-new', title, 1);
      addNotification({
        user: 'user-1',
        title: '🔥 Habit Created & Scheduled',
        message: `Habit "${title}" created. Keep up the daily momentum!`,
        type: 'habit_reminder',
        is_read: false,
        target_type: 'habit',
        deep_link: '/(tabs)/routines',
      });
    } else {
      await addRoutine({
        user: 'user-1',
        title: title.trim(),
        description: description.trim(),
        frequency: 'daily',
        times_per_day: 1,
        category,
      });
    }

    setModalVisible(false);
  };

  const handleDeleteHabit = (id: string, habitTitle: string) => {
    Alert.alert('Delete Habit', `Delete "${habitTitle}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteHabit(id) },
    ]);
  };

  const handleDeleteRoutine = (id: string, rotTitle: string) => {
    Alert.alert('Delete Routine', `Delete "${rotTitle}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteRoutine(id) },
    ]);
  };

  const triggerStreakAlert = async (habit: Habit) => {
    await scheduleHabitReminderAlert(habit.id, habit.title, habit.streak_count);
    addNotification({
      user: 'user-1',
      title: '🔥 Habit Streak Milestone!',
      message: `Keep your ${habit.streak_count}-day streak alive on "${habit.title}"!`,
      type: 'habit_reminder',
      is_read: false,
      target_type: 'habit',
      target_id: habit.id,
      deep_link: '/(tabs)/routines',
    });
    Alert.alert('Streak Reminder Sent', `Notification scheduled for "${habit.title}".`);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <View style={styles.container}>
      {/* View Switcher Header */}
      <GlassCard glow style={styles.topCard}>
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'habits' && styles.tabBtnActive]}
            onPress={() => setActiveTab('habits')}
          >
            <Ionicons name="flame" size={18} color={activeTab === 'habits' ? '#FBBF24' : '#94A3B8'} />
            <Text style={[styles.tabText, activeTab === 'habits' && styles.tabTextActive]}>
              Daily Habits ({habits.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'routines' && styles.tabBtnActive]}
            onPress={() => setActiveTab('routines')}
          >
            <Ionicons name="time" size={18} color={activeTab === 'routines' ? '#818CF8' : '#94A3B8'} />
            <Text style={[styles.tabText, activeTab === 'routines' && styles.tabTextActive]}>
              Routines ({routines.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerBtnRow}>
          <GlassButton
            title={activeTab === 'habits' ? '+ Add Habit' : '+ Add Routine'}
            onPress={openAddModal}
            variant="primary"
            icon="add"
          />
        </View>
      </GlassCard>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'habits' ? (
          habits.map((h) => {
            const isDoneToday = h.last_completed_date === today;

            return (
              <GlassCard key={h.id} style={styles.habitCard}>
                <View style={styles.habitRow}>
                  <TouchableOpacity onPress={() => toggleHabitCompletion(h.id)} style={styles.checkBtn}>
                    <Ionicons
                      name={isDoneToday ? 'checkmark-circle' : 'ellipse-outline'}
                      size={28}
                      color={isDoneToday ? '#34D399' : '#64748B'}
                    />
                  </TouchableOpacity>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.habitTitle}>{h.title}</Text>
                    {h.description ? <Text style={styles.habitDesc}>{h.description}</Text> : null}
                    <Text style={styles.categoryTag}>{h.category || 'General'}</Text>
                  </View>

                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <View style={styles.streakBadge}>
                      <Ionicons name="flame" size={16} color="#FBBF24" />
                      <Text style={styles.streakText}>{h.streak_count}d streak</Text>
                    </View>
                    <Text style={styles.bestStreakText}>Best: {h.best_streak}d</Text>
                  </View>
                </View>

                {/* Actions Row */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => triggerStreakAlert(h)}>
                    <Ionicons name="notifications-outline" size={16} color="#FBBF24" />
                    <Text style={styles.actionBtnText}>Alert</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteHabit(h.id, h.title)}>
                    <Ionicons name="trash-outline" size={16} color="#F87171" />
                    <Text style={[styles.actionBtnText, { color: '#F87171' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            );
          })
        ) : (
          routines.map((r) => (
            <GlassCard key={r.id} style={styles.habitCard}>
              <View style={styles.habitRow}>
                <TouchableOpacity onPress={() => toggleRoutineCompleted(r.id)} style={styles.checkBtn}>
                  <Ionicons
                    name={r.completed_today ? 'checkmark-circle' : 'time-outline'}
                    size={28}
                    color={r.completed_today ? '#34D399' : '#818CF8'}
                  />
                </TouchableOpacity>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.habitTitle}>{r.title}</Text>
                  {r.description ? <Text style={styles.habitDesc}>{r.description}</Text> : null}
                  <Text style={styles.categoryTag}>Frequency: {r.frequency.toUpperCase()}</Text>
                </View>

                <TouchableOpacity onPress={() => handleDeleteRoutine(r.id, r.title)} style={{ padding: 4 }}>
                  <Ionicons name="trash-outline" size={20} color="#F87171" />
                </TouchableOpacity>
              </View>
            </GlassCard>
          ))
        )}
      </ScrollView>

      {/* Add Modal */}
      <GlassModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={activeTab === 'habits' ? 'New Daily Habit' : 'New Routine'}
      >
        <GlassInput
          label="Title"
          placeholder={activeTab === 'habits' ? 'Drink 2.5L Water, Read 20 mins...' : 'Morning Focus, Gym...'}
          value={title}
          onChangeText={setTitle}
          iconName="flame-outline"
        />

        <GlassInput
          label="Description"
          placeholder="Details or motivation..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={2}
          style={{ height: 60 }}
          iconName="document-text-outline"
        />

        <GlassInput
          label="Category"
          placeholder="Health, Productivity, Fitness..."
          value={category}
          onChangeText={setCategory}
          iconName="folder-outline"
        />

        <GlassButton
          title={activeTab === 'habits' ? 'Create Habit & Track Streak' : 'Create Routine'}
          onPress={handleSave}
          variant="primary"
          style={{ marginTop: 12 }}
        />
      </GlassModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A14',
  },
  topCard: {
    margin: 16,
    marginBottom: 10,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  headerBtnRow: {
    alignItems: 'stretch',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  habitCard: {
    marginBottom: 12,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkBtn: {
    padding: 2,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  habitDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  categoryTag: {
    fontSize: 11,
    color: '#818CF8',
    marginTop: 4,
    fontWeight: '600',
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
    fontSize: 12,
    fontWeight: '800',
    color: '#FBBF24',
  },
  bestStreakText: {
    fontSize: 10,
    color: '#64748B',
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 14,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnText: {
    fontSize: 12,
    color: '#FBBF24',
    fontWeight: '600',
  },
});
