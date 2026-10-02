import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { AuraCard } from '../../components/AuraCard';
import { ProfileForm } from '../../components/ProfileForm';
import { blobColor } from '../../components/ProfileCard';
import { ProgressSection } from '../../components/ProgressSection';
import { Button, Chip, T } from '../../components/ui';
import { fetchMyProfile, fetchProgress, jobsEnabled } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { signOut } from '../../lib/authActions';
import { availabilityTone } from '../../lib/availability';
import { colors, fonts } from '../../theme';

const TONE = { good: colors.like, warn: colors.accent, bad: colors.danger, info: colors.blue } as const;

export default function ProfileTab() {
  const { session } = useAuth();
  const me = session!.user.id;
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ['my-profile', me], queryFn: () => fetchMyProfile(me) });
  const demoFreelancer = jobsEnabled && data?.account_type === 'freelancer';
  const prog = useQuery({ queryKey: ['progress', me], queryFn: () => fetchProgress(me), enabled: demoFreelancer });
  if (isLoading || !data) return <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />;

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={s.box} keyboardShouldPersistTaps="handled">
      <AuraCard aura="orange" style={{ alignSelf: 'stretch' }}>
        <View style={s.head}>
          <View style={[s.avatar, { backgroundColor: blobColor(data.id) }]}><T style={s.avatarText}>{data.name.charAt(0)}</T></View>
          <View style={{ flex: 1, gap: 4 }}>
            <T style={s.name}>{data.name}</T>
            <T style={s.role}>{data.roles.join(' · ')}</T>
            <T style={s.meta}>{data.city ?? 'Sem cidade'}{data.account_type === 'empresa' ? ' · Empresa' : ''}</T>
          </View>
        </View>
        {prog.data ? (
          <View style={s.pill}>
            <Chip label={prog.data.availabilityText} tint={TONE[availabilityTone(prog.data.availability)]} />
          </View>
        ) : null}
      </AuraCard>

      {demoFreelancer ? <ProgressSection userId={me} roles={data.roles} /> : null}

      <Chip label={editing ? 'Fechar edição' : 'Editar perfil'} onPress={() => setEditing((v) => !v)} />
      {editing && (
        <ProfileForm
          userId={me}
          accountType={data.account_type}
          initial={data}
          submitLabel="Salvar alterações"
          onSaved={() => { setEditing(false); qc.invalidateQueries({ queryKey: ['my-profile'] }); qc.invalidateQueries({ queryKey: ['home'] }); }}
        />
      )}
      <Button title="Sair" variant="ghost" onPress={() => signOut()} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  box: { padding: 20, gap: 22, paddingBottom: 130 },
  head: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  avatar: { width: 76, height: 76, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.bg, fontFamily: fonts.black, fontSize: 34 },
  name: { fontFamily: fonts.semibold, fontSize: 26, lineHeight: 32 },
  role: { color: colors.text, fontSize: 14 },
  meta: { color: colors.muted, fontSize: 13 },
  pill: { marginTop: 14, flexDirection: 'row' },
});
