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
            <RemindlyLogo size={72} showBackground={false} />
          </View>
          <Text style={styles.title}>Remindly</Text>
          <Text style={styles.subtitle}>
            Subscriptions & Task Manager
          </Text>
        </View>

        {/* Glass Card Form */}
        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back</Text>
          <Text style={styles.cardSubtitle}>
            Sign in to manage your reminders and subscriptions
          </Text>

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {message && (
            <View style={styles.messageBox}>
              <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
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
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrapper: {
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#171717',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  card: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#171717',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 18,
    marginTop: 2,
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 18,
  },
  forgotText: {
    fontSize: 13,
    color: '#5B5CE2',
    fontWeight: '600',
  },
  loginBtn: {
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
  },
  signUpText: {
    fontSize: 13,
    color: '#5B5CE2',
    fontWeight: '700',
  },
});
