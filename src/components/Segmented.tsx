import { Pressable, StyleSheet, View } from 'react-native';
import { colors, fonts, glass } from '../theme';
import { Glass, T } from './ui';

/** Controle segmentado de vidro (referência 5). */
export function Segmented<K extends string>({
  options, value, onChange,
}: { options: { id: K; label: string }[]; value: K; onChange: (k: K) => void }) {
  return (
    <Glass style={s.wrap}>
      <View style={s.row} accessibilityRole="tablist">
        {options.map((o) => {
          const on = o.id === value;
          return (
            <Pressable key={o.id} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => onChange(o.id)} style={[s.item, on && s.itemOn]}>
              <T style={[s.text, on && { color: colors.onAccent, fontFamily: fonts.semibold }]}>{o.label}</T>
            </Pressable>
          );
        })}
      </View>
    </Glass>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 4, borderColor: glass.border },
  row: { flexDirection: 'row', gap: 4 },
  item: { flex: 1, paddingVertical: 9, borderRadius: 999, alignItems: 'center' },
  itemOn: { backgroundColor: colors.accent },
  text: { fontSize: 13, color: colors.muted },
});
