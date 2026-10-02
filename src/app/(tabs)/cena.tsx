import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { AuraCard, auraFor } from '../../components/AuraCard';
import { Chip, T, Title } from '../../components/ui';
import { CENA_KINDS, KIND_LABEL } from '../../constants/cena';
import { fetchCena } from '../../lib/api';
import { formatShort } from '../../lib/dates';
import type { CenaKind } from '../../lib/types';
import { colors, fonts } from '../../theme';

export default function Cena() {
  const [kind, setKind] = useState<CenaKind | undefined>();
  const q = useQuery({ queryKey: ['cena', kind], queryFn: () => fetchCena({ kind }) });
  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={s.box}>
      <Title lead="Cena" rest="o que acontece perto de você." />
      <T style={s.example}>Dados de exemplo: nomes, datas e locais são inventados para mostrar como a Cena funciona.</T>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Chip label="Tudo" selected={!kind} onPress={() => setKind(undefined)} />
        {CENA_KINDS.map((k) => <Chip key={k.id} label={k.label} selected={kind === k.id} onPress={() => setKind(kind === k.id ? undefined : k.id)} />)}
      </ScrollView>
      {q.isLoading ? <ActivityIndicator color={colors.accent} /> : (
        <View style={{ gap: 12 }}>
          {q.data?.map((c) => (
            <AuraCard key={c.id} aura={auraFor(c.id)}>
              <View style={{ gap: 6 }}>
                <T style={s.kind}>{KIND_LABEL[c.kind]} · {c.city.toUpperCase()}</T>
                <T style={s.title}>{c.title}</T>
                <T style={s.date}>{formatShort(c.date)}</T>
                <T style={s.desc}>{c.description}</T>
              </View>
            </AuraCard>
          ))}
          {q.data?.length === 0 && <T style={s.empty}>Nada por aqui agora.</T>}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  box: { padding: 20, gap: 16, paddingBottom: 130 },
  example: { color: colors.accent, fontSize: 12 },
  kind: { color: colors.accent, fontSize: 11, fontFamily: fonts.semibold, letterSpacing: 1.2 },
  title: { fontFamily: fonts.semibold, fontSize: 17 },
  date: { color: colors.text, fontSize: 14, fontFamily: fonts.semibold },
  desc: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  empty: { color: colors.muted, textAlign: 'center', marginVertical: 24 },
});
