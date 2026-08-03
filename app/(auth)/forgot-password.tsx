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
import { TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import pb from '../../services/pocketbase';
import { DarkTheme, LightTheme } from '../../theme/colors';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? DarkTheme : LightTheme;

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (pb.authStore.isValid || pb.collection) {
        await pb.collection('users').requestPasswordReset(email.trim());
      }
      setMessage('Password reset instructions have been sent to your email.');
    } catch (e: any) {
      // Even if offline/failed, show helpful guidance
      setMessage('Password reset email sent if account exists.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Enter your email to receive a password reset link
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          {error && (
            <View style={[styles.alertBox, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="alert-circle" size={20} color="#DC2626" />
              <Text style={{ color: '#DC2626', fontSize: 13, flex: 1 }}>{error}</Text>
            </View>
          )}

          {message && (
            <View style={[styles.alertBox, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#059669" />
              <Text style={{ color: '#059669', fontSize: 13, flex: 1 }}>{message}</Text>
            </View>
          )}

          <TextInput
            label="Email Address"
            value={email}
            onChangeText={(t) => {
              setError(null);
              setEmail(t);
            }}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            left={<TextInput.Icon icon="email-outline" />}
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleResetPassword}
            loading={loading}
            disabled={loading}
            style={[styles.resetBtn, { backgroundColor: theme.colors.primary }]}
            contentStyle={{ paddingVertical: 6 }}
          >
            Send Reset Link
          </Button>

          <Button
            mode="text"
            onPress={() => router.push('/(auth)/login')}
            textColor={theme.colors.primary}
            style={{ marginTop: 8 }}
          >
            Back to Sign In
          </Button>
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
    padding: 24,
    justifyContent: 'center',
  },
  backBtn: {
    marginBottom: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    elevation: 4,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  input: {
    marginBottom: 16,
  },
  resetBtn: {
    borderRadius: 14,
  },
});
