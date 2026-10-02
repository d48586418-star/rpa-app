import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { GENRES, genreLabel } from '../constants/genres';
import { addCredit, confirmCreditDemo, fetchProgress, toggleBusyDay } from '../lib/api';
import { addDays, formatShort } from '../lib/dates';
import type { Genre } from '../lib/types';
import { colors, fonts, radius } from '../theme';
import { LevelBar } from './LevelBar';
import { Button, Chip, Input, T } from './ui';

/** Nível, selos, créditos e agenda do profissional (só na demo por enquanto). */
export function ProgressSection({ userId, roles }: { userId: string; roles: string[] }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['progress', userId], queryFn: () => fetchProgress(userId) });
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: ['progress'] }), qc.invalidateQueries({ queryKey: ['job'] }), qc.invalidateQueries({ queryKey: ['jobs'] })]);

  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [role, setRole] = useState(roles[0] ?? '');
  const [genre, setGenre] = useState<Genre>('casamento');

  if (!q.data) return null;
  const p = q.data;
  const days = Array.from({ length: 14 }, (_, i) => addDays(p.today, i));
  const rep = p.reputation;

  const save = async () => {
    try {
      await addCredit(userId, { title, role, genre, year: Number(p.today.slice(0, 4)) });
      setTitle('');
      setAdding(false);
      await refresh();
    } catch (e) {
      Alert.alert('Não foi possível adicionar', e instanceof Error ? e.message : 'Tente novamente.');
    }
  };

  return (
    <View style={{ gap: 22 }}>
      <View style={s.card}>
        <LevelBar level={p.level} xp={p.progress.xp} />
      </View>

      <View style={{ gap: 10 }}>
        <T style={s.section}>Selos</T>
        <View style={s.wrap}>
          {p.allBadges.map((b) => {
            const has = p.badges.some((x) => x.id === b.id);
            return (
              <View key={b.id} style={[s.badge, has && s.badgeOn]} accessible accessibilityLabel={`${b.name}: ${has ? 'conquistado' : b.how}`}>
                <T style={[s.badgeName, has && { color: colors.onLight }]}>{has ? '★ ' : ''}{b.name}</T>
                {!has && <T style={s.hint}>{b.how}</T>}
              </View>
            );
          })}
        </View>
        <T style={s.hint}>
          {rep.ratingCount > 0
            ? `Nota ${rep.ratingAvg!.toFixed(1).replace('.', ',')} em ${rep.ratingCount} avaliações · ${Math.round((rep.attendance ?? 1) * 100)}% de comparecimento`
            : 'Conta nova: ainda sem avaliações.'}
        </T>
      </View>

      <View style={{ gap: 10 }}>
        <T style={s.section}>Créditos</T>
        <T style={s.hint}>Só créditos verificados entram no match. Peça a confirmação a quem contratou ou estava na equipe.</T>
        {p.credits.map((c) => (
          <View key={c.id} style={s.credit}>
            <View style={{ flex: 1, gap: 2 }}>
              <T style={s.creditTitle}>{c.title}</T>
              <T style={s.hint}>{c.role} · {genreLabel(c.genre)} · {c.year}</T>
            </View>
            {c.verified ? (
              <Chip label="Verificado" tint={colors.like} />
            ) : (
              <Chip label="Simular confirmação" tint={colors.accent} onPress={async () => { await confirmCreditDemo(userId, c.id); await refresh(); }} />
            )}
          </View>
        ))}
        {adding ? (
          <View style={s.card}>
            <Input placeholder="Título do trabalho" value={title} onChangeText={setTitle} maxLength={80} />
            <T style={s.hint}>Sua função nele</T>
            <View style={s.wrap}>{roles.map((r) => <Chip key={r} label={r} selected={role === r} onPress={() => setRole(r)} />)}</View>
            <T style={s.hint}>Tipo de trabalho</T>
            <View style={s.wrap}>{GENRES.map((g) => <Chip key={g.id} label={g.label} selected={genre === g.id} onPress={() => setGenre(g.id)} />)}</View>
            <Button title="Adicionar (fica pendente)" onPress={save} />
          </View>
        ) : (
          <Chip label="+ Adicionar crédito" onPress={() => setAdding(true)} />
        )}
      </View>

      <View style={{ gap: 10 }}>
        <T style={s.section}>Agenda dos próximos 14 dias</T>
        <T style={s.hint}>Toque para alternar entre livre (verde) e ocupado (vermelho). Dia ocupado zera a disponibilidade no match.</T>
        <View style={s.wrap}>
          {days.map((d) => {
            const busy = p.blockedDates.includes(d);
            return (
              <Chip
                key={d}
                label={`${busy ? 'Ocupado' : 'Livre'} · ${formatShort(d)}`}
                tint={busy ? colors.danger : colors.like}
                onPress={async () => { await toggleBusyDay(userId, d); await refresh(); }}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, gap: 10, borderWidth: 1, borderColor: colors.border },
  section: { fontFamily: fonts.semibold, fontSize: 18 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  badge: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 8, gap: 2, maxWidth: '100%' },
  badgeOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  badgeName: { fontFamily: fonts.semibold, fontSize: 13 },
  credit: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, borderWidth: 1, borderColor: colors.border },
  creditTitle: { fontFamily: fonts.semibold, fontSize: 14 },
});
