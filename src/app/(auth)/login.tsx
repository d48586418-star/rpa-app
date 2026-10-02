import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, View } from 'react-native';
import { Button, Input, T, Wordmark } from '../../components/ui';
import { signIn } from '../../lib/authActions';
import { colors, fonts } from '../../theme';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) Alert.alert('Não foi possível entrar', error);
  };

  return (
    <SafeAreaView style={s.root}>
      <View style={s.box}>
        <View style={{ alignSelf: 'flex-end' }}><Wordmark /></View>
        <T style={s.title}><T style={s.bold}>Bem-vindo</T><T style={s.thin}> de volta</T></T>
        <Input placeholder="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Input placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry />
        <Button title="Entrar" onPress={submit} loading={loading} arrow />
        <Link href="/journey" style={s.link}>Não tem conta? Criar conta</Link>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center' },
  box: { padding: 24, gap: 14 },
  title: { fontSize: 32, lineHeight: 42, marginBottom: 8 },
  thin: { fontFamily: fonts.light, fontSize: 32 },
  bold: { fontFamily: fonts.semibold, fontSize: 32 },
  link: { color: colors.muted, textAlign: 'center', marginTop: 8, fontFamily: fonts.regular },
});
