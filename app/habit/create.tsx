import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRoutineStore } from '../../store/useRoutineStore';
import GlassCard from '../../components/GlassCard';
import GlassInput from '../../components/GlassInput';
import GlassButton from '../../components/GlassButton';

export default function CreateHabitScreen() {
  const router = useRouter();
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <GlassCard glow style={styles.card}>
        <GlassInput
          label="Habit Title *"
          placeholder="e.g. Read 20 pages, Drink 2L water"
          value={title}
          onChangeText={setTitle}
          iconName="flame-outline"
        />

        <GlassInput
          label="Description"
          placeholder="Goal details..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={{ height: 80 }}
          iconName="document-text-outline"
        />

        <GlassInput
          label="Category"
          placeholder="Fitness, Learning, Health..."
          value={category}
          onChangeText={setCategory}
          iconName="folder-outline"
        />

        <GlassButton
          title="Create Habit & Track Streak"
          onPress={handleSave}
          disabled={!title}
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
});
