import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api, Listing } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useI18n } from '../lib/i18n';
import { C, TIER_COLOR, TIER_LABEL } from '../lib/theme';

export default function Profile() {
  const { t, taxo, tier } = useI18n();
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const [mine, setMine] = useState<Listing[]>([]);

  useEffect(() => {
    if (user) api.get<Listing[]>('/listings/mine').then(setMine).catch(() => {});
  }, [user]);

  if (!ready) return <View style={s.center}><ActivityIndicator color={C.accentA} /></View>;
  if (!user) {
    return (
      <View style={s.center}>
        <Text style={{ color: C.dim, marginBottom: 16 }}>Profilini görmek için giriş yap.</Text>
        <Link href="/login" style={s.btn}>{t('login')}</Link>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20 }}>
      <View style={s.head}>
        <View style={s.avatar}><Text style={s.avatarText}>{user.fullName.slice(0, 2).toUpperCase()}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={s.name}>{user.fullName}</Text>
          <Text style={s.meta}>{user.memberType} · {user.email}</Text>
        </View>
      </View>

      <View style={[s.banner, user.status === 'PENDING' ? s.bannerWarn : s.bannerOk]}>
        <Text style={{ color: user.status === 'PENDING' ? C.warn : C.good, fontSize: 13 }}>
          {user.status === 'PENDING'
            ? t('pending')
            : t('active')}
        </Text>
      </View>

      <Text style={s.sectionTitle}>{t('my_profile')}</Text>
      {mine.length ? mine.map((l) => (
        <TouchableOpacity key={l.id} style={s.card} onPress={() => router.push(`/ilan/${l.id}`)}>
          <View style={s.row}>
            <Text style={s.cardTitle}>{l.title}</Text>
            <Text style={[s.tier, { color: TIER_COLOR[l.tier] }]}>● {tier(l.tier)}</Text>
          </View>
          <Text style={s.meta}>{[taxo(l.category), l.city].filter(Boolean).join(' · ')}</Text>
        </TouchableOpacity>
      )) : <Text style={{ color: C.faint }}>Henüz ilan vermedin.</Text>}

      <TouchableOpacity style={s.logout} onPress={async () => { await logout(); router.replace('/'); }}>
        <Text style={{ color: '#f2716a', fontWeight: '700' }}>{t('logout')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  head: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: C.accentA, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 20 },
  name: { color: C.text, fontSize: 20, fontWeight: '800' },
  meta: { color: C.faint, fontSize: 12, marginTop: 4 },
  banner: { borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 18 },
  bannerWarn: { backgroundColor: 'rgba(242,178,91,0.1)', borderColor: 'rgba(242,178,91,0.35)' },
  bannerOk: { backgroundColor: 'rgba(79,214,168,0.1)', borderColor: 'rgba(79,214,168,0.35)' },
  sectionTitle: { color: C.text, fontSize: 16, fontWeight: '700', marginTop: 26, marginBottom: 12 },
  card: { backgroundColor: C.panel, borderColor: C.line, borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTitle: { color: C.text, fontWeight: '700', fontSize: 15, flexShrink: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tier: { fontSize: 11, fontWeight: '700' },
  btn: { backgroundColor: C.accentA, color: '#fff', paddingVertical: 12, paddingHorizontal: 26, borderRadius: 10, fontWeight: '700', overflow: 'hidden' },
  logout: { marginTop: 30, alignItems: 'center', padding: 12 },
});
