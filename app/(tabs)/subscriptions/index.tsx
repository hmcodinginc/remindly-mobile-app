import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSubscriptionStore } from '../../../store/useSubscriptionStore';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { scheduleOneWeekRenewalAlert } from '../../../services/notifications';
import { Subscription, BillingCycle } from '../../../types';
import GlassCard from '../../../components/GlassCard';
import GlassModal from '../../../components/GlassModal';
import GlassInput from '../../../components/GlassInput';
import GlassButton from '../../../components/GlassButton';
import GlassPicker from '../../../components/GlassPicker';
import GlassDatePicker from '../../../components/GlassDatePicker';
import { confirmDelete } from '../../../utils/confirmDelete';

const CATEGORIES = ['All', 'Entertainment', 'Music', 'Developer Tools', 'Cloud Storage', 'Utilities'];

const ALERT_TIMING_OPTIONS = [
  { label: '1 Day Before Renewal', value: '1' },
  { label: '3 Days Before Renewal', value: '3' },
  { label: '1 Week (7 Days) Before', value: '7' },
  { label: '14 Days Before Renewal', value: '14' },
  { label: '20 Days Before Renewal', value: '20' },
  { label: '1 Month (30 Days) Before', value: '30' },
  { label: 'On Renewal Date', value: '0' },
];

