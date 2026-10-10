import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ChartNoAxesColumn, FileText, Image as ImageIcon, Video } from 'lucide-react-native';
import { Brand, Button, Card, Message, Screen } from '../../components/ui';
import { colors } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { getAnalyses } from '../../services/analysisService';
import { getErrorMessage } from '../../services/api';

const actions = [
  { path: '/text', Icon: FileText, title: 'Text analysis', detail: 'Check a claim and review evidence.' },
  { path: '/image', Icon: ImageIcon, title: 'Image analysis', detail: 'Review image authenticity signals.' },
  { path: '/video', Icon: Video, title: 'Video analysis', detail: 'Look for video manipulation signals.' },
];

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadDashboard = useCallback(async (pullToRefresh = false) => {
    if (pullToRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const response = await getAnalyses();
      setAnalyses(Array.isArray(response.analyses) ? response.analyses : []);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Unable to load your dashboard activity.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const counts = {
    all: analyses.length,
    text: analyses.filter((item) => item.type === 'text').length,
    image: analyses.filter((item) => item.type === 'image').length,
    video: analyses.filter((item) => item.type === 'video').length,
  };
  const recentAnalyses = analyses.slice(0, 4);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setError('');
    try {
      await logout();
      router.replace('/login');
    } catch (logoutError) {
      setError(getErrorMessage(logoutError, 'Unable to log out. Please try again.'));
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadDashboard(true)} tintColor={colors.primary} />}>
      <Brand onPress={() => setAccountMenuOpen((isOpen) => !isOpen)} />
      {accountMenuOpen ? (
        <Card style={{ marginTop: -16, padding: 13 }}>
          <Text style={{ color: colors.text, fontSize: 12, fontWeight: '800' }}>
            {user?.name || 'TruthLens account'}
          </Text>
          {user?.email ? (
            <Text style={{ marginTop: 3, marginBottom: 10, color: colors.muted, fontSize: 11 }}>
              {user.email}
            </Text>
          ) : null}
          {!user?.email ? <View style={{ height: 10 }} /> : null}
          <Button title="Log out" secondary onPress={handleLogout} loading={loggingOut} />
        </Card>
      ) : null}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: colors.text, fontSize: 27, fontWeight: '850', letterSpacing: -0.6 }}>
          Dashboard
        </Text>
        <Text style={{ marginTop: 7, color: colors.muted, fontSize: 13, lineHeight: 20 }}>
          Welcome{user?.name ? `, ${user.name.trim().split(/\s+/)[0]}` : ''}. Your verification activity at a glance.
        </Text>
      </View>

      {error ? (
        <>
          <Message>{error}</Message>
          <Button title="Retry loading dashboard" secondary onPress={() => loadDashboard()} />
        </>
      ) : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 9 }}>
        <StatCard label="Total analyses" value={loading ? '—' : counts.all} Icon={ChartNoAxesColumn} />
        <StatCard label="Text checks" value={loading ? '—' : counts.text} Icon={FileText} />
        <StatCard label="Image checks" value={loading ? '—' : counts.image} Icon={ImageIcon} />
        <StatCard label="Video checks" value={loading ? '—' : counts.video} Icon={Video} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginTop: 4 }}>
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '850' }}>Start an analysis</Text>
        <Text style={{ color: colors.subtle, fontSize: 10 }}>Choose a content type</Text>
      </View>

      {actions.map((action) => (
        <Pressable key={action.path} onPress={() => router.push(action.path)}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 }}>
            <View style={{ width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff' }}>
              <action.Icon size={20} color={colors.primary} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: '800' }}>{action.title}</Text>
              <Text style={{ marginTop: 4, color: colors.muted, fontSize: 11, lineHeight: 16 }}>{action.detail}</Text>
            </View>
            <Text style={{ color: colors.primary, fontSize: 20 }}>›</Text>
          </Card>
        </Pressable>
      ))}

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, marginBottom: 10 }}>
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '850' }}>Recent activity</Text>
        <Pressable accessibilityRole="button" onPress={() => router.navigate('/(tabs)/history')}>
          <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '750' }}>View history</Text>
        </Pressable>
      </View>
      <Card style={{ paddingVertical: 5 }}>
        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 18 }}>
            <ActivityIndicator color={colors.primary} />
            <Text style={{ marginTop: 8, color: colors.muted, fontSize: 11 }}>Loading your recent analyses...</Text>
          </View>
        ) : recentAnalyses.length ? (
          recentAnalyses.map((item, index) => (
            <RecentAnalysis key={item._id || `${item.type}-${item.createdAt}-${index}`} item={item} last={index === recentAnalyses.length - 1} />
          ))
        ) : (
          <View style={{ paddingVertical: 16 }}>
            <Text style={{ color: colors.text, fontSize: 12, fontWeight: '750' }}>No analyses yet</Text>
            <Text style={{ marginTop: 5, color: colors.muted, fontSize: 11, lineHeight: 17 }}>
              Your completed text, image, and video checks will appear here.
            </Text>
          </View>
        )}
      </Card>

      <Pressable onPress={() => router.push('/pricing')}>
        <Card style={{ backgroundColor: '#eff6ff', borderColor: '#dbeafe' }}>
          <Text style={{ color: colors.primaryDark, fontSize: 13, fontWeight: '800' }}>Explore TruthLens plans</Text>
          <Text style={{ marginTop: 5, color: colors.muted, fontSize: 11, lineHeight: 17 }}>
            Compare Free, Premium, and Enterprise options.
          </Text>
        </Card>
      </Pressable>
      <Text style={{ marginTop: 3, color: colors.subtle, fontSize: 10, lineHeight: 16 }}>
        Analysis results are model estimates and should be considered alongside other evidence.
      </Text>
    </Screen>
  );
}

function StatCard({ label, value, Icon }) {
  return (
    <Card style={{ width: '48%', flexGrow: 1, minHeight: 86, marginBottom: 0, padding: 13 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.muted, fontSize: 10, fontWeight: '650' }}>{label}</Text>
        <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#eff6ff' }}>
          <Icon size={14} color={colors.primary} strokeWidth={2} />
        </View>
      </View>
      <Text style={{ marginTop: 5, color: colors.text, fontSize: 22, fontWeight: '850' }}>{value}</Text>
    </Card>
  );
}

function RecentAnalysis({ item, last }) {
  const result = item.result || {};
  const date = item.createdAt ? new Date(item.createdAt) : null;
  const dateLabel = date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : 'Date unavailable';
  const summary = result.assessment || result.verdict || result.label || 'Result unavailable';

  return (
    <View style={{ paddingVertical: 12, borderBottomWidth: last ? 0 : 1, borderBottomColor: '#edf1f6' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <Text style={{ color: colors.primary, fontSize: 9, fontWeight: '850', letterSpacing: 0.5, textTransform: 'uppercase' }}>
          {item.type || 'Analysis'}
        </Text>
        <Text style={{ color: colors.subtle, fontSize: 10 }}>{dateLabel}</Text>
      </View>
      <Text numberOfLines={2} style={{ marginTop: 5, color: colors.text, fontSize: 12, fontWeight: '700', lineHeight: 17 }}>
        {item.content || 'Content unavailable'}
      </Text>
      <Text numberOfLines={1} style={{ marginTop: 4, color: colors.muted, fontSize: 10 }}>{summary}</Text>
    </View>
  );
}
