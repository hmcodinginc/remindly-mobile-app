import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import RemindlyLogo from '../../components/RemindlyLogo';
import GlassCard from '../../components/GlassCard';
import GlassInput from '../../components/GlassInput';
import GlassButton from '../../components/GlassButton';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const { requestPasswordReset, isLoading, error, message, clearError } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleResetPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setLocalError('Please enter your registered email address.');
      return;
    }
    setLocalError(null);
    clearError();

    // Directly request password reset email dispatch
    await requestPasswordReset(trimmedEmail);
  };

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#171717" />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.logoWrapper}>
            <RemindlyLogo size={64} showBackground={false} />
          </View>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address to receive a secure password reset link in your inbox
          </Text>
        </View>

        <GlassCard style={styles.card}>
          {displayError && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          )}

          {message && (
            <View style={styles.messageBox}>
              <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
              <Text style={styles.messageText}>{message}</Text>
            </View>
          )}

          <GlassInput
            label="Registered Email Address"
            placeholder="name@example.com"
            value={email}
            onChangeText={(t) => {
              setLocalError(null);
              clearError();
              setEmail(t);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            iconName="mail-outline"
          />

          <GlassButton
            title="Send Reset Password Link"
            onPress={handleResetPassword}
            loading={isLoading}
            variant="primary"
            style={styles.resetBtn}
          />

          <GlassButton
            title="Back to Sign In"
            onPress={() => router.push('/(auth)/login')}
            variant="ghost"
            style={{ marginTop: 10 }}
          />
        </GlassCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    maxWidth: 460,
    width: '100%',
    alignSelf: 'center',
  },
  backBtn: {
    marginBottom: 16,
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F7F8FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoWrapper: {
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#171717',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    flex: 1,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    gap: 8,
  },
  messageText: {
    color: '#15803D',
    fontSize: 13,
    flex: 1,
  },
  resetBtn: {
    marginTop: 6,
  },
});
