import { StyleSheet, View } from 'react-native';
import type { LevelInfo } from '../lib/xp';
import { colors, fonts } from '../theme';
import { T } from './ui';

export function LevelBar({ level, xp }: { level: LevelInfo; xp: number }) {
  return (
    <View style={{ gap: 8 }} accessible accessibilityLabel={`Nível ${level.name}, ${xp} XP`}>
      <View style={s.row}>
        <T style={s.name}>{level.name}</T>
        <T style={s.xp}>{xp} XP</T>
      </View>
      <View style={s.track}>
        <View style={[s.fill, { width: `${Math.round(level.progress * 100)}%` }]} />
      </View>
      <T style={s.hint}>
        {level.next ? `${level.xpSpan - level.xpInto} XP para ${level.next}` : 'Nível máximo'}
      </T>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  name: { fontFamily: fonts.semibold, fontSize: 22 },
  xp: { color: colors.accent, fontFamily: fonts.semibold },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.accent },
  hint: { color: colors.muted, fontSize: 13 },
});
