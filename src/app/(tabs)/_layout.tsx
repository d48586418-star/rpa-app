import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import { router } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Icon, type IconName } from '../../components/Icon';
import { T } from '../../components/ui';
import { jobsEnabled } from '../../lib/api';
import { colors, fonts, shadow } from '../../theme';

type Item = { route: string; label: string; icon: IconName } | { plus: true };

// Com a demo: Início, Explorar, +, Rede, Perfil. Sem ela (Supabase): só o que já tem backend.
const ITEMS: Item[] = jobsEnabled
  ? [
      { route: 'inicio', label: 'Início', icon: 'home' },
      { route: 'discover', label: 'Explorar', icon: 'compass' },
      { plus: true },
      { route: 'rede', label: 'Rede', icon: 'users' },
      { route: 'profile', label: 'Perfil', icon: 'user' },
    ]
  : [
      { route: 'discover', label: 'Descobrir', icon: 'compass' },
      { route: 'matches', label: 'Matches', icon: 'chat' },
      { route: 'profile', label: 'Perfil', icon: 'user' },
    ];

/** Barra preta em pílula (referência "Chats"): ícone com rótulo, ativo em pílula branca, "+" azul no centro. */
function TabBar({ state, navigation, insets }: BottomTabBarProps) {
  const active = state.routes[state.index]?.name;
  return (
    <View style={[s.wrap, { bottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <View style={s.bar}>
        {ITEMS.map((it) => {
          if ('plus' in it) {
            return (
              <View key="plus" style={s.plusSlot}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Criar: vaga, trabalho ou projeto"
                  onPress={() => router.push('/create')}
                  style={({ pressed }) => [s.plus, pressed && { transform: [{ scale: 0.94 }] }]}>
                  <Icon name="plus" size={28} color={colors.onAccent} stroke={2.4} />
                </Pressable>
              </View>
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
                <Icon name={it.icon} size={21} color={focused ? colors.ink : '#B4B4BE'} />
              </View>
              <T style={[s.label, focused && { color: '#fff', fontFamily: fonts.semibold }]} numberOfLines={1}>{it.label}</T>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName={jobsEnabled ? 'inicio' : 'discover'}
      tabBar={(p) => <TabBar {...p} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}>
      <Tabs.Screen name="inicio" options={{ title: 'Início' }} />
      <Tabs.Screen name="discover" options={{ title: 'Explorar' }} />
      <Tabs.Screen name="rede" options={{ title: 'Rede' }} />
      <Tabs.Screen name="cena" options={{ title: 'Cena' }} />
      <Tabs.Screen name="projetos" options={{ title: 'Projetos' }} />
      <Tabs.Screen name="matches" options={{ title: 'Conversas' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  bar: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', maxWidth: 460, paddingHorizontal: 8, paddingVertical: 8,
    borderRadius: 34, backgroundColor: 'rgba(11,11,15,0.94)',
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(16px)' } as object) : null),
    ...(shadow.float as object),
  },
  item: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 2, minHeight: 48 },
  iconWrap: { width: 46, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  iconOn: { backgroundColor: '#fff' },
  label: { color: '#B4B4BE', fontSize: 10.5, fontFamily: fonts.regular },
  plusSlot: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  plus: {
    width: 58, height: 58, borderRadius: 29, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
    marginTop: -26, borderWidth: 5, borderColor: colors.bg, ...(shadow.glow as object),
  },
});
