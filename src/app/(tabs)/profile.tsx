import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, ScrollView } from 'react-native';
import { ProfileForm } from '../../components/ProfileForm';
import { Button } from '../../components/ui';
import { fetchMyProfile } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { colors } from '../../theme';

export default function ProfileTab() {
  const { session } = useAuth();
  const me = session!.user.id;
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['my-profile', me], queryFn: () => fetchMyProfile(me) });
  if (isLoading || !data) return <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />;
  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
      <ProfileForm
        userId={me}
        initial={data}
        submitLabel="Salvar alterações"
        onSaved={() => qc.invalidateQueries({ queryKey: ['my-profile'] })}
      />
      <Button title="Sair" variant="ghost" onPress={() => supabase.auth.signOut()} />
    </ScrollView>
  );
}
