import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api, Listing } from '../lib/api';
import { useI18n } from '../lib/i18n';
import { C, TIER_COLOR, TIER_LABEL } from '../lib/theme';

export default function Listings() {
  const { t, taxo, tier } = useI18n();
  const router = useRouter();
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Listing[]>('/listings?type=IDEA')
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={s.center}><ActivityIndicator color={C.accentA} /></View>;
  if (error) return <View style={s.center}><Text style={{ color: C.faint, textAlign: 'center' }}>{error}</Text></View>;

  return (
    <FlatList
      style={{ backgroundColor: C.bg }}
      contentContainerStyle={{ padding: 16 }}
      data={items}
      keyExtractor={(i) => i.id}
      ListEmptyComponent={<Text style={{ color: C.faint, textAlign: 'center', marginTop: 40 }}>{t('search_no_results') || '—'}</Text>}
      renderItem={({ item }) => (
        <TouchableOpacity style={[s.card, { borderColor: item.tier !== 'NORMAL' ? TIER_COLOR[item.tier] : C.line }]}
          onPress={() => router.push(`/ilan/${item.id}`)}>
          <View style={s.row}>
            <Text style={s.title}>{item.title}</Text>
            <Text style={[s.tier, { color: TIER_COLOR[item.tier] }]}>● {tier(item.tier)}</Text>
          </View>
          <Text style={s.meta}>{[taxo(item.category), item.city].filter(Boolean).join(' · ')}</Text>
          <Text style={s.value}>{item.amountText || item.stage || ''}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const s = StyleSheet.create({
  center: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: C.panel, borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: C.text, fontWeight: '700', fontSize: 16, flexShrink: 1 },
  tier: { fontSize: 11, fontWeight: '700' },
  meta: { color: C.faint, fontSize: 12, marginTop: 6 },
  value: { color: C.accentA, fontWeight: '700', marginTop: 8 },
});
