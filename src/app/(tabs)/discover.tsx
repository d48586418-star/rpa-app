import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, View } from 'react-native';
import { SwipeDeck } from '../../components/SwipeDeck';
import { ProJobCard } from '../../components/JobCard';
import { ProjectCardView } from '../../components/ProjectCardView';
import { Segmented } from '../../components/Segmented';
import { Button, Chip, T } from '../../components/ui';
import { ROLES } from '../../constants/roles';
import { fetchCandidates, fetchJobFeed, fetchMyProfile, fetchProjects, jobsEnabled, recordSwipe } from '../../lib/api';
import { commonPoints } from '../../lib/common';
import { oppositeType } from '../../lib/matching';
import { useAuth } from '../../lib/auth';
import type { Profile } from '../../lib/types';
import { colors, fonts } from '../../theme';
import { router } from 'expo-router';

export default function Discover() {
  const { session } = useAuth();
  const me = session!.user.id;
  const qc = useQueryClient();
  const [role, setRole] = useState<string | undefined>();
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [mode, setMode] = useState<'talentos' | 'projetos'>('talentos');
  const [matched, setMatched] = useState<Profile | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);

  const mine = useQuery({ queryKey: ['my-profile', me], queryFn: () => fetchMyProfile(me) });
  const target = mine.data ? oppositeType(mine.data.account_type) : undefined;
  const { data, isLoading, error } = useQuery({
    queryKey: ['candidates', me, target, role, onlyAvailable],
    queryFn: () => fetchCandidates(me, { accountType: target, role, onlyAvailable }),
    enabled: Boolean(target),
  });
  const feed = useQuery({ queryKey: ['jobs', me, 'feed'], queryFn: () => fetchJobFeed(me), enabled: jobsEnabled && mode === 'projetos' && mine.data?.account_type === 'freelancer' });
  const projects = useQuery({ queryKey: ['projects', me], queryFn: () => fetchProjects(me), enabled: jobsEnabled && mode === 'projetos' });
  const deck = (data ?? []).filter((p) => !hidden.includes(p.id));

  const onSwipe = useCallback(
    async (p: Profile, dir: 'like' | 'pass') => {
      setHidden((h) => [...h, p.id]);
      try {
        const isMatch = await recordSwipe(me, p.id, dir);
        if (isMatch) {
          setMatched(p);
          qc.invalidateQueries({ queryKey: ['matches'] });
        }
      } catch (e) {
        setHidden((h) => h.filter((id) => id !== p.id));
        Alert.alert('Erro ao registrar', e instanceof Error ? e.message : 'Tente novamente.');
      }
    },
    [me, qc],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingBottom: 84 }}>
      {jobsEnabled && (
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <Segmented options={[{ id: 'talentos', label: 'Talentos' }, { id: 'projetos', label: 'Projetos' }]} value={mode} onChange={setMode} />
        </View>
      )}
      {mode === 'talentos' ? (
        <>
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
              <Chip label={target === 'empresa' ? 'Só contratando' : 'Só disponíveis'} selected={onlyAvailable} onPress={() => setOnlyAvailable((v) => !v)} />
              {ROLES.map((r) => (
                <Chip key={r} label={r} selected={role === r} onPress={() => setRole(role === r ? undefined : r)} />
              ))}
            </ScrollView>
          </View>
          {isLoading || mine.isLoading ? (
            <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
          ) : error ? (
            <T style={{ color: colors.danger, padding: 20 }}>Erro ao carregar perfis.</T>
          ) : (
            <SwipeDeck profiles={deck} onSwipe={onSwipe} />
          )}
        </>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
          <T style={{ color: colors.muted, fontSize: 13 }}>Projetos e jobs que combinam com você. Toque para ver e marcar interesse.</T>
          {projects.data?.map((c) => <ProjectCardView key={c.project.id} c={c} onPress={() => router.push({ pathname: '/project/[id]', params: { id: c.project.id } })} />)}
          {feed.data?.slice(0, 4).map((c) => <ProJobCard key={c.job.id} c={c} onPress={() => router.push({ pathname: '/job/[id]', params: { id: c.job.id } })} />)}
          {projects.isLoading && <ActivityIndicator color={colors.accent} />}
        </ScrollView>
      )}
      <Modal visible={Boolean(matched)} transparent animationType="fade">
        <View style={s.modal}>
          <T style={s.matchTitle}>É um match!</T>
          <T style={{ textAlign: 'center', fontFamily: fonts.light, fontSize: 18 }}>
            Você e {matched?.name} querem trabalhar juntos.
          </T>
          {matched && mine.data ? (
            <View style={{ alignSelf: 'stretch', gap: 6 }}>
              <T style={{ fontFamily: fonts.semibold, textAlign: 'center' }}>Vocês combinam</T>
              {commonPoints(mine.data, matched).map((pt) => <T key={pt} style={{ color: colors.muted, textAlign: 'center', fontSize: 14 }}>✓ {pt}</T>)}
            </View>
          ) : null}
          <View style={{ gap: 10, alignSelf: 'stretch' }}>
            <Button title="Ver conversas" arrow onPress={() => { setMatched(null); router.push('/matches'); }} />
            <Button title="Continuar" variant="ghost" onPress={() => setMatched(null)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  filters: { gap: 8, padding: 12 },
  modal: { flex: 1, backgroundColor: 'rgba(5,5,5,0.94)', alignItems: 'center', justifyContent: 'center', padding: 28, gap: 18 },
  matchTitle: { color: colors.accent, fontSize: 36, fontFamily: fonts.black },
});
