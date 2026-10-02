import { useQueryClient } from '@tanstack/react-query';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Input, T } from '../../components/ui';
import { GENRES } from '../../constants/genres';
import { ROLES } from '../../constants/roles';
import { createJob } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { brl } from '../../lib/contract';
import { addDays, formatShort, todayISO } from '../../lib/dates';
import { CITY_NAMES } from '../../lib/geo';
import { referenceRate } from '../../lib/referenceRates';
import type { Genre } from '../../lib/types';
import { colors, fonts } from '../../theme';

export default function NewJob() {
  const { session } = useAuth();
  const me = session!.user.id;
  const qc = useQueryClient();
  const today = todayISO();
  const dates = Array.from({ length: 21 }, (_, i) => addDays(today, i + 1));

  const [title, setTitle] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [genre, setGenre] = useState<Genre>('publicidade');
  const [date, setDate] = useState(dates[6]);
  const [city, setCity] = useState<string | null>(CITY_NAMES[0]);
  const [days, setDays] = useState(1);
  const [budget, setBudget] = useState('');
  const [gear, setGear] = useState('');
  const [desc, setDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const ref = role ? referenceRate(role) : null;
  const value = parseInt(budget, 10) || 0;
  const below = ref && value > 0 && value < ref.min;

  const publish = async () => {
    setSaving(true);
    try {
      const job = await createJob(me, {
        title, role: role ?? '', genre, date, days, city, budget_per_day: value,
        gear: gear.split(',').map((g) => g.trim()).filter(Boolean), description: desc.trim(),
      });
      await qc.invalidateQueries({ queryKey: ['jobs'] });
      router.replace({ pathname: '/job/[id]', params: { id: job.id } });
    } catch (e) {
      Alert.alert('Não foi possível publicar', e instanceof Error ? e.message : 'Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen options={{ title: 'Novo job' }} />
      <ScrollView contentContainerStyle={s.box} keyboardShouldPersistTaps="handled">
        <Input placeholder="Título (ex.: Casamento em Itacaré)" value={title} onChangeText={setTitle} maxLength={80} />

        <T style={s.label}>Função que você procura</T>
        <View style={s.wrap}>{ROLES.map((r) => <Chip key={r} label={r} selected={role === r} onPress={() => setRole(r)} />)}</View>

        <T style={s.label}>Tipo de trabalho</T>
        <View style={s.wrap}>{GENRES.map((g) => <Chip key={g.id} label={g.label} selected={genre === g.id} onPress={() => setGenre(g.id)} />)}</View>

        <T style={s.label}>Primeira data</T>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {dates.map((d) => <Chip key={d} label={formatShort(d)} selected={date === d} onPress={() => setDate(d)} />)}
        </ScrollView>

        <T style={s.label}>Local</T>
        <View style={s.wrap}>
          {CITY_NAMES.map((c) => <Chip key={c} label={c} selected={city === c} onPress={() => setCity(c)} />)}
          <Chip label="Remoto" selected={city === null} onPress={() => setCity(null)} />
        </View>

        <T style={s.label}>Diárias</T>
        <View style={s.stepper}>
          <Chip label="−" onPress={() => setDays((d) => Math.max(1, d - 1))} />
          <T style={{ fontFamily: fonts.semibold, fontSize: 18 }}>{days}</T>
          <Chip label="+" onPress={() => setDays((d) => Math.min(30, d + 1))} />
        </View>

        <T style={s.label}>Orçamento por diária (R$)</T>
        <Input placeholder="Ex.: 650" value={budget} onChangeText={setBudget} keyboardType="number-pad" />
        {ref ? (
          <T style={[s.hint, below && { color: colors.accent }]}>
            Piso de referência para {role}: {brl(ref.min)} a {brl(ref.max)} (valores de exemplo).
            {below ? ' Seu orçamento está abaixo do piso: isso afasta bons profissionais.' : ''}
          </T>
        ) : (
          <T style={s.hint}>Escolha a função para ver o piso de referência.</T>
        )}

        <Input placeholder="Equipamentos pedidos, separados por vírgula" value={gear} onChangeText={setGear} />
        <Input placeholder="Descrição do trabalho" value={desc} onChangeText={setDesc} multiline maxLength={500} style={{ minHeight: 90 }} />
        <Button title="Publicar job" arrow onPress={publish} loading={saving} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  box: { padding: 20, gap: 12, paddingBottom: 60 },
  label: { color: colors.muted, fontFamily: fonts.semibold, marginTop: 6 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 19 },
});
