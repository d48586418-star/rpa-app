import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StyleSheet, View } from 'react-native';
import { Photo } from '../../components/Photo';
import { Header, Screen, T } from '../../components/ui';
import { fetchMatches, jobsEnabled, subscribeMatches } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { profileSubtitle, rolesText } from '../../lib/profileText';
import { hashString } from '../../lib/shapes';
import { colors, fonts, radius, shadow } from '../../theme';

/** Conversas como balões coloridos, com a foto da pessoa como "adesivo" (referência Chats). */
export default function Matches() {
  const { session } = useAuth();
  const me = session!.user.id;
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['matches', me], queryFn: () => fetchMatches(me) });

  useEffect(
    () => subscribeMatches(() => qc.invalidateQueries({ queryKey: ['matches'] })),
    [qc],
  );

  return (
    <Screen>
      <SafeAreaView style={{ flex: 1 }}>
        <Header lead="Conversas" rest="recentes." onBack={jobsEnabled ? () => (router.canGoBack() ? router.back() : router.replace('/inicio')) : undefined} />
        {isLoading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} /> : (
          <FlatList
            data={data}
            keyExtractor={(m) => m.id}
            contentContainerStyle={{ padding: 20, gap: 12, flexGrow: 1, paddingBottom: 130 }}
            ListEmptyComponent={<T style={s.empty}>Nenhum match ainda. Continue deslizando!</T>}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Conversa com ${item.other.name}`}
                style={({ pressed }) => [s.row, { backgroundColor: colors.bubbles[hashString(item.id) % colors.bubbles.length] }, pressed && { opacity: 0.88 }]}
                onPress={() => router.push({ pathname: '/chat/[matchId]', params: { matchId: item.id, name: item.other.name } })}>
                <View style={{ flex: 1, gap: 2 }}>
                  <T style={s.name} numberOfLines={1}>{item.other.name}</T>
                  <T style={s.roles} numberOfLines={1}>{rolesText(item.other) || profileSubtitle(item.other)}</T>
                  <T style={s.cta}>Toque para conversar</T>
                </View>
                <View style={s.sticker}>
                  {item.other.avatar_url ? <Photo photo={item.other.avatar_url} style={StyleSheet.absoluteFill} /> : <T style={s.initial}>{item.other.name.charAt(0)}</T>}
                </View>
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </Screen>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 16, borderRadius: radius.lg, borderTopLeftRadius: 8 },
  sticker: { width: 64, height: 76, borderRadius: 20, overflow: 'hidden', borderWidth: 3, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent, transform: [{ rotate: '4deg' }], ...(shadow.card as object) },
  initial: { color: '#fff', fontFamily: fonts.black, fontSize: 26 },
  name: { fontFamily: fonts.semibold, fontSize: 17 },
  roles: { color: 'rgba(11,11,15,0.7)', fontSize: 13 },
  cta: { color: 'rgba(11,11,15,0.6)', fontSize: 12, marginTop: 4 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 60 },
});