export default function SubscriptionsScreen() {
  const {
    subscriptions,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    getTotalMonthlySpend,
    addSubscription,
    updateSubscription,
    deleteSubscription,
  } = useSubscriptionStore();

  const addNotification = useNotificationStore((state) => state.addNotification);

  // Modal State for Create / Edit
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('$');
  const [category, setCategory] = useState('Entertainment');
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [renewalDate, setRenewalDate] = useState('2026-08-25');
  const [alertNoticeDays, setAlertNoticeDays] = useState('7');

  const openCreateModal = () => {
    setEditingSub(null);
    setName('');
    setAmount('');
    setCurrency('$');
    setCategory('Entertainment');
    setCycle('monthly');
    setRenewalDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setAlertNoticeDays('7');
    setModalVisible(true);
  };

  const openEditModal = (sub: Subscription) => {
    setEditingSub(sub);
    setName(sub.name);
    setAmount(sub.amount.toString());
    setCurrency(sub.currency);
    setCategory(sub.category);
    setCycle(sub.billing_cycle);
    setRenewalDate(sub.renewal_date);
    setAlertNoticeDays(sub.reminder_days_before?.toString() || '7');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name || !amount) return;
    const parsedAmount = parseFloat(amount) || 0;
    const noticeDays = parseInt(alertNoticeDays) || 7;

    if (editingSub) {
      await updateSubscription(editingSub.id, {
        name: name.trim(),
        amount: parsedAmount,
        currency,
        category,
        billing_cycle: cycle,
        renewal_date: renewalDate,
        reminder_days_before: noticeDays,
      });
    } else {
      await addSubscription({
        user: 'user-1',
        name: name.trim(),
        amount: parsedAmount,
        currency,
        billing_cycle: cycle,
        renewal_date: renewalDate,
        category,
        auto_renew: true,
        payment_method: `${noticeDays} Days Notice`,
        status: 'active',
        reminder_days_before: noticeDays,
      });

      await scheduleOneWeekRenewalAlert('sub-new', name, renewalDate, parsedAmount);
      addNotification({
        user: 'user-1',
        title: '📅 Advance Renewal Alert Scheduled',
        message: `Set ${noticeDays}-day advance alert for ${name} ($${parsedAmount.toFixed(2)}) due ${renewalDate}.`,
        type: 'subscription_renewal',
        is_read: false,
        target_type: 'subscription',
        deep_link: '/(tabs)/subscriptions',
      });
    }

    setModalVisible(false);
  };

  const handleDelete = (id: string, name: string) => {
    confirmDelete(
      'Delete Subscription',
      `Are you sure you want to delete ${name}?`,
      async () => {
        await deleteSubscription(id);
      }
    );
  };

  const triggerTestAlert = async (sub: Subscription) => {
    const noticeDays = sub.reminder_days_before || 7;
    await scheduleOneWeekRenewalAlert(sub.id, sub.name, sub.renewal_date, sub.amount);
    addNotification({
      user: 'user-1',
      title: '📅 Renewal Advance Alert',
      message: `${sub.name} ($${sub.amount.toFixed(2)}) is renewing in ${noticeDays} days on ${sub.renewal_date}.`,
      type: 'subscription_renewal',
      is_read: false,
      target_type: 'subscription',
      target_id: sub.id,
      deep_link: '/(tabs)/subscriptions',
    });
  };

  const filtered = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || selectedCategory === 'All' || sub.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalSpend = getTotalMonthlySpend();

  return (
    <View style={styles.container}>
      {/* Spending Summary Banner */}
      <GlassCard style={styles.banner}>
        <View style={styles.bannerRow}>
          <View>
            <Text style={styles.bannerLabel}>Total Monthly Subscriptions</Text>
            <Text style={styles.bannerAmount}>${totalSpend.toFixed(2)}</Text>
          </View>
          <GlassButton
            title="+ Add Subscription"
            onPress={openCreateModal}
            variant="primary"
            icon="add"
          />
        </View>
      </GlassCard>

      {/* Search Input & Category Pills */}
      <View style={styles.filterSection}>
        <GlassInput
          placeholder="Search subscriptions or categories..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          iconName="search-outline"
          rightIcon={searchQuery ? 'close-circle' : undefined}
          onRightIconPress={() => setSearchQuery('')}
        />

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryContainer}
          renderItem={({ item }) => {
            const isSelected = (selectedCategory || 'All') === item;
            return (
              <TouchableOpacity
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillActive,
                ]}
                onPress={() => setSelectedCategory(item === 'All' ? null : item)}
              >
                <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Subscription Cards List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <GlassCard style={styles.emptyCard}>
            <Ionicons name="card-outline" size={40} color="#9CA3AF" />
            <Text style={styles.emptyText}>No subscriptions found</Text>
          </GlassCard>
        }
        renderItem={({ item }) => {
          const alertDays = item.reminder_days_before || 7;
          return (
            <GlassCard style={styles.subCard}>
              <View style={styles.cardHeader}>
                <View style={styles.iconBg}>
                  <Ionicons name="card" size={22} color="#5B5CE2" />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.subName}>{item.name}</Text>
                  <Text style={styles.subCategory}>
                    {item.category} • {item.billing_cycle.toUpperCase()}
                  </Text>
                  <Text style={styles.renewalText}>
                    Renews: {item.renewal_date} • Alert: {alertDays} days prior
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.subPrice}>
                    {item.currency}{item.amount.toFixed(2)}
                  </Text>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => triggerTestAlert(item)}
                    >
                      <Ionicons name="notifications-outline" size={18} color="#D97706" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => openEditModal(item)}
                    >
                      <Ionicons name="pencil" size={18} color="#5B5CE2" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => handleDelete(item.id, item.name)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
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
        title={editingSub ? 'Edit Subscription' : 'New Subscription'}
      >
        <GlassInput
          label="Subscription Name *"
          placeholder="Netflix, Spotify, Cloud Storage..."
          value={name}
          onChangeText={setName}
          iconName="card-outline"
        />

        <GlassInput
          label="Amount ($) *"
          placeholder="14.99"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          iconName="cash-outline"
        />

        <GlassPicker
          label="Billing Cycle"
          value={cycle}
          options={[
            { label: 'Monthly', value: 'monthly' },
            { label: 'Yearly', value: 'yearly' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Quarterly', value: 'quarterly' },
          ]}
          onSelect={(v) => setCycle(v as BillingCycle)}
          iconName="repeat-outline"
        />

        <GlassPicker
          label="Category"
          value={category}
          options={[
            { label: 'Entertainment', value: 'Entertainment', icon: 'tv-outline' },
            { label: 'Music', value: 'Music', icon: 'musical-notes-outline' },
            { label: 'Developer Tools', value: 'Developer Tools', icon: 'code-slash-outline' },
            { label: 'Cloud Storage', value: 'Cloud Storage', icon: 'cloud-outline' },
            { label: 'Utilities', value: 'Utilities', icon: 'flash-outline' },
          ]}
          onSelect={setCategory}
          iconName="folder-outline"
        />

        <GlassDatePicker
          label="Next Renewal Date"
          value={renewalDate}
          onSelect={setRenewalDate}
        />

        <GlassPicker
          label="Send Alert Notice"
          value={alertNoticeDays}
          options={ALERT_TIMING_OPTIONS}
          onSelect={setAlertNoticeDays}
          iconName="notifications-outline"
        />

        <GlassButton
          title={editingSub ? 'Update Subscription' : 'Create Subscription'}
          onPress={handleSave}
          variant="primary"
          style={{ marginTop: 10 }}
        />
      </GlassModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  banner: {
    margin: 16,
    marginBottom: 10,
    backgroundColor: '#F7F8FA',
    borderColor: '#E5E7EB',
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  bannerAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#171717',
    marginTop: 2,
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  categoryContainer: {
    gap: 8,
    paddingBottom: 10,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryPillActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#5B5CE2',
  },
  categoryText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryTextActive: {
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
    fontSize: 13,
    color: '#6B7280',
  },
  subCard: {
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#171717',
  },
  subCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  renewalText: {
    fontSize: 11,
    color: '#5B5CE2',
    marginTop: 3,
    fontWeight: '500',
  },
  subPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5B5CE2',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  actionIconBtn: {
    padding: 4,
  },
});
