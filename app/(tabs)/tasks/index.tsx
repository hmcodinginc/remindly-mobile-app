import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTaskStore, isTaskOverdue } from '../../../store/useTaskStore';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { scheduleOverdueTaskAlert } from '../../../services/notifications';
import { Task, TaskPriority } from '../../../types';
import GlassCard from '../../../components/GlassCard';
import GlassModal from '../../../components/GlassModal';
import GlassInput from '../../../components/GlassInput';
import GlassButton from '../../../components/GlassButton';
import GlassPicker from '../../../components/GlassPicker';
import GlassDatePicker from '../../../components/GlassDatePicker';
import { PriorityColors } from '../../../theme/colors';
import { confirmDelete } from '../../../utils/confirmDelete';

const STATUS_FILTERS: Array<{ label: string; value: 'all' | 'pending' | 'overdue' | 'completed' }> = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Completed', value: 'completed' },
];

export default function TasksScreen() {
  const {
    getUserTasks,
    searchQuery,
    selectedStatus,
    setSearchQuery,
    setSelectedStatus,
    getOverdueTasksCount,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
  } = useTaskStore();

  const tasks = getUserTasks();

  const addNotification = useNotificationStore((state) => state.addNotification);

  // Expanded Accordion State
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('2026-08-20');

  const router = useRouter();
  const isDemoMode = useAuthStore((state) => state.isDemoMode);
  const [demoNoticeVisible, setDemoNoticeVisible] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleProtectedAction = (action: () => void) => {
    if (isDemoMode) {
      setDemoNoticeVisible(true);
      return;
    }
    action();
  };

  const openCreateModal = () => {
    handleProtectedAction(() => {
      setEditingTask(null);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
      setModalVisible(true);
    });
  };

  const openEditModal = (t: Task) => {
    handleProtectedAction(() => {
      setEditingTask(t);
      setTitle(t.title);
      setDescription(t.description || '');
      setPriority(t.priority);
      setDueDate(t.due_date);
      setModalVisible(true);
    });
  };

  const handleSave = async () => {
    if (!title.trim()) return;

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
        labels: ['General'],
        reminder: true,
        reminder_time: '09:00 AM',
      });

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
    handleProtectedAction(() => {
      confirmDelete('Delete Task', `Are you sure you want to delete "${taskTitle}"?`, async () => {
        await deleteTask(id);
      });
    });
  };

  const triggerOverdueAlert = async (task: Task) => {
    await scheduleOverdueTaskAlert(task.id, task.title);
    addNotification({
      user: 'user-1',
      title: '⚠️ Overdue Task Alert',
      message: `Task "${task.title}" is overdue!`,
      type: 'overdue_task',
      is_read: false,
      target_type: 'task',
      target_id: task.id,
      deep_link: '/(tabs)/tasks',
    });
  };

  const overdueCount = getOverdueTasksCount();

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const overdue = isTaskOverdue(task);

    let matchesStatus = true;
    if (selectedStatus === 'pending') matchesStatus = task.status !== 'completed' && !overdue;
    if (selectedStatus === 'overdue') matchesStatus = overdue;
    if (selectedStatus === 'completed') matchesStatus = task.status === 'completed';

    return matchesSearch && matchesStatus;
  });

  return (
    <View style={styles.container}>
      {/* Overdue Warning Banner */}
      {overdueCount > 0 && (
        <GlassCard style={styles.overdueBanner}>
          <View style={styles.bannerRow}>
            <Ionicons name="warning-outline" size={20} color="#DC2626" />
            <Text style={styles.overdueText}>
              <Text style={{ fontWeight: '700' }}>{overdueCount} task(s)</Text> overdue!
            </Text>
          </View>
        </GlassCard>
      )}

      {/* Header Bar - Perfectly Aligned Search & Add Task Button */}
      <View style={styles.headerBar}>
        <View style={styles.searchInputWrapper}>
          <GlassInput
            placeholder="Search reminders & tasks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            iconName="search-outline"
            rightIcon={searchQuery ? 'close-circle' : undefined}
            onRightIconPress={() => setSearchQuery('')}
            containerStyle={{ marginBottom: 0 }}
          />
        </View>
        <GlassButton
          title="+ Task"
          onPress={openCreateModal}
          variant="primary"
          style={styles.addTaskBtn}
        />
      </View>

      {/* Status Filter Chips */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((f) => {
          const isSelected = selectedStatus === f.value;
          return (
            <TouchableOpacity
              key={f.value}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
              onPress={() => setSelectedStatus(f.value)}
            >
              <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                {f.label} {f.value === 'overdue' && overdueCount > 0 ? `(${overdueCount})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Task List with Expandable Description Accordion */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <GlassCard style={styles.emptyCard}>
            <Ionicons name="checkbox-outline" size={40} color="#9CA3AF" />
            <Text style={styles.emptyText}>No tasks found</Text>
          </GlassCard>
        }
        renderItem={({ item }) => {
          const overdue = isTaskOverdue(item);
          const pStyle = PriorityColors[item.priority];
          const isExpanded = !!expandedIds[item.id];

          return (
            <GlassCard style={[styles.taskCard, overdue && styles.taskCardOverdue]}>
              <View style={styles.cardRow}>
                <TouchableOpacity onPress={() => toggleTaskStatus(item.id)} style={styles.checkBtn}>
                  <Ionicons
                    name={item.status === 'completed' ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={item.status === 'completed' ? '#16A34A' : overdue ? '#DC2626' : '#9CA3AF'}
                  />
                </TouchableOpacity>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.taskTitle, item.status === 'completed' && styles.completedTitle]}>
                    {item.title}
                  </Text>

                  <View style={styles.metaRow}>
                    <Text style={[styles.dateText, overdue && { color: '#DC2626', fontWeight: '700' }]}>
                      {overdue ? '⚠️ Overdue • ' : ''}Due: {item.due_date}
                    </Text>

                    <View style={[styles.priorityBadge, { backgroundColor: pStyle.bg, borderColor: pStyle.border }]}>
                      <Text style={[styles.priorityText, { color: pStyle.text }]}>
                        {item.priority.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Right Action Icons & Expand Dropdown Toggle */}
                <View style={styles.actionsCol}>
                  {item.description ? (
                    <TouchableOpacity style={styles.expandBtn} onPress={() => toggleExpand(item.id)}>
                      <Text style={styles.expandLabel}>Details</Text>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color="#5B5CE2"
                      />
                    </TouchableOpacity>
                  ) : null}

                  <TouchableOpacity style={styles.iconBtn} onPress={() => openEditModal(item)}>
                    <Ionicons name="pencil" size={18} color="#5B5CE2" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id, item.title)}>
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Expandable Full Description Dropdown Section */}
              {isExpanded && item.description ? (
                <View style={styles.expandedDescContainer}>
                  <View style={styles.descHeader}>
                    <Ionicons name="document-text-outline" size={16} color="#5B5CE2" />
                    <Text style={styles.descTitle}>Full Description & Details</Text>
                  </View>
                  <Text style={styles.expandedDescText}>{item.description}</Text>
                </View>
              ) : null}
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
          label="Task Title *"
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
          iconName="document-text-outline"
        />

        <GlassPicker
          label="Priority Level"
          value={priority}
          options={[
            { label: 'Urgent Priority', value: 'urgent', icon: 'alert-circle-outline', color: '#DC2626' },
            { label: 'High Priority', value: 'high', icon: 'warning-outline', color: '#D97706' },
            { label: 'Medium Priority', value: 'medium', icon: 'remove-circle-outline', color: '#4F46E5' },
            { label: 'Low Priority', value: 'low', icon: 'arrow-down-circle-outline', color: '#16A34A' },
          ]}
          onSelect={(v) => setPriority(v as TaskPriority)}
          iconName="alert-circle-outline"
        />

        <GlassDatePicker
          label="Due Date"
          value={dueDate}
          onSelect={setDueDate}
        />

        <GlassButton
          title={editingTask ? 'Update Task' : 'Create Task'}
          onPress={handleSave}
          variant="primary"
          style={{ marginTop: 10 }}
        />
      </GlassModal>

      {/* Demo Showcase Notice Modal */}
      <GlassModal
        visible={demoNoticeVisible}
        onClose={() => setDemoNoticeVisible(false)}
        title="Demo Showcase Mode"
      >
        <View style={{ alignItems: 'center', paddingVertical: 10 }}>
          <Ionicons name="lock-closed-outline" size={40} color="#5B5CE2" style={{ marginBottom: 10 }} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#171717', marginBottom: 6 }}>
            Read-Only Product Preview
          </Text>
          <Text style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 18, lineHeight: 18 }}>
            Explore Demo Mode is a product showcase. To add, edit, or delete tasks, please sign in or create your free account!
          </Text>

          <GlassButton
            title="Sign In to Your Account"
            onPress={() => {
              setDemoNoticeVisible(false);
              router.push('/(auth)/login');
            }}
            variant="primary"
            style={{ width: '100%', marginBottom: 8 }}
          />

          <GlassButton
            title="Create Free Account"
            onPress={() => {
              setDemoNoticeVisible(false);
              router.push('/(auth)/register');
            }}
            variant="secondary"
            style={{ width: '100%' }}
          />
        </View>
      </GlassModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  overdueBanner: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overdueText: {
    color: '#DC2626',
    fontSize: 13,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 10,
  },
  searchInputWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  addTaskBtn: {
    height: 48,
    paddingHorizontal: 18,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#5B5CE2',
  },
  filterChipText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#5B5CE2',
    fontWeight: '700',
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
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  taskCard: {
    marginBottom: 12,
    padding: 14,
  },
  taskCardOverdue: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkBtn: {
    padding: 4,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#171717',
    letterSpacing: -0.2,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 5,
  },
  dateText: {
    fontSize: 12.5,
    color: '#4B5563',
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  actionsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 10,
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 2,
  },
  expandLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5B5CE2',
  },
  iconBtn: {
    padding: 5,
  },
  expandedDescContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
  },
  descHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  descTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5B5CE2',
  },
  expandedDescText: {
    fontSize: 13.5,
    color: '#374151',
    lineHeight: 20,
  },
});
