import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { TextInput, Button, HelperText, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { DarkTheme, LightTheme } from '../../theme/colors';
import RemindlyLogo from '../../components/RemindlyLogo';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? DarkTheme : LightTheme;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);

  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) return;
    const success = await login(email.trim(), password);
    if (success) {
      router.replace('/(tabs)/dashboard');
    }
  };

  const handleBypass = () => {
    // Quick demo login for offline/development testing
    router.replace('/(tabs)/dashboard');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header Branding */}
        <View style={styles.header}>
          <View style={{ marginBottom: 12 }}>
            <RemindlyLogo size={88} />
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>Remindly</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Subscriptions, Tasks & Habit Tracker
          </Text>
        </View>

        {/* Card Form */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Welcome Back</Text>
          <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
            Sign in to sync your PocketBase account
          </Text>

          {error && (
            <View style={[styles.errorBox, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="alert-circle" size={20} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TextInput
            label="Email"
            value={email}
            onChangeText={(t) => {
              clearError();
              setEmail(t);
            }}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            left={<TextInput.Icon icon="email-outline" />}
            style={styles.input}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={(t) => {
              clearError();
              setPassword(t);
            }}
            mode="outlined"
            secureTextEntry={secureText}
            left={<TextInput.Icon icon="lock-outline" />}
            right={
              <TextInput.Icon
                icon={secureText ? 'eye-outline' : 'eye-off-outline'}
                onPress={() => setSecureText(!secureText)}
              />
            }
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            <Text style={[styles.forgotText, { color: theme.colors.primary }]}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={[styles.loginBtn, { backgroundColor: theme.colors.primary }]}
            contentStyle={{ paddingVertical: 6 }}
          >
            Sign In
          </Button>

          <Button
            mode="outlined"
            onPress={handleBypass}
            style={styles.demoBtn}
            textColor={theme.colors.textSecondary}
          >
            Explore App (Demo Mode)
          </Button>
        </View>

        {/* Register link */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={[styles.signUpText, { color: theme.colors.primary }]}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 13,
    marginBottom: 20,
    marginTop: 2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    flex: 1,
  },
  input: {
    marginBottom: 14,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  loginBtn: {
    borderRadius: 14,
    marginBottom: 12,
  },
  demoBtn: {
    borderRadius: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 14,
  },
  signUpText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
