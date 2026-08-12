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
import GlassCard from '../../components/GlassCard';
import GlassInput from '../../components/GlassInput';
import GlassButton from '../../components/GlassButton';
import { openRealEmailApp } from '../../utils/emailDispatcher';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const { requestPasswordReset, isLoading, error, message, clearError } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleResetPassword = async () => {
    if (!email) {
      setLocalError('Please enter your registered email address.');
      return;
    }
    setLocalError(null);
    clearError();
    await requestPasswordReset(email.trim());
  };

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your account email to receive a password reset link
          </Text>
        </View>

        <GlassCard glow style={styles.card}>
          {displayError && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#F87171" />
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          )}

          {message && (
            <View style={styles.messageBox}>
              <Ionicons name="checkmark-circle" size={18} color="#34D399" />
              <Text style={styles.messageText}>{message}</Text>
            </View>
          )}

          <GlassInput
            label="Registered Email"
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
            title="Send Reset Link"
            onPress={handleResetPassword}
            loading={isLoading}
            variant="primary"
            style={styles.resetBtn}
          />

          {message && (
            <GlassButton
              title="Open Gmail / Mail App"
              onPress={() => openRealEmailApp(email, 'Remindly Password Reset Link', `Hello,\n\nReset link for ${email}:\nhttps://remindly.app/reset-password?email=${encodeURIComponent(email)}`)}
              variant="secondary"
              icon="mail-outline"
              style={{ marginTop: 10 }}
            />
          )}

          <GlassButton
            title="Back to Sign In"
            onPress={() => router.push('/(auth)/login')}
            variant="ghost"
            style={{ marginTop: 8 }}
          />
        </GlassCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A14',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  backBtn: {
    marginBottom: 20,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  card: {
    marginBottom: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#F87171',
    fontSize: 13,
    flex: 1,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  messageText: {
    color: '#34D399',
    fontSize: 13,
    flex: 1,
  },
  resetBtn: {
    marginTop: 8,
  },
});
