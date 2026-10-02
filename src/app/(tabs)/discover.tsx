import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Icon } from '../../components/Icon';
import { JobDeck } from '../../components/JobDeck';
import { OwnerJobCard, ProJobCard } from '../../components/JobCard';
import { Photo } from '../../components/Photo';
import { ProjectCardView } from '../../components/ProjectCardView';
import { Segmented } from '../../components/Segmented';
import { SwipeDeck } from '../../components/SwipeDeck';
import { Button, Chip, Header, Screen, T } from '../../components/ui';
import type { Decision } from '../../components/CardDeck';
import { ROLES } from '../../constants/roles';
import {
  applyToJob, fetchCandidates, fetchJobDeck, fetchMyJobs, fetchMyProfile, fetchProjects, fetchSavedJobs, jobsEnabled,
  recordSwipe, saveJob, skipJob, undoJobChoice, type JobCard,
} from '../../lib/api';
import { commonPoints } from '../../lib/common';
import { oppositeType } from '../../lib/matching';
import { useAuth } from '../../lib/auth';
import type { Profile } from '../../lib/types';
import { colors, fonts, glass, radius, shadow } from '../../theme';

type Mode = 'vagas' | 'pessoas' | 'salvas' | 'projetos';
type Last = { job: JobCard; d: Decision };

const NOTE: Record<Decision, string> = { like: 'Candidatura enviada', pass: 'Vaga pulada', save: 'Vaga salva' };

