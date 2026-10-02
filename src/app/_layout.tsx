import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { fetchMyProfile } from '../lib/api';
import { AuthProvider, useAuth } from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';
import { colors } from '../theme';

const queryClient = new QueryClient();

function Gate() {
  const { session, loading } = useAuth();
  const userId = session?.user.id;
  const profile = useQuery({
    queryKey: ['my-profile', userId],
    queryFn: () => fetchMyProfile(userId!),
    enabled: Boolean(userId),
  });

  if (!isSupabaseConfigured) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>Supabase não configurado</Text>
        <Text style={{ color: colors.muted, marginTop: 8 }}>
          Copie .env.example para .env e preencha EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY.
        </Text>
      </View>
    );
  }
  if (loading || (userId && profile.isLoading)) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const hasProfile = Boolean(profile.data);
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(session) && !hasProfile}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(session) && hasProfile}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat/[matchId]" options={{ headerShown: true, title: 'Conversa', headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.text }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style="light" />
          <Gate />
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
