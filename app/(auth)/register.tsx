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
import { sanitizeNameInput } from '../../utils/formatName';

export default function RegisterScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  const { register, isLoading, error, clearError } = useAuthStore();

  const handleFirstNameChange = (t: string) => {
    setFirstName(sanitizeNameInput(t));
  };

  const handleLastNameChange = (t: string) => {
    setLastName(sanitizeNameInput(t));
  };

  const handleRegister = async () => {
    setLocalError(null);
    clearError();

    if (!firstName.trim() || !lastName.trim()) {
      setLocalError('Please enter both First Name and Last Name.');
      return;
    }
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

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const success = await register(email.trim(), password, confirmPassword, fullName);
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
          <Ionicons name="arrow-back" size={20} color="#171717" />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.logoWrapper}>
            <RemindlyLogo size={64} showBackground={false} />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join Remindly to manage subscriptions & reminders
          </Text>
        </View>

        <GlassCard style={styles.card}>
          {displayError && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          )}

          {/* First Name & Last Name Inputs (No numbers allowed) */}
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <GlassInput
                label="First Name *"
                placeholder="Alex"
                value={firstName}
                onChangeText={handleFirstNameChange}
                iconName="person-outline"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <GlassInput
                label="Last Name *"
                placeholder="Johnson"
                value={lastName}
                onChangeText={handleLastNameChange}
                iconName="person-outline"
              />
            </View>
          </View>

          <GlassInput
            label="Email Address *"
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
            label="Password (min 8 chars) *"
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
            label="Confirm Password *"
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
    backgroundColor: '#FFFFFF',
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
  nameRow: {
    flexDirection: 'row',
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
  registerBtn: {
    marginTop: 6,
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
  signInText: {
    fontSize: 13,
    color: '#5B5CE2',
    fontWeight: '700',
  },
});
