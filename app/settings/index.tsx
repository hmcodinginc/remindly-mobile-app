import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { Card, Switch, Divider, List } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, LightTheme } from '../../theme/colors';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? DarkTheme : LightTheme;

  const [pushEnabled, setPushEnabled] = useState(true);
  const [renewalAlerts, setRenewalAlerts] = useState(true);
  const [habitReminders, setHabitReminders] = useState(true);
  const [currency, setCurrency] = useState('USD ($)');
  const [privacyMode, setPrivacyMode] = useState(false);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Notifications</Text>
      <Card style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Push Notifications</Text>
            <Text style={[styles.settingSub, { color: theme.colors.textSecondary }]}>
              Receive local reminders for tasks & habits
            </Text>
          </View>
          <Switch value={pushEnabled} onValueChange={setPushEnabled} color={theme.colors.primary} />
        </View>

        <Divider />

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Renewal Alerts</Text>
            <Text style={[styles.settingSub, { color: theme.colors.textSecondary }]}>
              Alert 3 days before subscription renewals
            </Text>
          </View>
          <Switch value={renewalAlerts} onValueChange={setRenewalAlerts} color={theme.colors.primary} />
        </View>

        <Divider />

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Daily Habit Reminders</Text>
            <Text style={[styles.settingSub, { color: theme.colors.textSecondary }]}>
              Remind to check off habits every morning
            </Text>
          </View>
          <Switch value={habitReminders} onValueChange={setHabitReminders} color={theme.colors.primary} />
        </View>
      </Card>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Preferences & Currency</Text>
      <Card style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
        <List.Item
          title="Currency"
          description={currency}
          left={(props) => <List.Icon {...props} icon="currency-usd" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          titleStyle={{ color: theme.colors.text }}
          descriptionStyle={{ color: theme.colors.textSecondary }}
        />
        <Divider />
        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Privacy Mode</Text>
            <Text style={[styles.settingSub, { color: theme.colors.textSecondary }]}>
              Hide monetary amounts on dashboard
            </Text>
          </View>
          <Switch value={privacyMode} onValueChange={setPrivacyMode} color={theme.colors.primary} />
        </View>
      </Card>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingSub: {
    fontSize: 12,
    marginTop: 2,
  },
});
