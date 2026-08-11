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
  { label: 'Task', value: 'task', icon: 'checkbox-outline', color: '#34D399' },
  { label: 'Subscription', value: 'subscription', icon: 'card-outline', color: '#818CF8' },
  { label: 'Payment / Bill', value: 'payment', icon: 'cash-outline', color: '#FBBF24' },
  { label: 'Appointment', value: 'appointment', icon: 'calendar-outline', color: '#60A5FA' },
  { label: 'Vehicle / Renewal', value: 'renewal', icon: 'car-outline', color: '#F87171' },
  { label: 'Birthday / Custom', value: 'custom', icon: 'gift-outline', color: '#A78BFA' },
];

const CATEGORY_OPTIONS: PickerOption[] = [
  { label: 'Entertainment', value: 'Entertainment', icon: 'tv-outline', color: '#818CF8' },
  { label: 'Bills & Utilities', value: 'Bills', icon: 'flash-outline', color: '#FBBF24' },
  { label: 'Health & Medical', value: 'Health', icon: 'heart-outline', color: '#F87171' },
  { label: 'Work & Projects', value: 'Work', icon: 'briefcase-outline', color: '#60A5FA' },
  { label: 'Personal & Family', value: 'Personal', icon: 'person-outline', color: '#34D399' },
  { label: 'Vehicle & Service', value: 'Vehicle & Service', icon: 'car-outline', color: '#FB923C' },
  { label: 'Birthdays & Events', value: 'Birthdays', icon: 'gift-outline', color: '#E879F9' },
  { label: 'Subscriptions', value: 'Subscriptions', icon: 'card-outline', color: '#818CF8' },
  { label: 'General Reminders', value: 'General', icon: 'bookmark-outline', color: '#94A3B8' },
];

const PAYMENT_OPTIONS: PickerOption[] = [
  { label: 'Credit Card (**** 4242)', value: 'Credit Card (**** 4242)', icon: 'card-outline' },
  { label: 'Debit Card', value: 'Debit Card', icon: 'card-outline' },
  { label: 'Bank Transfer / ACH', value: 'Bank Transfer', icon: 'business-outline' },
  { label: 'Cash', value: 'Cash', icon: 'cash-outline' },
  { label: 'UPI / Digital Wallet', value: 'UPI', icon: 'qr-code-outline' },
  { label: 'Apple / Google Pay', value: 'Apple / Google Pay', icon: 'phone-portrait-outline' },
];

const CYCLE_OPTIONS: PickerOption[] = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Daily', value: 'daily' },
  { label: 'One-Time Only', value: 'custom' },
];

