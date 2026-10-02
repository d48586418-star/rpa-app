import { StyleSheet, View } from 'react-native';
import { genreLabel } from '../constants/genres';
import type { JobCard as JobCardData, OwnerJobRow } from '../lib/api';
import { brl } from '../lib/contract';
import { formatShort } from '../lib/dates';
import { STAGE_LABELS } from '../lib/engagement';
import { colors, fonts } from '../theme';
import { AuraCard, auraFor } from './AuraCard';
import { MatchRing } from './MatchRing';
import { Chip, T } from './ui';

/** Card de job para o profissional, com o anel de match. */
export function ProJobCard({ c, onPress, compact }: { c: JobCardData; onPress: () => void; compact?: boolean }) {
  return (
    <AuraCard aura={auraFor(c.job.id)} onPress={onPress} label={`${c.job.title}, ${c.score}% compatível`} style={compact ? s.compact : undefined}>
      <View style={s.row}>
        <MatchRing score={c.score} size={compact ? 48 : 56} />
        <View style={{ flex: 1, gap: 4 }}>
          <T style={s.title} numberOfLines={2}>{c.job.title}</T>
          <T style={s.meta} numberOfLines={1}>{c.ownerName} · {c.job.role}</T>
          <T style={s.meta}>{formatShort(c.job.date)} · {c.job.city ?? 'Remoto'}{c.distanceKm ? ` · ${c.distanceKm} km` : ''} · {brl(c.job.budget_per_day)}/dia</T>
          {!compact && (
            <View style={s.chips}>
              <Chip label={genreLabel(c.job.genre)} />
              {c.selected ? <Chip label="Você foi escolhido" tint={colors.like} /> : c.applied ? <Chip label="Candidatado" tint={colors.accent} /> : null}
            </View>
          )}
        </View>
      </View>
    </AuraCard>
  );
}

/** Card de job para a empresa (candidatos e etapa). */
export function OwnerJobCard({ r, onPress }: { r: OwnerJobRow; onPress: () => void }) {
  return (
    <AuraCard aura={auraFor(r.job.id)} onPress={onPress} label={`Abrir job ${r.job.title}`}>
      <View style={{ gap: 6 }}>
        <T style={s.title}>{r.job.title}</T>
        <T style={s.meta}>{r.job.role} · {formatShort(r.job.date)} · {r.job.city ?? 'Remoto'}</T>
        <View style={s.chips}>
          <Chip label={`${r.applicants} ${r.applicants === 1 ? 'candidato' : 'candidatos'}`} />
          {r.stage ? <Chip label={STAGE_LABELS[r.stage]} tint={colors.accent} /> : <Chip label="Aberto" tint={colors.like} />}
        </View>
      </View>
    </AuraCard>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  title: { fontFamily: fonts.semibold, fontSize: 16 },
  meta: { color: colors.muted, fontSize: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  compact: { width: 300 },
});
