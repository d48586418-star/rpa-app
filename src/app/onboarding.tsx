import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Input, T, Title } from '../components/ui';
import { ROLES } from '../constants/roles';
import { setMyAvailability, upsertProfile, jobsEnabled } from '../lib/api';
import { useAuth } from '../lib/auth';
import { AVAILABILITY_OPTIONS, isAvailableToday } from '../lib/availability';
import { addDays, todayISO, formatShort } from '../lib/dates';
import { CITY_NAMES } from '../lib/geo';
import { PENDING_TYPE_KEY } from '../lib/pendingType';
import type { AccountType, Availability } from '../lib/types';
import { colors, fonts } from '../theme';

const STEPS = 4;

/** Onboarding curto: poucas perguntas por vez, o resto do perfil fica para depois. */
export default function Onboarding() {
  const { session } = useAuth();
  const me = session!.user.id;
  const qc = useQueryClient();
  const [type, setType] = useState<AccountType | null>(null);
  const [step, setStep] = useState(0);
  const [roles, setRoles] = useState<string[]>([]);
  const [city, setCity] = useState<string | null | undefined>(undefined); // undefined = ainda não escolheu
  const [avail, setAvail] = useState<Availability>('now');
  const [from, setFrom] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PENDING_TYPE_KEY)
      .then((v) => setType(v === 'empresa' ? 'empresa' : 'freelancer'))
      .catch(() => setType('freelancer'));
  }, []);

  if (!type) return null;
  const company = type === 'empresa';
  const today = todayISO();
  const fromDays = Array.from({ length: 21 }, (_, i) => addDays(today, i + 1));

  const toggle = (r: string) => setRoles((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]));
  const canNext =
    (step === 0 && roles.length > 0) || (step === 1 && city !== undefined) || (step === 2 && (avail !== 'from' || from != null)) || step === 3;

  const finish = async () => {
    if (name.trim().length < 2) return Alert.alert(company ? 'Informe o nome da empresa.' : 'Informe como podemos te chamar.');
    setSaving(true);
    try {
      await upsertProfile({
        id: me, account_type: type, name: name.trim(), avatar_url: null, city: city ?? null, bio: null, roles,
        day_rate_min: null, day_rate_max: null, available: isAvailableToday(avail, from, today),
        portfolio_links: [], gear: null, website: null,
      });
      if (jobsEnabled) await setMyAvailability(me, avail, from);
      await AsyncStorage.removeItem(PENDING_TYPE_KEY).catch(() => {});
      await qc.invalidateQueries({ queryKey: ['my-profile'] });
    } catch (e) {
      Alert.alert('Não foi possível salvar', e instanceof Error ? e.message : 'Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={s.box} keyboardShouldPersistTaps="handled">
        <View style={s.dots} accessibilityLabel={`Passo ${step + 1} de ${STEPS}`}>
          {Array.from({ length: STEPS }, (_, i) => <View key={i} style={[s.dot, i <= step && s.dotOn]} />)}
        </View>

        {step === 0 && (
          <View style={s.step}>
            <Title lead={company ? 'Que funções' : 'Qual é a'} rest={company ? 'você procura?' : 'sua praia?'} />
            <T style={s.hint}>{company ? 'Escolha uma ou mais. Dá para mudar depois.' : 'Escolha as funções em que você trabalha.'}</T>
            <View style={s.wrap}>{ROLES.map((r) => <Chip key={r} label={r} selected={roles.includes(r)} onPress={() => toggle(r)} />)}</View>
          </View>
        )}

        {step === 1 && (
          <View style={s.step}>
            <Title lead="Onde você" rest="trabalha?" />
            <View style={s.wrap}>
              {CITY_NAMES.map((c) => <Chip key={c} label={c} selected={city === c} onPress={() => setCity(c)} />)}
              <Chip label="Remoto" selected={city === null} onPress={() => setCity(null)} />
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={s.step}>
            <Title lead={company ? 'Você está' : 'Você está'} rest={company ? 'contratando?' : 'disponível?'} />
            <View style={s.wrap}>
              {AVAILABILITY_OPTIONS.map((o) => <Chip key={o.id} label={o.label} selected={avail === o.id} onPress={() => { setAvail(o.id); if (o.id !== 'from') setFrom(null); }} />)}
            </View>
            {avail === 'from' && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {fromDays.map((d) => <Chip key={d} label={formatShort(d)} selected={from === d} onPress={() => setFrom(d)} />)}
              </ScrollView>
            )}
          </View>
        )}

        {step === 3 && (
          <View style={s.step}>
            <Title lead={company ? 'Como se chama' : 'Como podemos'} rest={company ? 'a empresa?' : 'te chamar?'} />
            <Input placeholder={company ? 'Nome da produtora ou empresa' : 'Seu nome profissional'} value={name} onChangeText={setName} maxLength={60} />
            <T style={s.hint}>O resto do perfil (portfólio, foto, cachê) você completa depois, em Perfil.</T>
          </View>
        )}

        <View style={s.nav}>
          {step > 0 && <Button title="Voltar" variant="ghost" onPress={() => setStep((n) => n - 1)} />}
          {step < STEPS - 1 ? (
            <View style={{ flex: 1 }}><Button title="Continuar" arrow disabled={!canNext} onPress={() => setStep((n) => n + 1)} /></View>
          ) : (
            <View style={{ flex: 1 }}><Button title="Começar" arrow loading={saving} onPress={finish} /></View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  box: { padding: 24, gap: 24, flexGrow: 1 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.border },
  dotOn: { backgroundColor: colors.accent },
  step: { gap: 16 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hint: { color: colors.muted, fontFamily: fonts.light, fontSize: 14, lineHeight: 21 },
  nav: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
