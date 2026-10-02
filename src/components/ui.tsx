import { BlurView } from 'expo-blur';
import {
  ActivityIndicator, Pressable, StyleSheet, Text, TextInput,
  type StyleProp, type TextInputProps, type TextProps, type ViewStyle,
} from 'react-native';
import { colors, fonts, radius } from '../theme';
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
        <ActivityIndicator color={primary ? colors.onLight : colors.text} />
      ) : (
        <>
          <T style={[s.btnText, !primary && { color: colors.text }]}>{title}</T>
          {arrow && (
            <View style={s.arrow}><T style={{ color: colors.text, fontFamily: fonts.semibold }}>→</T></View>
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
    <Pressable onPress={onPress} style={[s.chip, selected && s.chipOn, tint ? { borderColor: tint } : null]}>
      <T style={[s.chipText, selected && { color: colors.onLight, fontFamily: fonts.semibold }]}>{label}</T>
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
  btnPrimary: { backgroundColor: colors.text },
  btnGhost: { borderWidth: 1, borderColor: colors.border },
  btnText: { color: colors.onLight, fontFamily: fonts.semibold, fontSize: 16 },
  arrow: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.onLight, alignItems: 'center', justifyContent: 'center' },
  input: {
    backgroundColor: colors.surface, color: colors.text, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: 18, paddingVertical: 14,
    fontSize: 16, fontFamily: fonts.regular,
  },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { fontSize: 13, fontFamily: fonts.regular },
  glass: {
    overflow: 'hidden', borderRadius: radius.pill, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)', backgroundColor: 'rgba(255,255,255,0.04)',
  },
});
