import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../lib/auth';
import { useI18n } from '../lib/i18n';
import { C } from '../lib/theme';

export default function Login() {
  const { login } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true); setError('');
    try {
      await login(email.trim(), password);
      router.replace('/profile');
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  };

  return (
    <View style={s.screen}>
      <Text style={s.h2}>{t('login')}</Text>
      <Text style={s.sub}>{t('hero_eb')}</Text>
      {error ? <Text style={s.error}>{error}</Text> : null}
      <Text style={s.label}>{t('email')}</Text>
      <TextInput style={s.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="ornek@eposta.com" placeholderTextColor={C.faint} />
      <Text style={s.label}>{t('password')}</Text>
      <TextInput style={s.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" placeholderTextColor={C.faint} />
      <TouchableOpacity style={s.btn} onPress={submit} disabled={busy}>
        <Text style={s.btnText}>{busy ? '...' : t('login')}</Text>
      </TouchableOpacity>
      <Link href="/kayit" style={s.link}>{t('no_account')}</Link>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg, padding: 24, justifyContent: 'center' },
  h2: { color: C.text, fontSize: 24, fontWeight: '800' },
  sub: { color: C.faint, marginTop: 6, marginBottom: 20 },
  label: { color: C.dim, fontWeight: '600', fontSize: 13, marginBottom: 8, marginTop: 14 },
  input: { backgroundColor: C.panel, borderColor: C.line, borderWidth: 1, borderRadius: 8, padding: 12, color: C.text },
  btn: { backgroundColor: C.accentA, borderRadius: 10, padding: 14, marginTop: 24, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  link: { color: C.accentA, textAlign: 'center', marginTop: 18 },
  error: { color: '#f2716a', marginBottom: 8 },
});
