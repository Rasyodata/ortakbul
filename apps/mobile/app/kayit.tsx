import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../lib/auth';
import { useI18n } from '../lib/i18n';
import { C } from '../lib/theme';

const ROLES: [string, string[]][] = [
  ['ENTREPRENEUR', ['Girişimci', 'Entrepreneur']], ['INVESTOR', ['Yatırımcı', 'Investor']],
  ['ANGEL_INVESTOR', ['Melek', 'Angel']], ['CONSULTANT', ['Danışman', 'Consultant']],
];

export default function Kayit() {
  const { register } = useAuth();
  const { t, lang } = useI18n();
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', countryCode: 'TR' });
  const [role, setRole] = useState('ENTREPRENEUR');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setBusy(true); setError('');
    try {
      await register({ ...form, email: form.email.trim(), memberType: role });
      router.replace('/profile');
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 24 }}>
      <Text style={s.h2}>{t('register')}</Text>
      <Text style={s.sub}>{t('pending')}</Text>
      {error ? <Text style={s.error}>{error}</Text> : null}

      <Text style={s.label}>{t('models')}</Text>
      <View style={s.roleRow}>
        {ROLES.map(([k, l]) => (
          <TouchableOpacity key={k} style={[s.pill, role === k && s.pillActive]} onPress={() => setRole(k)}>
            <Text style={{ color: role === k ? C.text : C.dim, fontSize: 12 }}>{lang === 'tr' ? l[0] : l[1]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Field label={t('fullname')} value={form.fullName} onChange={(v: string) => set('fullName', v)} />
      <Field label={t('email')} value={form.email} onChange={(v: string) => set('email', v)} keyboard="email-address" />
      <Field label={t('password')} value={form.password} onChange={(v: string) => set('password', v)} secure />
      <Field label={t('country_iso')} value={form.countryCode} onChange={(v: string) => set('countryCode', v.toUpperCase())} />

      <TouchableOpacity style={s.btn} onPress={submit} disabled={busy}>
        <Text style={s.btnText}>{busy ? '...' : t('register')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field({ label, value, onChange, secure, keyboard }: any) {
  return (
    <>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChange}
        secureTextEntry={!!secure}
        autoCapitalize="none"
        keyboardType={keyboard || 'default'}
        placeholderTextColor={C.faint}
      />
    </>
  );
}

const s = StyleSheet.create({
  h2: { color: C.text, fontSize: 24, fontWeight: '800' },
  sub: { color: C.faint, marginTop: 6, marginBottom: 16 },
  label: { color: C.dim, fontWeight: '600', fontSize: 13, marginBottom: 8, marginTop: 14 },
  input: { backgroundColor: C.panel, borderColor: C.line, borderWidth: 1, borderRadius: 8, padding: 12, color: C.text },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { borderWidth: 1, borderColor: C.line, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  pillActive: { borderColor: C.accentA, backgroundColor: 'rgba(91,110,242,0.12)' },
  btn: { backgroundColor: C.accentA, borderRadius: 10, padding: 14, marginTop: 24, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  error: { color: '#f2716a', marginBottom: 8 },
});