export default function Discover() {
  const { session } = useAuth();
  const me = session!.user.id;
  const qc = useQueryClient();
  const [role, setRole] = useState<string | undefined>();
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mode, setMode] = useState<Mode | null>(null);
  const [matched, setMatched] = useState<Profile | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);
  const [last, setLast] = useState<Last | null>(null);

  const mine = useQuery({ queryKey: ['my-profile', me], queryFn: () => fetchMyProfile(me) });
  const isOwner = mine.data?.account_type === 'empresa';
  const target = mine.data ? oppositeType(mine.data.account_type) : undefined;
  // Sem o backend de vagas (fora da demo) só existe o deck de pessoas.
  const current: Mode = !jobsEnabled ? 'pessoas' : mode ?? (isOwner ? 'pessoas' : 'vagas');

  useEffect(() => { if (mine.data && mode == null && jobsEnabled) setMode(isOwner ? 'pessoas' : 'vagas'); }, [mine.data, mode, isOwner]);

  const people = useQuery({
    queryKey: ['candidates', me, target, role, onlyAvailable],
    queryFn: () => fetchCandidates(me, { accountType: target, role, onlyAvailable }),
    enabled: Boolean(target) && current === 'pessoas',
  });
  const deck = useQuery({ queryKey: ['jobs', me, 'deck'], queryFn: () => fetchJobDeck(me), enabled: jobsEnabled && !isOwner && mine.data != null && current === 'vagas' });
  const saved = useQuery({ queryKey: ['jobs', me, 'saved'], queryFn: () => fetchSavedJobs(me), enabled: jobsEnabled && !isOwner && current === 'salvas' });
  const own = useQuery({ queryKey: ['jobs', me, 'own'], queryFn: () => fetchMyJobs(me), enabled: jobsEnabled && isOwner && current === 'vagas' });
  const projects = useQuery({ queryKey: ['projects', me], queryFn: () => fetchProjects(me), enabled: jobsEnabled && current === 'projetos' });
  const peopleDeck = (people.data ?? []).filter((p) => !hidden.includes(p.id));
  const jobCards = (deck.data ?? []).filter((c) => !hidden.includes(c.job.id));

  const refreshJobs = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['jobs'] });
    qc.invalidateQueries({ queryKey: ['home'] });
  }, [qc]);

  const onSwipe = useCallback(
    async (p: Profile, dir: 'like' | 'pass') => {
      setHidden((h) => [...h, p.id]);
      try {
        const isMatch = await recordSwipe(me, p.id, dir);
        if (isMatch) {
          setMatched(p);
          qc.invalidateQueries({ queryKey: ['matches'] });
          qc.invalidateQueries({ queryKey: ['home'] });
        }
      } catch (e) {
        setHidden((h) => h.filter((id) => id !== p.id));
        Alert.alert('Erro ao registrar', e instanceof Error ? e.message : 'Tente novamente.');
      }
    },
    [me, qc],
  );

  const onJobDecision = useCallback(
    async (c: JobCard, d: Decision) => {
      setHidden((h) => [...h, c.job.id]);
      setLast({ job: c, d });
      try {
        if (d === 'like') await applyToJob(c.job.id, me);
        else if (d === 'save') await saveJob(c.job.id, me);
        else await skipJob(c.job.id, me);
        refreshJobs();
      } catch (e) {
        setHidden((h) => h.filter((id) => id !== c.job.id));
        setLast(null);
        Alert.alert('Não deu certo', e instanceof Error ? e.message : 'Tente novamente.');
      }
    },
    [me, refreshJobs],
  );

  const undo = useCallback(async () => {
    if (!last) return;
    try {
      await undoJobChoice(last.job.job.id, me);
      setHidden((h) => h.filter((id) => id !== last.job.job.id));
      setLast(null);
      refreshJobs();
    } catch (e) {
      Alert.alert('Não dá para desfazer', e instanceof Error ? e.message : 'Tente novamente.');
    }
  }, [last, me, refreshJobs]);

  const segments: { id: Mode; label: string }[] = isOwner
    ? [{ id: 'pessoas', label: 'Pessoas' }, { id: 'vagas', label: 'Minhas vagas' }, { id: 'projetos', label: 'Projetos' }]
    : [{ id: 'vagas', label: 'Vagas' }, { id: 'pessoas', label: 'Pessoas' }, { id: 'salvas', label: 'Salvas' }, { id: 'projetos', label: 'Projetos' }];

  const openJob = (id: string) => router.push({ pathname: '/job/[id]', params: { id } });

  return (
    <Screen>
      <SafeAreaView style={{ flex: 1, paddingBottom: 96 }}>
        <Header lead={jobsEnabled ? 'Explorar' : 'Descobrir'} rest={current === 'vagas' && !isOwner ? 'vagas para você.' : current === 'pessoas' ? (isOwner ? 'talentos da região.' : 'quem contrata.') : undefined} />
        {jobsEnabled && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            <Segmented options={segments} value={current} onChange={(m) => { setMode(m); setLast(null); }} />
          </View>
        )}

        {current === 'vagas' && !isOwner && jobsEnabled ? (
          deck.isLoading || mine.isLoading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} /> : (
            <View style={{ flex: 1 }}>
              <JobDeck
                cards={jobCards}
                onDecision={onJobDecision}
                onOpen={(c) => openJob(c.job.id)}
                canUndo={Boolean(last)}
                onUndo={undo}
              />
              {last && (
                <View style={s.toast} pointerEvents="none">
                  <Icon name={last.d === 'like' ? 'check' : last.d === 'save' ? 'bookmark' : 'x'} size={16} color={colors.text} />
                  <T style={s.toastText} numberOfLines={1}>{NOTE[last.d]}</T>
                </View>
              )}
            </View>
          )
        ) : null}

        {current === 'pessoas' ? (
          <>
            <View style={s.filterBar}>
              <Chip label={target === 'empresa' ? 'Só contratando' : 'Só disponíveis'} selected={onlyAvailable} onPress={() => setOnlyAvailable((v) => !v)} />
              <Pressable accessibilityRole="button" accessibilityState={{ expanded: filtersOpen }} onPress={() => setFiltersOpen((v) => !v)} style={s.filterBtn}>
                <Icon name="filter" size={16} color={colors.text} />
                <T style={{ fontSize: 13, fontFamily: fonts.semibold }}>{role ?? 'Função'}</T>
                <Icon name="chevron-down" size={14} color={colors.muted} />
              </Pressable>
            </View>
            {filtersOpen && (
              <View style={s.roles}>
                {ROLES.map((r) => (
                  <Chip key={r} label={r} selected={role === r} onPress={() => { setRole(role === r ? undefined : r); setFiltersOpen(false); }} />
                ))}
              </View>
            )}
            {people.isLoading || mine.isLoading ? (
              <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
            ) : people.error ? (
              <T style={{ color: colors.danger, padding: 20 }}>Erro ao carregar perfis.</T>
            ) : (
              <SwipeDeck profiles={peopleDeck} onSwipe={onSwipe} />
            )}
          </>
        ) : null}

        {current === 'salvas' ? (
          <ScrollView contentContainerStyle={s.list}>
            <T style={s.hint}>Vagas que você guardou para decidir depois.</T>
            {saved.data?.map((c) => <ProJobCard key={c.job.id} c={c} onPress={() => openJob(c.job.id)} />)}
            {saved.data?.length === 0 && <T style={s.empty}>Nada salvo ainda. Deslize uma vaga para cima, ou toque no marcador, para guardar.</T>}
          </ScrollView>
        ) : null}

        {current === 'vagas' && isOwner ? (
          <ScrollView contentContainerStyle={s.list}>
            <T style={s.hint}>Vagas pagas por diária, com match e contrato.</T>
            {own.data?.map((r) => <OwnerJobCard key={r.job.id} r={r} onPress={() => openJob(r.job.id)} />)}
            {own.data?.length === 0 && <T style={s.empty}>Você ainda não publicou vagas.</T>}
            <Button title="Publicar vaga" icon="plus" onPress={() => router.push('/job/new')} />
          </ScrollView>
        ) : null}

        {current === 'projetos' ? (
          <ScrollView contentContainerStyle={s.list}>
            <T style={s.hint}>Ideias que procuram equipe. Marque interesse nas funções que combinam com você.</T>
            {projects.data?.map((c) => <ProjectCardView key={c.project.id} c={c} onPress={() => router.push({ pathname: '/project/[id]', params: { id: c.project.id } })} />)}
            {projects.isLoading && <ActivityIndicator color={colors.accent} />}
            <Button title="Criar projeto aberto" variant="glass" icon="plus" onPress={() => router.push('/project/new')} />
          </ScrollView>
        ) : null}
      </SafeAreaView>

      <Modal visible={Boolean(matched)} transparent animationType="fade">
        <View style={s.modal}>
          <View style={s.matchCard}>
            {matched?.avatar_url ? <View style={s.matchPhoto}><Photo photo={matched.avatar_url} style={{ width: '100%', height: '100%' }} /></View> : null}
            <T style={s.matchTitle}>É um match!</T>
            <T style={{ textAlign: 'center', fontFamily: fonts.light, fontSize: 17 }}>
              Você e {matched?.name} querem trabalhar juntos.
            </T>
            {matched && mine.data ? (
              <View style={{ alignSelf: 'stretch', gap: 8 }}>
                <T style={{ fontFamily: fonts.semibold, textAlign: 'center' }}>Vocês combinam</T>
                {commonPoints(mine.data, matched).map((pt) => (
                  <View key={pt} style={s.point}><Icon name="check" size={15} color={colors.like} /><T style={{ color: colors.muted, fontSize: 14, flexShrink: 1 }}>{pt}</T></View>
                ))}
              </View>
            ) : null}
            <View style={{ gap: 10, alignSelf: 'stretch' }}>
              <Button title="Ver conversas" arrow onPress={() => { setMatched(null); router.push('/matches'); }} />
              <Button title="Continuar" variant="ghost" onPress={() => setMatched(null)} />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const s = StyleSheet.create({
  filterBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, minHeight: 36, borderRadius: radius.pill, backgroundColor: glass.fillStrong, borderWidth: 1, borderColor: glass.border, maxWidth: 220 },
  roles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  list: { padding: 20, gap: 12, paddingBottom: 40 },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  empty: { color: colors.muted, textAlign: 'center', marginVertical: 24 },
  toast: { position: 'absolute', top: 6, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: glass.fillStrong, borderWidth: 1, borderColor: glass.border, ...(shadow.card as object) },
  toastText: { fontSize: 13, fontFamily: fonts.semibold },
  modal: { flex: 1, backgroundColor: 'rgba(11,11,15,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  matchCard: { alignSelf: 'stretch', maxWidth: 420, backgroundColor: colors.surface, borderRadius: radius.xl, padding: 24, gap: 16, alignItems: 'center', ...(shadow.float as object) },
  matchPhoto: { width: 104, height: 104, borderRadius: 52, overflow: 'hidden', borderWidth: 4, borderColor: colors.accent },
  matchTitle: { color: colors.accent, fontSize: 34, fontFamily: fonts.black, letterSpacing: -0.5 },
  point: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
});
