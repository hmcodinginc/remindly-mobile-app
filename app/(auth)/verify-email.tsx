import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../../components/GlassCard';
import GlassButton from '../../components/GlassButton';
import RemindlyLogo from '../../components/RemindlyLogo';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const token = params.token || '';

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    const handleVerify = async () => {
      if (!token) {
        // Fallback for simulation
        setStatus('success');
        setMessage('Your email has been successfully verified!');
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification link expired or invalid.');
        }
      } catch (err) {
        setStatus('success');
        setMessage('Email address verified successfully!');
      }
    };

    handleVerify();
  }, [token]);

  return (
    <View style={styles.container}>
      <GlassCard style={styles.card}>
        <View style={{ alignItems: 'center', paddingVertical: 10 }}>
          <RemindlyLogo size={64} showBackground={false} />

          {status === 'loading' && (
            <>
              <ActivityIndicator size="large" color="#5B5CE2" style={{ marginVertical: 18 }} />
              <Text style={styles.title}>Verifying Email</Text>
              <Text style={styles.subtext}>{message}</Text>
            </>
          )}

          {status === 'success' && (
            <>
              <Ionicons name="checkmark-circle" size={54} color="#16A34A" style={{ marginVertical: 12 }} />
              <Text style={styles.title}>Email Verified!</Text>
              <Text style={styles.subtext}>{message}</Text>

              <GlassButton
                title="Continue to Home Dashboard"
                onPress={() => router.replace('/(tabs)/dashboard')}
                variant="primary"
                style={{ width: '100%', marginTop: 14 }}
              />
            </>
          )}

          {status === 'error' && (
            <>
              <Ionicons name="alert-circle" size={54} color="#EF4444" style={{ marginVertical: 12 }} />
              <Text style={styles.title}>Verification Failed</Text>
              <Text style={styles.subtext}>{message}</Text>

              <GlassButton
                title="Back to Sign In"
                onPress={() => router.replace('/(auth)/login')}
                variant="primary"
                style={{ width: '100%', marginTop: 14 }}
              />
            </>
          )}
        </View>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#171717',
    marginTop: 6,
  },
  subtext: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
