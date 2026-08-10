import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSubscriptionStore } from '../../store/useSubscriptionStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { scheduleOneWeekRenewalAlert } from '../../services/notifications';
import { BillingCycle } from '../../types';
import GlassCard from '../../components/GlassCard';
import GlassInput from '../../components/GlassInput';
import GlassButton from '../../components/GlassButton';

const CYCLES: BillingCycle[] = ['monthly', 'yearly', 'weekly', 'quarterly'];

export default function CreateSubscriptionScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Entertainment');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [renewalDate, setRenewalDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState('Credit Card (**** 4242)');
  const [autoRenew, setAutoRenew] = useState(true);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const addSubscription = useSubscriptionStore((state) => state.addSubscription);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const handleSave = async () => {
    if (!name || !amount) return;
    setLoading(true);
    const cleanName = name.trim();
    const parsedAmount = parseFloat(amount) || 0;

    await addSubscription({
      user: 'user-1',
      name: cleanName,
      amount: parsedAmount,
      currency: '$',
      billing_cycle: billingCycle,
      renewal_date: renewalDate,
      category,
      auto_renew: autoRenew,
      payment_method: paymentMethod,
      status: 'active',
      description: description.trim(),
      reminder_days_before: 7,
    });

    if (autoRenew) {
      addNotification({
        user: 'user-1',
        title: '📅 1-Week Renewal Alert Scheduled',
        message: `${cleanName} ($${parsedAmount.toFixed(2)}) will renew on ${renewalDate}. 7-day alert active.`,
        type: 'subscription_renewal',
        is_read: false,
        target_type: 'subscription',
        deep_link: '/(tabs)/subscriptions',
      });
      await scheduleOneWeekRenewalAlert('sub-new', cleanName, renewalDate, parsedAmount);
    }

    setLoading(false);
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <GlassCard glow style={styles.card}>
        <GlassInput
          label="Subscription Name *"
          placeholder="Netflix, Spotify, AWS..."
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

        <Text style={styles.label}>Billing Cycle</Text>
        <View style={styles.cycleRow}>
          {CYCLES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.cycleBtn, billingCycle === c && styles.cycleBtnActive]}
              onPress={() => setBillingCycle(c)}
            >
              <Text style={[styles.cycleText, billingCycle === c && styles.cycleTextActive]}>
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

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Auto Renew & 1-Week Alert</Text>
            <Text style={styles.switchSublabel}>Automatically alert 7 days before renewal</Text>
          </View>
          <Switch
            value={autoRenew}
            onValueChange={setAutoRenew}
            trackColor={{ false: '#334155', true: '#6366F1' }}
            thumbColor={autoRenew ? '#A78BFA' : '#94A3B8'}
          />
        </View>

        <GlassInput
          label="Notes / Description"
          placeholder="Plan tier or details..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={{ height: 80 }}
          iconName="document-text-outline"
        />

        <GlassButton
          title="Save Subscription & Set Reminders"
          onPress={handleSave}
          loading={loading}
          disabled={loading || !name || !amount}
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
  label: {
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 14,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  switchSublabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
});
