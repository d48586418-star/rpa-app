import { Link, router } from 'expo-router';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { SlideToStart } from '../../components/SlideToStart';
import { T, Wordmark } from '../../components/ui';
import { colors, fonts } from '../../theme';

export default function Welcome() {
  return (
    <SafeAreaView style={s.root}>
      <View style={s.top}>
        <View style={s.dot} />
        <Wordmark />
      </View>
      <View style={s.bottom}>
        <T style={s.kicker}>Match profissional</T>
        <T style={s.title}>
          <T style={s.thin}>Encontre o{'\n'}</T>
          <T style={s.bold}>projeto certo </T>
          <T style={s.thin}>ou o{'\n'}</T>
          <T style={s.bold}>profissional ideal!</T>
        </T>
        <SlideToStart label="Comece sua jornada" onComplete={() => router.push('/journey')} />
        <Link href="/login" style={s.link}>Já tenho conta</Link>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, justifyContent: 'space-between' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 28 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent, marginTop: 8 },
  bottom: { padding: 28, paddingBottom: 48, gap: 18 },
  kicker: { fontFamily: fonts.light, fontSize: 20, color: colors.muted },
  title: { fontSize: 36, lineHeight: 46, marginBottom: 12 },
  thin: { fontFamily: fonts.light, fontSize: 36, lineHeight: 46 },
  bold: { fontFamily: fonts.semibold, fontSize: 36, lineHeight: 46 },
  link: { color: colors.muted, textAlign: 'center', fontFamily: fonts.regular, marginTop: 4 },
});
