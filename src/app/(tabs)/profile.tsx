import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Photo, photoSource } from '../../components/Photo';
import { ProfileForm } from '../../components/ProfileForm';
import { blobColor } from '../../components/ProfileCard';
import { ProgressSection } from '../../components/ProgressSection';
import { Button, Collapsible, Screen, T } from '../../components/ui';
import { fetchMyProfile, fetchPosts, fetchProgress, jobsEnabled } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { profileSubtitle } from '../../lib/profileText';
import { signOut } from '../../lib/authActions';
import { availabilityTone } from '../../lib/availability';
import { colors, fonts, glass, gradients, radius, shadow } from '../../theme';

const TONE = { good: colors.like, warn: colors.accent, bad: colors.danger, info: colors.blue } as const;

export default function ProfileTab() {
  const { session } = useAuth();
  const me = session!.user.id;
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ['my-profile', me], queryFn: () => fetchMyProfile(me) });
  const demoFreelancer = jobsEnabled && data?.account_type === 'freelancer';
  const prog = useQuery({ queryKey: ['progress', me], queryFn: () => fetchProgress(me), enabled: demoFreelancer });
  const mine = useQuery({ queryKey: ['posts', me, 'mine'], queryFn: () => fetchPosts(me, { authorId: me }), enabled: jobsEnabled });
  if (isLoading || !data) return <Screen><ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} /></Screen>;
  const hasPhoto = Boolean(photoSource(data.avatar_url));

  return (
    <Screen>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.box} keyboardShouldPersistTaps="handled">
          <View style={s.hero}>
            {hasPhoto ? (
              <>
                <Photo photo={data.avatar_url} style={StyleSheet.absoluteFill} />
                <LinearGradient colors={gradients.photoShade} start={{ x: 0.5, y: 0.4 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
              </>
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: blobColor(data.id), alignItems: 'center', justifyContent: 'center' }]}>
                <T style={{ color: '#fff', fontFamily: fonts.black, fontSize: 96 }}>{data.name.charAt(0)}</T>
              </View>
            )}
            <View style={s.panel}>
              <T style={s.name} numberOfLines={2}>{data.name}</T>
              <T style={s.role} numberOfLines={1}>{profileSubtitle(data) || 'Sem cidade'}</T>
              {prog.data ? (
                <View style={s.pill}><View style={[s.dot, { backgroundColor: TONE[availabilityTone(prog.data.availability)] }]} /><T style={s.pillText}>{prog.data.availabilityText}</T></View>
              ) : null}
            </View>
          </View>
          {hasPhoto && <T style={s.note}>Foto ilustrativa de exemplo.</T>}

          <View style={s.actions}>
            {jobsEnabled && <View style={{ flex: 1 }}><Button title="Postar" icon="image" small onPress={() => router.push('/post/new')} /></View>}
            <View style={{ flex: 1 }}><Button title={editing ? 'Fechar edição' : 'Editar perfil'} variant="glass" small onPress={() => setEditing((v) => !v)} /></View>
          </View>

          {editing && (
            <ProfileForm
              userId={me}
              accountType={data.account_type}
              initial={data}
              submitLabel="Salvar alterações"
              onSaved={() => { setEditing(false); qc.invalidateQueries({ queryKey: ['my-profile'] }); qc.invalidateQueries({ queryKey: ['home'] }); }}
            />
          )}

          {jobsEnabled && (
            <Collapsible title="Meus posts" hint={`${mine.data?.length ?? 0}`} defaultOpen={(mine.data?.length ?? 0) > 0}>
              {mine.data && mine.data.length > 0 ? (
                <View style={s.mosaic}>
                  {mine.data.map((p) => <View key={p.id} style={s.mTile}><Photo photo={p.photo} style={StyleSheet.absoluteFill} /></View>)}
                </View>
              ) : <T style={s.note}>Você ainda não postou. Mostre um trabalho na Rede.</T>}
            </Collapsible>
          )}

          {demoFreelancer ? <ProgressSection userId={me} roles={data.roles} /> : null}

          <Button title="Sair" variant="ghost" onPress={() => signOut()} />
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const s = StyleSheet.create({
  box: { padding: 20, gap: 20, paddingBottom: 150 },
  hero: { height: 340, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.surfaceAlt, ...(shadow.float as object) },
  panel: { position: 'absolute', left: 12, right: 12, bottom: 12, padding: 16, gap: 6, borderRadius: radius.lg, backgroundColor: glass.onPhoto, borderWidth: 1, borderColor: glass.onPhotoBorder },
  name: { color: '#fff', fontFamily: fonts.semibold, fontSize: 28, lineHeight: 34, letterSpacing: -0.4 },
  role: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontFamily: fonts.semibold },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: 'rgba(11,11,15,0.4)', borderWidth: 1, borderColor: glass.onPhotoBorder, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  pillText: { color: '#fff', fontSize: 12.5, fontFamily: fonts.semibold, flexShrink: 1 },
  note: { color: colors.muted, fontSize: 12, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 10 },
  mosaic: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  mTile: { width: '32%', aspectRatio: 1, borderRadius: radius.sm, overflow: 'hidden', backgroundColor: colors.surfaceAlt },
});
