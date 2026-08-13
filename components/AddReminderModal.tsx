import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassModal from './GlassModal';
import GlassInput from './GlassInput';
import GlassButton from './GlassButton';
import GlassPicker, { PickerOption } from './GlassPicker';
import GlassDatePicker from './GlassDatePicker';
import GlassTimePicker from './GlassTimePicker';
import { ReminderType, TaskPriority, BillingCycle, GenericReminder } from '../types';
import { useReminderStore } from '../store/useReminderStore';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { useTaskStore } from '../store/useTaskStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { scheduleLocalNotification } from '../services/notifications';

interface AddReminderModalProps {
  visible: boolean;
  onClose: () => void;
  initialType?: ReminderType;
  editingReminder?: GenericReminder | null;
}

const TYPE_OPTIONS: { label: string; value: ReminderType; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { label: 'Task', value: 'task', icon: 'checkbox-outline', color: '#5B5CE2' },
  { label: 'Bill', value: 'payment', icon: 'receipt-outline', color: '#D97706' },
  { label: 'Appointment', value: 'appointment', icon: 'calendar-outline', color: '#2563EB' },
  { label: 'Subscription', value: 'subscription', icon: 'card-outline', color: '#7C3AED' },
  { label: 'General', value: 'custom', icon: 'bookmark-outline', color: '#059669' },
];

const CATEGORY_OPTIONS: PickerOption[] = [
  { label: 'Entertainment', value: 'Entertainment', icon: 'tv-outline' },
  { label: 'Bills & Utilities', value: 'Bills', icon: 'flash-outline' },
  { label: 'Health & Medical', value: 'Health', icon: 'heart-outline' },
  { label: 'Work & Projects', value: 'Work', icon: 'briefcase-outline' },
  { label: 'Personal & Family', value: 'Personal', icon: 'person-outline' },
  { label: 'Vehicle & Service', value: 'Vehicle & Service', icon: 'car-outline' },
  { label: 'Birthdays & Events', value: 'Birthdays', icon: 'gift-outline' },
  { label: 'Subscriptions', value: 'Subscriptions', icon: 'card-outline' },
  { label: 'General', value: 'General', icon: 'bookmark-outline' },
];

const ALERT_TIMING_OPTIONS: PickerOption[] = [
  { label: '1 Day Before', value: '1' },
  { label: '3 Days Before', value: '3' },
  { label: '1 Week (7 Days) Before', value: '7' },
  { label: '14 Days Before', value: '14' },
  { label: '20 Days Before', value: '20' },
  { label: '1 Month (30 Days) Before', value: '30' },
  { label: 'On Renewal Date', value: '0' },
];

const CYCLE_OPTIONS: PickerOption[] = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Daily', value: 'daily' },
  { label: 'One-Time Only', value: 'custom' },
];

const PRIORITY_OPTIONS: PickerOption[] = [
  { label: 'Urgent Priority', value: 'urgent', icon: 'alert-circle-outline', color: '#DC2626' },
  { label: 'High Priority', value: 'high', icon: 'warning-outline', color: '#D97706' },
  { label: 'Medium Priority', value: 'medium', icon: 'remove-circle-outline', color: '#4F46E5' },
  { label: 'Low Priority', value: 'low', icon: 'arrow-down-circle-outline', color: '#16A34A' },
];

