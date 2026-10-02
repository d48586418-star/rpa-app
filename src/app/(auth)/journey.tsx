import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { JourneyShapes } from '../../components/JourneyShapes';
import { T, Wordmark } from '../../components/ui';
import { PENDING_TYPE_KEY } from '../../lib/pendingType';
import type { AccountType } from '../../lib/types';
import { colors, fonts } from '../../theme';

export default function Journey() {
  const choose = async (t: AccountType) => {
    try { await AsyncStorage.setItem(PENDING_TYPE_KEY, t); } catch { /* segue com o padrão */ }
    router.push('/signup');
  };
  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.header}>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Voltar" hitSlop={12}>
            <T style={{ fontFamily: fonts.light, fontSize: 36, lineHeight: 38 }}>←</T>
          </Pressable>
          <Wordmark />
        </View>
        <T style={s.title}>
          <T style={s.bold}>Selecione</T>
          <T style={s.thin}> a{'\n'}sua jornada!</T>
        </T>
        <JourneyShapes onFreelancer={() => choose('freelancer')} onCompany={() => choose('empresa')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 28, gap: 24, paddingBottom: 48 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 40, lineHeight: 52 },
  thin: { fontFamily: fonts.light, fontSize: 40, lineHeight: 52 },
  bold: { fontFamily: fonts.semibold, fontSize: 40, lineHeight: 52 },
});
