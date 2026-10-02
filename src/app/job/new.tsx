import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Icon } from '../../components/Icon';
import { JobFace } from '../../components/JobCard';
import { Photo } from '../../components/Photo';
import { Button, Chip, Input, Screen, T, Title } from '../../components/ui';
import { GENRES } from '../../constants/genres';
import { ROLES } from '../../constants/roles';
import { createJob, fetchMyProfile, type JobCard } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { brl } from '../../lib/contract';
import { addDays, formatShort, todayISO } from '../../lib/dates';
import { CITY_NAMES } from '../../lib/geo';
import { COVER_CHOICES } from '../../lib/photoKeys';
import { referenceRate } from '../../lib/referenceRates';
import type { Genre, Job } from '../../lib/types';
import { colors, fonts, radius } from '../../theme';

const STEPS = ['Vaga', 'Quando e onde', 'Valor', 'Capa e detalhes'];

/** Criar vaga em 4 passos curtos; o último mostra a prévia do cartão que o profissional vai ver. */
export default function NewJob() {
  const { session } = useAuth();
  const me = session!.user.id;
  const qc = useQueryClient();
  const today = todayISO();
  const dates = Array.from({ length: 21 }, (_, i) => addDays(today, i + 1));
  const mine = useQuery({ queryKey: ['my-profile', me], queryFn: () => fetchMyProfile(me) });

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [genre, setGenre] = useState<Genre>('publicidade');
  const [date, setDate] = useState(dates[6]);
  const [city, setCity] = useState<string | null>(CITY_NAMES[0]);
  const [days, setDays] = useState(1);
  const [budget, setBudget] = useState('');
  const [gear, setGear] = useState('');
  const [desc, setDesc] = useState('');
  const [reqs, setReqs] = useState('');
  const [cover, setCover] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const ref = role ? referenceRate(role) : null;
  const value = parseInt(budget, 10) || 0;
  const below = ref && value > 0 && value < ref.min;
  const valid = [title.trim().length >= 3 && role != null, true, value > 0, true][step];
  const list = (t: string) => t.split(',').map((g) => g.trim()).filter(Boolean);

  const pickCover = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 5], quality: 0.7 });
    if (!res.canceled) setCover(res.assets[0].uri);
  };

  const publish = async () => {
    setSaving(true);
    try {
      const job = await createJob(me, {
        title, role: role ?? '', genre, date, days, city, budget_per_day: value,
        gear: list(gear), description: desc.trim(), cover, requirements: list(reqs),
      });
      await qc.invalidateQueries({ queryKey: ['jobs'] });
      await qc.invalidateQueries({ queryKey: ['home'] });
      router.replace({ pathname: '/job/[id]', params: { id: job.id } });
    } catch (e) {
      Alert.alert('Não foi possível publicar', e instanceof Error ? e.message : 'Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const preview: JobCard = {
    job: {
      id: 'preview', owner_id: me, title: title.trim() || 'Título da vaga', role: role ?? 'Função', genre, date, days, city,
      budget_per_day: value, gear: list(gear), description: desc, status: 'open', created_at: today, cover,
    } as Job,
    ownerName: mine.data?.name ?? 'Sua empresa', ownerPhoto: mine.data?.avatar_url ?? null, score: 90, chance: 'Alta' as JobCard['chance'],
    applied: false, selected: false, distanceKm: null, saved: false,
  };

  return (
    <Screen>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Screen options={{ title: 'Nova vaga' }} />
        <View style={s.dots} accessibilityLabel={`Passo ${step + 1} de ${STEPS.length}`}>
          {STEPS.map((l, i) => <View key={l} style={[s.dot, i <= step && { backgroundColor: colors.accent }]} />)}
        </View>
        <ScrollView contentContainerStyle={s.box} keyboardShouldPersistTaps="handled">
          <Title lead={step === 0 ? 'O que você' : step === 1 ? 'Quando' : step === 2 ? 'Quanto' : 'Como a vaga'} rest={step === 0 ? 'procura?' : step === 1 ? 'e onde?' : step === 2 ? 'vai pagar?' : 'vai aparecer.'} />

          {step === 0 && (
            <>
              <Input placeholder="Título (ex.: Casamento em Itacaré)" value={title} onChangeText={setTitle} maxLength={80} accessibilityLabel="Título da vaga" />
              <T style={s.label}>Função</T>
              <View style={s.wrap}>{ROLES.map((r) => <Chip key={r} label={r} selected={role === r} onPress={() => setRole(r)} />)}</View>
              <T style={s.label}>Tipo de trabalho</T>
              <View style={s.wrap}>{GENRES.map((g) => <Chip key={g.id} label={g.label} selected={genre === g.id} onPress={() => setGenre(g.id)} />)}</View>
            </>
          )}

          {step === 1 && (
            <>
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
                <Pressable accessibilityRole="button" accessibilityLabel="Menos uma diária" onPress={() => setDays((d) => Math.max(1, d - 1))} style={s.round}><T style={s.roundText}>−</T></Pressable>
                <T style={{ fontFamily: fonts.semibold, fontSize: 24, minWidth: 32, textAlign: 'center' }}>{days}</T>
                <Pressable accessibilityRole="button" accessibilityLabel="Mais uma diária" onPress={() => setDays((d) => Math.min(30, d + 1))} style={s.round}><Icon name="plus" size={20} color={colors.text} /></Pressable>
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <T style={s.label}>Orçamento por diária (R$)</T>
              <Input placeholder="Ex.: 650" value={budget} onChangeText={setBudget} keyboardType="number-pad" accessibilityLabel="Orçamento por diária" />
              {ref ? (
                <T style={[s.hint, below && { color: colors.danger }]}>
                  Piso de referência para {role}: {brl(ref.min)} a {brl(ref.max)} (valores de exemplo).
                  {below ? ' Seu orçamento está abaixo do piso: isso afasta bons profissionais.' : ''}
                </T>
              ) : <T style={s.hint}>Escolha a função no passo 1 para ver o piso de referência.</T>}
              <T style={s.label}>Equipamentos pedidos (opcional)</T>
              <Input placeholder="Separados por vírgula" value={gear} onChangeText={setGear} />
            </>
          )}

          {step === 3 && (
            <>
              <T style={s.label}>Foto de capa</T>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                <Pressable accessibilityRole="button" accessibilityLabel="Escolher da galeria" onPress={pickCover} style={[s.cover, s.coverPick]}>
                  <Icon name="image" size={22} color={colors.accent} />
                  <T style={{ fontSize: 11.5, color: colors.accent, fontFamily: fonts.semibold }}>Galeria</T>
                </Pressable>
                {COVER_CHOICES.map((k) => (
                  <Pressable key={k} accessibilityRole="button" accessibilityLabel={`Capa ${k}`} accessibilityState={{ selected: cover === k }} onPress={() => setCover(cover === k ? null : k)} style={[s.cover, cover === k && s.coverOn]}>
                    <Photo photo={k} style={StyleSheet.absoluteFill} />
                    {cover === k && <View style={s.check}><Icon name="check" size={14} color="#fff" stroke={2.6} /></View>}
                  </Pressable>
                ))}
              </ScrollView>
              <T style={s.hint}>Sem escolher, usamos uma foto do tipo de trabalho. Fotos de exemplo são ilustrativas.</T>
              <T style={s.label}>Descrição</T>
              <Input placeholder="Conte o trabalho em poucas linhas" value={desc} onChangeText={setDesc} multiline maxLength={500} style={{ minHeight: 90 }} />
              <T style={s.label}>Requisitos (opcional)</T>
              <Input placeholder="Separados por vírgula: ex.: CNH, câmera própria" value={reqs} onChangeText={setReqs} />
              <T style={s.label}>Prévia</T>
              <View style={{ height: 380 }}><JobFace c={preview} /></View>
            </>
          )}
        </ScrollView>
        <View style={s.footer}>
          {step > 0 && <View style={{ flex: 1 }}><Button title="Voltar" variant="glass" onPress={() => setStep((n) => n - 1)} /></View>}
          <View style={{ flex: 2 }}>
            {step < STEPS.length - 1
              ? <Button title="Continuar" arrow disabled={!valid} onPress={() => setStep((n) => n + 1)} />
              : <Button title="Publicar vaga" icon="check" onPress={publish} loading={saving} />}
          </View>
        </View>
      </SafeAreaView>
    </Screen>
  );
}

const s = StyleSheet.create({
  dots: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingTop: 8 },
  dot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.border },
  box: { padding: 20, gap: 12, paddingBottom: 30 },
  label: { color: colors.muted, fontFamily: fonts.semibold, marginTop: 6 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  round: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  roundText: { fontSize: 24, lineHeight: 28 },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  cover: { width: 84, height: 104, borderRadius: radius.md, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent', backgroundColor: colors.surfaceAlt },
  coverPick: { alignItems: 'center', justifyContent: 'center', gap: 4, borderColor: colors.border, borderStyle: 'dashed', backgroundColor: colors.surface },
  coverOn: { borderColor: colors.accent },
  check: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  footer: { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 20 },
});
