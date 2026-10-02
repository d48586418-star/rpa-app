import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { MatchRing } from '../../components/MatchRing';
import { ScoreBreakdown } from '../../components/ScoreBreakdown';
import { StageStepper } from '../../components/StageStepper';
import { Button, Chip, Input, T } from '../../components/ui';
import { genreLabel } from '../../constants/genres';
import {
  actOnEngagement, applyToJob, fetchJob, inviteCandidate, selectCandidate,
  type CandidateRow, type EngagementView,
} from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { brl } from '../../lib/contract';
import { formatShort } from '../../lib/dates';
import { CRITERIA, weakestCriterion, type Action } from '../../lib/engagement';
import type { ReviewScores } from '../../lib/types';
import { colors, fonts, radius } from '../../theme';

const errMsg = (e: unknown) => (e instanceof Error ? e.message : 'Tente novamente.');

export default function JobScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const me = session!.user.id;
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['job', id, me], queryFn: () => fetchJob(id, me) });
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: ['job'] }), qc.invalidateQueries({ queryKey: ['jobs'] }), qc.invalidateQueries({ queryKey: ['progress'] }), qc.invalidateQueries({ queryKey: ['matches'] })]);
  const run = useMutation({
    mutationFn: async (fn: () => Promise<unknown>) => fn(),
    onSuccess: refresh,
    onError: (e) => Alert.alert('Não foi possível continuar', errMsg(e)),
  });

  if (q.isLoading || !q.data) return <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />;
  const d = q.data;
  const { job } = d;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen options={{ title: 'Job', headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.text, headerShadowVisible: false }} />
      <ScrollView contentContainerStyle={s.box}>
        <View style={{ gap: 6 }}>
          <T style={s.title}>{job.title}</T>
          <T style={s.meta}>{d.owner.name} · {job.role}</T>
          <View style={s.chips}>
            <Chip label={genreLabel(job.genre)} />
            <Chip label={`${formatShort(job.date)}${job.days > 1 ? ` (${job.days} diárias)` : ''}`} />
            <Chip label={job.city ?? 'Remoto'} />
            <Chip label={`${brl(job.budget_per_day)}/dia`} tint={colors.accent} />
          </View>
          {job.gear.length > 0 && <T style={s.meta}>Equipamento: {job.gear.join(', ')}</T>}
          {job.description ? <T style={s.desc}>{job.description}</T> : null}
        </View>

        {d.engagement ? (
          <EngagementPanel view={d.engagement} busy={run.isPending} onAct={(a, p) => run.mutate(() => actOnEngagement(id, me, a, p))} />
        ) : d.side === 'pro' ? (
          <ProSection detail={d} busy={run.isPending} onApply={() => run.mutate(() => applyToJob(id, me))} />
        ) : (
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
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProSection({ detail, busy, onApply }: { detail: NonNullable<ReturnType<typeof useQuery<Awaited<ReturnType<typeof fetchJob>>>>['data']>; busy: boolean; onApply: () => void }) {
  return (
    <View style={{ gap: 16 }}>
      <View style={s.card}>
        <ScoreBreakdown breakdown={detail.breakdown!} suggestions={detail.suggestions} chance={detail.chance} />
      </View>
      {detail.applied ? (
        <T style={s.ok}>Você se candidatou. Candidatar-se é grátis; o contratante vê seu match e seus créditos.</T>
      ) : detail.job.status === 'open' ? (
        <Button title="Candidatar-se (grátis)" arrow onPress={onApply} loading={busy} />
      ) : (
        <T style={s.meta}>Este job não está mais aberto.</T>
      )}
      <T style={s.meta}>{detail.applicants} {detail.applicants === 1 ? 'candidato' : 'candidatos'} até agora.</T>
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
