import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, Text, View } from 'react-native';
import { Card, Message, PageHeading, Screen } from '../../components/ui';
import { colors } from '../../constants/theme';
import { getErrorMessage } from '../../services/api';
import { getAnalyses } from '../../services/analysisService';

const filters = ['All', 'Text', 'Image', 'Video'];

const resultSummary = (item) => {
  const result = item.result;
  if (!result) return 'Result unavailable';
  return result.assessment || result.verdict || result.label || 'Analysis complete';
};

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString();
};

export default function HistoryScreen() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (pullToRefresh = false) => {
    if (pullToRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const response = await getAnalyses();
      setItems(Array.isArray(response.analyses) ? response.analyses : []);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Unable to load analysis history.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visibleItems = filter === 'All'
    ? items
    : items.filter((item) => item.type === filter.toLowerCase());

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />}>
      <PageHeading eyebrow="Your account" title="History" description="Past analyses saved to your TruthLens account." />
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 17 }}>
        {filters.map((item) => (
          <Pressable
            key={item}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === item }}
            onPress={() => setFilter(item)}
            style={{ paddingVertical: 8, paddingHorizontal: 13, borderWidth: 1, borderColor: filter === item ? colors.primary : colors.border, borderRadius: 999, backgroundColor: filter === item ? '#eff6ff' : '#ffffff' }}
          >
            <Text style={{ color: filter === item ? colors.primaryDark : colors.muted, fontSize: 11, fontWeight: '750' }}>{item}</Text>
          </Pressable>
        ))}
      </View>

      {error ? <Message>{error}</Message> : null}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={colors.primary} />
      ) : visibleItems.length === 0 ? (
        <Card>
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: '800' }}>No analyses found</Text>
          <Text style={{ marginTop: 6, color: colors.muted, fontSize: 12, lineHeight: 18 }}>
            {items.length ? 'There are no entries for this filter.' : 'Your completed analyses will appear here.'}
          </Text>
        </Card>
      ) : visibleItems.map((item) => (
        <Card key={item._id}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '850', letterSpacing: 0.6, textTransform: 'uppercase' }}>
              {item.type || 'Analysis'}
            </Text>
            <Text style={{ color: colors.subtle, fontSize: 10 }}>{formatDate(item.createdAt)}</Text>
          </View>
          <Text numberOfLines={3} style={{ marginTop: 9, color: colors.text, fontSize: 13, fontWeight: '700', lineHeight: 19 }}>
            {item.content || 'Content unavailable'}
          </Text>
          <View style={{ height: 1, marginVertical: 11, backgroundColor: '#edf1f6' }} />
          <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 17 }}>{resultSummary(item)}</Text>
        </Card>
      ))}
    </Screen>
  );
}
