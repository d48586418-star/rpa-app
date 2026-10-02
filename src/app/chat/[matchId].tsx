import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Button, Input } from '../../components/ui';
import { fetchMessages, sendMessage } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import type { Message } from '../../lib/types';
import { colors } from '../../theme';

export default function Chat() {
  const { matchId, name } = useLocalSearchParams<{ matchId: string; name?: string }>();
  const { session } = useAuth();
  const me = session!.user.id;
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const list = useRef<FlatList<Message>>(null);
  const key = ['messages', matchId];
  const { data } = useQuery({ queryKey: key, queryFn: () => fetchMessages(matchId) });

  useEffect(() => {
    const ch = supabase
      .channel(`chat-${matchId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
        (payload) => {
          const msg = payload.new as Message;
          qc.setQueryData<Message[]>(key, (cur = []) => (cur.some((m) => m.id === msg.id) ? cur : [...cur, msg]));
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, qc]);

  const send = async () => {
    const body = text.trim();
    if (!body) return;
    setText('');
    try {
      await sendMessage(matchId, me, body);
    } catch (e) {
      setText(body);
      Alert.alert('Mensagem não enviada', e instanceof Error ? e.message : 'Tente novamente.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <Stack.Screen options={{ title: name ?? 'Conversa' }} />
      <FlatList
        ref={list}
        data={data}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={<Text style={s.hint}>Diga oi e combine o projeto 👋</Text>}
        renderItem={({ item }) => (
          <View style={[s.bubble, item.sender_id === me ? s.mine : s.theirs]}>
            <Text style={{ color: item.sender_id === me ? colors.accentText : colors.text }}>{item.body}</Text>
          </View>
        )}
      />
      <View style={s.bar}>
        <Input style={{ flex: 1 }} placeholder="Mensagem" value={text} onChangeText={setText} onSubmitEditing={send} maxLength={2000} />
        <Button title="Enviar" onPress={send} />
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  bubble: { maxWidth: '80%', padding: 10, borderRadius: 14 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.accent },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.card },
  bar: { flexDirection: 'row', gap: 8, padding: 12, alignItems: 'center' },
  hint: { color: colors.muted, textAlign: 'center', marginTop: 40 },
});
