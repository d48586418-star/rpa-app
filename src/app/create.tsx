import { useQuery } from '@tanstack/react-query';
import { Stack, router } from 'expo-router';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { AuraCard } from '../components/AuraCard';
import { T, Title } from '../components/ui';
import { fetchMyProfile } from '../lib/api';
import { useAuth } from '../lib/auth';
import { colors, fonts } from '../theme';

/** Seletor do botão "+": o que você quer criar? */
export default function Create() {
  const { session } = useAuth();
  const me = session!.user.id;
  const mine = useQuery({ queryKey: ['my-profile', me], queryFn: () => fetchMyProfile(me) });
  const canJob = mine.data?.account_type === 'empresa';
  const go = (path: '/project/new' | '/job/new') => router.replace(path);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen options={{ title: 'Criar', headerShown: true, headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.text, headerShadowVisible: false }} />
      <View style={s.box}>
        <Title lead="O que você" rest="quer criar?" />
        <AuraCard aura="orange" onPress={() => go('/project/new')} label="Criar projeto aberto">
          <T style={s.cardTitle}>Projeto aberto</T>
          <T style={s.cardText}>Tenho uma ideia e preciso montar a equipe: direção, fotografia, som, montagem. Qualquer pessoa pode criar.</T>
        </AuraCard>
        <AuraCard aura="blue" onPress={canJob ? () => go('/job/new') : undefined} label="Publicar job">
          <T style={s.cardTitle}>Job pago por diária</T>
          <T style={s.cardText}>
            {canJob ? 'Preciso contratar alguém para um trabalho, com match, contrato e pagamento (simulado).' : 'Disponível para contas de empresa. Você pode criar um projeto aberto e escolher quem entra na equipe.'}
          </T>
        </AuraCard>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  box: { padding: 20, gap: 16 },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 18, marginBottom: 6 },
  cardText: { color: colors.muted, fontSize: 14, lineHeight: 21 },
});
