import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, View } from 'react-native';
import { ROLES } from '../constants/roles';
import { upsertProfile, uploadAvatar } from '../lib/api';
import type { AccountType, Profile } from '../lib/types';
import { colors, fonts, radius } from '../theme';
import { Button, Chip, Input, T } from './ui';

const toInt = (v: string) => (v.trim() === '' ? null : Math.max(0, parseInt(v, 10) || 0));

export function ProfileForm({
  userId, accountType, initial, submitLabel, onSaved,
}: {
  userId: string; accountType: AccountType; initial?: Profile | null;
  submitLabel: string; onSaved: () => void;
}) {
  const company = accountType === 'empresa';
  const [name, setName] = useState(initial?.name ?? '');
  const [city, setCity] = useState(initial?.city ?? '');
  const [bio, setBio] = useState(initial?.bio ?? '');
  const [gear, setGear] = useState(initial?.gear ?? '');
  const [website, setWebsite] = useState(initial?.website ?? '');
  const [roles, setRoles] = useState<string[]>(initial?.roles ?? []);
  const [min, setMin] = useState(initial?.day_rate_min?.toString() ?? '');
  const [max, setMax] = useState(initial?.day_rate_max?.toString() ?? '');
  const [available, setAvailable] = useState(initial?.available ?? true);
  const [links, setLinks] = useState((initial?.portfolio_links ?? []).join('\n'));
  const [avatar] = useState(initial?.avatar_url ?? null);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const toggle = (r: string) =>
    setRoles((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]));

  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7,
    });
    if (!res.canceled) setLocalUri(res.assets[0].uri);
  };

  const save = async () => {
    if (name.trim().length < 2) return Alert.alert(company ? 'Informe o nome da empresa.' : 'Informe seu nome.');
    if (roles.length === 0) return Alert.alert(company ? 'Escolha ao menos uma função que você procura.' : 'Escolha ao menos uma função.');
    const lo = company ? null : toInt(min);
    const hi = company ? null : toInt(max);
    if (lo != null && hi != null && hi < lo) return Alert.alert('O cachê máximo deve ser maior que o mínimo.');
    setSaving(true);
    try {
      const avatar_url = localUri ? await uploadAvatar(userId, localUri) : avatar;
      await upsertProfile({
        id: userId, account_type: accountType, name: name.trim(), avatar_url,
        city: city.trim() || null, bio: bio.trim() || null, roles,
        day_rate_min: lo, day_rate_max: hi, available,
        portfolio_links: company ? [] : links.split('\n').map((l) => l.trim()).filter(Boolean),
        gear: company ? null : gear.trim() || null,
        website: company ? website.trim() || null : null,
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
      <Pressable onPress={pick} style={s.avatar} accessibilityRole="button" accessibilityLabel="Escolher foto">
        {shown ? <Image source={{ uri: shown }} style={StyleSheet.absoluteFill} /> : <T style={s.avatarText}>+ {company ? 'Logo' : 'Foto'}</T>}
      </Pressable>
      <Input placeholder={company ? 'Nome da produtora / empresa' : 'Nome artístico / profissional'} value={name} onChangeText={setName} />
      <Input placeholder="Cidade" value={city} onChangeText={setCity} />
      <T style={s.label}>{company ? 'Funções que você procura' : 'Suas funções'}</T>
      <View style={s.wrap}>{ROLES.map((r) => <Chip key={r} label={r} selected={roles.includes(r)} onPress={() => toggle(r)} />)}</View>
      <Input placeholder={company ? 'Sobre a empresa e os projetos' : 'Sobre você'} value={bio} onChangeText={setBio} multiline maxLength={500} style={{ minHeight: 90 }} />
      {company ? (
        <Input placeholder="Site ou Instagram" value={website} onChangeText={setWebsite} autoCapitalize="none" maxLength={200} />
      ) : (
        <>
          <T style={s.label}>Cachê diário (R$)</T>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Input placeholder="Mín." value={min} onChangeText={setMin} keyboardType="number-pad" style={{ flex: 1 }} />
            <Input placeholder="Máx." value={max} onChangeText={setMax} keyboardType="number-pad" style={{ flex: 1 }} />
          </View>
          <Input placeholder="Equipamentos (ex.: FX6, lentes Sigma, Aputure)" value={gear} onChangeText={setGear} maxLength={500} />
          <Input placeholder="Links do portfólio (um por linha)" value={links} onChangeText={setLinks} multiline autoCapitalize="none" style={{ minHeight: 70 }} />
        </>
      )}
      <View style={s.switchRow}>
        <T>{company ? 'Contratando agora' : 'Disponível para novos trabalhos'}</T>
        <Switch value={available} onValueChange={setAvailable} trackColor={{ true: colors.accent }} />
      </View>
      <Button title={submitLabel} onPress={save} loading={saving} arrow />
    </View>
  );
}

const s = StyleSheet.create({
  avatar: { width: 120, height: 120, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', overflow: 'hidden' },
  avatarText: { color: colors.accent, fontFamily: fonts.semibold },
  label: { color: colors.muted, fontFamily: fonts.semibold },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
