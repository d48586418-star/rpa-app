import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { hashString } from '../lib/shapes';
import { auraOrder, auras, colors, radius, type AuraName } from '../theme';

/** Aura estável por texto (id), para o mesmo card ter sempre a mesma cor. */
export const auraFor = (seed: string): AuraName => auraOrder[hashString(seed) % auraOrder.length];

/** Cartão squircle com uma aura de degradê suave no canto, como nas referências. */
export function AuraCard({
  aura = 'orange', children, style, onPress, label,
}: { aura?: AuraName; children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; label?: string }) {
  const body = (
    <>
      <LinearGradient colors={auras[aura]} start={{ x: 1, y: 0 }} end={{ x: 0.2, y: 0.9 }} style={StyleSheet.absoluteFill} />
      <View style={s.inner}>{children}</View>
    </>
  );
  if (onPress) {
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [s.card, style, pressed && { opacity: 0.85 }]}>
        {body}
      </Pressable>
    );
  }
  return <View style={[s.card, style]}>{body}</View>;
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.squircle, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  inner: { padding: 16 },
});
