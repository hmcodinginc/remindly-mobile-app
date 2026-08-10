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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);

  const { login, loginAsDemo, isLoading, error, clearError, message } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) return;
    const success = await login(email.trim(), password);
    if (success) {
      router.replace('/(tabs)/dashboard');
    }
  };

  const handleDemo = () => {
    loginAsDemo();
    router.replace('/(tabs)/dashboard');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header Branding */}
        <View style={styles.header}>
          <View style={styles.logoWrapper}>
            <RemindlyLogo size={88} />
          </View>
          <Text style={styles.title}>Remindly</Text>
          <Text style={styles.subtitle}>
            Subscriptions, Tasks & Habit Tracker
          </Text>
        </View>

        {/* Glass Card Form */}
        <GlassCard glow style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back</Text>
          <Text style={styles.cardSubtitle}>
            Sign in to sync your subscriptions, tasks & habits
          </Text>

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#F87171" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {message && (
            <View style={styles.messageBox}>
              <Ionicons name="checkmark-circle" size={18} color="#34D399" />
              <Text style={styles.messageText}>{message}</Text>
            </View>
          )}

          <GlassInput
            label="Email Address"
            placeholder="name@example.com"
            value={email}
            onChangeText={(t) => {
              clearError();
              setEmail(t);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            iconName="mail-outline"
          />

          <GlassInput
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={(t) => {
              clearError();
              setPassword(t);
            }}
            secureTextEntry={secureText}
            iconName="lock-closed-outline"
            rightIcon={secureText ? 'eye-outline' : 'eye-off-outline'}
            onRightIconPress={() => setSecureText(!secureText)}
          />

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <GlassButton
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            variant="primary"
            style={styles.loginBtn}
          />

          <GlassButton
            title="Explore Demo Mode"
            onPress={handleDemo}
            variant="secondary"
            icon="sparkles-outline"
          />
        </GlassCard>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.signUpText}>Create Account</Text>
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
    justifyContent: 'center',
    padding: 24,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoWrapper: {
    marginBottom: 14,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  title: {
    fontSize: 32,
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
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 20,
    marginTop: 4,
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 13,
    color: '#A78BFA',
    fontWeight: '600',
  },
  loginBtn: {
    marginBottom: 12,
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
  signUpText: {
    fontSize: 14,
    color: '#818CF8',
    fontWeight: '700',
  },
});
