import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, View } from 'react-native';
import { Button, Input, T, Wordmark } from '../../components/ui';
import { signUp } from '../../lib/authActions';
import { colors, fonts } from '../../theme';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (password.length < 6) return Alert.alert('A senha precisa ter ao menos 6 caracteres.');
    setLoading(true);
    const { error, needsConfirmation } = await signUp(email, password);
    setLoading(false);
    if (error) return Alert.alert('Não foi possível criar a conta', error);
    if (needsConfirmation) Alert.alert('Confirme seu e-mail', 'Enviamos um link de confirmação para o seu e-mail.');
  };

  return (
    <SafeAreaView style={s.root}>
      <View style={s.box}>
        <View style={{ alignSelf: 'flex-end' }}><Wordmark /></View>
        <T style={s.title}><T style={s.bold}>Criar</T><T style={s.thin}> conta</T></T>
        <Input placeholder="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Input placeholder="Senha (mín. 6 caracteres)" value={password} onChangeText={setPassword} secureTextEntry />
        <Button title="Criar conta" onPress={submit} loading={loading} arrow />
        <Link href="/login" style={s.link}>Já tem conta? Entrar</Link>
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
