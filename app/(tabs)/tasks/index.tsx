import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Searchbar, Chip, FAB, Card, Checkbox } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore } from '../../../store/useTaskStore';
import { TaskPriority, TaskStatus } from '../../../types';
import { DarkTheme, LightTheme } from '../../../theme/colors';

const STATUS_FILTERS: Array<{ label: string; value: TaskStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
];

export default function TasksScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? DarkTheme : LightTheme;

  const {
    tasks,
    searchQuery,
    selectedStatus,
    selectedPriority,
    setSearchQuery,
    setSelectedStatus,
    toggleTaskStatus,
    deleteTask,
  } = useTaskStore();

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || t.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return '#EF4444';
      case 'high':
        return '#F59E0B';
      case 'medium':
        return '#3B82F6';
      default:
        return '#10B981';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search & Filters */}
      <View style={styles.headerArea}>
        <Searchbar
          placeholder="Search tasks..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchbar, { backgroundColor: theme.colors.surface }]}
          elevation={1}
        />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isSelected = selectedStatus === item.value;
            return (
              <Chip
                selected={isSelected}
                onPress={() => setSelectedStatus(item.value)}
                style={[isSelected && { backgroundColor: theme.colors.primaryContainer }]}
                selectedColor={theme.colors.primary}
              >
                {item.label}
              </Chip>
            );
          }}
        />
      </View>

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkbox-outline" size={48} color={theme.colors.textMuted} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No tasks found</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isDone = item.status === 'completed';
          const pColor = getPriorityColor(item.priority);

          return (
            <Card style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
              <Card.Content style={styles.cardContent}>
                <Checkbox
                  status={isDone ? 'checked' : 'unchecked'}
                  onPress={() => toggleTaskStatus(item.id)}
                  color={theme.colors.primary}
                />

                <TouchableOpacity
                  style={{ flex: 1, marginLeft: 8 }}
                  onPress={() => router.push(`/task/${item.id}`)}
                >
                  <Text
                    style={[
                      styles.taskTitle,
                      { color: theme.colors.text },
                      isDone && styles.completedTitle,
                    ]}
                  >
                    {item.title}
                  </Text>
                  {item.description ? (
                    <Text
                      style={[styles.taskDesc, { color: theme.colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {item.description}
                    </Text>
                  ) : null}

                  <View style={styles.metaRow}>
                    <View style={[styles.priorityBadge, { backgroundColor: pColor + '20' }]}>
                      <Text style={[styles.priorityText, { color: pColor }]}>
                        {item.priority.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.dueDate, { color: theme.colors.textSecondary }]}>
                      📅 {item.due_date}
                    </Text>
                    {item.reminder && (
                      <Ionicons name="notifications" size={14} color={theme.colors.primary} />
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </Card.Content>
            </Card>
          );
        }}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#FFF"
        onPress={() => router.push('/task/create')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerArea: {
    padding: 16,
    paddingBottom: 8,
  },
  searchbar: {
    borderRadius: 14,
    marginBottom: 10,
  },
  filterList: {
    gap: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  taskDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 10,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800',
  },
  dueDate: {
    fontSize: 11,
  },
  deleteBtn: {
    padding: 6,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    borderRadius: 28,
  },
});
