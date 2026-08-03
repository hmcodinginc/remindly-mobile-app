import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useRoutineStore } from '../../store/useRoutineStore';
import { DarkTheme, LightTheme } from '../../theme/colors';

export default function CreateRoutineScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? DarkTheme : LightTheme;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [category, setCategory] = useState('Wellness');

  const addRoutine = useRoutineStore((state) => state.addRoutine);

  const handleSave = async () => {
    if (!title) return;
    await addRoutine({
      user: 'user-1',
      title: title.trim(),
      description: description.trim(),
      frequency,
      times_per_day: 1,
      category,
    });
    router.back();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <TextInput
        label="Routine Title *"
        value={title}
        onChangeText={setTitle}
        mode="outlined"
        placeholder="e.g. Morning Mindfulness, Nightly Journal"
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

      <Text style={[styles.label, { color: theme.colors.text }]}>Frequency</Text>
      <SegmentedButtons
        value={frequency}
        onValueChange={(val) => setFrequency(val as 'daily' | 'weekly' | 'monthly')}
        buttons={[
          { value: 'daily', label: 'Daily' },
          { value: 'weekly', label: 'Weekly' },
          { value: 'monthly', label: 'Monthly' },
        ]}
        style={styles.segmented}
      />

      <TextInput
        label="Category"
        value={category}
        onChangeText={setCategory}
        mode="outlined"
        placeholder="Productivity, Wellness, Health"
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleSave}
        disabled={!title}
        style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
        contentStyle={{ paddingVertical: 6 }}
      >
        Save Routine
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
  saveBtn: {
    borderRadius: 14,
    marginTop: 16,
  },
});
