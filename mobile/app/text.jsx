import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Field, Message, PageHeading, Screen, SmallLabel } from '../components/ui';
import { colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import { analyzeText } from '../services/analysisService';

export default function TextAnalysisScreen() {
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const claim = content.trim();
    const url = sourceUrl.trim();
    if (!claim) {
      setError('Enter a claim before starting your review.');
      return;
    }
    if (claim.length > 5000) {
      setError('Claims must be 5,000 characters or fewer.');
      return;
    }
    if (url) {
      try {
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
      } catch {
        setError('Enter a valid source link beginning with https:// or http://.');
        return;
      }
    }

    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await analyzeText(claim, url);
      setResult(response);
    } catch (analysisError) {
      setError(getErrorMessage(analysisError, 'Text analysis failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <PageHeading eyebrow="Text verification" title="Analyze a claim" description="Submit a factual claim to review it with TruthLens evidence analysis." />
        <Card>
          {error ? <Message>{error}</Message> : null}
          <Field
            label="Claim"
            multiline
            value={content}
            onChangeText={(value) => { setContent(value); setError(''); }}
            placeholder="Paste a factual claim to check..."
            maxLength={5000}
            accessibilityLabel="Claim text"
          />
          <Text style={{ marginTop: -8, marginBottom: 14, color: colors.subtle, fontSize: 10, textAlign: 'right' }}>
            {content.length}/5000
          </Text>
          <Field label="Source URL (optional)" value={sourceUrl} onChangeText={setSourceUrl} placeholder="https://example.com/article" autoCapitalize="none" keyboardType="url" />
          <Button title="Analyze claim" onPress={submit} loading={loading} disabled={!content.trim()} />
          <View style={{ marginTop: 10 }}>
            <Button title="Clear" secondary onPress={() => { setContent(''); setSourceUrl(''); setResult(null); setError(''); }} />
          </View>
        </Card>

        {result ? <AnalysisResult response={result} /> : null}
      </KeyboardAvoidingView>
    </Screen>
  );
}

function AnalysisResult({ response }) {
  const result = response.result || {};
  const analysis = response.analysis || {};

  return (
    <Card>
      <SmallLabel>ANALYSIS RESULT</SmallLabel>
      <Text style={{ color: colors.text, fontSize: 19, fontWeight: '850' }}>
        {result.verdict || result.assessment || 'Analysis complete'}
      </Text>
      {result.confidence !== undefined ? (
        <Text style={{ marginTop: 7, color: colors.primary, fontSize: 12, fontWeight: '750' }}>
          {result.confidence}% confidence indicator
        </Text>
      ) : null}
      {result.summary ? <Text style={{ marginTop: 12, color: colors.muted, fontSize: 12, lineHeight: 19 }}>{result.summary}</Text> : null}
      {result.explanation ? <Text style={{ marginTop: 12, color: colors.muted, fontSize: 12, lineHeight: 19 }}>{result.explanation}</Text> : null}
      {Array.isArray(result.keyClaims) && result.keyClaims.length ? (
        <View style={{ marginTop: 12 }}>
          <SmallLabel>KEY CLAIMS</SmallLabel>
          {result.keyClaims.map((claim, index) => (
            <Text key={`${index}-${claim.text || claim}`} style={{ marginTop: 6, color: colors.muted, fontSize: 12, lineHeight: 18 }}>
              • {typeof claim === 'string' ? claim : claim.text || JSON.stringify(claim)}
            </Text>
          ))}
        </View>
      ) : null}
      {analysis._id ? <Text style={{ marginTop: 12, color: colors.subtle, fontSize: 10 }}>Saved to your analysis history.</Text> : null}
      <View style={{ marginTop: 15 }}>
        <Button title="Back to dashboard" secondary onPress={() => router.replace('/(tabs)')} />
      </View>
    </Card>
  );
}
