import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, type IconName } from '../../components/Icon';
import { Glass, T } from '../../components/ui';
import { jobsEnabled } from '../../lib/api';
import { colors, fonts, glass } from '../../theme';

type Item = { route: string; label: string; icon: IconName } | { plus: true };

// Com a demo: Início, Descobrir, +, Cena, Projetos, Perfil. Sem ela (Supabase): só o que já tem backend.
const ITEMS: Item[] = jobsEnabled
  ? [
      { route: 'inicio', label: 'Início', icon: 'home' },
      { route: 'discover', label: 'Descobrir', icon: 'compass' },
      { plus: true },
      { route: 'cena', label: 'Cena', icon: 'spark' },
      { route: 'projetos', label: 'Projetos', icon: 'film' },
      { route: 'profile', label: 'Perfil', icon: 'user' },
    ]
  : [
      { route: 'discover', label: 'Descobrir', icon: 'compass' },
      { route: 'matches', label: 'Matches', icon: 'chat' },
      { route: 'profile', label: 'Perfil', icon: 'user' },
    ];

function GlassTabBar({ state, navigation, insets }: BottomTabBarProps) {
  const active = state.routes[state.index]?.name;
  return (
    <View style={[s.wrap, { bottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <Glass style={s.bar}>
        {ITEMS.map((it, i) => {
          if ('plus' in it) {
            return (
              <Pressable key="plus" accessibilityRole="button" accessibilityLabel="Criar projeto ou job" onPress={() => router.push('/create')} style={s.plusSlot}>
                <View style={s.plus}><Icon name="plus" size={26} color={colors.onAccent} stroke={2.4} /></View>
              </Pressable>
            );
          }
          const route = state.routes.find((r) => r.name === it.route);
          if (!route) return null;
          const focused = active === it.route;
          return (
            <Pressable
              key={it.route}
              accessibilityRole="tab"
              accessibilityLabel={it.label}
              accessibilityState={{ selected: focused }}
              onPress={() => {
                const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !e.defaultPrevented) navigation.navigate(route.name, route.params);
              }}
              style={s.item}>
              <View style={[s.iconWrap, focused && s.iconOn]}>
                <Icon name={it.icon} size={20} color={focused ? colors.onAccent : colors.muted} />
              </View>
              <T style={[s.label, focused && { color: colors.text, fontFamily: fonts.semibold }]} numberOfLines={1}>{it.label}</T>
            </Pressable>
          );
        })}
      </Glass>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName={jobsEnabled ? 'inicio' : 'discover'}
      tabBar={(p) => <GlassTabBar {...p} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.semibold },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.bg },
      }}>
      <Tabs.Screen name="inicio" options={{ title: 'Início', headerShown: false }} />
      <Tabs.Screen name="discover" options={{ title: 'Descobrir' }} />
      <Tabs.Screen name="cena" options={{ title: 'Cena' }} />
      <Tabs.Screen name="projetos" options={{ title: 'Projetos' }} />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Conversas',
          headerLeft: jobsEnabled
            ? () => (
                <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} hitSlop={12} style={{ paddingHorizontal: 16 }}>
                  <T style={{ fontSize: 26, lineHeight: 28 }}>←</T>
                </Pressable>
              )
            : undefined,
        }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  wrap: { position: 'absolute', left: 12, right: 12, alignItems: 'center' },
  // Fundo mais escuro que o vidro padrão: texto de cards por trás não pode atrapalhar a leitura da barra.
  bar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 6, borderColor: glass.border, alignSelf: 'stretch', backgroundColor: 'rgba(12,12,12,0.82)' },
  item: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 2 },
  iconWrap: { width: 38, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  iconOn: { backgroundColor: colors.accent },
  label: { color: colors.muted, fontSize: 10, fontFamily: fonts.regular },
  plusSlot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  plus: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
    marginTop: -20, borderWidth: 4, borderColor: colors.bg,
  },
});
