import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Chip, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSubscriptionStore } from '../../store/useSubscriptionStore';
import { DarkTheme, LightTheme } from '../../theme/colors';

export default function SubscriptionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? DarkTheme : LightTheme;

  const { subscriptions, deleteSubscription } = useSubscriptionStore();
  const sub = subscriptions.find((s) => s.id === id);

  if (!sub) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.textSecondary }}>Subscription not found.</Text>
      </View>
    );
  }

  const handleDelete = () => {
    deleteSubscription(sub.id);
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
              <Ionicons name="card" size={32} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={[styles.name, { color: theme.colors.text }]}>{sub.name}</Text>
              <Text style={[styles.category, { color: theme.colors.textSecondary }]}>{sub.category}</Text>
            </View>
            <Text style={[styles.amount, { color: theme.colors.text }]}>
              {sub.currency}{sub.amount.toFixed(2)}
            </Text>
          </View>

          <Divider style={{ marginVertical: 16 }} />

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Billing Cycle</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>{sub.billing_cycle.toUpperCase()}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Renewal Date</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>{sub.renewal_date}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Payment Method</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>{sub.payment_method}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Auto-Renew Status</Text>
            <Chip compact style={sub.auto_renew ? styles.activeChip : styles.inactiveChip}>
              {sub.auto_renew ? 'Auto-Renewing' : 'Manual Renewal'}
            </Chip>
          </View>

          {sub.description ? (
            <View style={{ marginTop: 12 }}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Description</Text>
              <Text style={[styles.descText, { color: theme.colors.text }]}>{sub.description}</Text>
            </View>
          ) : null}
        </Card.Content>
      </Card>

      <Button
        mode="outlined"
        onPress={handleDelete}
        icon="trash-can-outline"
        style={styles.deleteBtn}
        textColor="#EF4444"
      >
        Delete Subscription
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
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
  },
  category: {
    fontSize: 13,
    marginTop: 2,
  },
  amount: {
    fontSize: 22,
    fontWeight: '800',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  descText: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  activeChip: {
    backgroundColor: '#D1FAE5',
  },
  inactiveChip: {
    backgroundColor: '#F3F4F6',
  },
  deleteBtn: {
    borderRadius: 14,
    borderColor: '#FCA5A5',
  },
});
