import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { OwnerJobCard, ProJobCard } from '../../components/JobCard';
import { ProjectCardView } from '../../components/ProjectCardView';
import { Segmented } from '../../components/Segmented';
import { Button, Header, Screen, T } from '../../components/ui';
import { fetchJobFeed, fetchMyJobs, fetchMyProfile, fetchProjects } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { colors } from '../../theme';

export default function Projetos() {
  const { session } = useAuth();
  const me = session!.user.id;
  const [tab, setTab] = useState<'projetos' | 'jobs'>('projetos');
  const mine = useQuery({ queryKey: ['my-profile', me], queryFn: () => fetchMyProfile(me) });
  const isOwner = mine.data?.account_type === 'empresa';
  const projects = useQuery({ queryKey: ['projects', me], queryFn: () => fetchProjects(me) });
  const feed = useQuery({ queryKey: ['jobs', me, 'feed'], queryFn: () => fetchJobFeed(me), enabled: mine.data != null && !isOwner });
  const own = useQuery({ queryKey: ['jobs', me, 'own'], queryFn: () => fetchMyJobs(me), enabled: mine.data != null && isOwner });

  if (mine.isLoading || projects.isLoading) return <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />;

  return (
    <Screen>
    <SafeAreaView style={{ flex: 1 }}>
    <Header lead="Projetos" rest={tab === 'projetos' ? 'com vagas na equipe.' : isOwner ? 'e vagas suas.' : 'e vagas.'} onBack={() => (router.canGoBack() ? router.back() : router.replace('/inicio'))} />
    <ScrollView contentContainerStyle={s.box}>
      <Segmented
        options={[{ id: 'projetos', label: 'Projetos abertos' }, { id: 'jobs', label: isOwner ? 'Minhas vagas' : 'Vagas' }]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'projetos' ? (
        <View style={{ gap: 12 }}>
          <T style={s.hint}>Qualquer pessoa pode publicar uma ideia e montar a equipe. Marque interesse nas funções que combinam com você.</T>
          {projects.data?.map((c) => <ProjectCardView key={c.project.id} c={c} onPress={() => router.push({ pathname: '/project/[id]', params: { id: c.project.id } })} />)}
          {projects.data?.length === 0 && <T style={s.empty}>Nenhum projeto procurando equipe agora.</T>}
          <Button title="Criar projeto aberto" icon="plus" onPress={() => router.push('/project/new')} />
        </View>
      ) : isOwner ? (
        <View style={{ gap: 12 }}>
          <T style={s.hint}>Vagas pagas por diária, com match e contrato.</T>
          {own.data?.map((r) => <OwnerJobCard key={r.job.id} r={r} onPress={() => router.push({ pathname: '/job/[id]', params: { id: r.job.id } })} />)}
          {own.data?.length === 0 && <T style={s.empty}>Você ainda não publicou vagas.</T>}
          <Button title="Publicar vaga" icon="plus" onPress={() => router.push('/job/new')} />
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          <T style={s.hint}>Do melhor match para o pior. Candidatar-se é grátis.</T>
          {feed.data?.map((c) => <ProJobCard key={c.job.id} c={c} onPress={() => router.push({ pathname: '/job/[id]', params: { id: c.job.id } })} />)}
          {feed.data?.length === 0 && <T style={s.empty}>Nenhuma vaga aberta agora.</T>}
        </View>
      )}
    </ScrollView>
    </SafeAreaView>
    </Screen>
  );
}

const s = StyleSheet.create({
  box: { padding: 20, gap: 16, paddingBottom: 130 },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  empty: { color: colors.muted, textAlign: 'center', marginVertical: 24 },
});
