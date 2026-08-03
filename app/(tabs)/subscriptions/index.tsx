import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Searchbar, Chip, FAB, Card, Badge } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSubscriptionStore } from '../../../store/useSubscriptionStore';
import { DarkTheme, LightTheme } from '../../../theme/colors';

const CATEGORIES = ['All', 'Entertainment', 'Music', 'Developer Tools', 'Cloud Storage', 'Utilities'];

export default function SubscriptionsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? DarkTheme : LightTheme;

  const {
    subscriptions,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    getTotalMonthlySpend,
  } = useSubscriptionStore();

  const filtered = subscriptions.filter((sub) => {
    const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || sub.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalSpend = getTotalMonthlySpend();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Monthly Total Header Banner */}
      <View style={[styles.banner, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
        <View>
          <Text style={[styles.bannerLabel, { color: theme.colors.textSecondary }]}>Total Monthly Spend</Text>
          <Text style={[styles.bannerAmount, { color: theme.colors.text }]}>${totalSpend.toFixed(2)}</Text>
        </View>
        <View style={[styles.bannerBadge, { backgroundColor: theme.colors.primaryContainer }]}>
          <Text style={[styles.bannerBadgeText, { color: theme.colors.primary }]}>{subscriptions.length} Subscriptions</Text>
        </View>
      </View>

      {/* Search & Categories */}
      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Search subscriptions..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchbar, { backgroundColor: theme.colors.surface }]}
          elevation={1}
        />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const isSelected = (selectedCategory || 'All') === item;
            return (
              <Chip
                selected={isSelected}
                onPress={() => setSelectedCategory(item === 'All' ? null : item)}
                style={[
                  styles.chip,
                  isSelected && { backgroundColor: theme.colors.primaryContainer },
                ]}
                selectedColor={theme.colors.primary}
              >
                {item}
              </Chip>
            );
          }}
        />
      </View>

      {/* Subscriptions List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={48} color={theme.colors.textMuted} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No subscriptions found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/subscription/${item.id}`)}>
            <Card style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
              <Card.Content style={styles.cardContent}>
                <View style={[styles.iconBg, { backgroundColor: theme.colors.primaryContainer }]}>
                  <Ionicons name="card" size={24} color={theme.colors.primary} />
                </View>

                <View style={styles.infoCol}>
                  <Text style={[styles.subName, { color: theme.colors.text }]}>{item.name}</Text>
                  <Text style={[styles.subMeta, { color: theme.colors.textSecondary }]}>
                    {item.category} • {item.billing_cycle}
                  </Text>
                  <Text style={[styles.renewalText, { color: theme.colors.textSecondary }]}>
                    Renews: {item.renewal_date} ({item.payment_method})
                  </Text>
                </View>

                <View style={styles.priceCol}>
                  <Text style={[styles.price, { color: theme.colors.text }]}>
                    {item.currency}{item.amount.toFixed(2)}
                  </Text>
                  {item.auto_renew ? (
                    <Chip compact style={styles.autoRenewChip} textStyle={{ fontSize: 10 }}>Auto-renew</Chip>
                  ) : (
                    <Chip compact style={styles.manualChip} textStyle={{ fontSize: 10 }}>Manual</Chip>
                  )}
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
      />

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#FFF"
        onPress={() => router.push('/subscription/create')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    margin: 16,
    marginBottom: 8,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  bannerAmount: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 2,
  },
  bannerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bannerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: 16,
  },
  searchbar: {
    borderRadius: 14,
    marginBottom: 10,
  },
  categoryList: {
    paddingBottom: 8,
    gap: 8,
  },
  chip: {
    marginRight: 6,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: 12,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
    marginLeft: 12,
  },
  subName: {
    fontSize: 16,
    fontWeight: '700',
  },
  subMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  renewalText: {
    fontSize: 11,
    marginTop: 4,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  autoRenewChip: {
    backgroundColor: '#D1FAE5',
  },
  manualChip: {
    backgroundColor: '#F3F4F6',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    borderRadius: 28,
  },
});
