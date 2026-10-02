import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, type TextInputProps } from 'react-native';
import { colors, radius } from '../theme';

export function Button({
  title, onPress, loading, variant = 'primary', disabled,
}: {
  title: string; onPress: () => void; loading?: boolean; disabled?: boolean;
  variant?: 'primary' | 'ghost';
}) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={loading || disabled}
      style={({ pressed }) => [
        s.btn, primary ? s.btnPrimary : s.btnGhost,
        (pressed || disabled) && { opacity: 0.7 },
      ]}>
      {loading ? (
        <ActivityIndicator color={primary ? colors.accentText : colors.text} />
      ) : (
        <Text style={[s.btnText, !primary && { color: colors.text }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Input(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.muted} {...props} style={[s.input, props.style]} />;
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, selected && s.chipOn]}>
      <Text style={[s.chipText, selected && { color: colors.accentText }]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: { paddingVertical: 14, borderRadius: radius.md, alignItems: 'center' },
  btnPrimary: { backgroundColor: colors.accent },
  btnGhost: { borderWidth: 1, borderColor: colors.border },
  btnText: { color: colors.accentText, fontWeight: '700', fontSize: 16 },
  input: {
    backgroundColor: colors.card, color: colors.text, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16,
  },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.card,
  },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.text, fontSize: 13 },
});
