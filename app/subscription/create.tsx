import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { TextInput, Button, Switch, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSubscriptionStore } from '../../store/useSubscriptionStore';
import { BillingCycle } from '../../types';
import { DarkTheme, LightTheme } from '../../theme/colors';

import { useNotificationStore } from '../../store/useNotificationStore';
import { scheduleSubscriptionRenewalAlert } from '../../services/notifications';

export default function CreateSubscriptionScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? DarkTheme : LightTheme;

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Entertainment');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [renewalDate, setRenewalDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
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
    });

    if (autoRenew) {
      addNotification({
        user: 'user-1',
        title: 'Subscription Renewal Alert',
        message: `${cleanName} ($${parsedAmount.toFixed(2)}) is scheduled to renew on ${renewalDate}.`,
        type: 'subscription_renewal',
        is_read: false,
      });
      await scheduleSubscriptionRenewalAlert(cleanName, renewalDate, parsedAmount);
    }

    setLoading(false);
    router.back();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <TextInput
        label="Subscription Name *"
        value={name}
        onChangeText={setName}
        mode="outlined"
        placeholder="e.g. Netflix, Spotify, AWS"
        style={styles.input}
      />

      <TextInput
        label="Amount ($) *"
        value={amount}
        onChangeText={setAmount}
        mode="outlined"
        keyboardType="decimal-pad"
        placeholder="14.99"
        style={styles.input}
      />

      <Text style={[styles.label, { color: theme.colors.text }]}>Billing Cycle</Text>
      <SegmentedButtons
        value={billingCycle}
        onValueChange={(val) => setBillingCycle(val as BillingCycle)}
        buttons={[
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly' },
          { value: 'weekly', label: 'Weekly' },
        ]}
        style={styles.segmented}
      />

      <TextInput
        label="Category"
        value={category}
        onChangeText={setCategory}
        mode="outlined"
        placeholder="Entertainment, Software, Utility"
        style={styles.input}
      />

      <TextInput
        label="Next Renewal Date (YYYY-MM-DD)"
        value={renewalDate}
        onChangeText={setRenewalDate}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Payment Method"
        value={paymentMethod}
        onChangeText={setPaymentMethod}
        mode="outlined"
        placeholder="Credit Card, PayPal, Apple Pay"
        style={styles.input}
      />

      <View style={styles.switchRow}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Auto Renew</Text>
        <Switch value={autoRenew} onValueChange={setAutoRenew} color={theme.colors.primary} />
      </View>

      <TextInput
        label="Notes / Description"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleSave}
        loading={loading}
        disabled={loading || !name || !amount}
        style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
        contentStyle={{ paddingVertical: 6 }}
      >
        Save Subscription
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  input: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  segmented: {
    marginBottom: 14,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  saveBtn: {
    borderRadius: 14,
    marginTop: 16,
  },
});
