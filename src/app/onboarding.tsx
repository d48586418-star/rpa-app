import { useQueryClient } from '@tanstack/react-query';
import { SafeAreaView, ScrollView, Text } from 'react-native';
import { ProfileForm } from '../components/ProfileForm';
import { useAuth } from '../lib/auth';
import { colors } from '../theme';

export default function Onboarding() {
  const { session } = useAuth();
  const qc = useQueryClient();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }} keyboardShouldPersistTaps="handled">
        <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800' }}>Monte seu perfil</Text>
        <Text style={{ color: colors.muted }}>É assim que outros profissionais vão te ver.</Text>
        <ProfileForm
          userId={session!.user.id}
          submitLabel="Começar"
          onSaved={() => qc.invalidateQueries({ queryKey: ['my-profile'] })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
