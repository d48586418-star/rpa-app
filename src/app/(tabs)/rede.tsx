import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Icon } from '../../components/Icon';
import { Photo } from '../../components/Photo';
import { PostCard } from '../../components/PostCard';
import { blobColor } from '../../components/ProfileCard';
import { Segmented } from '../../components/Segmented';
import { Chip, Header, Screen, T } from '../../components/ui';
import { fetchMyProfile, fetchPosts } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { colors, fonts, glass, radius, shadow } from '../../theme';

export default function Rede() {
  const { session } = useAuth();
  const me = session!.user.id;
  const [tab, setTab] = useState<'tudo' | 'salvos'>('tudo');
  const mine = useQuery({ queryKey: ['my-profile', me], queryFn: () => fetchMyProfile(me) });
  const posts = useQuery({ queryKey: ['posts', me, tab], queryFn: () => fetchPosts(me, { savedOnly: tab === 'salvos' }) });

  return (
    <Screen>
      <SafeAreaView style={{ flex: 1 }}>
        <Header lead="Rede" rest="de quem faz." right={<Chip label="Cena" icon="spark" onPress={() => router.push('/cena')} />} />
        <ScrollView contentContainerStyle={s.box} keyboardShouldPersistTaps="handled">
          <Pressable accessibilityRole="button" accessibilityLabel="Postar um trabalho" onPress={() => router.push('/post/new')} style={({ pressed }) => [s.composer, pressed && { opacity: 0.9 }]}>
            <View style={[s.avatar, { backgroundColor: blobColor(me) }]}>
              {mine.data?.avatar_url ? <Photo photo={mine.data.avatar_url} style={StyleSheet.absoluteFill} /> : <T style={{ color: '#fff', fontFamily: fonts.black }}>{mine.data?.name.charAt(0)}</T>}
            </View>
            <T style={{ flex: 1, color: colors.muted, fontSize: 15 }}>Poste um trabalho seu…</T>
            <View style={s.camera}><Icon name="image" size={20} color={colors.onAccent} /></View>
          </Pressable>
          <Segmented options={[{ id: 'tudo', label: 'Recentes' }, { id: 'salvos', label: 'Salvos' }]} value={tab} onChange={setTab} />
          {posts.isLoading ? <ActivityIndicator color={colors.accent} /> : (
            <View style={{ gap: 16 }}>
              {posts.data?.map((p) => <PostCard key={p.id} post={p} me={me} />)}
              {posts.data?.length === 0 && (
                <T style={s.empty}>{tab === 'salvos' ? 'Nenhum post salvo. Toque no marcador de um post para guardar.' : 'Ainda não há posts. Seja a primeira pessoa a postar.'}</T>
              )}
            </View>
          )}
          <T style={s.note}>Fotos ilustrativas de exemplo; não são dos trabalhos reais.</T>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const s = StyleSheet.create({
  box: { padding: 20, gap: 16, paddingBottom: 150 },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, paddingRight: 10, minHeight: 64, borderRadius: radius.pill, backgroundColor: glass.fillStrong, borderWidth: 1, borderColor: glass.border, ...(shadow.card as object) },
  avatar: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  camera: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  empty: { color: colors.muted, textAlign: 'center', marginVertical: 24 },
  note: { color: colors.muted, fontSize: 11.5, textAlign: 'center' },
});
