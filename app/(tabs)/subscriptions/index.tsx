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
import { useSubscriptionStore } from '../../../store/useSubscriptionStore';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { scheduleOneWeekRenewalAlert, scheduleSubscriptionRenewalAlert } from '../../../services/notifications';
import { Subscription, BillingCycle } from '../../../types';
import GlassCard from '../../../components/GlassCard';
import GlassModal from '../../../components/GlassModal';
import GlassInput from '../../../components/GlassInput';
import GlassButton from '../../../components/GlassButton';
import { confirmDelete } from '../../../utils/confirmDelete';

const CATEGORIES = ['All', 'Entertainment', 'Music', 'Developer Tools', 'Cloud Storage', 'Utilities'];
const CYCLES: BillingCycle[] = ['monthly', 'yearly', 'weekly', 'quarterly'];

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
  const [paymentMethod, setPaymentMethod] = useState('Credit Card (**** 4242)');

  const openCreateModal = () => {
    setEditingSub(null);
    setName('');
    setAmount('');
    setCurrency('$');
    setCategory('Entertainment');
    setCycle('monthly');
    setRenewalDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setPaymentMethod('Credit Card (**** 4242)');
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
    setPaymentMethod(sub.payment_method);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name || !amount) return;
    const parsedAmount = parseFloat(amount) || 0;

    if (editingSub) {
      await updateSubscription(editingSub.id, {
        name: name.trim(),
        amount: parsedAmount,
        currency,
        category,
        billing_cycle: cycle,
        renewal_date: renewalDate,
        payment_method: paymentMethod,
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
        payment_method: paymentMethod,
        status: 'active',
        reminder_days_before: 7,
      });

      // Schedule 1-week prior notification
      await scheduleOneWeekRenewalAlert('sub-new', name, renewalDate, parsedAmount);
      addNotification({
        user: 'user-1',
        title: '📅 1 Week Advance Renewal Scheduled',
        message: `Set 7-day advance alert for ${name} ($${parsedAmount.toFixed(2)}) due ${renewalDate}.`,
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
    await scheduleOneWeekRenewalAlert(sub.id, sub.name, sub.renewal_date, sub.amount);
    addNotification({
      user: 'user-1',
      title: '📅 1 Week Advance Renewal Alert',
      message: `${sub.name} ($${sub.amount.toFixed(2)}) is renewing in 7 days on ${sub.renewal_date}.`,
      type: 'subscription_renewal',
      is_read: false,
      target_type: 'subscription',
      target_id: sub.id,
      deep_link: '/(tabs)/subscriptions',
    });
    Alert.alert('Alert Triggered', `1-week renewal reminder sent for ${sub.name}!`);
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
      {/* Top Spending Summary Banner */}
      <GlassCard glow style={styles.banner}>
        <View style={styles.bannerRow}>
          <View>
            <Text style={styles.bannerLabel}>Total Monthly Spend</Text>
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
            <Ionicons name="card-outline" size={48} color="#64748B" />
            <Text style={styles.emptyText}>No subscriptions found</Text>
          </GlassCard>
        }
        renderItem={({ item }) => (
          <GlassCard style={styles.subCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBg}>
                <Ionicons name="card" size={24} color="#818CF8" />
              </View>

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.subName}>{item.name}</Text>
                <Text style={styles.subCategory}>
                  {item.category} • {item.billing_cycle.toUpperCase()}
                </Text>
                <Text style={styles.renewalText}>
                  Renews: {item.renewal_date} ({item.payment_method})
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
                    <Ionicons name="notifications-outline" size={18} color="#FBBF24" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => openEditModal(item)}
                  >
                    <Ionicons name="pencil" size={18} color="#818CF8" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => handleDelete(item.id, item.name)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#F87171" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </GlassCard>
        )}
      />

      {/* Create / Edit Modal */}
      <GlassModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editingSub ? 'Edit Subscription' : 'New Subscription'}
      >
        <GlassInput
          label="Subscription Name"
          placeholder="Netflix, Spotify, GitHub..."
          value={name}
          onChangeText={setName}
          iconName="card-outline"
        />

        <GlassInput
          label="Amount ($)"
          placeholder="19.99"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          iconName="cash-outline"
        />

        <Text style={styles.modalLabel}>Billing Cycle</Text>
        <View style={styles.cycleRow}>
          {CYCLES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.cycleBtn, cycle === c && styles.cycleBtnActive]}
              onPress={() => setCycle(c)}
            >
              <Text style={[styles.cycleText, cycle === c && styles.cycleTextActive]}>
                {c.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <GlassInput
          label="Category"
          placeholder="Entertainment, Music, Dev..."
          value={category}
          onChangeText={setCategory}
          iconName="folder-outline"
        />

        <GlassInput
          label="Next Renewal Date (YYYY-MM-DD)"
          placeholder="2026-08-25"
          value={renewalDate}
          onChangeText={setRenewalDate}
          iconName="calendar-outline"
        />

        <GlassInput
          label="Payment Method"
          placeholder="Credit Card, PayPal..."
          value={paymentMethod}
          onChangeText={setPaymentMethod}
          iconName="wallet-outline"
        />

        <GlassButton
          title={editingSub ? 'Update Subscription' : 'Create & Schedule 1-Wk Alert'}
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
  banner: {
    margin: 16,
    marginBottom: 10,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  bannerAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 2,
  },
  filterSection: {
    paddingHorizontal: 16,
  },
  categoryContainer: {
    gap: 8,
    paddingBottom: 10,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(18, 25, 42, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  categoryPillActive: {
    backgroundColor: '#6366F1',
    borderColor: '#8B5CF6',
  },
  categoryText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  categoryTextActive: {
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
  subCard: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  subCategory: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  renewalText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  subPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: '#818CF8',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  actionIconBtn: {
    padding: 4,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 8,
  },
  cycleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  cycleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    alignItems: 'center',
  },
  cycleBtnActive: {
    backgroundColor: '#6366F1',
    borderColor: '#8B5CF6',
  },
  cycleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  cycleTextActive: {
    color: '#FFFFFF',
  },
});
