import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { MatchRing } from '../../components/MatchRing';
import { Button, Chip, T } from '../../components/ui';
import { genreLabel } from '../../constants/genres';
import { fetchJobFeed, fetchMyJobs, fetchMyProfile } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { brl } from '../../lib/contract';
import { formatShort } from '../../lib/dates';
import { STAGE_LABELS } from '../../lib/engagement';
import { colors, fonts, radius } from '../../theme';

const open = (id: string) => router.push({ pathname: '/job/[id]', params: { id } });

export default function Jobs() {
  const { session } = useAuth();
  const me = session!.user.id;
  const mine = useQuery({ queryKey: ['my-profile', me], queryFn: () => fetchMyProfile(me) });
  const isOwner = mine.data?.account_type === 'empresa';

  const feed = useQuery({ queryKey: ['jobs', me, 'feed'], queryFn: () => fetchJobFeed(me), enabled: mine.data != null && !isOwner });
  const own = useQuery({ queryKey: ['jobs', me, 'own'], queryFn: () => fetchMyJobs(me), enabled: mine.data != null && isOwner });

  if (mine.isLoading || feed.isLoading || own.isLoading) return <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />;

  if (isOwner) {
    return (
      <FlatList
        style={{ backgroundColor: colors.bg }}
        data={own.data}
        keyExtractor={(r) => r.job.id}
        contentContainerStyle={s.list}
        ListHeaderComponent={
          <View style={{ gap: 6, marginBottom: 6 }}>
            <T style={s.title}>Meus jobs</T>
            <T style={s.sub}>Publique uma vaga e receba os profissionais mais compatíveis.</T>
            <Button title="Publicar novo job" arrow onPress={() => router.push('/job/new')} />
          </View>
        }
        ListEmptyComponent={<T style={s.empty}>Você ainda não publicou nenhum job.</T>}
        renderItem={({ item: r }) => (
          <Pressable style={s.card} onPress={() => open(r.job.id)} accessibilityRole="button" accessibilityLabel={`Abrir job ${r.job.title}`}>
            <View style={{ flex: 1, gap: 6 }}>
              <T style={s.jobTitle}>{r.job.title}</T>
              <T style={s.meta}>{r.job.role} · {formatShort(r.job.date)} · {r.job.city ?? 'Remoto'}</T>
              <View style={s.chips}>
                <Chip label={`${r.applicants} ${r.applicants === 1 ? 'candidato' : 'candidatos'}`} />
                {r.stage ? <Chip label={STAGE_LABELS[r.stage]} tint={colors.accent} /> : <Chip label="Aberto" tint={colors.like} />}
              </View>
            </View>
          </Pressable>
        )}
      />
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      data={feed.data}
      keyExtractor={(c) => c.job.id}
      contentContainerStyle={s.list}
      ListHeaderComponent={
        <View style={{ gap: 6, marginBottom: 6 }}>
          <T style={s.title}>Jobs para você</T>
          <T style={s.sub}>Do melhor match para o pior. Candidatar-se é grátis.</T>
        </View>
      }
      ListEmptyComponent={<T style={s.empty}>Nenhum job aberto agora.</T>}
      renderItem={({ item: c }) => (
        <Pressable style={s.card} onPress={() => open(c.job.id)} accessibilityRole="button" accessibilityLabel={`${c.job.title}, ${c.score}% compatível`}>
          <MatchRing score={c.score} />
          <View style={{ flex: 1, gap: 4 }}>
            <T style={s.jobTitle} numberOfLines={2}>{c.job.title}</T>
            <T style={s.meta} numberOfLines={1}>{c.ownerName} · {c.job.role}</T>
            <T style={s.meta}>
              {formatShort(c.job.date)} · {c.job.city ?? 'Remoto'}{c.distanceKm ? ` · ${c.distanceKm} km` : ''} · {brl(c.job.budget_per_day)}/dia
            </T>
            <View style={s.chips}>
              <Chip label={genreLabel(c.job.genre)} />
              {c.selected ? <Chip label="Você foi escolhido" tint={colors.like} /> : c.applied ? <Chip label="Candidatado" tint={colors.accent} /> : null}
            </View>
          </View>
        </Pressable>
      )}
    />
  );
}

const s = StyleSheet.create({
  list: { padding: 16, gap: 12, paddingBottom: 110 },
  title: { fontFamily: fonts.semibold, fontSize: 28 },
  sub: { color: colors.muted, marginBottom: 8 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', gap: 14, alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  jobTitle: { fontFamily: fonts.semibold, fontSize: 16 },
  meta: { color: colors.muted, fontSize: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
});
