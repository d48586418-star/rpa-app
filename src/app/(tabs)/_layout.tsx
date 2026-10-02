import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../theme';

const icon = (e: string) => () => <Text style={{ fontSize: 20 }}>{e}</Text>;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
      }}>
      <Tabs.Screen name="discover" options={{ title: 'Descobrir', tabBarIcon: icon('🎞️') }} />
      <Tabs.Screen name="matches" options={{ title: 'Matches', tabBarIcon: icon('💬') }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: icon('👤') }} />
    </Tabs>
  );
}
