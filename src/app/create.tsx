import { useQuery } from '@tanstack/react-query';
import { Stack, router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, type IconName } from '../components/Icon';
import { IconButton, T } from '../components/ui';
import { fetchMyProfile } from '../lib/api';
import { useAuth } from '../lib/auth';
import { colors, fonts, glass, radius, shadow } from '../theme';

type Option = { icon: IconName; title: string; text: string; to: '/job/new' | '/post/new' | '/project/new'; disabled?: boolean };

/** Folha de vidro do botão "+": o que você quer criar? */
export default function Create() {
  const { session } = useAuth();
  const me = session!.user.id;
  const mine = useQuery({ queryKey: ['my-profile', me], queryFn: () => fetchMyProfile(me) });
  const canJob = mine.data?.account_type === 'empresa';
  const options: Option[] = [
    { icon: 'briefcase', title: 'Publicar vaga', text: canJob ? 'Contrate por diária, com match e contrato.' : 'Só para contas de empresa.', to: '/job/new', disabled: !canJob },
    { icon: 'image', title: 'Postar trabalho', text: 'Mostre uma foto do que você fez na Rede.', to: '/post/new' },
    { icon: 'users', title: 'Projeto aberto', text: 'Tenho uma ideia e preciso montar a equipe.', to: '/project/new' },
  ];
  return (
    <View style={s.root}>
      <Stack.Screen options={{ headerShown: false, presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <Pressable accessibilityRole="button" accessibilityLabel="Fechar" style={StyleSheet.absoluteFill} onPress={() => router.back()} />
      <View style={s.sheet}>
        <View style={s.grabber} />
        <View style={s.head}>
          <T style={s.title}>O que você quer criar?</T>
          <IconButton icon="x" label="Fechar" onPress={() => router.back()} size={44} tone="plain" />
        </View>
        {options.map((o) => (
          <Pressable
            key={o.title}
            accessibilityRole="button"
            accessibilityLabel={o.title}
            accessibilityState={{ disabled: Boolean(o.disabled) }}
            disabled={o.disabled}
            onPress={() => router.replace(o.to)}
            style={({ pressed }) => [s.row, o.disabled && { opacity: 0.5 }, pressed && { opacity: 0.85 }]}>
            <View style={s.icon}><Icon name={o.icon} size={24} color={colors.onAccent} /></View>
            <View style={{ flex: 1, gap: 2 }}>
              <T style={{ fontFamily: fonts.semibold, fontSize: 16 }}>{o.title}</T>
              <T style={{ color: colors.muted, fontSize: 13, lineHeight: 18 }}>{o.text}</T>
            </View>
            <Icon name="arrow-right" size={18} color={colors.muted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(11,11,15,0.45)' },
  sheet: { width: '100%', maxWidth: 520, alignSelf: 'center', padding: 16, paddingBottom: 28, gap: 10, borderTopLeftRadius: 36, borderTopRightRadius: 36, backgroundColor: 'rgba(255,255,255,0.97)', borderWidth: 1, borderColor: glass.border, ...(shadow.float as object) },
  grabber: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: 4 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 6 },
  title: { fontFamily: fonts.semibold, fontSize: 22, letterSpacing: -0.4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, minHeight: 72, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  icon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
});
