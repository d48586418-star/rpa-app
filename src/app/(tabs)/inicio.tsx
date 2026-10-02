import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Icon, type IconName } from '../../components/Icon';
import { JobTile, OwnerJobCard, ProJobCard } from '../../components/JobCard';
import { Photo } from '../../components/Photo';
import { blobColor } from '../../components/ProfileCard';
import { SearchHero } from '../../components/SearchHero';
import { IconButton, Screen, Section, T } from '../../components/ui';
import { fetchHome, fetchSearch } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { greeting } from '../../lib/dates';
import { profileSubtitle } from '../../lib/profileText';
import { hashString } from '../../lib/shapes';
import { colors, fonts, glass, radius, shadow } from '../../theme';

function LinkRow({ icon, title, hint, onPress }: { icon: IconName; title: string; hint: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={({ pressed }) => [s.link, pressed && { opacity: 0.85 }]}>
      <View style={s.linkIcon}><Icon name={icon} size={20} color={colors.accent} /></View>
      <View style={{ flex: 1 }}>
        <T style={{ fontFamily: fonts.semibold, fontSize: 15 }}>{title}</T>
        <T style={{ color: colors.muted, fontSize: 12.5 }} numberOfLines={1}>{hint}</T>
      </View>
      <Icon name="arrow-right" size={18} color={colors.muted} />
    </Pressable>
  );
}

