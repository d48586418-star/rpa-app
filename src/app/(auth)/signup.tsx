import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Button, Input } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import { colors } from '../../theme';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (password.length < 6) return Alert.alert('A senha precisa ter ao menos 6 caracteres.');
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    setLoading(false);
    if (error) return Alert.alert('Não foi possível criar a conta', error.message);
    if (!data.session) Alert.alert('Confirme seu e-mail', 'Enviamos um link de confirmação para o seu e-mail.');
  };

  return (
    <SafeAreaView style={s.root}>
      <View style={s.box}>
        <Text style={s.title}>Criar conta</Text>
        <Input placeholder="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Input placeholder="Senha (mín. 6 caracteres)" value={password} onChangeText={setPassword} secureTextEntry />
        <Button title="Criar conta" onPress={submit} loading={loading} />
        <Link href="/login" style={s.link}>Já tem conta? Entrar</Link>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center' },
  box: { padding: 24, gap: 14 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: 8 },
  link: { color: colors.accent, textAlign: 'center', marginTop: 8 },
});
