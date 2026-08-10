import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTaskStore } from '../../store/useTaskStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { scheduleTaskReminderAlert } from '../../services/notifications';
import { TaskPriority } from '../../types';
import GlassCard from '../../components/GlassCard';
import GlassInput from '../../components/GlassInput';
import GlassButton from '../../components/GlassButton';
import { PriorityColors } from '../../theme/colors';

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

export default function CreateTaskScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [reminder, setReminder] = useState(true);
  const [labels, setLabels] = useState('Work, Mobile');
  const [loading, setLoading] = useState(false);

  const addTask = useTaskStore((state) => state.addTask);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const handleSave = async () => {
    if (!title) return;
    setLoading(true);
    const cleanTitle = title.trim();
    await addTask({
      user: 'user-1',
      title: cleanTitle,
      description: description.trim(),
      priority,
      due_date: dueDate,
      status: 'todo',
      labels: labels.split(',').map((l) => l.trim()).filter(Boolean),
      reminder,
    });

    if (reminder) {
      addNotification({
        user: 'user-1',
        title: '⏰ Task Reminder Scheduled',
        message: `Reminder set for task "${cleanTitle}" due on ${dueDate}.`,
        type: 'task_reminder',
        is_read: false,
        target_type: 'task',
        deep_link: '/(tabs)/tasks',
      });
      await scheduleTaskReminderAlert('task-new', cleanTitle, dueDate);
    }

    setLoading(false);
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <GlassCard glow style={styles.card}>
        <GlassInput
          label="Task Title *"
          placeholder="e.g. Prepare presentation, Submit report"
          value={title}
          onChangeText={setTitle}
          iconName="checkbox-outline"
        />

        <GlassInput
          label="Description"
          placeholder="Task details or breakdown..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={{ height: 80 }}
          iconName="document-text-outline"
        />

        <Text style={styles.label}>Priority Level</Text>
        <View style={styles.priorityRow}>
          {PRIORITIES.map((p) => {
            const pStyle = PriorityColors[p];
            const isSelected = priority === p;
            return (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityBtn,
                  { backgroundColor: isSelected ? pStyle.bg : 'rgba(15, 23, 42, 0.75)', borderColor: pStyle.border },
                ]}
                onPress={() => setPriority(p)}
              >
                <Text style={[styles.priorityBtnText, { color: pStyle.text }]}>
                  {p.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <GlassInput
          label="Due Date (YYYY-MM-DD)"
          placeholder="2026-08-15"
          value={dueDate}
          onChangeText={setDueDate}
          iconName="calendar-outline"
        />

        <GlassInput
          label="Labels (comma separated)"
          placeholder="Finance, Work, Personal"
          value={labels}
          onChangeText={setLabels}
          iconName="pricetags-outline"
        />

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Schedule Local Push Reminder</Text>
            <Text style={styles.switchSublabel}>Receive notification alert on mobile/web</Text>
          </View>
          <Switch
            value={reminder}
            onValueChange={setReminder}
            trackColor={{ false: '#334155', true: '#6366F1' }}
            thumbColor={reminder ? '#A78BFA' : '#94A3B8'}
          />
        </View>

        <GlassButton
          title="Save Task"
          onPress={handleSave}
          loading={loading}
          disabled={loading || !title}
          variant="primary"
          style={{ marginTop: 12 }}
        />
      </GlassCard>
    </ScrollView>
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
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 8,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  priorityBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 14,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  switchSublabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
});
