import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { useI18n } from '../../lib/i18n';
import { C, TIER_COLOR, TIER_LABEL } from '../../lib/theme';

export default function IlanDetay() {
  const { t, taxo, tier } = useI18n();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, ready } = useAuth();
  const [l, setL] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/listings/${id}`).then(setL).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <View style={s.center}><Text style={{ color: C.faint }}>—</Text></View>;
  if (!l) return <View style={s.center}><ActivityIndicator color={C.accentA} /></View>;

  if (ready && !user) {
    return (
      <View style={s.center}>
        <Text style={s.gateTitle}>{t('login')}</Text>
        <Text style={s.gateSub}>&quot;{l.title}&quot; — {t('gate_detail')}</Text>
        <Link href="/login" style={[s.btn, { backgroundColor: C.accentA, color: '#fff' }]}>{t('login')}</Link>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20 }}>
      <Text style={[s.tier, { color: TIER_COLOR[l.tier] }]}>● {tier(l.tier)}</Text>
      <Text style={s.h1}>{l.title}</Text>
      <Text style={s.owner}>{l.owner?.fullName} · {taxo(l.category)} · {l.city || '—'}</Text>
      <Block h={t('d_desc')} p={l.detail} />
      {l.problem ? <Block h={t('d_problem')} p={l.problem} /> : null}
      {l.audience ? <Block h={t('d_audience')} p={l.audience} /> : null}
      {l.amountText ? <Block h={t('d_amount')} p={l.amountText} /> : null}
    </ScrollView>
  );
}

function Block({ h, p }: { h: string; p: string }) {
  return (
    <View style={{ marginTop: 22 }}>
      <Text style={s.blockH}>{h}</Text>
      <Text style={s.blockP}>{p}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  tier: { fontSize: 12, fontWeight: '700' },
  h1: { color: C.text, fontSize: 26, fontWeight: '800', marginTop: 8 },
  owner: { color: C.faint, marginTop: 6 },
  blockH: { color: C.dim, fontWeight: '700', fontSize: 14, marginBottom: 6 },
  blockP: { color: C.text, fontSize: 15, lineHeight: 22 },
  gateTitle: { color: C.text, fontSize: 18, fontWeight: '700' },
  gateSub: { color: C.dim, textAlign: 'center', marginTop: 10, marginBottom: 20 },
  btn: { paddingVertical: 12, paddingHorizontal: 26, borderRadius: 10, fontWeight: '700', overflow: 'hidden' },
});
