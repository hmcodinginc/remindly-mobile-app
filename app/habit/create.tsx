import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useRoutineStore } from '../../store/useRoutineStore';
import { DarkTheme, LightTheme } from '../../theme/colors';

export default function CreateHabitScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? DarkTheme : LightTheme;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Health');

  const addHabit = useRoutineStore((state) => state.addHabit);

  const handleSave = async () => {
    if (!title) return;
    await addHabit({
      user: 'user-1',
      title: title.trim(),
      description: description.trim(),
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
        label="Habit Title *"
        value={title}
        onChangeText={setTitle}
        mode="outlined"
        placeholder="e.g. Read 20 pages, Drink 2L water"
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

      <TextInput
        label="Category"
        value={category}
        onChangeText={setCategory}
        mode="outlined"
        placeholder="Fitness, Learning, Health"
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleSave}
        disabled={!title}
        style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
        contentStyle={{ paddingVertical: 6 }}
      >
        Create Habit
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
  saveBtn: {
    borderRadius: 14,
    marginTop: 16,
  },
});
