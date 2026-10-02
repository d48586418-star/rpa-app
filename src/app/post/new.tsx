import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Icon } from '../../components/Icon';
import { Photo } from '../../components/Photo';
import { Button, Chip, Input, Screen, T, Title } from '../../components/ui';
import { createPost, fetchMyProfile } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { FEED_PHOTOS } from '../../lib/photoKeys';
import { colors, fonts, radius } from '../../theme';

/** Postar um trabalho na Rede: foto, legenda, função e crédito opcionais. */
export default function NewPost() {
  const { session } = useAuth();
  const me = session!.user.id;
  const qc = useQueryClient();
  const mine = useQuery({ queryKey: ['my-profile', me], queryFn: () => fetchMyProfile(me) });
  const [photo, setPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [credit, setCredit] = useState('');
  const [saving, setSaving] = useState(false);

  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 5], quality: 0.7 });
    if (!res.canceled) setPhoto(res.assets[0].uri);
  };

  const publish = async () => {
    setSaving(true);
    try {
      await createPost(me, { photo: photo ?? '', caption, role, credit });
      await qc.invalidateQueries({ queryKey: ['posts'] });
      router.replace('/rede');
    } catch (e) {
      Alert.alert('Não foi possível postar', e instanceof Error ? e.message : 'Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Screen options={{ title: 'Postar trabalho' }} />
        <ScrollView contentContainerStyle={s.box} keyboardShouldPersistTaps="handled">
          <Title lead="Mostre o que" rest="você fez." />
          <View style={s.preview}>
            {photo ? <Photo photo={photo} style={StyleSheet.absoluteFill} /> : (
              <View style={s.placeholder}><Icon name="image" size={34} color={colors.muted} /><T style={{ color: colors.muted }}>Escolha uma foto abaixo</T></View>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            <Pressable accessibilityRole="button" accessibilityLabel="Escolher da galeria" onPress={pick} style={[s.thumb, s.pick]}>
              <Icon name="image" size={22} color={colors.accent} />
              <T style={{ fontSize: 11.5, color: colors.accent, fontFamily: fonts.semibold }}>Galeria</T>
            </Pressable>
            {FEED_PHOTOS.map((k) => (
              <Pressable key={k} accessibilityRole="button" accessibilityLabel={`Foto ${k}`} accessibilityState={{ selected: photo === k }} onPress={() => setPhoto(k)} style={[s.thumb, photo === k && s.thumbOn]}>
                <Photo photo={k} style={StyleSheet.absoluteFill} />
              </Pressable>
            ))}
          </ScrollView>
          <T style={s.hint}>Fotos de exemplo são ilustrativas. Na versão real, você sobe as suas.</T>
          <Input placeholder="Legenda (até 280 caracteres)" value={caption} onChangeText={setCaption} multiline maxLength={280} style={{ minHeight: 84 }} accessibilityLabel="Legenda" />
          {mine.data && mine.data.roles.length > 0 && (
            <>
              <T style={s.label}>Sua função neste trabalho (opcional)</T>
              <View style={s.wrap}>{mine.data.roles.map((r) => <Chip key={r} label={r} selected={role === r} onPress={() => setRole(role === r ? null : r)} />)}</View>
            </>
          )}
          <Input placeholder="Crédito do trabalho (opcional)" value={credit} onChangeText={setCredit} maxLength={60} />
          <Button title="Publicar na Rede" icon="send" onPress={publish} loading={saving} disabled={!photo || caption.trim().length < 3} />
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const s = StyleSheet.create({
  box: { padding: 20, gap: 14, paddingBottom: 50 },
  preview: { height: 260, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  thumb: { width: 72, height: 90, borderRadius: radius.md, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent', backgroundColor: colors.surfaceAlt },
  thumbOn: { borderColor: colors.accent },
  pick: { alignItems: 'center', justifyContent: 'center', gap: 4, borderColor: colors.border, borderStyle: 'dashed', backgroundColor: colors.surface },
  label: { color: colors.muted, fontFamily: fonts.semibold },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  hint: { color: colors.muted, fontSize: 12.5 },
});
