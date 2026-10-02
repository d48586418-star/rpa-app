import { BlurView } from 'expo-blur';
import { useState } from 'react';
import {
  ActivityIndicator, Pressable, StyleSheet, Text, TextInput,
  type StyleProp, type TextInputProps, type TextProps, type ViewStyle,
} from 'react-native';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';
import { colors, fonts, glass, radius, shadow } from '../theme';
import { View } from 'react-native';
import { Icon, type IconName } from './Icon';

/** Text com a fonte e a cor padrão do app (RN não herda fontFamily). */
export function T({ style, ...rest }: TextProps) {
  return <Text {...rest} style={[{ fontFamily: fonts.regular, color: colors.text }, style]} />;
}

/** Cabeçalho de tela: voltar opcional, título grande de dois tons e ação à direita. */
export function Header({ lead, rest, onBack, right }: { lead: string; rest?: string; onBack?: () => void; right?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6 }}>
      {onBack ? <IconButton icon="arrow-left" label="Voltar" onPress={onBack} size={44} /> : null}
      <View style={{ flex: 1 }}><Title lead={lead} rest={rest} size={28} /></View>
      {right}
    </View>
  );
}

/** Bloco com título e um "Ver tudo" opcional. */
export function Section({ title, action, onAction, children }: { title: string; action?: string; onAction?: () => void; children: React.ReactNode }) {
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <T style={{ fontFamily: fonts.semibold, fontSize: 18, flexShrink: 1 }}>{title}</T>
        {action ? (
          <Pressable onPress={onAction} accessibilityRole="button" hitSlop={10}>
            <T style={{ color: colors.accent, fontSize: 13, fontFamily: fonts.semibold }}>{action}</T>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export type ButtonVariant = 'primary' | 'glass' | 'ink' | 'ghost' | 'danger';

/** Botão padrão. primary = azul; glass = vidro; ink = preto; ghost = contorno; danger = vermelho. Altura 52 (ou 44 com `small`). */
export function Button({
  title, onPress, loading, variant = 'primary', disabled, arrow, icon, small,
}: {
  title: string; onPress: () => void; loading?: boolean; disabled?: boolean; arrow?: boolean; icon?: IconName; small?: boolean;
  variant?: ButtonVariant;
}) {
  const fg = variant === 'primary' || variant === 'ink' || variant === 'danger' ? colors.onAccent : colors.text;
  const bg = { primary: colors.accent, ink: colors.ink, danger: colors.danger, glass: glass.fillStrong, ghost: 'transparent' }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: Boolean(disabled || loading) }}
      onPress={onPress}
      disabled={loading || disabled}
      style={({ pressed }) => [
        s.btn, { backgroundColor: bg, minHeight: small ? 44 : 52 },
        variant === 'primary' && shadow.glow,
        variant === 'glass' && { borderWidth: 1, borderColor: glass.border, ...(shadow.card as object) },
        variant === 'ghost' && { borderWidth: 1, borderColor: colors.border },
        pressed && { opacity: 0.82, transform: [{ scale: 0.98 }] },
        disabled && { opacity: 0.45 },
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={18} color={fg} /> : null}
          <T style={[s.btnText, { color: fg, fontSize: small ? 14 : 16 }]}>{title}</T>
          {arrow ? <Icon name="arrow-right" size={18} color={fg} /> : null}
        </>
      )}
    </Pressable>
  );
}

/** Botão redondo só com ícone (mínimo 44px de toque). */
export function IconButton({
  icon, label, onPress, size = 48, tone = 'glass', color,
}: { icon: IconName; label: string; onPress: () => void; size?: number; tone?: 'glass' | 'ink' | 'accent' | 'plain'; color?: string }) {
  const bg = { glass: glass.fillStrong, ink: colors.ink, accent: colors.accent, plain: 'transparent' }[tone];
  const fg = color ?? (tone === 'ink' || tone === 'accent' ? colors.onAccent : colors.text);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' },
        tone === 'glass' && { borderWidth: 1, borderColor: glass.border, ...(shadow.card as object) },
        pressed && { opacity: 0.8, transform: [{ scale: 0.94 }] },
      ]}>
      <Icon name={icon} size={Math.round(size * 0.44)} color={fg} />
    </Pressable>
  );
}

/** Fundo off-white com grade fina (referência "Chats"). Fica atrás do conteúdo. */
export function Screen({ children, style }: { children?: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flex: 1, backgroundColor: colors.bg }, style]}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
        <Defs>
          <Pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <Path d="M28 0H0V28" fill="none" stroke={colors.bgGrid} strokeWidth="1" />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#grid)" />
      </Svg>
      {children}
    </View>
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
  label, selected, onPress, tint, icon,
}: { label: string; selected?: boolean; onPress?: () => void; tint?: string; icon?: IconName }) {
  const style = [s.chip, icon ? { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6 } : null, selected && s.chipOn, tint && !selected ? { borderColor: tint } : null];
  const inner = (
    <>
      {icon ? <Icon name={icon} size={14} color={selected ? colors.onAccent : tint ?? colors.text} stroke={2.2} /> : null}
      <T style={[s.chipText, selected && { color: colors.onAccent, fontFamily: fonts.semibold }]}>{label}</T>
    </>
  );
  // Sem ação, o chip é só informação: não pode capturar o toque do cartão em volta.
  if (!onPress) return <View style={style}>{inner}</View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: Boolean(selected) }} style={style}>
      {inner}
    </Pressable>
  );
}

/** Seção que abre e fecha: mantém telas densas leves (divulgação progressiva). */
export function Collapsible({ title, hint, children, defaultOpen = false }: { title: string; hint?: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={{ gap: 10 }}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen((v) => !v)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 }}>
        <T style={{ fontFamily: fonts.semibold, fontSize: 18, flex: 1 }}>{title}</T>
        {hint ? <T style={{ color: colors.muted, fontSize: 12.5 }}>{hint}</T> : null}
        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}><Icon name="chevron-down" size={18} color={colors.muted} /></View>
      </Pressable>
      {open ? children : null}
    </View>
  );
}

/** Superfície de vidro fosco (pílula translúcida das referências). */
export function Glass({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <BlurView intensity={glass.blur * 2} tint="light" style={[s.glass, style]}>
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
    paddingHorizontal: 22, borderRadius: radius.pill,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10,
  },
  btnText: { fontFamily: fonts.semibold },
  input: {
    backgroundColor: colors.surface, color: colors.text, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: 18, paddingVertical: 14,
    fontSize: 16, fontFamily: fonts.regular,
  },
  chip: {
    maxWidth: '100%', paddingHorizontal: 14, paddingVertical: 9, minHeight: 36, justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 13, fontFamily: fonts.regular, flexShrink: 1 },
  glass: {
    overflow: 'hidden', borderRadius: radius.pill, borderWidth: 1,
    borderColor: glass.border, backgroundColor: glass.fill,
  },
});
