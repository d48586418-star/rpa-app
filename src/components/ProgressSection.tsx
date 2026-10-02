import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { GENRES, genreLabel } from '../constants/genres';
import { addCredit, confirmCreditDemo, fetchProgress, setMyAvailability, toggleBusyDay } from '../lib/api';
import { AVAILABILITY_OPTIONS } from '../lib/availability';
import { addDays, formatShort } from '../lib/dates';
import type { Genre } from '../lib/types';
import { colors, fonts, radius } from '../theme';
import { AuraCard, auraFor } from './AuraCard';
import { LevelBar } from './LevelBar';
import { Button, Chip, Input, T } from './ui';

/** Portfólio primeiro: trabalhos, disponibilidade, nível, selos e agenda (só na demo por enquanto). */
export function ProgressSection({ userId, roles }: { userId: string; roles: string[] }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['progress', userId], queryFn: () => fetchProgress(userId) });
  const refresh = () => Promise.all(['progress', 'job', 'jobs', 'home', 'my-profile', 'candidates'].map((k) => qc.invalidateQueries({ queryKey: [k] })));

  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [role, setRole] = useState(roles[0] ?? '');
  const [genre, setGenre] = useState<Genre>('casamento');

  if (!q.data) return null;
  const p = q.data;
  const days = Array.from({ length: 14 }, (_, i) => addDays(p.today, i));
  const fromDays = Array.from({ length: 21 }, (_, i) => addDays(p.today, i + 1));
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

  const setAvail = async (state: 'now' | 'open' | 'busy' | 'from', from: string | null = null) => {
    try {
      await setMyAvailability(userId, state, from);
      await refresh();
    } catch (e) {
      Alert.alert('Não foi possível atualizar', e instanceof Error ? e.message : 'Tente novamente.');
    }
  };

  return (
    <View style={{ gap: 26 }}>
      <View style={{ gap: 10 }}>
        <T style={s.section}>Trabalhos</T>
        <T style={s.hint}>Cada trabalho mostra a função que você exerceu. Só os verificados entram no match.</T>
        <View style={s.grid}>
          {p.credits.map((c) => (
            <AuraCard key={c.id} aura={auraFor(c.id)} style={s.tile}>
              <View style={{ gap: 6, minHeight: 110 }}>
                <T style={s.tileTitle} numberOfLines={3}>{c.title}</T>
                <T style={s.hint}>{c.role}</T>
                <T style={s.hint}>{genreLabel(c.genre)} · {c.year}</T>
                <View style={{ flex: 1 }} />
                {c.verified ? (
                  <Chip label="✓ Verificado" tint={colors.like} />
                ) : (
                  <Chip label="Pendente · simular confirmação" tint={colors.accent} onPress={async () => { await confirmCreditDemo(userId, c.id); await refresh(); }} />
                )}
              </View>
            </AuraCard>
          ))}
        </View>
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
          <Chip label="+ Adicionar trabalho" onPress={() => setAdding(true)} />
        )}
      </View>

      <View style={{ gap: 10 }}>
        <T style={s.section}>Você está disponível?</T>
        <View style={s.wrap}>
          {AVAILABILITY_OPTIONS.map((o) => (
            <Chip key={o.id} label={o.label} selected={p.availability === o.id} onPress={() => (o.id === 'from' ? setAvail('from', p.availableFrom ?? fromDays[6]) : setAvail(o.id))} />
          ))}
        </View>
        <T style={s.hint}>{p.availabilityText}</T>
        {p.availability === 'from' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {fromDays.map((d) => <Chip key={d} label={formatShort(d)} selected={p.availableFrom === d} onPress={() => setAvail('from', d)} />)}
          </ScrollView>
        )}
      </View>

      <View style={s.card}>
        <LevelBar level={p.level} xp={p.progress.xp} />
      </View>

      <View style={{ gap: 10 }}>
        <T style={s.section}>Conquistas</T>
        <View style={s.wrap}>
          {p.allBadges.map((b) => {
            const has = p.badges.some((x) => x.id === b.id);
            return (
              <View key={b.id} style={[s.badge, has && s.badgeOn]} accessible accessibilityLabel={`${b.name}: ${has ? 'conquistado' : b.how}`}>
                <T style={[s.badgeName, has && { color: colors.onAccent }]}>{has ? '★ ' : ''}{b.name}</T>
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { flexGrow: 1, flexBasis: '46%', minWidth: 150 },
  tileTitle: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 19 },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  badge: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 8, gap: 2, maxWidth: '100%' },
  badgeOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  badgeName: { fontFamily: fonts.semibold, fontSize: 13 },
});
