import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { AuraCard, auraFor } from '../../components/AuraCard';
import { Icon } from '../../components/Icon';
import { OwnerJobCard, ProJobCard } from '../../components/JobCard';
import { ProjectCardView } from '../../components/ProjectCardView';
import { Glass, T } from '../../components/ui';
import { KIND_LABEL } from '../../constants/cena';
import { fetchHome } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { formatShort, greeting } from '../../lib/dates';
import { blobColor } from '../../components/ProfileCard';
import { colors, fonts } from '../../theme';

function Section({ title, action, onAction, children }: { title: string; action?: string; onAction?: () => void; children: React.ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <View style={s.sectionHead}>
        <T style={s.section}>{title}</T>
        {action ? <Pressable onPress={onAction} accessibilityRole="button"><T style={s.action}>{action}</T></Pressable> : null}
      </View>
      {children}
    </View>
  );
}

export default function Inicio() {
  const { session } = useAuth();
  const me = session!.user.id;
  const q = useQuery({ queryKey: ['home', me], queryFn: () => fetchHome(me) });
  if (q.isLoading || !q.data) return <ActivityIndicator color={colors.accent} style={{ marginTop: 60 }} />;
  const d = q.data;
  const first = d.profile?.name.split(' ')[0] ?? '';
  const openJob = (id: string) => router.push({ pathname: '/job/[id]', params: { id } });
  const openProject = (id: string) => router.push({ pathname: '/project/[id]', params: { id } });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={s.box}>
        <View style={s.top}>
          <View style={{ flex: 1 }}>
            <T style={s.hello}>{greeting(new Date().getHours())},</T>
            <T style={s.name} numberOfLines={1}>{first}.</T>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={`Conversas, ${d.conversations}`} onPress={() => router.push('/matches')}>
            <Glass style={s.chatBtn}>
              <Icon name="chat" size={22} />
              {d.conversations > 0 && <View style={s.badge}><T style={s.badgeText}>{d.conversations}</T></View>}
            </Glass>
          </Pressable>
        </View>

        {d.isOwner ? (
          <Section title="Seus jobs" action="Ver todos" onAction={() => router.push('/projetos')}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hrow}>
              {d.jobs.map((r) => <View key={r.job.id} style={s.hcard}><OwnerJobCard r={r} onPress={() => openJob(r.job.id)} /></View>)}
              {d.jobs.length === 0 && <T style={s.empty}>Publique seu primeiro job pelo botão +.</T>}
            </ScrollView>
          </Section>
        ) : (
          <Section title="Jobs que combinam com você" action="Ver todos" onAction={() => router.push('/projetos')}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hrow}>
              {d.matchingJobs.map((c) => <View key={c.job.id} style={s.hcard}><ProJobCard c={c} compact onPress={() => openJob(c.job.id)} /></View>)}
              {d.matchingJobs.length === 0 && <T style={s.empty}>Nenhum job aberto agora.</T>}
            </ScrollView>
          </Section>
        )}

        <Section title="Projetos procurando equipe" action="Ver todos" onAction={() => router.push('/projetos')}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hrow}>
            {d.projects.map((c) => <View key={c.project.id} style={s.hcard}><ProjectCardView c={c} compact onPress={() => openProject(c.project.id)} /></View>)}
            {d.projects.length === 0 && <T style={s.empty}>Nenhum projeto aberto agora.</T>}
          </ScrollView>
        </Section>

        <Section title="Pessoas que você pode conhecer" action="Descobrir" onAction={() => router.push('/discover')}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hrow}>
            {d.people.map((p) => (
              <AuraCard key={p.id} aura={auraFor(p.id)} onPress={() => router.push('/discover')} label={`${p.name}, ${p.roles[0]}`} style={s.person}>
                <View style={[s.avatar, { backgroundColor: blobColor(p.id) }]}><T style={s.avatarText}>{p.name.charAt(0)}</T></View>
                <T style={s.pname} numberOfLines={1}>{p.name}</T>
                <T style={s.prole} numberOfLines={1}>{p.roles[0]}</T>
                <T style={s.prole} numberOfLines={1}>{p.city}</T>
              </AuraCard>
            ))}
          </ScrollView>
        </Section>

        <Section title="Acontecendo na região" action="Ver a Cena" onAction={() => router.push('/cena')}>
          <View style={{ gap: 10 }}>
            {d.cena.map((c) => (
              <AuraCard key={c.id} aura={auraFor(c.id)} onPress={() => router.push('/cena')} label={c.title}>
                <T style={s.kind}>{KIND_LABEL[c.kind]} · {c.city.toUpperCase()}</T>
                <T style={s.ctitle}>{c.title}</T>
                <T style={s.prole}>{formatShort(c.date)} · exemplo</T>
              </AuraCard>
            ))}
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  box: { padding: 20, gap: 26, paddingBottom: 140 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 8 },
  hello: { fontFamily: fonts.light, fontSize: 30, lineHeight: 38, color: colors.muted },
  name: { fontFamily: fonts.semibold, fontSize: 34, lineHeight: 42 },
  chatBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24 },
  badge: { position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: colors.onAccent, fontSize: 11, fontFamily: fonts.semibold },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  section: { fontFamily: fonts.semibold, fontSize: 18, flexShrink: 1 },
  action: { color: colors.accent, fontSize: 13 },
  hrow: { gap: 12, paddingRight: 20 },
  hcard: { width: 300 },
  empty: { color: colors.muted, fontSize: 13 },
  person: { width: 140 },
  avatar: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText: { color: colors.bg, fontFamily: fonts.black, fontSize: 24 },
  pname: { fontFamily: fonts.semibold, fontSize: 14 },
  prole: { color: colors.muted, fontSize: 12 },
  kind: { color: colors.accent, fontSize: 11, fontFamily: fonts.semibold, letterSpacing: 1.2 },
  ctitle: { fontFamily: fonts.semibold, fontSize: 15, marginVertical: 4 },
});
