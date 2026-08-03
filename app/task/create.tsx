import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { TextInput, Button, Switch, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTaskStore } from '../../store/useTaskStore';
import { TaskPriority } from '../../types';
import { DarkTheme, LightTheme } from '../../theme/colors';

import { useNotificationStore } from '../../store/useNotificationStore';
import { scheduleTaskReminderAlert } from '../../services/notifications';

export default function CreateTaskScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? DarkTheme : LightTheme;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
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
        title: 'Task Reminder Created',
        message: `Reminder set for task "${cleanTitle}" due on ${dueDate}.`,
        type: 'task_reminder',
        is_read: false,
      });
      await scheduleTaskReminderAlert(cleanTitle, dueDate);
    }

    setLoading(false);
    router.back();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <TextInput
        label="Task Title *"
        value={title}
        onChangeText={setTitle}
        mode="outlined"
        placeholder="e.g. Prepare presentation, Submit report"
        style={styles.input}
      />

      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      <Text style={[styles.label, { color: theme.colors.text }]}>Priority</Text>
      <SegmentedButtons
        value={priority}
        onValueChange={(val) => setPriority(val as TaskPriority)}
        buttons={[
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Med' },
          { value: 'high', label: 'High' },
          { value: 'urgent', label: 'Urgent' },
        ]}
        style={styles.segmented}
      />

      <TextInput
        label="Due Date (YYYY-MM-DD)"
        value={dueDate}
        onChangeText={setDueDate}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Labels (comma separated)"
        value={labels}
        onChangeText={setLabels}
        mode="outlined"
        placeholder="Finance, Health, Work"
        style={styles.input}
      />

      <View style={styles.switchRow}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Enable Reminder</Text>
        <Switch value={reminder} onValueChange={setReminder} color={theme.colors.primary} />
      </View>

      <Button
        mode="contained"
        onPress={handleSave}
        loading={loading}
        disabled={loading || !title}
        style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
        contentStyle={{ paddingVertical: 6 }}
      >
        Save Task
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  input: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  segmented: {
    marginBottom: 14,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  saveBtn: {
    borderRadius: 14,
    marginTop: 16,
  },
});