export default function Inicio() {
  const { session } = useAuth();
  const me = session!.user.id;
  const [term, setTerm] = useState('');
  const q = useQuery({ queryKey: ['home', me], queryFn: () => fetchHome(me) });
  const searching = term.trim().length >= 2;
  const found = useQuery({ queryKey: ['search', me, term.trim()], queryFn: () => fetchSearch(me, term.trim()), enabled: searching });
  if (q.isLoading || !q.data) return <Screen><ActivityIndicator color={colors.accent} style={{ marginTop: 60 }} /></Screen>;
  const d = q.data;
  const first = d.profile?.name.split(' ')[0] ?? '';
  const openJob = (id: string) => router.push({ pathname: '/job/[id]', params: { id } });
  const bubbleOf = (id: string) => colors.bubbles[hashString(id) % colors.bubbles.length];

  return (
    <Screen>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.box} keyboardShouldPersistTaps="handled">
          <View style={s.top}>
            <View style={{ flex: 1 }}>
              <T style={s.hello}>{greeting(new Date().getHours())},</T>
              <T style={s.name} numberOfLines={1}>{first}.</T>
            </View>
            <View>
              <IconButton icon="chat" label={`Conversas, ${d.conversations}`} onPress={() => router.push('/matches')} />
              {d.conversations > 0 && <View style={s.badge} pointerEvents="none"><T style={s.badgeText}>{d.conversations}</T></View>}
            </View>
          </View>

          <SearchHero value={term} onChangeText={setTerm} onFilters={() => router.push('/discover')} />

          {searching ? (
            <Section title={`Resultados para “${term.trim()}”`}>
              {found.isLoading ? <ActivityIndicator color={colors.accent} /> : (
                <View style={{ gap: 10 }}>
                  {found.data?.jobs.map((c) => <ProJobCard key={c.job.id} c={c} onPress={() => openJob(c.job.id)} />)}
                  {found.data?.people.map((p) => (
                    <Pressable key={p.id} accessibilityRole="button" accessibilityLabel={p.name} onPress={() => router.push('/discover')} style={s.person}>
                      <View style={[s.avatarSm, { backgroundColor: blobColor(p.id) }]}>
                        {p.avatar_url ? <Photo photo={p.avatar_url} style={StyleSheet.absoluteFill} /> : <T style={s.avatarText}>{p.name.charAt(0)}</T>}
                      </View>
                      <View style={{ flex: 1 }}>
                        <T style={{ fontFamily: fonts.semibold }} numberOfLines={1}>{p.name}</T>
                        <T style={{ color: colors.muted, fontSize: 12.5 }} numberOfLines={1}>{profileSubtitle(p)}</T>
                      </View>
                    </Pressable>
                  ))}
                  {found.data && found.data.jobs.length + found.data.people.length === 0 && <T style={s.empty}>Nada encontrado. Tente outra palavra, como uma função ou cidade.</T>}
                </View>
              )}
            </Section>
          ) : (
            <>
              {d.isOwner ? (
                <Section title="Suas vagas" action="Ver tudo" onAction={() => router.push('/discover')}>
                  <View style={{ gap: 10 }}>
                    {d.jobs.slice(0, 2).map((r) => <OwnerJobCard key={r.job.id} r={r} onPress={() => openJob(r.job.id)} />)}
                    {d.jobs.length === 0 && <T style={s.empty}>Publique sua primeira vaga pelo botão +.</T>}
                  </View>
                </Section>
              ) : (
                <Section title="Vagas para você" action="Deslizar vagas" onAction={() => router.push('/discover')}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hrow}>
                    {d.matchingJobs.map((c) => <JobTile key={c.job.id} c={c} onPress={() => openJob(c.job.id)} />)}
                    {d.matchingJobs.length === 0 && <T style={s.empty}>Nenhuma vaga aberta agora.</T>}
                  </ScrollView>
                </Section>
              )}

              <Section title="Gente da região" action="Ver pessoas" onAction={() => router.push('/discover')}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hrow}>
                  {d.people.map((p) => (
                    <Pressable key={p.id} accessibilityRole="button" accessibilityLabel={`${p.name}, ${p.roles[0]}`} onPress={() => router.push('/discover')} style={s.blob}>
                      <View style={[s.avatar, { backgroundColor: blobColor(p.id) }]}>
                        {p.avatar_url ? <Photo photo={p.avatar_url} style={StyleSheet.absoluteFill} /> : <T style={s.avatarText}>{p.name.charAt(0)}</T>}
                      </View>
                      <T style={s.pname} numberOfLines={1}>{p.account_type === 'empresa' ? p.name : p.name.split(' ')[0]}</T>
                      <T style={s.prole} numberOfLines={1}>{p.account_type === 'empresa' ? p.city : p.roles[0]}</T>
                    </Pressable>
                  ))}
                </ScrollView>
              </Section>

              <Section title="Conversas" action={d.conversations > 0 ? 'Abrir' : undefined} onAction={() => router.push('/matches')}>
                {d.recent.length > 0 ? (
                  <View style={{ gap: 8 }}>
                    {d.recent.map((m, i) => (
                      <Pressable
                        key={m.id}
                        accessibilityRole="button"
                        accessibilityLabel={`Conversa com ${m.other.name}`}
                        onPress={() => router.push({ pathname: '/chat/[matchId]', params: { matchId: m.id, name: m.other.name } })}
                        style={[s.bubble, { backgroundColor: bubbleOf(m.id), alignSelf: i % 2 ? 'flex-end' : 'flex-start' }]}>
                        <T style={{ fontFamily: fonts.semibold, fontSize: 14 }}>{m.other.name}</T>
                        <T style={{ fontSize: 12.5, color: 'rgba(11,11,15,0.7)' }} numberOfLines={1}>{profileSubtitle(m.other)} · toque para responder</T>
                      </Pressable>
                    ))}
                  </View>
                ) : <T style={s.empty}>Nenhuma conversa ainda. Quando houver match, ela aparece aqui.</T>}
              </Section>

              <View style={{ gap: 10 }}>
                <LinkRow icon="film" title="Projetos procurando equipe" hint={`${d.projects.length} abertos agora`} onPress={() => router.push('/projetos')} />
                <LinkRow icon="spark" title="Acontecendo na região" hint={d.cena[0] ? `${d.cena[0].title} (exemplo)` : 'Eventos, editais e oficinas'} onPress={() => router.push('/cena')} />
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const s = StyleSheet.create({
  box: { padding: 20, gap: 26, paddingBottom: 150 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 8 },
  hello: { fontFamily: fonts.light, fontSize: 30, lineHeight: 38, color: colors.muted },
  name: { fontFamily: fonts.semibold, fontSize: 34, lineHeight: 42 },
  badge: { position: 'absolute', top: -2, right: -2, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  badgeText: { color: colors.onAccent, fontSize: 11, fontFamily: fonts.semibold },
  hrow: { gap: 12, paddingRight: 20, paddingVertical: 12, marginVertical: -12 },
  empty: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  blob: { width: 84, alignItems: 'center', gap: 4 },
  avatar: { width: 76, height: 76, borderRadius: 34, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff', ...(shadow.card as object) },
  avatarSm: { width: 48, height: 48, borderRadius: 20, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontFamily: fonts.black, fontSize: 24 },
  pname: { fontFamily: fonts.semibold, fontSize: 13 },
  prole: { color: colors.muted, fontSize: 11, textAlign: 'center' },
  person: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.lg, backgroundColor: glass.fillStrong, borderWidth: 1, borderColor: glass.border },
  bubble: { maxWidth: '82%', paddingVertical: 12, paddingHorizontal: 16, borderRadius: radius.lg, borderTopLeftRadius: 8, gap: 2 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, minHeight: 64, borderRadius: radius.lg, backgroundColor: glass.fillStrong, borderWidth: 1, borderColor: glass.border },
  linkIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
});