export default function AddReminderModal({
  visible,
  onClose,
  initialType = 'task',
  editingReminder = null,
}: AddReminderModalProps) {
  const [type, setType] = useState<ReminderType>(editingReminder?.type || initialType);
  const [title, setTitle] = useState(editingReminder?.title || '');
  const [category, setCategory] = useState(editingReminder?.category || 'General');
  const [dueDate, setDueDate] = useState(
    editingReminder?.due_date || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [dueTime, setDueTime] = useState(editingReminder?.due_time || '09:00 AM');
  const [amount, setAmount] = useState(editingReminder?.amount ? editingReminder.amount.toString() : '');
  const [currency, setCurrency] = useState(editingReminder?.currency || '$');
  const [cycle, setCycle] = useState<BillingCycle>(editingReminder?.billing_cycle || 'monthly');
  const [priority, setPriority] = useState<TaskPriority>(editingReminder?.priority || 'medium');
  const [reminderEnabled, setReminderEnabled] = useState(editingReminder?.reminder_enabled ?? true);
  const [advanceNoticeDays, setAdvanceNoticeDays] = useState(editingReminder?.advance_notice_days || 7);
  const [description, setDescription] = useState(editingReminder?.description || '');

  const addReminder = useReminderStore((state) => state.addReminder);
  const updateReminder = useReminderStore((state) => state.updateReminder);
  const addSubscription = useSubscriptionStore((state) => state.addSubscription);
  const addTask = useTaskStore((state) => state.addTask);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const handleSave = async () => {
    if (!title.trim()) return;
    const cleanTitle = title.trim();
    const parsedAmount = parseFloat(amount) || 0;

    if (editingReminder) {
      updateReminder(editingReminder.id, {
        title: cleanTitle,
        type,
        category,
        due_date: dueDate,
        due_time: dueTime,
        amount: parsedAmount,
        currency,
        billing_cycle: cycle,
        priority,
        reminder_enabled: reminderEnabled,
        advance_notice_days: advanceNoticeDays,
        description: description.trim(),
      });
    } else {
      addReminder({
        user: 'user-1',
        title: cleanTitle,
        type,
        category,
        due_date: dueDate,
        due_time: dueTime,
        amount: parsedAmount,
        currency,
        billing_cycle: cycle,
        priority,
        reminder_enabled: reminderEnabled,
        advance_notice_days: advanceNoticeDays,
        status: 'pending',
        description: description.trim(),
      });

      if (type === 'subscription') {
        addSubscription({
          user: 'user-1',
          name: cleanTitle,
          amount: parsedAmount,
          currency,
          billing_cycle: cycle,
          renewal_date: dueDate,
          category,
          auto_renew: true,
          payment_method: `${advanceNoticeDays} Days Notice Alert`,
          status: 'active',
          description: description.trim(),
          reminder_days_before: advanceNoticeDays,
        });
      } else if (type === 'task') {
        addTask({
          user: 'user-1',
          title: cleanTitle,
          description: description.trim(),
          priority,
          due_date: dueDate,
          status: 'todo',
          labels: [category],
          reminder: reminderEnabled,
          reminder_time: dueTime,
        });
      }

      if (reminderEnabled) {
        addNotification({
          user: 'user-1',
          title: `🔔 ${type.toUpperCase()} Reminder`,
          message: `"${cleanTitle}" scheduled for ${dueDate}.`,
          type: type === 'subscription' ? 'subscription_renewal' : 'task_reminder',
          is_read: false,
          target_type: 'reminder',
          deep_link: '/(tabs)/dashboard',
        });
        await scheduleLocalNotification(
          `🔔 ${cleanTitle}`,
          `Reminder due: ${dueDate}`,
          { target_type: 'reminder', deep_link: '/(tabs)/dashboard' },
          5
        );
      }
    }

    onClose();
  };

  return (
    <GlassModal
      visible={visible}
      onClose={onClose}
      title={editingReminder ? 'Edit Reminder' : 'Add New Reminder'}
    >
      {/* Type Selector Pills */}
      <Text style={styles.typeLabel}>Reminder Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
        <View style={styles.typeRow}>
          {TYPE_OPTIONS.map((t) => {
            const isSelected = type === t.value;
            return (
              <TouchableOpacity
                key={t.value}
                style={[
                  styles.typePill,
                  isSelected && styles.typePillActive,
                ]}
                onPress={() => {
                  setType(t.value);
                  if (t.value === 'subscription') setCategory('Subscriptions');
                  if (t.value === 'payment') setCategory('Bills');
                }}
              >
                <Ionicons name={t.icon} size={15} color={isSelected ? '#5B5CE2' : '#6B7280'} />
                <Text style={[styles.typePillText, isSelected && styles.typePillTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Title Field */}
      <GlassInput
        label="Title *"
        placeholder={
          type === 'subscription'
            ? 'Netflix, Spotify, Cloud Storage...'
            : type === 'payment'
            ? 'Electricity Bill, Rent, Credit Card...'
            : type === 'appointment'
            ? 'Doctor Appointment, Client Meeting...'
            : 'Prepare report, Birthday...'
        }
        value={title}
        onChangeText={setTitle}
        iconName="bookmark-outline"
      />

      {/* Category Dropdown */}
      <GlassPicker
        label="Category"
        value={category}
        options={CATEGORY_OPTIONS}
        onSelect={setCategory}
        iconName="folder-outline"
      />

      {/* Date & Time Selectors */}
      <View style={styles.flexRow}>
        <View style={{ flex: 1, marginRight: 6 }}>
          <GlassDatePicker
            label={type === 'subscription' ? 'Renewal Date' : 'Due Date'}
            value={dueDate}
            onSelect={setDueDate}
          />
        </View>

        {(type === 'task' || type === 'appointment' || type === 'custom') && (
          <View style={{ flex: 1, marginLeft: 6 }}>
            <GlassTimePicker
              label="Time"
              value={dueTime}
              onSelect={setDueTime}
            />
          </View>
        )}
      </View>

      {/* Amount & Alert Timing for Subscriptions */}
      {type === 'subscription' && (
        <View style={styles.flexRow}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <GlassInput
              label="Amount ($) *"
              placeholder="14.99"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              iconName="cash-outline"
            />
          </View>

          <View style={{ flex: 1, marginLeft: 6 }}>
            <GlassPicker
              label="Send Alert Notice"
              value={advanceNoticeDays.toString()}
              options={ALERT_TIMING_OPTIONS}
              onSelect={(val) => setAdvanceNoticeDays(parseInt(val) || 7)}
              iconName="notifications-outline"
            />
          </View>
        </View>
      )}

      {/* Amount for Payments */}
      {type === 'payment' && (
        <GlassInput
          label="Bill Amount ($) *"
          placeholder="85.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          iconName="cash-outline"
        />
      )}

      {/* Billing Cycle for Subscriptions */}
      {type === 'subscription' && (
        <GlassPicker
          label="Billing Cycle"
          value={cycle}
          options={CYCLE_OPTIONS}
          onSelect={(v) => setCycle(v as BillingCycle)}
          iconName="repeat-outline"
        />
      )}

      {/* Priority Level for Tasks */}
      {type === 'task' && (
        <GlassPicker
          label="Priority Level"
          value={priority}
          options={PRIORITY_OPTIONS}
          onSelect={(v) => setPriority(v as TaskPriority)}
          iconName="alert-circle-outline"
        />
      )}

      {/* Switch Toggle */}
      <View style={styles.switchBox}>
        <View style={{ flex: 1 }}>
          <Text style={styles.switchTitle}>Enable Notifications</Text>
          <Text style={styles.switchSubtitle}>Send local alert to mobile device</Text>
        </View>
        <Switch
          value={reminderEnabled}
          onValueChange={setReminderEnabled}
          trackColor={{ false: '#E5E7EB', true: '#5B5CE2' }}
          thumbColor={reminderEnabled ? '#FFFFFF' : '#9CA3AF'}
        />
      </View>

      {/* Multiline Notes */}
      <GlassInput
        label="Notes & Details"
        placeholder="Add details, notes, or instructions..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        iconName="document-text-outline"
      />

      <GlassButton
        title={editingReminder ? 'Update Reminder' : 'Create Reminder'}
        onPress={handleSave}
        variant="primary"
        disabled={!title.trim()}
        style={{ marginTop: 10 }}
      />
    </GlassModal>
  );
}

const styles = StyleSheet.create({
  typeLabel: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  typeScroll: {
    marginBottom: 14,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  typePillActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#5B5CE2',
  },
  typePillText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  typePillTextActive: {
    color: '#5B5CE2',
    fontWeight: '700',
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  switchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 14,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#171717',
  },
  switchSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
});
