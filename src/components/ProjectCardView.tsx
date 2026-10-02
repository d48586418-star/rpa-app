import { StyleSheet, View } from 'react-native';
import { statusOf, STATUS_LABELS } from '../lib/demoProjects';
import type { ProjectCard } from '../lib/api';
import { brl } from '../lib/contract';
import { colors, fonts } from '../theme';
import { AuraCard, auraFor } from './AuraCard';
import { Chip, T } from './ui';

/** Card de projeto aberto: título, status da equipe e funções que ainda procuram gente. */
export function ProjectCardView({ c, onPress, compact }: { c: ProjectCard; onPress: () => void; compact?: boolean }) {
  const open = c.project.roles.filter((r) => !r.filledBy);
  return (
    <AuraCard aura={auraFor(c.project.id)} onPress={onPress} label={`Projeto ${c.project.title}`} style={compact ? { width: 300 } : undefined}>
      <View style={{ gap: 6 }}>
        <T style={s.kind}>PROJETO ABERTO{c.mine ? ' · SEU' : ''}</T>
        <T style={s.title} numberOfLines={2}>{c.project.title}</T>
        <T style={s.meta} numberOfLines={1}>{c.ownerName} · {c.project.city ?? 'Remoto'} · {brl(c.project.budget_total)}</T>
        <View style={s.chips}>
          <Chip label={STATUS_LABELS[statusOf(c.project.roles)]} tint={colors.accent} />
          {open.slice(0, compact ? 2 : 4).map((r) => <Chip key={r.role} label={r.role} selected={c.matching.includes(r.role)} />)}
          {open.length > (compact ? 2 : 4) ? <Chip label={`+${open.length - (compact ? 2 : 4)}`} /> : null}
        </View>
        {c.matching.length > 0 && <T style={s.match}>Combina com você: {c.matching.join(', ')}</T>}
      </View>
    </AuraCard>
  );
}

const s = StyleSheet.create({
  kind: { color: colors.accent, fontSize: 11, fontFamily: fonts.semibold, letterSpacing: 1.2 },
  title: { fontFamily: fonts.semibold, fontSize: 17 },
  meta: { color: colors.muted, fontSize: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  match: { color: colors.like, fontSize: 12 },
});
