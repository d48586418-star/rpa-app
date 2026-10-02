import { useQueryClient } from '@tanstack/react-query';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Input, T } from '../../components/ui';
import { ROLES } from '../../constants/roles';
import { createProject } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { CITY_NAMES } from '../../lib/geo';
import { colors, fonts } from '../../theme';

export default function NewProject() {
  const { session } = useAuth();
  const me = session!.user.id;
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [city, setCity] = useState<string | null>(CITY_NAMES[0]);
  const [budget, setBudget] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggle = (r: string) => setRoles((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]));

  const publish = async () => {
    setSaving(true);
    try {
      const p = await createProject(me, { title, description: desc, city, budget_total: parseInt(budget, 10) || 0, roles });
      await qc.invalidateQueries({ queryKey: ['projects'] });
      await qc.invalidateQueries({ queryKey: ['home'] });
      router.replace({ pathname: '/project/[id]', params: { id: p.id } });
    } catch (e) {
      Alert.alert('Não foi possível publicar', e instanceof Error ? e.message : 'Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen options={{ title: 'Novo projeto', headerShown: true, headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.text, headerShadowVisible: false }} />
      <ScrollView contentContainerStyle={s.box} keyboardShouldPersistTaps="handled">
        <Input placeholder="Nome do projeto (ex.: Curta Maré Baixa)" value={title} onChangeText={setTitle} maxLength={80} />
        <Input placeholder="Conte a ideia em poucas linhas" value={desc} onChangeText={setDesc} multiline maxLength={400} style={{ minHeight: 90 }} />
        <T style={s.label}>Quais funções você procura?</T>
        <View style={s.wrap}>{ROLES.map((r) => <Chip key={r} label={r} selected={roles.includes(r)} onPress={() => toggle(r)} />)}</View>
        <T style={s.label}>Onde será feito</T>
        <View style={s.wrap}>
          {CITY_NAMES.map((c) => <Chip key={c} label={c} selected={city === c} onPress={() => setCity(c)} />)}
          <Chip label="Remoto" selected={city === null} onPress={() => setCity(null)} />
        </View>
        <T style={s.label}>Orçamento total (R$)</T>
        <Input placeholder="Ex.: 5000" value={budget} onChangeText={setBudget} keyboardType="number-pad" />
        <Button title="Publicar projeto" arrow onPress={publish} loading={saving} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  box: { padding: 20, gap: 12, paddingBottom: 60 },
  label: { color: colors.muted, fontFamily: fonts.semibold, marginTop: 6 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
