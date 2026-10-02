import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { Glass, T } from '../../components/ui';
import { colors, fonts } from '../../theme';

function GlassTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  return (
    <View style={[s.wrap, { bottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <Glass style={s.bar}>
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const title = descriptors[route.key].options.title ?? route.name;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              onPress={() => {
                const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !e.defaultPrevented) navigation.navigate(route.name, route.params);
              }}
              style={[s.item, focused && s.itemOn]}>
              <T style={[s.label, focused && { color: colors.onLight, fontFamily: fonts.semibold }]}>{title}</T>
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
      tabBar={(p) => <GlassTabBar {...p} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.semibold },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.bg },
      }}>
      <Tabs.Screen name="discover" options={{ title: 'Descobrir' }} />
      <Tabs.Screen name="matches" options={{ title: 'Matches' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  wrap: { position: 'absolute', left: 24, right: 24, alignItems: 'center' },
  bar: { flexDirection: 'row', padding: 6, gap: 4 },
  item: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 999 },
  itemOn: { backgroundColor: colors.light },
  label: { color: colors.muted, fontSize: 14, fontFamily: fonts.regular },
});
