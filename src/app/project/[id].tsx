import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { AuraCard, auraFor } from '../../components/AuraCard';
import { Chip, T } from '../../components/ui';
import { chooseForRole, fetchProject, talkToInterested, toggleProjectInterest } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { brl } from '../../lib/contract';
import { STATUS_LABELS } from '../../lib/demoProjects';
import { colors, fonts } from '../../theme';

const errMsg = (e: unknown) => (e instanceof Error ? e.message : 'Tente novamente.');

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const me = session!.user.id;
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['project', id, me], queryFn: () => fetchProject(id, me) });
  const refresh = () => Promise.all(['project', 'projects', 'home', 'matches'].map((k) => qc.invalidateQueries({ queryKey: [k] })));
  const run = useMutation({ mutationFn: async (fn: () => Promise<unknown>) => fn(), onSuccess: refresh, onError: (e) => Alert.alert('Não foi possível continuar', errMsg(e)) });

  if (q.isLoading || !q.data) return <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />;
  const d = q.data;
  const p = d.project;

  const chat = async (proId: string, name: string) => {
    try {
      const matchId = await talkToInterested(id, me, proId);
      await refresh();
      router.push({ pathname: '/chat/[matchId]', params: { matchId, name } });
    } catch (e) { Alert.alert('Não foi possível abrir a conversa', errMsg(e)); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen options={{ title: 'Projeto', headerShown: true, headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.text, headerShadowVisible: false }} />
      <ScrollView contentContainerStyle={s.box}>
        <View style={{ gap: 6 }}>
          <T style={s.kind}>PROJETO ABERTO · {STATUS_LABELS[d.status].toUpperCase()}</T>
          <T style={s.title}>{p.title}</T>
          <T style={s.meta}>{d.owner.name} · {p.city ?? 'Remoto'} · Orçamento {brl(p.budget_total)}</T>
          {p.description ? <T style={s.desc}>{p.description}</T> : null}
        </View>

        <T style={s.section}>Funções</T>
        {p.roles.map((r) => {
          const filled = d.filledProfiles[r.role];
          const interested = d.interestedProfiles[r.role] ?? [];
          const iAmIn = r.interested.includes(me);
          return (
            <AuraCard key={r.role} aura={auraFor(p.id + r.role)}>
              <View style={{ gap: 8 }}>
                <View style={s.rowBetween}>
                  <T style={s.role}>{r.role}</T>
                  <Chip label={filled ? 'Preenchida' : 'Procurando'} tint={filled ? colors.like : colors.accent} />
                </View>
                {filled ? <T style={s.meta}>{filled.name}</T> : null}
                {!filled && d.mine && (
                  interested.length === 0 ? <T style={s.meta}>Ninguém marcou interesse ainda.</T> : interested.map((x) => (
                    <View key={x.id} style={s.person}>
                      <View style={{ flex: 1 }}>
                        <T style={s.name}>{x.name}</T>
                        <T style={s.meta}>{x.roles.join(', ')} · {x.city}</T>
                      </View>
                      <Chip label="Conversar" onPress={() => chat(x.id, x.name)} />
                      <Chip label="Escolher" selected onPress={() => run.mutate(() => chooseForRole(id, me, r.role, x.id))} />
                    </View>
                  ))
                )}
                {!filled && !d.mine && (
                  <Chip label={iAmIn ? 'Interesse marcado (toque para retirar)' : 'Tenho interesse'} selected={iAmIn} onPress={() => run.mutate(() => toggleProjectInterest(id, me, r.role))} />
                )}
              </View>
            </AuraCard>
          );
        })}
        {!d.mine && <T style={s.meta}>Marcar interesse é grátis. Quem criou o projeto vê o seu perfil e pode chamar você para conversar.</T>}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  box: { padding: 20, gap: 14, paddingBottom: 60 },
  kind: { color: colors.accent, fontSize: 11, fontFamily: fonts.semibold, letterSpacing: 1.2 },
  title: { fontFamily: fonts.semibold, fontSize: 26, lineHeight: 34 },
  meta: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  desc: { fontSize: 14, lineHeight: 21, marginTop: 4 },
  section: { fontFamily: fonts.semibold, fontSize: 18, marginTop: 6 },
  role: { fontFamily: fonts.semibold, fontSize: 16, flexShrink: 1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  person: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontFamily: fonts.semibold, fontSize: 14 },
});
