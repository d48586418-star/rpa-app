import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { commentOnPost, fetchPostComments, likePost, savePost, type PostView } from '../lib/api';
import { formatShort } from '../lib/dates';
import { colors, fonts, glass, radius, shadow } from '../theme';
import { Icon } from './Icon';
import { Photo } from './Photo';
import { blobColor } from './ProfileCard';
import { T } from './ui';

function Action({ icon, label, active, count, onPress, tint = colors.accent }: {
  icon: 'heart' | 'comment' | 'bookmark'; label: string; active?: boolean; count?: number; onPress: () => void; tint?: string;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: Boolean(active) }} onPress={onPress} hitSlop={6} style={s.action}>
      <Icon name={icon} size={24} color={active ? tint : colors.text} fill={active ? tint : undefined} />
      {count != null && count > 0 ? <T style={s.count}>{count}</T> : null}
    </Pressable>
  );
}

/** Post de trabalho da Rede: foto, legenda, crédito, curtir, comentar e salvar. */
export function PostCard({ post, me }: { post: PostView; me: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const refresh = () => qc.invalidateQueries({ queryKey: ['posts'] });
  const comments = useQuery({ queryKey: ['post-comments', post.id], queryFn: () => fetchPostComments(post.id), enabled: open });
  const run = async (fn: () => Promise<unknown>) => {
    try { await fn(); refresh(); } catch (e) { Alert.alert('Não deu certo', e instanceof Error ? e.message : 'Tente novamente.'); }
  };
  const send = () => run(async () => {
    await commentOnPost(post.id, me, text);
    setText('');
    qc.invalidateQueries({ queryKey: ['post-comments', post.id] });
  });

  return (
    <View style={s.card}>
      <View style={s.head}>
        <View style={[s.avatar, { backgroundColor: blobColor(post.author_id) }]}>
          {post.authorPhoto ? <Photo photo={post.authorPhoto} style={StyleSheet.absoluteFill} /> : <T style={s.avatarText}>{post.authorName.charAt(0)}</T>}
        </View>
        <View style={{ flex: 1 }}>
          <T style={{ fontFamily: fonts.semibold, fontSize: 15 }} numberOfLines={1}>{post.authorName}</T>
          <T style={{ color: colors.muted, fontSize: 12 }} numberOfLines={1}>{[post.authorRole, formatShort(post.created_at)].filter(Boolean).join(' · ')}</T>
        </View>
      </View>
      <View style={s.photo}>
        <Photo photo={post.photo} style={StyleSheet.absoluteFill} />
        {post.credit ? (
          <View style={s.credit}><Icon name="clapper" size={14} color="#fff" /><T style={s.creditText} numberOfLines={1}>{post.credit}</T></View>
        ) : null}
      </View>
      <View style={s.actions}>
        <Action icon="heart" label={post.liked ? 'Descurtir' : 'Curtir'} active={post.liked} count={post.likeCount} tint={colors.pass} onPress={() => run(() => likePost(post.id, me))} />
        <Action icon="comment" label="Comentários" active={open} count={post.comments.length} onPress={() => setOpen((v) => !v)} />
        <View style={{ flex: 1 }} />
        <Action icon="bookmark" label={post.saved ? 'Remover dos salvos' : 'Salvar'} active={post.saved} onPress={() => run(() => savePost(post.id, me))} />
      </View>
      <T style={s.caption}>{post.caption}</T>
      {open && (
        <View style={s.comments}>
          {comments.data?.map((c) => (
            <T key={c.id} style={{ fontSize: 13.5, lineHeight: 19 }}>
              <T style={{ fontFamily: fonts.semibold, fontSize: 13.5 }}>{c.authorName} </T>{c.body}
            </T>
          ))}
          {comments.data?.length === 0 && <T style={{ color: colors.muted, fontSize: 13 }}>Seja a primeira pessoa a comentar.</T>}
          <View style={s.inputRow}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Escreva um comentário"
              placeholderTextColor={colors.muted}
              accessibilityLabel="Escreva um comentário"
              maxLength={200}
              onSubmitEditing={send}
              style={s.input}
            />
            <Pressable accessibilityRole="button" accessibilityLabel="Enviar comentário" onPress={send} disabled={!text.trim()} style={[s.send, !text.trim() && { opacity: 0.4 }]}>
              <Icon name="send" size={18} color={colors.onAccent} />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 12, gap: 10, borderWidth: 1, borderColor: colors.border, ...(shadow.card as object) },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 42, height: 42, borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontFamily: fonts.black, fontSize: 18 },
  photo: { height: 280, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surfaceAlt },
  credit: { position: 'absolute', left: 10, bottom: 10, maxWidth: '80%', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: 'rgba(11,11,15,0.42)', borderWidth: 1, borderColor: glass.onPhotoBorder },
  creditText: { color: '#fff', fontSize: 12, fontFamily: fonts.semibold, flexShrink: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, minWidth: 44, justifyContent: 'center' },
  count: { fontSize: 14, fontFamily: fonts.semibold },
  caption: { fontSize: 14.5, lineHeight: 21, paddingHorizontal: 2 },
  comments: { gap: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  inputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: { flex: 1, minHeight: 44, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, paddingHorizontal: 16, fontSize: 14, fontFamily: fonts.regular, color: colors.text },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
});
