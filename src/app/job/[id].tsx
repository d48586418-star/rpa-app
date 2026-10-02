import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, type IconName } from '../../components/Icon';
import { JobTile } from '../../components/JobCard';
import { MatchRing } from '../../components/MatchRing';
import { Photo } from '../../components/Photo';
import { Segmented } from '../../components/Segmented';
import { ScoreBreakdown } from '../../components/ScoreBreakdown';
import { StageStepper } from '../../components/StageStepper';
import { Button, Chip, IconButton, Input, Screen, T } from '../../components/ui';
import { genreLabel } from '../../constants/genres';
import {
  actOnEngagement, applyToJob, fetchJob, inviteCandidate, saveJob, selectCandidate, undoJobChoice,
  type CandidateRow, type EngagementView,
} from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { brl } from '../../lib/contract';
import { formatShort } from '../../lib/dates';
import { galleryFor } from '../../lib/photoKeys';
import { perksFor, requirementsFor } from '../../lib/jobInfo';
import { CRITERIA, weakestCriterion, type Action } from '../../lib/engagement';
import type { ReviewScores } from '../../lib/types';
import { colors, fonts, glass, gradients, radius, shadow } from '../../theme';

const errMsg = (e: unknown) => (e instanceof Error ? e.message : 'Tente novamente.');

