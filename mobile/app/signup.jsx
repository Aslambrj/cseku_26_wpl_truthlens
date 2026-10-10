import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Brand, Button, Card, Field, Message, Screen } from '../components/ui';
import { colors } from '../constants/theme';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SignupScreen() {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      await signup(name, email, password);
      router.replace('/(tabs)');
    } catch (signupError) {
      setError(getErrorMessage(signupError, 'Unable to create your account. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Brand />
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: '850' }}>Create account</Text>
        <Text style={{ marginTop: 8, marginBottom: 22, color: colors.muted, fontSize: 13, lineHeight: 20 }}>
          Get started with evidence-aware content analysis.
        </Text>
        <Card>
          {error ? <Message>{error}</Message> : null}
          <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" autoComplete="name" />
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 6 characters" secureTextEntry autoComplete="new-password" />
          <Button title="Create account" onPress={submit} loading={loading} />
        </Card>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 5 }}>
          <Text style={{ color: colors.muted, fontSize: 13 }}>Already have an account?</Text>
          <Link href="/login" style={{ color: colors.primary, fontSize: 13, fontWeight: '750' }}>Sign in</Link>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
