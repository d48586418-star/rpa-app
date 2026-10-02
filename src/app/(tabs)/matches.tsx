import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { T } from '../../components/ui';
import { fetchMatches } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { colors, fonts } from '../../theme';

export default function Matches() {
  const { session } = useAuth();
  const me = session!.user.id;
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['matches', me], queryFn: () => fetchMatches(me) });

  useEffect(() => {
    const ch = supabase
      .channel('matches-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches' }, () =>
        qc.invalidateQueries({ queryKey: ['matches'] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  if (isLoading) return <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />;
  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      data={data}
      keyExtractor={(m) => m.id}
      contentContainerStyle={{ padding: 16, gap: 10, flexGrow: 1, paddingBottom: 100 }}
      ListEmptyComponent={<T style={s.empty}>Nenhum match ainda. Continue deslizando!</T>}
      renderItem={({ item }) => (
        <Pressable style={s.row} onPress={() => router.push({ pathname: '/chat/[matchId]', params: { matchId: item.id, name: item.other.name } })}>
          {item.other.avatar_url ? (
            <Image source={{ uri: item.other.avatar_url }} style={s.avatar} />
          ) : (
            <View style={[s.avatar, { backgroundColor: colors.border }]} />
          )}
          <View style={{ flex: 1 }}>
            <T style={s.name}>{item.other.name}</T>
            <T style={s.roles} numberOfLines={1}>{item.other.roles.join(' · ')}</T>
          </View>
        </Pressable>
      )}
    />
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: colors.surface, padding: 12, borderRadius: 28, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  name: { fontFamily: fonts.semibold, fontSize: 16 },
  roles: { color: colors.muted, fontSize: 13 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 60 },
});
