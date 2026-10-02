import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Button, Input } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import { colors } from '../../theme';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) Alert.alert('Não foi possível entrar', error.message);
  };

  return (
    <SafeAreaView style={s.root}>
      <View style={s.box}>
        <Text style={s.logo}>🎬 Claquete</Text>
        <Text style={s.tag}>Encontre sua próxima equipe.</Text>
        <Input placeholder="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Input placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry />
        <Button title="Entrar" onPress={submit} loading={loading} />
        <Link href="/signup" style={s.link}>Não tem conta? Criar conta</Link>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center' },
  box: { padding: 24, gap: 14 },
  logo: { color: colors.accent, fontSize: 36, fontWeight: '900' },
  tag: { color: colors.muted, marginBottom: 12 },
  link: { color: colors.accent, textAlign: 'center', marginTop: 8 },
});
