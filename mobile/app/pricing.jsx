import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button, Card, Message, PageHeading, Screen } from '../components/ui';
import { colors } from '../constants/theme';

const plans = [
  {
    name: 'Free',
    subtitle: 'For individuals who occasionally verify online content.',
    price: '$0',
    period: '/ month',
    button: 'Included with your account',
    note: 'No credit card required.',
    features: [
      '10 analyses per month',
      'Text misinformation detection',
      'AI-generated image detection',
      'Basic video and deepfake detection',
      'Confidence score',
      'Basic analysis results',
      'Limited analysis history',
    ],
    excluded: ['Detailed reports', 'Bulk analysis', 'API access', 'Priority support'],
  },
  {
    name: 'Premium',
    subtitle: 'For frequent users who need deeper and faster verification.',
    price: '$9.99',
    period: '/ month',
    button: 'Upgrade to Premium',
    note: 'Cancel anytime.',
    popular: true,
    features: [
      '500 analyses per month',
      'Advanced text analysis',
      'AI-generated image detection',
      'Advanced video and deepfake analysis',
      'Detailed analysis reports',
      'Confidence and evidence insights',
      'Full analysis history',
      'PDF and CSV report export',
      'Faster processing',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    subtitle: 'For organizations that verify content at scale.',
    price: 'Custom',
    period: 'tailored to your needs',
    button: 'Upgrade to Enterprise',
    note: 'Tailored to your organization’s needs.',
    features: [
      'Unlimited or high-volume analyses',
      'Bulk content analysis',
      'API access',
      'Organization dashboard',
      'Multiple team members',
      'Usage analytics',
      'Custom integrations',
      'Dedicated support',
      'Custom usage limits',
      'Enterprise security controls',
    ],
  },
];

export default function PricingScreen() {
  const [notice, setNotice] = useState('');

  return (
    <Screen>
      <PageHeading eyebrow="TruthLens plans" title="Choose a plan" description="Compare options for personal and organization-wide verification." />
      {plans.map((plan) => (
        <Card key={plan.name} style={plan.popular ? { borderColor: colors.primary, borderWidth: 2 } : null}>
          {plan.popular ? <Text style={{ marginBottom: 9, color: colors.primary, fontSize: 10, fontWeight: '850', letterSpacing: 0.8 }}>★ MOST POPULAR</Text> : null}
          <Text style={{ color: colors.text, fontSize: 19, fontWeight: '850' }}>{plan.name}</Text>
          <Text style={{ marginTop: 5, color: colors.muted, fontSize: 11, lineHeight: 17 }}>{plan.subtitle}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 16, marginBottom: 13 }}>
            <Text style={{ color: colors.text, fontSize: 28, fontWeight: '900' }}>{plan.price}</Text>
            <Text style={{ color: colors.muted, fontSize: 10 }}>{plan.period}</Text>
          </View>
          {plan.name === 'Free' ? (
            <Text style={{ marginBottom: 16, color: colors.muted, fontSize: 10, textAlign: 'center' }}>{plan.note}</Text>
          ) : (
            <>
              <Button
                title={plan.button}
                secondary={!plan.popular}
                onPress={() => setNotice(plan.name.toLowerCase())}
              />
              <Text style={{ marginTop: 8, marginBottom: 12, color: colors.subtle, fontSize: 10, textAlign: 'center' }}>{plan.note}</Text>
              {notice === plan.name.toLowerCase() ? (
                <Message tone="success">{plan.name} upgrades are coming soon. No payment has been taken.</Message>
              ) : null}
            </>
          )}
          <View style={{ height: 1, marginBottom: 13, backgroundColor: '#edf1f6' }} />
          <Text style={{ marginBottom: 10, color: colors.muted, fontSize: 11, fontWeight: '750' }}>
            {plan.name === 'Free' ? 'Included' : plan.name === 'Premium' ? 'Everything in Free, plus' : 'Everything in Premium, plus'}
          </Text>
          {plan.features.map((feature) => <Feature key={feature} text={feature} included />)}
          {plan.excluded?.map((feature) => <Feature key={feature} text={feature} />)}
        </Card>
      ))}
      <Text style={{ color: colors.subtle, fontSize: 10, lineHeight: 16, textAlign: 'center' }}>
        Premium and Enterprise plans are presented for the prototype and are not currently activated.
      </Text>
    </Screen>
  );
}

function Feature({ text, included }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginBottom: 9 }}>
      <Text style={{ width: 15, color: included ? colors.success : colors.subtle, fontSize: 12, fontWeight: '850' }}>{included ? '✓' : '×'}</Text>
      <Text style={{ flex: 1, color: included ? '#46556d' : colors.subtle, fontSize: 11, lineHeight: 16 }}>{text}</Text>
    </View>
  );
}
