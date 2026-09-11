import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useI18n, LANGS } from '../lib/i18n';
import { C } from '../lib/theme';

export default function Home() {
  const { user } = useAuth();
  const { t, lang, setLang } = useI18n();
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    api.get('/meta').then(setMeta).catch(() => {});
  }, []);

  const structures = [
    ['💰', 's_capital'], ['🏦', 's_collateral'], ['📈', 's_credit'], ['🧾', 's_cheque'], ['🛠️', 'pe_effort'],
  ];
  const SM: Record<string, string[]> = {
    s_capital: ['Sermaye', 'Capital'], s_collateral: ['Teminat', 'Collateral'], s_credit: ['Kredi', 'Credit Line'],
    s_cheque: ['Çek / Bono', 'Cheque / Bond'], pe_effort: ['Emek', 'Effort'],
  };
  const sm = (k: string) => (lang === 'tr' ? SM[k][0] : SM[k][1]);

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      {/* Dil değiştirici */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
        {LANGS.map((l) => (
          <Text key={l.code} onPress={() => setLang(l.code)}
            style={[s.lang, lang === l.code && s.langActive]}>{l.flag} {l.code.toUpperCase()}</Text>
        ))}
      </ScrollView>

      <Text style={s.eyebrow}>{t('hero_eb')}</Text>
      <Text style={s.h1}>{t('hero_title')}</Text>
      <Text style={s.sub}>{t('hero_sub')}</Text>

      <Link href="/listings" style={[s.btn, s.btnPrimary]}>{t('explore')}</Link>
      {user ? (
        <Link href="/profile" style={[s.btn, s.btnGhost]}>{t('my_profile')}</Link>
      ) : (
        <Link href="/login" style={[s.btn, s.btnGhost]}>{t('login')}</Link>
      )}

      <View style={s.statStrip}>
        <Stat n="10.000+" l={t('target_users')} />
        <Stat n={meta?.counts?.listings ?? '—'} l={t('active_listings')} />
        <Stat n={meta?.counts?.consultants ?? '—'} l={t('consultants')} />
      </View>

      <Text style={s.sectionTitle}>{t('models')}</Text>
      <View style={s.grid}>
        {structures.map(([i, k]) => (
          <View key={k} style={s.card}>
            <Text style={{ fontSize: 24 }}>{i}</Text>
            <Text style={s.cardTitle}>{sm(k)}</Text>
          </View>
        ))}
      </View>

      <View style={s.badges}>
        <Text style={s.badge}>🔒 KVKK & GDPR</Text>
        <Text style={s.badge}>🌍 9</Text>
      </View>
    </ScrollView>
  );
}

function Stat({ n, l }: { n: any; l: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={s.statNum}>{String(n)}</Text>
      <Text style={s.statLbl}>{l}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  eyebrow: { color: C.gold, fontWeight: '700', fontSize: 12, letterSpacing: 1, marginBottom: 10 },
  h1: { color: C.text, fontSize: 38, fontWeight: '800', lineHeight: 42 },
  sub: { color: C.dim, fontSize: 16, marginTop: 14, lineHeight: 23 },
  btn: { textAlign: 'center', paddingVertical: 14, borderRadius: 10, marginTop: 14, fontWeight: '700', overflow: 'hidden' },
  btnPrimary: { backgroundColor: C.accentA, color: '#fff' },
  btnGhost: { borderWidth: 1, borderColor: C.line, color: C.text },
  statStrip: { flexDirection: 'row', gap: 12, marginTop: 28, backgroundColor: C.panel, borderColor: C.line, borderWidth: 1, borderRadius: 16, padding: 20 },
  statNum: { color: C.accentA, fontSize: 22, fontWeight: '800' },
  statLbl: { color: C.dim, fontSize: 11, marginTop: 4 },
  sectionTitle: { color: C.text, fontSize: 22, fontWeight: '800', marginTop: 32, marginBottom: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 14 },
  card: { width: '47%', backgroundColor: C.panel, borderColor: C.line, borderWidth: 1, borderRadius: 12, padding: 16 },
  cardTitle: { color: C.text, fontWeight: '700', marginTop: 8, fontSize: 15 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 24 },
  badge: { color: C.faint, fontSize: 12 },
  lang: { color: C.dim, fontSize: 13, fontWeight: '600', paddingVertical: 6, paddingHorizontal: 11, marginRight: 8, borderRadius: 8, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  langActive: { color: '#fff', backgroundColor: C.accentA, borderColor: C.accentA },
});
