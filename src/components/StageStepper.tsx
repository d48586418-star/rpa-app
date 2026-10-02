import { ScrollView, StyleSheet, View } from 'react-native';
import { STAGE_LABELS, STAGE_ORDER } from '../lib/engagement';
import type { Stage } from '../lib/types';
import { colors, fonts } from '../theme';
import { Icon } from './Icon';
import { T } from './ui';

/** Linha do tempo do contrato: o que já passou, onde está e o que falta. */
export function StageStepper({ stage }: { stage: Stage }) {
  const current = STAGE_ORDER.indexOf(stage);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row} accessibilityLabel={`Etapa atual: ${STAGE_LABELS[stage]}`}>
      {STAGE_ORDER.map((st, i) => {
        const done = i < current;
        const now = i === current;
        return (
          <View key={st} style={[s.item, now && s.itemNow, done && s.itemDone]}>
            {done ? <Icon name="check" size={13} color={colors.onAccent} stroke={2.4} /> : null}
            <T style={[s.text, (now || done) && { color: colors.onAccent, fontFamily: fonts.semibold }]}>{STAGE_LABELS[st]}</T>
          </View>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: { gap: 6 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  itemNow: { backgroundColor: colors.ink, borderColor: colors.ink },
  itemDone: { backgroundColor: colors.accent, borderColor: colors.accent },
  text: { fontSize: 12, color: colors.muted },
});
