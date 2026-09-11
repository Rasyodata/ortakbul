import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../lib/auth';
import { I18nProvider } from '../lib/i18n';
import { C } from '../lib/theme';

export default function RootLayout() {
  return (
    <I18nProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: C.panel },
            headerTintColor: C.text,
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: C.bg },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'ortakbul.org' }} />
          <Stack.Screen name="listings" options={{ title: 'ortakbul.org' }} />
          <Stack.Screen name="ilan/[id]" options={{ title: 'ortakbul.org' }} />
          <Stack.Screen name="login" options={{ title: 'ortakbul.org' }} />
          <Stack.Screen name="kayit" options={{ title: 'ortakbul.org' }} />
          <Stack.Screen name="profile" options={{ title: 'ortakbul.org' }} />
        </Stack>
      </AuthProvider>
    </I18nProvider>
  );
}
