import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { ROLES } from '../constants/roles';
import { upsertProfile, uploadAvatar } from '../lib/api';
import type { Profile } from '../lib/types';
import { colors } from '../theme';
import { Button, Chip, Input } from './ui';

const toInt = (v: string) => (v.trim() === '' ? null : Math.max(0, parseInt(v, 10) || 0));

export function ProfileForm({
  userId, initial, submitLabel, onSaved,
}: { userId: string; initial?: Profile | null; submitLabel: string; onSaved: () => void }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [city, setCity] = useState(initial?.city ?? '');
  const [bio, setBio] = useState(initial?.bio ?? '');
  const [gear, setGear] = useState(initial?.gear ?? '');
  const [roles, setRoles] = useState<string[]>(initial?.roles ?? []);
  const [min, setMin] = useState(initial?.day_rate_min?.toString() ?? '');
  const [max, setMax] = useState(initial?.day_rate_max?.toString() ?? '');
  const [available, setAvailable] = useState(initial?.available ?? true);
  const [links, setLinks] = useState((initial?.portfolio_links ?? []).join('\n'));
  const [avatar, setAvatar] = useState(initial?.avatar_url ?? null);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const toggle = (r: string) =>
    setRoles((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]));

  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [4, 5], quality: 0.7,
    });
    if (!res.canceled) setLocalUri(res.assets[0].uri);
  };

  const save = async () => {
    if (name.trim().length < 2) return Alert.alert('Informe seu nome.');
    if (roles.length === 0) return Alert.alert('Escolha ao menos uma função.');
    const lo = toInt(min), hi = toInt(max);
    if (lo != null && hi != null && hi < lo) return Alert.alert('O cachê máximo deve ser maior que o mínimo.');
    setSaving(true);
    try {
      const avatar_url = localUri ? await uploadAvatar(userId, localUri) : avatar;
      await upsertProfile({
        id: userId, name: name.trim(), avatar_url, city: city.trim() || null,
        bio: bio.trim() || null, roles, day_rate_min: lo, day_rate_max: hi, available,
        portfolio_links: links.split('\n').map((l) => l.trim()).filter(Boolean),
        gear: gear.trim() || null,
      });
      onSaved();
    } catch (e) {
      Alert.alert('Não foi possível salvar', e instanceof Error ? e.message : 'Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const shown = localUri ?? avatar;
  return (
    <View style={{ gap: 14 }}>
      <Pressable onPress={pick} style={s.avatar}>
        {shown ? <Image source={{ uri: shown }} style={StyleSheet.absoluteFill} /> : <Text style={s.avatarText}>+ Foto</Text>}
      </Pressable>
      <Input placeholder="Nome artístico / profissional" value={name} onChangeText={setName} />
      <Input placeholder="Cidade" value={city} onChangeText={setCity} />
      <Text style={s.label}>Funções</Text>
      <View style={s.wrap}>{ROLES.map((r) => <Chip key={r} label={r} selected={roles.includes(r)} onPress={() => toggle(r)} />)}</View>
      <Input placeholder="Sobre você" value={bio} onChangeText={setBio} multiline maxLength={500} style={{ minHeight: 90 }} />
      <Text style={s.label}>Cachê diário (R$)</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Input placeholder="Mín." value={min} onChangeText={setMin} keyboardType="number-pad" style={{ flex: 1 }} />
        <Input placeholder="Máx." value={max} onChangeText={setMax} keyboardType="number-pad" style={{ flex: 1 }} />
      </View>
      <Input placeholder="Equipamentos (ex.: FX6, lentes Sigma, Aputure)" value={gear} onChangeText={setGear} maxLength={500} />
      <Input placeholder={'Links do portfólio (um por linha)'} value={links} onChangeText={setLinks} multiline autoCapitalize="none" style={{ minHeight: 70 }} />
      <View style={s.switchRow}>
        <Text style={{ color: colors.text }}>Disponível para novos trabalhos</Text>
        <Switch value={available} onValueChange={setAvailable} trackColor={{ true: colors.accent }} />
      </View>
      <Button title={submitLabel} onPress={save} loading={saving} />
    </View>
  );
}

const s = StyleSheet.create({
  avatar: { width: 120, height: 150, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', overflow: 'hidden' },
  avatarText: { color: colors.accent, fontWeight: '700' },
  label: { color: colors.muted, fontWeight: '600' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
