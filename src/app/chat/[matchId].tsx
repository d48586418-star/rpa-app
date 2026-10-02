import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, Input, T } from '../../components/ui';
import { fetchMessages, sendMessage, subscribeMessages } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import type { Message } from '../../lib/types';
import { colors, fonts } from '../../theme';

export default function Chat() {
  const { matchId, name } = useLocalSearchParams<{ matchId: string; name?: string }>();
  const { session } = useAuth();
  const me = session!.user.id;
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const list = useRef<FlatList<Message>>(null);
  const { data } = useQuery({ queryKey: ['messages', matchId], queryFn: () => fetchMessages(matchId) });

  useEffect(
    () =>
      subscribeMessages(matchId, (msg) =>
        qc.setQueryData<Message[]>(['messages', matchId], (cur = []) =>
          cur.some((m) => m.id === msg.id) ? cur : [...cur, msg])),
    [matchId, qc],
  );

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
        ListEmptyComponent={<T style={s.hint}>Diga oi e combine o projeto</T>}
        renderItem={({ item }) => (
          <View style={[s.bubble, item.sender_id === me ? s.mine : s.theirs]}>
            <T style={{ color: item.sender_id === me ? colors.onLight : colors.text }}>{item.body}</T>
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
  bubble: { maxWidth: '80%', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.light },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.surface },
  bar: { flexDirection: 'row', gap: 8, padding: 12, alignItems: 'center' },
  hint: { color: colors.muted, textAlign: 'center', marginTop: 40 },
});
