import { StyleSheet, View } from 'react-native';
import type { Breakdown, Chance, Suggestion } from '../lib/matchScore';
import { colors, fonts, radius } from '../theme';
import { MatchRing, scoreColor } from './MatchRing';
import { T } from './ui';

/** Match explicado: nota, motivos de cada fator, o que falta para subir e a chance de ser chamado. */
const pts = (n: number) => (Math.round(n * 10) / 10).toLocaleString('pt-BR');

export function ScoreBreakdown({
  breakdown, suggestions = [], chance, compact,
}: { breakdown: Breakdown; suggestions?: Suggestion[]; chance?: Chance | null; compact?: boolean }) {
  return (
    <View style={{ gap: 14 }}>
      <View style={s.head}>
        <MatchRing score={breakdown.total} size={72} />
        <View style={{ flex: 1, gap: 4 }}>
          <T style={s.big}>{breakdown.total}% compatível</T>
          {chance ? (
            <T style={s.chance}>
              Chance de ser chamado: <T style={{ fontFamily: fonts.semibold, color: chance === 'Alta' ? colors.like : chance === 'Média' ? colors.accent : colors.muted }}>{chance}</T>
            </T>
          ) : null}
        </View>
      </View>
      {!compact && (
        <View style={{ gap: 12 }}>
          {breakdown.factors.map((f) => {
            const ratio = f.max ? f.points / f.max : 0;
            return (
              <View key={f.key} style={{ gap: 4, opacity: f.applicable ? 1 : 0.55 }} accessible accessibilityLabel={`${f.label}: ${f.applicable ? `${pts(f.points)} de ${f.max} pontos` : 'não conta'}. ${f.note}`}>
                <View style={s.row}>
                  <T style={s.label}>{f.label}</T>
                  <T style={s.pts}>{f.applicable ? `${pts(f.points)}/${f.max}` : 'não conta'}</T>
                </View>
                <View style={s.track}>
                  <View style={[s.fill, { width: `${Math.round(ratio * 100)}%`, backgroundColor: scoreColor(ratio * 100) }]} />
                </View>
                <T style={s.note}>{f.note}</T>
              </View>
            );
          })}
        </View>
      )}
      {suggestions.length > 0 && (
        <View style={s.missing}>
          <T style={s.missingTitle}>O que falta</T>
          {suggestions.map((x) => <T key={x.text} style={s.note}>{x.text}.</T>)}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  big: { fontFamily: fonts.semibold, fontSize: 22 },
  chance: { color: colors.muted, fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  label: { fontFamily: fonts.semibold, fontSize: 14, flexShrink: 1 },
  pts: { color: colors.muted, fontSize: 13 },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  note: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  missing: { gap: 6, backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.border },
  missingTitle: { fontFamily: fonts.semibold, color: colors.accent },
});
