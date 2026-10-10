import { Alert, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, PageHeading, Screen } from '../../components/ui';
import { colors } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const confirmLogout = () => {
    Alert.alert('Sign out?', 'You can sign in again at any time.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            router.replace('/login');
          } catch (error) {
            Alert.alert('Unable to sign out', error.message || 'Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <Screen>
      <PageHeading eyebrow="Your account" title="Profile" description="Account information from your TruthLens profile." />
      <Card style={{ alignItems: 'center', paddingVertical: 26 }}>
        <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center', borderRadius: 32, backgroundColor: '#eff6ff' }}>
          <Text style={{ color: colors.primary, fontSize: 24, fontWeight: '850' }}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
        </View>
        <Text style={{ marginTop: 13, color: colors.text, fontSize: 18, fontWeight: '800' }}>{user?.name || 'TruthLens user'}</Text>
        <Text style={{ marginTop: 5, color: colors.muted, fontSize: 12 }}>{user?.email || 'Email unavailable'}</Text>
      </Card>
      <Card>
        <Text style={{ marginBottom: 14, color: colors.text, fontSize: 13, fontWeight: '800' }}>Account details</Text>
        <ProfileField label="Name" value={user?.name} />
        <ProfileField label="Email" value={user?.email} />
        <ProfileField label="Account type" value={user?.role || 'user'} last />
      </Card>
      <Button title="Sign out" secondary onPress={confirmLogout} />
    </Screen>
  );
}

function ProfileField({ label, value, last }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 11, borderBottomWidth: last ? 0 : 1, borderBottomColor: '#edf1f6' }}>
      <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
      <Text style={{ flexShrink: 1, color: colors.text, fontSize: 12, fontWeight: '700', textAlign: 'right' }}>{value || 'Not provided'}</Text>
    </View>
  );
}