const PRIORITY_OPTIONS: PickerOption[] = [
  { label: 'Urgent Priority', value: 'urgent', icon: 'alert-circle-outline', color: '#F87171' },
  { label: 'High Priority', value: 'high', icon: 'warning-outline', color: '#FBBF24' },
  { label: 'Medium Priority', value: 'medium', icon: 'remove-circle-outline', color: '#818CF8' },
  { label: 'Low Priority', value: 'low', icon: 'arrow-down-circle-outline', color: '#34D399' },
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
  const [paymentMethod, setPaymentMethod] = useState(editingReminder?.payment_method || 'Credit Card (**** 4242)');
  const [priority, setPriority] = useState<TaskPriority>(editingReminder?.priority || 'medium');
  const [reminderEnabled, setReminderEnabled] = useState(editingReminder?.reminder_enabled ?? true);
  const [advanceNoticeDays, setAdvanceNoticeDays] = useState(editingReminder?.advance_notice_days || 7);
  const [autoPay, setAutoPay] = useState(editingReminder?.auto_pay ?? true);
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
        payment_method: paymentMethod as any,
        priority,
        reminder_enabled: reminderEnabled,
        advance_notice_days: advanceNoticeDays,
        auto_pay: autoPay,
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
        payment_method: paymentMethod as any,
        priority,
        reminder_enabled: reminderEnabled,
        advance_notice_days: advanceNoticeDays,
        auto_pay: autoPay,
        status: 'pending',
        description: description.trim(),
      });

      // Also sync to specialized stores if Subscription or Task
      if (type === 'subscription') {
        addSubscription({
          user: 'user-1',
          name: cleanTitle,
          amount: parsedAmount,
          currency,
          billing_cycle: cycle,
          renewal_date: dueDate,
          category,
          auto_renew: autoPay,
          payment_method: paymentMethod as string,
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

      // Schedule Push Notification Alert
      if (reminderEnabled) {
        addNotification({
          user: 'user-1',
          title: `🔔 ${type.toUpperCase()} Reminder`,
          message: `"${cleanTitle}" scheduled for ${dueDate} at ${dueTime}.`,
          type: type === 'subscription' ? 'subscription_renewal' : 'task_reminder',
          is_read: false,
          target_type: 'reminder',
          deep_link: '/(tabs)/dashboard',
        });
        await scheduleLocalNotification(
          `🔔 ${cleanTitle}`,
          `Reminder due: ${dueDate} (${dueTime})`,
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
      {/* Reminder Type Pills Selector */}
      <Text style={styles.typeLabel}>Select Reminder Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
        <View style={styles.typeRow}>
          {TYPE_OPTIONS.map((t) => {
            const isSelected = type === t.value;
            return (
              <TouchableOpacity
                key={t.value}
                style={[
                  styles.typePill,
                  isSelected && { backgroundColor: 'rgba(99, 102, 241, 0.3)', borderColor: t.color },
                ]}
                onPress={() => {
                  setType(t.value);
                  if (t.value === 'subscription') setCategory('Subscriptions');
                  if (t.value === 'payment') setCategory('Bills');
                  if (t.value === 'renewal') setCategory('Vehicle & Service');
                }}
              >
                <Ionicons name={t.icon} size={16} color={isSelected ? t.color : '#94A3B8'} />
                <Text style={[styles.typePillText, isSelected && { color: '#F8FAFC', fontWeight: '700' }]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Title Field (Always shown) */}
      <GlassInput
        label="Title *"
        placeholder={
          type === 'subscription'
            ? 'Netflix, Spotify, Cloud Storage...'
            : type === 'payment'
            ? 'Rent, Electricity Bill, Credit Card...'
            : type === 'appointment'
            ? 'Doctor Checkup, Dentist, Client Meeting...'
            : type === 'renewal'
            ? 'Car Insurance, License Renewal...'
            : 'Prepare report, Birthday gift...'
        }
        value={title}
        onChangeText={setTitle}
        iconName="bookmark-outline"
      />

      {/* Category Dropdown (Always shown) */}
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
            label={type === 'subscription' || type === 'renewal' ? 'Renewal / Due Date' : 'Due Date'}
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

      {/* Amount & Currency (Relevant for Subscriptions & Payments) */}
      {(type === 'subscription' || type === 'payment') && (
        <View style={styles.flexRow}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <GlassInput
              label="Amount ($) *"
              placeholder="19.99"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              iconName="cash-outline"
            />
          </View>

          <View style={{ flex: 1, marginLeft: 6 }}>
            <GlassPicker
              label="Payment Method"
              value={paymentMethod}
              options={PAYMENT_OPTIONS}
              onSelect={setPaymentMethod}
              iconName="wallet-outline"
            />
          </View>
        </View>
      )}

      {/* Billing / Repeat Cycle (Relevant for Subscriptions & Custom) */}
      {(type === 'subscription' || type === 'custom') && (
        <GlassPicker
          label="Billing / Repeat Cycle"
          value={cycle}
          options={CYCLE_OPTIONS}
          onSelect={(v) => setCycle(v as BillingCycle)}
          iconName="repeat-outline"
        />
      )}

      {/* Priority Level (Relevant for Tasks) */}
      {type === 'task' && (
        <GlassPicker
          label="Priority Level"
          value={priority}
          options={PRIORITY_OPTIONS}
          onSelect={(v) => setPriority(v as TaskPriority)}
          iconName="alert-circle-outline"
        />
      )}

      {/* Toggle Switches */}
      <View style={styles.switchBox}>
        <View style={{ flex: 1 }}>
          <Text style={styles.switchTitle}>
            {type === 'subscription' || type === 'payment'
              ? 'Auto Pay / Auto Renew & Advance Alert'
              : 'Enable Notification Alert'}
          </Text>
          <Text style={styles.switchSubtitle}>
            {type === 'subscription'
              ? 'Send advance alert 7 days before renewal'
              : 'Trigger mobile & web notification'}
          </Text>
        </View>
        <Switch
          value={reminderEnabled}
          onValueChange={setReminderEnabled}
          trackColor={{ false: '#334155', true: '#6366F1' }}
          thumbColor={reminderEnabled ? '#A78BFA' : '#94A3B8'}
        />
      </View>

      {/* Multiline Notes Textarea without overlap */}
      <GlassInput
        label="Notes & Details"
        placeholder="Add account details, URLs, notes, or instructions..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        iconName="document-text-outline"
      />

      <GlassButton
        title={editingReminder ? 'Update Reminder' : 'Create & Schedule Reminder'}
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
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  typeScroll: {
    marginBottom: 16,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    gap: 6,
  },
  typePillText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  switchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    padding: 12,
    marginBottom: 16,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  switchSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
});
