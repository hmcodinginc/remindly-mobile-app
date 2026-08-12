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
    error,
    clearMessage,
    clearError,
  } = useAuthStore();

  // Change Password Modal state
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
        `Hello ${user.name || 'Remindly User'},\n\nClick the link below to verify your Remindly account:\nhttps://remindly.app/verify?email=${encodeURIComponent(user.email)}&code=REM-${Math.floor(100000 + Math.random() * 900000)}\n\nBest regards,\nRemindly Team`
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

  const handleLogout = () => {
    confirmAction(
      'Sign Out',
      'Are you sure you want to sign out of Remindly?',
      async () => {
        await logout();
        router.replace('/(auth)/login');
      },
      'Sign Out'
    );
  };

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : 'RM';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Messages */}
      {message && (
        <GlassCard style={styles.messageCard}>
          <View style={styles.messageRow}>
            <Ionicons name="checkmark-circle" size={20} color="#34D399" />
            <Text style={styles.messageText}>{message}</Text>
            <TouchableOpacity onPress={clearMessage}>
              <Ionicons name="close" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </GlassCard>
      )}

      {/* User Profile Glass Card */}
      <GlassCard glow style={styles.profileCard}>
        <View style={styles.profileRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{userInitials}</Text>
          </View>

          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@remindly.app'}</Text>

            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.verifiedBadge,
                  user?.emailVerified ? styles.badgeGreen : styles.badgeAmber,
                ]}
              >
                <Ionicons
                  name={user?.emailVerified ? 'checkmark-circle' : 'alert-circle'}
                  size={12}
                  color={user?.emailVerified ? '#34D399' : '#FBBF24'}
                />
                <Text
                  style={[
                    styles.badgeText,
                    user?.emailVerified ? { color: '#34D399' } : { color: '#FBBF24' },
                  ]}
                >
                  {user?.emailVerified ? 'Verified Email' : 'Unverified Email'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {!user?.emailVerified && (
          <GlassButton
            title="Send Email Verification Link"
            onPress={handleVerifyEmail}
            variant="secondary"
            icon="mail-outline"
            style={{ marginTop: 16 }}
          />
        )}
      </GlassCard>

      {/* Notification Preferences Section */}
      <Text style={styles.sectionHeaderTitle}>Notification Preferences</Text>
      <GlassCard style={styles.menuCard}>
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Push & Local Notifications</Text>
            <Text style={styles.toggleSubtext}>Enable mobile & web push alerts</Text>
          </View>
          <Switch
            value={prefs.push_enabled}
            onValueChange={(val) => updateNotificationPreferences({ push_enabled: val })}
            trackColor={{ false: '#334155', true: '#6366F1' }}
            thumbColor={prefs.push_enabled ? '#A78BFA' : '#94A3B8'}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>📅 1-Week Advance Renewal Alerts</Text>
            <Text style={styles.toggleSubtext}>Get notified 7 days prior to subscription renew</Text>
          </View>
          <Switch
            value={prefs.one_week_renewal_alerts}
            onValueChange={(val) => updateNotificationPreferences({ one_week_renewal_alerts: val })}
            trackColor={{ false: '#334155', true: '#6366F1' }}
            thumbColor={prefs.one_week_renewal_alerts ? '#A78BFA' : '#94A3B8'}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>⚠️ Overdue Task Warnings</Text>
            <Text style={styles.toggleSubtext}>Receive alerts for past due tasks</Text>
          </View>
          <Switch
            value={prefs.overdue_alerts}
            onValueChange={(val) => updateNotificationPreferences({ overdue_alerts: val })}
            trackColor={{ false: '#334155', true: '#6366F1' }}
            thumbColor={prefs.overdue_alerts ? '#A78BFA' : '#94A3B8'}
          />
        </View>
      </GlassCard>

      {/* Account Security & Password Section */}
      <Text style={styles.sectionHeaderTitle}>Security & Account</Text>
      <GlassCard style={styles.menuCard}>
        <TouchableOpacity style={styles.menuItem} onPress={() => setPasswordModalVisible(true)}>
          <View style={[styles.menuIconBg, { backgroundColor: 'rgba(99, 102, 241, 0.2)' }]}>
            <Ionicons name="key-outline" size={20} color="#818CF8" />
          </View>
          <Text style={styles.menuItemText}>Change Password</Text>
          <Ionicons name="chevron-forward" size={18} color="#64748B" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/analytics' as any)}>
          <View style={[styles.menuIconBg, { backgroundColor: 'rgba(167, 139, 250, 0.2)' }]}>
            <Ionicons name="bar-chart-outline" size={20} color="#A78BFA" />
          </View>
          <Text style={styles.menuItemText}>Spending & Task Analytics Reports</Text>
          <Ionicons name="chevron-forward" size={18} color="#64748B" />
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

      {/* Email Dispatcher Modal */}
      <GlassModal
        visible={emailModalVisible}
        onClose={() => setEmailModalVisible(false)}
        title="Email Verification Link"
      >
        <Text style={{ color: '#CBD5E1', fontSize: 13, marginBottom: 14, lineHeight: 18 }}>
          Dispatch a real verification email link to <Text style={{ color: '#F8FAFC', fontWeight: '700' }}>{user?.email}</Text> or verify your account directly.
        </Text>

        <GlassButton
          title="Open Gmail / Mail Client App"
          onPress={handleOpenMailClient}
          variant="primary"
          icon="mail-outline"
          style={{ marginBottom: 10 }}
        />

        <GlassButton
          title="Verify Account Status Directly"
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
    backgroundColor: '#070A14',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  messageCard: {
    marginBottom: 16,
    borderColor: 'rgba(52, 211, 153, 0.4)',
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageText: {
    color: '#34D399',
    fontSize: 13,
    flex: 1,
  },
  profileCard: {
    marginBottom: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  userEmail: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
  },
  badgeGreen: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  badgeAmber: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 10,
    marginTop: 10,
  },
  menuCard: {
    marginBottom: 18,
    paddingVertical: 6,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  toggleSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  logoutBtn: {
    marginTop: 8,
    marginBottom: 16,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#64748B',
  },
});
