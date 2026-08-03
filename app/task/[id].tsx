import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Chip, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore } from '../../store/useTaskStore';
import { DarkTheme, LightTheme } from '../../theme/colors';

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? DarkTheme : LightTheme;

  const { tasks, toggleTaskStatus, deleteTask } = useTaskStore();
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.textSecondary }}>Task not found.</Text>
      </View>
    );
  }

  const handleDelete = () => {
    deleteTask(task.id);
    router.back();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
        <Card.Content>
          <View style={styles.headerRow}>
            <View style={[styles.iconBg, { backgroundColor: theme.colors.primaryContainer }]}>
              <Ionicons name="checkbox" size={28} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.title, { color: theme.colors.text }]}>{task.title}</Text>
              <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>Due: {task.due_date}</Text>
            </View>
          </View>

          <Divider style={{ marginVertical: 16 }} />

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Priority</Text>
            <Chip compact style={{ backgroundColor: '#FEF3C7' }}>{task.priority.toUpperCase()}</Chip>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Status</Text>
            <Chip compact style={{ backgroundColor: task.status === 'completed' ? '#D1FAE5' : '#E0F2FE' }}>
              {task.status.toUpperCase()}
            </Chip>
          </View>

          {task.description ? (
            <View style={{ marginTop: 12 }}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Description</Text>
              <Text style={[styles.descText, { color: theme.colors.text }]}>{task.description}</Text>
            </View>
          ) : null}

          {task.labels && task.labels.length > 0 ? (
            <View style={styles.labelsRow}>
              {task.labels.map((l) => (
                <Chip key={l} style={styles.labelChip} textStyle={{ fontSize: 11 }}>{l}</Chip>
              ))}
            </View>
          ) : null}
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={() => toggleTaskStatus(task.id)}
        style={[styles.toggleBtn, { backgroundColor: theme.colors.primary }]}
      >
        {task.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed ✓'}
      </Button>

      <Button
        mode="outlined"
        onPress={handleDelete}
        icon="trash-can-outline"
        style={styles.deleteBtn}
        textColor="#EF4444"
      >
        Delete Task
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
  },
  descText: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  labelsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
  },
  labelChip: {
    backgroundColor: '#F1F5F9',
  },
  toggleBtn: {
    borderRadius: 14,
    marginBottom: 12,
  },
  deleteBtn: {
    borderRadius: 14,
    borderColor: '#FCA5A5',
  },
});
