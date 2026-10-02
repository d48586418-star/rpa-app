import {
  Montserrat_300Light, Montserrat_400Regular, Montserrat_600SemiBold,
  Montserrat_700Bold, Montserrat_900Black, useFonts,
} from '@expo-google-fonts/montserrat';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { T } from '../components/ui';
import { fetchMyProfile } from '../lib/api';
import { AuthProvider, useAuth } from '../lib/auth';
import { isDemo } from '../lib/demo';
import { isSupabaseConfigured } from '../lib/supabase';
import { colors, fonts } from '../theme';

const queryClient = new QueryClient();

function Gate() {
  const { session, loading } = useAuth();
  const userId = session?.user.id;
  const profile = useQuery({
    queryKey: ['my-profile', userId],
    queryFn: () => fetchMyProfile(userId!),
    enabled: Boolean(userId),
  });

  if (!isSupabaseConfigured && !isDemo) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 24 }}>
        <T style={{ fontSize: 18, fontFamily: fonts.semibold }}>Supabase não configurado</T>
        <T style={{ color: colors.muted, marginTop: 8 }}>
          Copie .env.example para .env e preencha EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY.
        </T>
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
        <Stack.Screen name="job/[id]" options={{ headerShown: true, title: 'Job', headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.text, headerTitleStyle: { fontFamily: fonts.semibold }, headerShadowVisible: false }} />
        <Stack.Screen name="create" options={{ headerShown: true, title: 'Criar' }} />
        <Stack.Screen name="project/[id]" options={{ headerShown: true, title: 'Projeto', headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.text, headerTitleStyle: { fontFamily: fonts.semibold }, headerShadowVisible: false }} />
        <Stack.Screen name="project/new" options={{ headerShown: true, title: 'Novo projeto', headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.text, headerTitleStyle: { fontFamily: fonts.semibold }, headerShadowVisible: false }} />
        <Stack.Screen name="job/new" options={{ headerShown: true, title: 'Novo job', headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.text, headerTitleStyle: { fontFamily: fonts.semibold }, headerShadowVisible: false }} />
        <Stack.Screen
          name="chat/[matchId]"
          options={{
            headerShown: true, title: 'Conversa', headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text, headerTitleStyle: { fontFamily: fonts.semibold },
            headerShadowVisible: false,
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Montserrat_300Light, Montserrat_400Regular, Montserrat_600SemiBold,
    Montserrat_700Bold, Montserrat_900Black,
  });
  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style="light" />
          <Gate />
          {isDemo && (
            <View pointerEvents="none" style={{ position: 'absolute', top: 6, right: 12, alignItems: 'flex-end', zIndex: 10 }}>
              <T style={{ fontSize: 11, color: colors.muted, backgroundColor: 'rgba(17,17,17,0.9)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' }}>
                Modo demo · dados não são salvos
              </T>
            </View>
          )}
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
