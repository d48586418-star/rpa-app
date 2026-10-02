import { BlurView } from 'expo-blur';
import {
  ActivityIndicator, Pressable, StyleSheet, Text, TextInput,
  type StyleProp, type TextInputProps, type TextProps, type ViewStyle,
} from 'react-native';
import { colors, fonts, glass, radius } from '../theme';
import { View } from 'react-native';

/** Text com a fonte e a cor padrão do app (RN não herda fontFamily). */
export function T({ style, ...rest }: TextProps) {
  return <Text {...rest} style={[{ fontFamily: fonts.regular, color: colors.text }, style]} />;
}

export function Button({
  title, onPress, loading, variant = 'primary', disabled, arrow,
}: {
  title: string; onPress: () => void; loading?: boolean; disabled?: boolean; arrow?: boolean;
  variant?: 'primary' | 'ghost';
}) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      disabled={loading || disabled}
      style={({ pressed }) => [
        s.btn, primary ? s.btnPrimary : s.btnGhost,
        (pressed || disabled) && { opacity: 0.7 },
      ]}>
      {loading ? (
        <ActivityIndicator color={primary ? colors.onAccent : colors.text} />
      ) : (
        <>
          <T style={[s.btnText, !primary && { color: colors.text }]}>{title}</T>
          {arrow && (
            <View style={s.arrow}><T style={{ color: colors.accent, fontFamily: fonts.semibold }}>→</T></View>
          )}
        </>
      )}
    </Pressable>
  );
}

export function Input(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      {...props}
      style={[s.input, props.style]}
    />
  );
}

export function Chip({
  label, selected, onPress, tint,
}: { label: string; selected?: boolean; onPress?: () => void; tint?: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole={onPress ? 'button' : undefined} accessibilityState={onPress ? { selected: Boolean(selected) } : undefined} style={[s.chip, selected && s.chipOn, tint && !selected ? { borderColor: tint } : null]}>
      <T style={[s.chipText, selected && { color: colors.onAccent, fontFamily: fonts.semibold }]}>{label}</T>
    </Pressable>
  );
}

/** Superfície de vidro fosco (pílula translúcida das referências). */
export function Glass({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <BlurView intensity={30} tint="dark" style={[s.glass, style]}>
      {children}
    </BlurView>
  );
}

/** Título grande e leve com a segunda parte em cinza (referências 8 e 9). */
export function Title({ lead, rest, size = 30 }: { lead: string; rest?: string; size?: number }) {
  return (
    <T style={{ fontSize: size, lineHeight: size * 1.28, letterSpacing: -0.5 }}>
      <T style={{ fontFamily: fonts.semibold, fontSize: size, lineHeight: size * 1.28 }}>{lead}</T>
      {rest ? <T style={{ fontFamily: fonts.light, fontSize: size, lineHeight: size * 1.28, color: colors.muted }}>{'\n'}{rest}</T> : null}
    </T>
  );
}

/** Wordmark só de texto, empilhado. */
export function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <T style={{ fontFamily: fonts.black, fontSize: size, lineHeight: size * 0.92, textAlign: 'right', letterSpacing: -0.5 }}>
      {'TAKE\nONE'}
    </T>
  );
}

const s = StyleSheet.create({
  btn: {
    paddingVertical: 14, paddingHorizontal: 22, borderRadius: radius.pill,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 12,
  },
  btnPrimary: { backgroundColor: colors.accent },
  btnGhost: { borderWidth: 1, borderColor: colors.border },
  btnText: { color: colors.onAccent, fontFamily: fonts.semibold, fontSize: 16 },
  arrow: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.onAccent, alignItems: 'center', justifyContent: 'center' },
  input: {
    backgroundColor: colors.surface, color: colors.text, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: 18, paddingVertical: 14,
    fontSize: 16, fontFamily: fonts.regular,
  },
  chip: {
    maxWidth: '100%', paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 13, fontFamily: fonts.regular, flexShrink: 1 },
  glass: {
    overflow: 'hidden', borderRadius: radius.pill, borderWidth: 1,
    borderColor: glass.border, backgroundColor: glass.fill,
  },
});
