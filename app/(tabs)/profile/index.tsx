import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/useAuthStore';
import GlassCard from '../../../components/GlassCard';
import GlassModal from '../../../components/GlassModal';
import GlassInput from '../../../components/GlassInput';
import GlassButton from '../../../components/GlassButton';
import { confirmAction } from '../../../utils/confirmDelete';
import { openRealEmailApp } from '../../../utils/emailDispatcher';
import { formatCleanName } from '../../../utils/formatName';

export default function ProfileScreen() {
  const router = useRouter();
  const {
    user,
    settings,
    logout,
    sendEmailVerification,
    changePassword,
    updateNotificationPreferences,
    message,
    clearMessage,
  } = useAuthStore();

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const prefs = settings.notification_preferences;

  const handleVerifyEmail = async () => {
    setEmailModalVisible(true);
  };

  const handleOpenMailClient = async () => {
    if (user?.email) {
      await openRealEmailApp(
        user.email,
        'Remindly Account Verification Link',
        `Hello ${user.name || 'Remindly User'},\n\nClick the link below to verify your Remindly account:\nhttps://remindly.app/verify?email=${encodeURIComponent(user.email)}`
      );
    }
    await sendEmailVerification();
    setEmailModalVisible(false);
  };

  const handleInstantVerify = async () => {
    await sendEmailVerification();
    setEmailModalVisible(false);
  };

  const handleChangePasswordSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters.');
      return;
    }
    await changePassword(oldPassword, newPassword);
    setPasswordModalVisible(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const displayName = formatCleanName(user?.name, user?.email);
  const userInitials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Toast Message */}
      {message && (
        <GlassCard style={styles.messageCard}>
          <View style={styles.messageRow}>
            <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
            <Text style={styles.messageText}>{message}</Text>
            <TouchableOpacity onPress={clearMessage}>
              <Ionicons name="close" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </GlassCard>
      )}

      {/* User Profile Card */}
      <GlassCard style={styles.profileCard}>
        <View style={styles.profileRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{userInitials}</Text>
          </View>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@remindly.app'}</Text>
          </View>
        </View>
      </GlassCard>

      {/* Notification Preferences */}
      <Text style={styles.sectionTitle}>Notification Preferences</Text>
      <GlassCard style={styles.menuCard}>
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Push & Local Notifications</Text>
            <Text style={styles.toggleSubtext}>Enable mobile alerts</Text>
          </View>
          <Switch
            value={prefs.push_enabled}
            onValueChange={(val) => updateNotificationPreferences({ push_enabled: val })}
            trackColor={{ false: '#E5E7EB', true: '#5B5CE2' }}
            thumbColor={prefs.push_enabled ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Subscription Advance Alerts</Text>
            <Text style={styles.toggleSubtext}>Alert prior to subscription renewals</Text>
          </View>
          <Switch
            value={prefs.one_week_renewal_alerts}
            onValueChange={(val) => updateNotificationPreferences({ one_week_renewal_alerts: val })}
            trackColor={{ false: '#E5E7EB', true: '#5B5CE2' }}
            thumbColor={prefs.one_week_renewal_alerts ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Overdue Task Warnings</Text>
            <Text style={styles.toggleSubtext}>Receive alerts for past due tasks</Text>
          </View>
          <Switch
            value={prefs.overdue_alerts}
            onValueChange={(val) => updateNotificationPreferences({ overdue_alerts: val })}
            trackColor={{ false: '#E5E7EB', true: '#5B5CE2' }}
            thumbColor={prefs.overdue_alerts ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>
      </GlassCard>

      {/* Account Security Section */}
      <Text style={styles.sectionTitle}>Security & Account</Text>
      <GlassCard style={styles.menuCard}>
        <TouchableOpacity style={styles.menuItem} onPress={() => setPasswordModalVisible(true)}>
          <View style={styles.menuIconBg}>
            <Ionicons name="key-outline" size={18} color="#5B5CE2" />
          </View>
          <Text style={styles.menuItemText}>Change Password</Text>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/analytics' as any)}>
          <View style={styles.menuIconBg}>
            <Ionicons name="bar-chart-outline" size={18} color="#5B5CE2" />
          </View>
          <Text style={styles.menuItemText}>Spending & Task Reports</Text>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </GlassCard>

      {/* Sign Out Button */}
      <GlassButton
        title="Sign Out"
        onPress={handleLogout}
        variant="danger"
        icon="log-out-outline"
        style={styles.logoutBtn}
      />


      {/* Change Password Modal */}
      <GlassModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
        title="Change Password"
      >
        <GlassInput
          label="Current Password"
          placeholder="••••••••"
          value={oldPassword}
          onChangeText={setOldPassword}
          secureTextEntry
          iconName="lock-closed-outline"
        />

        <GlassInput
          label="New Password (min 8 chars)"
          placeholder="••••••••"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          iconName="key-outline"
        />

        <GlassInput
          label="Confirm New Password"
          placeholder="••••••••"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          iconName="shield-checkmark-outline"
        />

        <GlassButton
          title="Update Password"
          onPress={handleChangePasswordSubmit}
          variant="primary"
          style={{ marginTop: 8 }}
        />
      </GlassModal>

      {/* Email Verification Modal */}
      <GlassModal
        visible={emailModalVisible}
        onClose={() => setEmailModalVisible(false)}
        title="Email Verification"
      >
        <Text style={{ color: '#6B7280', fontSize: 13, marginBottom: 14, lineHeight: 18 }}>
          Dispatch a verification email to <Text style={{ color: '#171717', fontWeight: '600' }}>{user?.email}</Text>.
        </Text>

        <GlassButton
          title="Open Gmail / Mail App"
          onPress={handleOpenMailClient}
          variant="primary"
          icon="mail-outline"
          style={{ marginBottom: 10 }}
        />

        <GlassButton
          title="Verify Account Directly"
          onPress={handleInstantVerify}
          variant="secondary"
          icon="checkmark-circle-outline"
        />
      </GlassModal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    width: '100%',
  },
  messageCard: {
    marginBottom: 14,
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageText: {
    color: '#15803D',
    fontSize: 13,
    flex: 1,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5B5CE2',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#171717',
  },
  userEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
  },
  badgeGreen: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  badgeAmber: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE047',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#171717',
    marginBottom: 8,
    marginTop: 8,
  },
  menuCard: {
    marginBottom: 16,
    paddingVertical: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#171717',
  },
  toggleSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#171717',
  },
  logoutBtn: {
    marginTop: 4,
    marginBottom: 16,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9CA3AF',
  },
});
