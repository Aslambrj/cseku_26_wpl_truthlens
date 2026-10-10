import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Brand, Button, Card, Field, Message, Screen } from '../components/ui';
import { colors } from '../constants/theme';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (loginError) {
      setError(getErrorMessage(loginError, 'Unable to sign in. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Brand />
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: '850' }}>Welcome back</Text>
        <Text style={{ marginTop: 8, marginBottom: 22, color: colors.muted, fontSize: 13, lineHeight: 20 }}>
          Sign in to continue verifying content.
        </Text>
        <Card>
          {error ? <Message>{error}</Message> : null}
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <Field label="Password" value={password} onChangeText={setPassword} placeholder="Enter your password" secureTextEntry autoComplete="password" />
          <Button title="Sign in" onPress={submit} loading={loading} />
        </Card>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 5 }}>
          <Text style={{ color: colors.muted, fontSize: 13 }}>New to TruthLens?</Text>
          <Link href="/signup" style={{ color: colors.primary, fontSize: 13, fontWeight: '750' }}>Create account</Link>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
