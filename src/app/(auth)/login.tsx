import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { PERSONAS, TEST_PASSWORD } from '../../constants/personas';
import { Button, Chip, Input, T, Wordmark } from '../../components/ui';
import { resetDemo, signIn } from '../../lib/authActions';
import { isDemo } from '../../lib/demo';
import { colors, fonts } from '../../theme';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e = email, p = password) => {
    setLoading(true);
    const { error } = await signIn(e, p);
    setLoading(false);
    if (error) Alert.alert('Não foi possível entrar', error);
  };

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.box} keyboardShouldPersistTaps="handled">
        <View style={{ alignSelf: 'flex-end' }}><Wordmark /></View>
        <T style={s.title}><T style={s.bold}>Bem-vindo</T><T style={s.thin}> de volta</T></T>
        <Input placeholder="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Input placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry />
        <Button title="Entrar" onPress={() => submit()} loading={loading} arrow />
        <Link href="/journey" style={s.link}>Não tem conta? Criar conta</Link>

        {isDemo && (
          <View style={s.personas}>
            <T style={s.section}>Entrar como persona de teste</T>
            <T style={s.hint}>Senha de todas: {TEST_PASSWORD}</T>
            <View style={s.wrap}>
              {PERSONAS.map((p) => (
                <Chip
                  key={p.key}
                  label={`${p.profile.name} · ${p.cargo}`}
                  tint={p.profile.account_type === 'empresa' ? colors.blue : colors.accent}
                  onPress={() => submit(p.email, TEST_PASSWORD)}
                />
              ))}
            </View>
            <T style={s.link} onPress={() => resetDemo()}>Reiniciar demo (apaga likes e matches)</T>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  box: { padding: 24, gap: 14, flexGrow: 1, justifyContent: 'center' },
  title: { fontSize: 32, lineHeight: 42, marginBottom: 8 },
  thin: { fontFamily: fonts.light, fontSize: 32 },
  bold: { fontFamily: fonts.semibold, fontSize: 32 },
  link: { color: colors.muted, textAlign: 'center', marginTop: 8, fontFamily: fonts.regular },
  personas: { gap: 10, marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: colors.border },
  section: { fontFamily: fonts.semibold, fontSize: 16 },
  hint: { color: colors.muted, fontSize: 13 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
