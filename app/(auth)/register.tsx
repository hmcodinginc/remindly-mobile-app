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

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  const { register, isLoading, error, clearError } = useAuthStore();

  const handleRegister = async () => {
    setLocalError(null);
    clearError();

    if (!email || !password || !confirmPassword) {
      setLocalError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long.');
      return;
    }

    const success = await register(email.trim(), password, confirmPassword, name.trim());
    if (success) {
      router.replace('/(tabs)/dashboard');
    }
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
          <View style={styles.logoWrapper}>
            <RemindlyLogo size={70} />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join Remindly to manage subscriptions & track daily habits
          </Text>
        </View>

        <GlassCard glow style={styles.card}>
          {displayError && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#F87171" />
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          )}

          <GlassInput
            label="Full Name"
            placeholder="Alex Johnson"
            value={name}
            onChangeText={setName}
            iconName="person-outline"
          />

          <GlassInput
            label="Email Address"
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

          <GlassInput
            label="Password (min 8 chars)"
            placeholder="••••••••"
            value={password}
            onChangeText={(t) => {
              setLocalError(null);
              clearError();
              setPassword(t);
            }}
            secureTextEntry={secureText}
            iconName="lock-closed-outline"
            rightIcon={secureText ? 'eye-outline' : 'eye-off-outline'}
            onRightIconPress={() => setSecureText(!secureText)}
          />

          <GlassInput
            label="Confirm Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={(t) => {
              setLocalError(null);
              clearError();
              setConfirmPassword(t);
            }}
            secureTextEntry={secureText}
            iconName="shield-checkmark-outline"
          />

          <GlassButton
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            variant="primary"
            style={styles.registerBtn}
          />
        </GlassCard>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 16,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrapper: {
    marginBottom: 12,
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
    textAlign: 'center',
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
  registerBtn: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  signInText: {
    fontSize: 14,
    color: '#818CF8',
    fontWeight: '700',
  },
});
