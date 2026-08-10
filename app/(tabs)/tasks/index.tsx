import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore, isTaskOverdue } from '../../../store/useTaskStore';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { scheduleOverdueTaskAlert, scheduleTaskReminderAlert } from '../../../services/notifications';
import { Task, TaskPriority } from '../../../types';
import GlassCard from '../../../components/GlassCard';
import GlassModal from '../../../components/GlassModal';
import GlassInput from '../../../components/GlassInput';
import GlassButton from '../../../components/GlassButton';
import { PriorityColors } from '../../../theme/colors';
import { confirmDelete } from '../../../utils/confirmDelete';

const STATUS_FILTERS: Array<{ label: string; value: 'all' | 'pending' | 'overdue' | 'completed' }> = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Overdue ⚠️', value: 'overdue' },
  { label: 'Completed', value: 'completed' },
];

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

export default function TasksScreen() {
  const {
    tasks,
    searchQuery,
    selectedStatus,
    setSearchQuery,
    setSelectedStatus,
    toggleTaskStatus,
    addTask,
    updateTask,
    deleteTask,
    getOverdueTasksCount,
  } = useTaskStore();

  const addNotification = useNotificationStore((state) => state.addNotification);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    setModalVisible(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
    setDueDate(task.due_date);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!title) return;

    if (editingTask) {
      await updateTask(editingTask.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        due_date: dueDate,
      });
    } else {
      await addTask({
        user: 'user-1',
        title: title.trim(),
        description: description.trim(),
        priority,
        due_date: dueDate,
        status: 'todo',
        labels: ['Task'],
        reminder: true,
      });

      // Schedule notification
      await scheduleTaskReminderAlert('task-new', title, dueDate);
      addNotification({
        user: 'user-1',
        title: '⏰ Task Reminder Scheduled',
        message: `Task "${title}" scheduled for ${dueDate}.`,
        type: 'task_reminder',
        is_read: false,
        target_type: 'task',
        deep_link: '/(tabs)/tasks',
      });
    }

    setModalVisible(false);
  };

  const handleDelete = (id: string, taskTitle: string) => {
    confirmDelete('Delete Task', `Are you sure you want to delete "${taskTitle}"?`, async () => {
      await deleteTask(id);
    });
  };

  const triggerOverdueAlert = async (task: Task) => {
    await scheduleOverdueTaskAlert(task.id, task.title);
    addNotification({
      user: 'user-1',
      title: '⚠️ Overdue Task Alert',
      message: `Task "${task.title}" is overdue! Please complete or reschedule.`,
      type: 'overdue_task',
      is_read: false,
      target_type: 'task',
      target_id: task.id,
      deep_link: '/(tabs)/tasks',
    });
    Alert.alert('Overdue Alert Sent', `Notification triggered for "${task.title}".`);
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const overdue = isTaskOverdue(t);
    let matchesStatus = true;
    if (selectedStatus === 'pending') matchesStatus = t.status !== 'completed';
    if (selectedStatus === 'overdue') matchesStatus = overdue;
    if (selectedStatus === 'completed') matchesStatus = t.status === 'completed';

    return matchesSearch && matchesStatus;
  });

  const overdueCount = getOverdueTasksCount();

  return (
    <View style={styles.container}>
      {/* Top Banner */}
      <GlassCard glow style={styles.topBanner}>
        <View style={styles.bannerRow}>
          <View>
            <Text style={styles.bannerTitle}>Task Manager</Text>
            <Text style={styles.bannerSubtitle}>
              {tasks.length} total • {overdueCount > 0 ? `${overdueCount} overdue ⚠️` : '0 overdue ✨'}
            </Text>
          </View>
          <GlassButton
            title="+ Add Task"
            onPress={openCreateModal}
            variant="primary"
            icon="add"
          />
        </View>
      </GlassCard>

      {/* Search & Filter Tabs */}
      <View style={styles.filterSection}>
        <GlassInput
          placeholder="Search tasks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          iconName="search-outline"
          rightIcon={searchQuery ? 'close-circle' : undefined}
          onRightIconPress={() => setSearchQuery('')}
        />

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filterContainer}
          renderItem={({ item }) => {
            const isSelected = selectedStatus === item.value;
            return (
              <TouchableOpacity
                style={[styles.filterPill, isSelected && styles.filterPillActive]}
                onPress={() => setSelectedStatus(item.value as any)}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Tasks List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <GlassCard style={styles.emptyCard}>
            <Ionicons name="checkbox-outline" size={48} color="#64748B" />
            <Text style={styles.emptyText}>No tasks found in this view</Text>
          </GlassCard>
        }
        renderItem={({ item }) => {
          const isDone = item.status === 'completed';
          const overdue = isTaskOverdue(item);
          const pStyle = PriorityColors[item.priority] || PriorityColors.medium;

          return (
            <GlassCard style={[styles.taskCard, overdue && styles.overdueTaskCard]}>
              <View style={styles.taskRow}>
                <TouchableOpacity onPress={() => toggleTaskStatus(item.id)} style={styles.checkBtn}>
                  <Ionicons
                    name={isDone ? 'checkmark-circle' : 'ellipse-outline'}
                    size={26}
                    color={isDone ? '#34D399' : overdue ? '#F87171' : '#94A3B8'}
                  />
                </TouchableOpacity>

                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.taskTitle, isDone && styles.completedTitle]}>
                    {item.title}
                  </Text>
                  {item.description ? (
                    <Text style={styles.taskDesc} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}

                  <View style={styles.badgeRow}>
                    <View style={[styles.priorityBadge, { backgroundColor: pStyle.bg, borderColor: pStyle.border }]}>
                      <Text style={[styles.priorityText, { color: pStyle.text }]}>
                        {item.priority.toUpperCase()}
                      </Text>
                    </View>

                    <Text style={[styles.dueDateText, overdue && { color: '#F87171', fontWeight: '700' }]}>
                      {overdue ? '⚠️ OVERDUE • ' : '📅 '}Due: {item.due_date}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionCol}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => triggerOverdueAlert(item)}>
                    <Ionicons name="notifications-outline" size={18} color="#FBBF24" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.iconBtn} onPress={() => openEditModal(item)}>
                    <Ionicons name="pencil" size={18} color="#818CF8" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id, item.title)}>
                    <Ionicons name="trash-outline" size={18} color="#F87171" />
                  </TouchableOpacity>
                </View>
              </View>
            </GlassCard>
          );
        }}
      />

      {/* Create / Edit Modal */}
      <GlassModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editingTask ? 'Edit Task' : 'New Task'}
      >
        <GlassInput
          label="Task Title"
          placeholder="Task title..."
          value={title}
          onChangeText={setTitle}
          iconName="checkbox-outline"
        />

        <GlassInput
          label="Description"
          placeholder="Task details..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={{ height: 80 }}
          iconName="document-text-outline"
        />

        <Text style={styles.modalLabel}>Priority Level</Text>
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

        <GlassButton
          title={editingTask ? 'Update Task' : 'Create Task & Schedule Reminder'}
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
  topBanner: {
    margin: 16,
    marginBottom: 10,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  filterSection: {
    paddingHorizontal: 16,
  },
  filterContainer: {
    gap: 8,
    paddingBottom: 10,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(18, 25, 42, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  filterPillActive: {
    backgroundColor: '#6366F1',
    borderColor: '#8B5CF6',
  },
  filterText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: '#94A3B8',
  },
  taskCard: {
    marginBottom: 12,
  },
  overdueTaskCard: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkBtn: {
    padding: 4,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  taskDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800',
  },
  dueDateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  actionCol: {
    gap: 6,
    alignItems: 'center',
  },
  iconBtn: {
    padding: 4,
  },
  modalLabel: {
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
});
