import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import { ProfileForm } from '../components/ProfileForm';
import { T } from '../components/ui';
import { useAuth } from '../lib/auth';
import { PENDING_TYPE_KEY } from '../lib/pendingType';
import type { AccountType } from '../lib/types';
import { colors, fonts } from '../theme';

export default function Onboarding() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const [type, setType] = useState<AccountType | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(PENDING_TYPE_KEY)
      .then((v) => setType(v === 'empresa' ? 'empresa' : 'freelancer'))
      .catch(() => setType('freelancer'));
  }, []);

  if (!type) return null;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 12 }} keyboardShouldPersistTaps="handled">
        <T style={{ fontSize: 30, fontFamily: fonts.semibold }}>Monte seu perfil</T>
        <T style={{ color: colors.muted, fontFamily: fonts.light }}>
          {type === 'empresa' ? 'É assim que os profissionais vão ver sua empresa.' : 'É assim que as empresas e outros profissionais vão te ver.'}
        </T>
        <ProfileForm
          userId={session!.user.id}
          accountType={type}
          submitLabel="Começar"
          onSaved={() => { AsyncStorage.removeItem(PENDING_TYPE_KEY).catch(() => {}); qc.invalidateQueries({ queryKey: ['my-profile'] }); }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