export default function JobScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const me = session!.user.id;
  const qc = useQueryClient();
  const [tab, setTab] = useState<'sobre' | 'requisitos' | 'empresa'>('sobre');
  const [hero, setHero] = useState(0);
  const q = useQuery({ queryKey: ['job', id, me], queryFn: () => fetchJob(id, me) });
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: ['job'] }), qc.invalidateQueries({ queryKey: ['jobs'] }), qc.invalidateQueries({ queryKey: ['progress'] }), qc.invalidateQueries({ queryKey: ['matches'] }), qc.invalidateQueries({ queryKey: ['home'] })]);
  const run = useMutation({
    mutationFn: async (fn: () => Promise<unknown>) => fn(),
    onSuccess: refresh,
    onError: (e) => Alert.alert('Não foi possível continuar', errMsg(e)),
  });

  if (q.isLoading || !q.data) return <Screen><Stack.Screen options={{ headerShown: false }} /><ActivityIndicator color={colors.accent} style={{ marginTop: 80 }} /></Screen>;
  const d = q.data;
  const { job } = d;
  const photos = galleryFor(job);
  const isPro = d.side === 'pro' && !d.engagement;
  const canApply = isPro && job.status === 'open' && !d.applied;

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingBottom: canApply || (isPro && d.applied) ? 120 : 50 }} showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <Photo photo={photos[Math.min(hero, photos.length - 1)]} style={StyleSheet.absoluteFill} />
          <LinearGradient colors={gradients.photoShade} start={{ x: 0.5, y: 0.5 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
          <SafeAreaView style={s.heroBar}>
            <IconButton icon="arrow-left" label="Voltar" onPress={() => (router.canGoBack() ? router.back() : router.replace('/discover'))} />
            {isPro && job.status === 'open' && !d.applied ? (
              <IconButton
                icon="bookmark" label={d.saved ? 'Remover dos salvos' : 'Salvar vaga'}
                color={d.saved ? colors.accent : colors.text}
                onPress={() => run.mutate(() => (d.saved ? undoJobChoice(id, me) : saveJob(id, me)))}
              />
            ) : <View />}
          </SafeAreaView>
          <View style={s.thumbs}>
            {photos.map((k, i) => (
              <Pressable key={k} accessibilityRole="button" accessibilityLabel={`Foto ${i + 1} de ${photos.length}`} onPress={() => setHero(i)} style={[s.thumb, i === hero && s.thumbOn]}>
                <Photo photo={k} style={StyleSheet.absoluteFill} />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={s.sheet}>
          <T style={s.kicker}>{job.role.toUpperCase()}  ·  {genreLabel(job.genre).toUpperCase()}</T>
          <T style={s.title}>{job.title}</T>
          <View style={s.company}>
            <View style={s.cAvatar}>{d.owner.avatar_url ? <Photo photo={d.owner.avatar_url} style={StyleSheet.absoluteFill} /> : <T style={{ color: '#fff', fontFamily: fonts.bold }}>{d.owner.name.charAt(0)}</T>}</View>
            <View style={{ flex: 1 }}>
              <T style={{ fontFamily: fonts.semibold, fontSize: 14 }} numberOfLines={1}>{d.owner.name}</T>
              <T style={{ color: colors.muted, fontSize: 12.5 }} numberOfLines={1}>{d.owner.city ?? 'Sul da Bahia'} · {d.applicants} {d.applicants === 1 ? 'candidato' : 'candidatos'}</T>
            </View>
            {d.breakdown ? <MatchRing score={d.breakdown.total} size={50} /> : null}
          </View>
          <View style={s.stats}>
            <Stat icon="calendar" label="Data" value={formatShort(job.date)} />
            <Stat icon="clock" label="Diárias" value={String(job.days)} />
            <Stat icon="money" label="Por dia" value={brl(job.budget_per_day)} />
          </View>
          <View style={s.cityRow}><Icon name="pin" size={16} color={colors.accent} /><T style={{ fontSize: 14 }}>{job.city ?? 'Remoto'}</T></View>

          {d.engagement ? (
            <EngagementPanel view={d.engagement} busy={run.isPending} onAct={(a, p) => run.mutate(() => actOnEngagement(id, me, a, p))} />
          ) : d.side === 'pro' ? (
            <>
              <Segmented options={[{ id: 'sobre', label: 'Sobre' }, { id: 'requisitos', label: 'Requisitos' }, { id: 'empresa', label: 'Empresa' }]} value={tab} onChange={setTab} />
              {tab === 'sobre' && (
                <View style={{ gap: 16 }}>
                  <T style={s.desc}>{job.description || 'A empresa ainda não escreveu uma descrição.'}</T>
                  <ProSection detail={d} />
                  {d.similar.length > 0 && (
                    <View style={{ gap: 10 }}>
                      <T style={s.section}>Vagas parecidas</T>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                        {d.similar.map((c) => <JobTile key={c.job.id} c={c} onPress={() => router.push({ pathname: '/job/[id]', params: { id: c.job.id } })} />)}
                      </ScrollView>
                    </View>
                  )}
                </View>
              )}
              {tab === 'requisitos' && (
                <View style={{ gap: 14 }}>
                  <T style={s.section}>O que a vaga pede</T>
                  {requirementsFor(job).map((r) => <ListLine key={r} text={r} />)}
                  <T style={[s.section, { marginTop: 6 }]}>O que você recebe</T>
                  {perksFor(job).map((r) => <ListLine key={r} text={r} />)}
                </View>
              )}
              {tab === 'empresa' && (
                <View style={{ gap: 10 }}>
                  <T style={s.section}>{d.owner.name}</T>
                  <T style={s.desc}>{d.owner.bio ?? 'Sem apresentação.'}</T>
                  {d.owner.roles.length > 0 && <T style={s.meta}>Procura: {d.owner.roles.join(', ')}</T>}
                  {d.owner.gear ? <T style={s.meta}>Equipamento: {d.owner.gear}</T> : null}
                </View>
              )}
            </>
          ) : (
            <View style={{ gap: 14 }}>
              {job.description ? <T style={s.desc}>{job.description}</T> : null}
              {job.gear.length > 0 && <T style={s.meta}>Equipamento: {job.gear.join(', ')}</T>}
              <OwnerSection
                candidates={d.candidates}
                jobOpen={job.status === 'open'}
                busy={run.isPending}
                onChat={async (proId) => {
                  try {
                    const matchId = await inviteCandidate(id, me, proId);
                    await refresh();
                    router.push({ pathname: '/chat/[matchId]', params: { matchId, name: d.candidates.find((c) => c.profile.id === proId)?.profile.name ?? 'Conversa' } });
                  } catch (e) { Alert.alert('Não foi possível abrir a conversa', errMsg(e)); }
                }}
                onSelect={(proId) => run.mutate(() => selectCandidate(id, me, proId))}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {canApply && (
        <View style={s.cta}>
          <View style={{ flex: 1 }}><Button title="Candidatar-se (grátis)" icon="check" onPress={() => run.mutate(() => applyToJob(id, me))} loading={run.isPending} /></View>
        </View>
      )}
      {isPro && d.applied && (
        <View style={s.cta}>
          <View style={s.sent}><Icon name="check" size={18} color={colors.like} /><T style={{ flex: 1, fontSize: 13.5 }}>Candidatura enviada. A empresa vê seu match e seus créditos.</T></View>
          <Button title="Desfazer" variant="ghost" small onPress={() => run.mutate(() => undoJobChoice(id, me))} />
        </View>
      )}
    </Screen>
  );
}

function Stat({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={s.stat}>
      <Icon name={icon} size={18} color={colors.accent} />
      <T style={{ color: colors.muted, fontSize: 11.5 }}>{label}</T>
      <T style={{ fontFamily: fonts.semibold, fontSize: 15 }} numberOfLines={1}>{value}</T>
    </View>
  );
}

function ListLine({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
      <View style={s.tick}><Icon name="check" size={13} color={colors.accent} stroke={2.4} /></View>
      <T style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>{text}</T>
    </View>
  );
}

function ProSection({ detail }: { detail: NonNullable<ReturnType<typeof useQuery<Awaited<ReturnType<typeof fetchJob>>>>['data']> }) {
  return (
    <View style={{ gap: 12 }}>
      <View style={s.card}>
        <ScoreBreakdown breakdown={detail.breakdown!} suggestions={detail.suggestions} chance={detail.chance} />
      </View>
      {detail.job.status !== 'open' && !detail.applied && <T style={s.meta}>Esta vaga não está mais aberta.</T>}
    </View>
  );
}

function OwnerSection({ candidates, jobOpen, busy, onChat, onSelect }: { candidates: CandidateRow[]; jobOpen: boolean; busy: boolean; onChat: (id: string) => void; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <View style={{ gap: 12 }}>
      <T style={s.section}>Candidatos por compatibilidade</T>
      {candidates.length === 0 && <T style={s.meta}>Ninguém se candidatou ainda.</T>}
      {candidates.map((c, i) => (
        <View key={c.profile.id} style={s.card}>
          <View style={s.cand}>
            <MatchRing score={c.score} />
            <View style={{ flex: 1, gap: 2 }}>
              <T style={s.name}>{i + 1}. {c.profile.name}</T>
              <T style={s.meta}>{c.profile.roles.join(', ')} · {c.profile.city}</T>
              <View style={s.chips}>
                <Chip label={`Chance ${c.chance}`} />
                {c.isNew && <Chip label="Conta nova" tint={colors.blue} />}
              </View>
            </View>
          </View>
          {open === c.profile.id && <View style={{ marginTop: 12 }}><ScoreBreakdown breakdown={c.breakdown} compact={false} /></View>}
          <View style={s.actions}>
            <Chip label={open === c.profile.id ? 'Ocultar detalhes' : 'Ver detalhes do match'} onPress={() => setOpen(open === c.profile.id ? null : c.profile.id)} />
            <Chip label="Convidar e conversar" onPress={() => onChat(c.profile.id)} />
          </View>
          {jobOpen && <Button title={`Fechar com ${c.profile.name.split(' ')[0]}`} onPress={() => onSelect(c.profile.id)} loading={busy} />}
        </View>
      ))}
    </View>
  );
}

const ACTION_TITLES: Record<Action, string> = {
  accept_contract: 'Aceitar contrato',
  pay_escrow: 'Pagar em custódia (simulação)',
  check_in: 'Fazer check-in no set',
  check_out: 'Fazer check-out',
  release: 'Liberar pagamento',
  review: 'Enviar avaliação',
};

function EngagementPanel({ view, busy, onAct }: { view: EngagementView; busy: boolean; onAct: (a: Action, payload?: { scores: ReviewScores; tip?: string }) => void }) {
  const { engagement: e, quote: q } = view;
  const [showContract, setShowContract] = useState(false);
  const [scores, setScores] = useState<ReviewScores>({ tecnica: 5, comunicacao: 5, prazo: 5 });
  const [tip, setTip] = useState('');
  const money = e.stage === 'aguardando_pagamento' || e.stage === 'em_custodia' || e.stage === 'entregue';
  const other = view.side === 'pro' ? view.owner.name : view.pro.name;

  return (
    <View style={{ gap: 14 }}>
      <T style={s.section}>Contrato e pagamento</T>
      <StageStepper stage={e.stage} />

      <View style={s.card}>
        <T style={s.name}>{view.pro.name} com {view.owner.name}</T>
        <T style={s.meta}>Para o profissional: {brl(q.proReceives)} · Taxa de serviço (contratante): {brl(q.fee)} · Total do contratante: {brl(q.total)}</T>
        <Chip label={showContract ? 'Ocultar contrato' : 'Ver contrato'} onPress={() => setShowContract((v) => !v)} />
        {showContract && view.clauses.map((c) => (
          <View key={c.title} style={{ gap: 2, marginTop: 8 }}>
            <T style={s.clause}>{c.title}</T>
            <T style={s.meta}>{c.body}</T>
          </View>
        ))}
      </View>

      {money && <T style={s.sim}>Simulação: nenhum dinheiro real é movimentado.</T>}

      {e.stage === 'concluido' ? (
        <View style={s.card}>
          <T style={s.ok}>Job concluído. {view.side === 'pro' ? 'Você ganhou:' : 'O profissional ganhou:'}</T>
          {e.xp_awarded.map((x) => <T key={x.label} style={s.meta}>+{x.xp} XP · {x.label}</T>)}
          {view.review?.tip ? <T style={s.meta}>Dica do contratante: {view.review.tip}</T> : null}
          {view.review && view.side === 'pro' ? <T style={s.meta}>Ponto a melhorar: {weakestCriterion(view.review.scores)}.</T> : null}
        </View>
      ) : view.next === 'review' ? (
        <View style={s.card}>
          <T style={s.name}>Avalie {view.pro.name}</T>
          {CRITERIA.map((c) => (
            <View key={c.key} style={{ gap: 6 }}>
              <T style={s.meta}>{c.label}</T>
              <View style={s.chips}>
                {[1, 2, 3, 4, 5].map((n) => <Chip key={n} label={String(n)} selected={scores[c.key] === n} onPress={() => setScores((s0) => ({ ...s0, [c.key]: n }))} />)}
              </View>
            </View>
          ))}
          <Input placeholder="Uma dica para o profissional (opcional)" value={tip} onChangeText={setTip} maxLength={200} />
          <Button title={ACTION_TITLES.review} arrow onPress={() => onAct('review', { scores, tip })} loading={busy} />
        </View>
      ) : view.next ? (
        <View style={{ gap: 8 }}>
          {view.next === 'release' && <T style={s.meta}>Na versão real, o pagamento é liberado automaticamente 24 horas após o check-out.</T>}
          <Button title={ACTION_TITLES[view.next]} arrow onPress={() => onAct(view.next!)} loading={busy} />
        </View>
      ) : (
        <T style={s.meta}>Aguardando {other}.</T>
      )}

      {view.matchId && (
        <Button variant="ghost" title={`Conversar com ${other}`} onPress={() => router.push({ pathname: '/chat/[matchId]', params: { matchId: view.matchId!, name: other } })} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  hero: { height: 340, backgroundColor: colors.surfaceAlt },
  heroBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12 },
  thumbs: { position: 'absolute', left: 20, bottom: 40, flexDirection: 'row', gap: 8 },
  thumb: { width: 46, height: 46, borderRadius: 14, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  thumbOn: { borderColor: '#fff' },
  sheet: { marginTop: -26, borderTopLeftRadius: 32, borderTopRightRadius: 32, backgroundColor: colors.bg, padding: 20, gap: 16 },
  kicker: { color: colors.accent, fontFamily: fonts.semibold, fontSize: 11.5, letterSpacing: 1.2 },
  company: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: radius.lg, backgroundColor: glass.fillStrong, borderWidth: 1, borderColor: glass.border },
  cAvatar: { width: 44, height: 44, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, gap: 3, padding: 12, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tick: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  cta: { position: 'absolute', left: 16, right: 16, bottom: 16, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: radius.xl, backgroundColor: glass.fillStrong, borderWidth: 1, borderColor: glass.border, ...(shadow.float as object) },
  sent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8 },
  box: { padding: 20, gap: 18, paddingBottom: 60 },
  title: { fontFamily: fonts.semibold, fontSize: 26, lineHeight: 34 },
  meta: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  desc: { fontSize: 14, lineHeight: 21, marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, gap: 10, borderWidth: 1, borderColor: colors.border },
  section: { fontFamily: fonts.semibold, fontSize: 18 },
  name: { fontFamily: fonts.semibold, fontSize: 16 },
  cand: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  ok: { color: colors.like, fontSize: 14, lineHeight: 21 },
  sim: { color: colors.accent, fontSize: 13, textAlign: 'center' },
  clause: { fontFamily: fonts.semibold, fontSize: 13 },
});
