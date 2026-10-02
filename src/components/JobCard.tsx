import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import { genreLabel } from '../constants/genres';
import type { JobCard as JobCardData, OwnerJobRow } from '../lib/api';
import { brl } from '../lib/contract';
import { formatShort } from '../lib/dates';
import { STAGE_LABELS } from '../lib/engagement';
import { coverFor } from '../lib/photoKeys';
import { hashString } from '../lib/shapes';
import { colors, fonts, glass, gradients, radius, shadow } from '../theme';
import { Icon, type IconName } from './Icon';
import { MatchRing } from './MatchRing';
import { Photo } from './Photo';
import { Chip, T } from './ui';

const bubble = (id: string) => colors.bubbles[hashString(id) % colors.bubbles.length];

/** Pílula de informação de vidro sobre foto. */
function PhotoChip({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={s.photoChip}>
      <Icon name={icon} size={13} color="#fff" />
      <T style={s.photoChipText} numberOfLines={1}>{text}</T>
    </View>
  );
}

/** Rosto da carta do deck de vagas: foto de capa inteira, painel de vidro com o essencial. Só 4 informações. */
export function JobFace({ c }: { c: JobCardData }) {
  const j = c.job;
  return (
    <View style={s.face}>
      <Photo photo={coverFor(j)} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={gradients.photoShade} start={{ x: 0.5, y: 0.35 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={s.faceTop}>
        <View style={s.ownerPill}>
          <View style={s.ownerAvatar}>
            {c.ownerPhoto ? <Photo photo={c.ownerPhoto} style={StyleSheet.absoluteFill} /> : <T style={{ color: '#fff', fontFamily: fonts.bold, fontSize: 12 }}>{c.ownerName.charAt(0)}</T>}
          </View>
          <T style={s.ownerName} numberOfLines={1}>{c.ownerName}</T>
        </View>
        <View style={s.ringWrap}><MatchRing score={c.score} size={52} onPhoto /></View>
      </View>
      <View style={s.facePanel}>
        <T style={s.faceRole}>{j.role.toUpperCase()}  ·  {genreLabel(j.genre).toUpperCase()}</T>
        <T style={s.faceTitle} numberOfLines={2}>{j.title}</T>
        <View style={s.chipRow}>
          <PhotoChip icon="calendar" text={`${formatShort(j.date)} · ${j.days} ${j.days === 1 ? 'diária' : 'diárias'}`} />
          <PhotoChip icon="pin" text={j.city ?? 'Remoto'} />
          <PhotoChip icon="money" text={`${brl(j.budget_per_day)}/dia`} />
        </View>
        <View style={s.moreRow}>
          <T style={s.more}>Toque para ver os detalhes</T>
          <Icon name="arrow-right" size={13} color="rgba(255,255,255,0.85)" />
        </View>
      </View>
    </View>
  );
}

/** Card de vaga em lista: balão colorido com a foto como "adesivo" (referência Chats). */
export function ProJobCard({ c, onPress, compact }: { c: JobCardData; onPress: () => void; compact?: boolean }) {
  const j = c.job;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${j.title}, ${c.score}% compatível`}
      onPress={onPress}
      style={({ pressed }) => [s.bubbleCard, { backgroundColor: bubble(j.id) }, compact && { width: 290 }, pressed && { opacity: 0.88 }]}>
      <View style={{ flex: 1, gap: 6 }}>
        <T style={s.bubbleOwner} numberOfLines={1}>{c.ownerName}</T>
        <T style={s.bubbleTitle} numberOfLines={2}>{j.title}</T>
        <T style={s.bubbleMeta} numberOfLines={1}>{formatShort(j.date)} · {j.city ?? 'Remoto'} · {brl(j.budget_per_day)}/dia</T>
        <View style={s.chips}>
          <View style={s.scorePill}><T style={s.scoreText}>{c.score}% compatível</T></View>
          {c.selected ? <Chip label="Você foi escolhido" tint={colors.like} /> : c.applied ? <Chip label="Candidatado" tint={colors.accent} /> : null}
        </View>
      </View>
      <View style={s.sticker}>
        <Photo photo={coverFor(j)} style={StyleSheet.absoluteFill} />
      </View>
    </Pressable>
  );
}

/** Carta vertical pequena para carrosséis (Início). */
export function JobTile({ c, onPress }: { c: JobCardData; onPress: () => void }) {
  const j = c.job;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${j.title}, ${c.score}% compatível`} onPress={onPress} style={({ pressed }) => [s.tile, pressed && { opacity: 0.9 }]}>
      <Photo photo={coverFor(j)} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={gradients.photoShade} start={{ x: 0.5, y: 0.4 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={s.tileScore}><T style={s.tileScoreText}>{c.score}%</T></View>
      <View style={{ position: 'absolute', left: 12, right: 12, bottom: 12, gap: 3 }}>
        <T style={s.tileTitle} numberOfLines={2}>{j.title}</T>
        <T style={s.tileMeta} numberOfLines={1}>{j.city ?? 'Remoto'} · {brl(j.budget_per_day)}</T>
      </View>
    </Pressable>
  );
}

/** Card de job para a empresa (candidatos e etapa). */
export function OwnerJobCard({ r, onPress }: { r: OwnerJobRow; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir vaga ${r.job.title}`}
      onPress={onPress}
      style={({ pressed }) => [s.bubbleCard, { backgroundColor: bubble(r.job.id) }, pressed && { opacity: 0.88 }]}>
      <View style={{ flex: 1, gap: 6 }}>
        <T style={s.bubbleTitle} numberOfLines={2}>{r.job.title}</T>
        <T style={s.bubbleMeta}>{r.job.role} · {formatShort(r.job.date)} · {r.job.city ?? 'Remoto'}</T>
        <View style={s.chips}>
          <Chip label={`${r.applicants} ${r.applicants === 1 ? 'candidato' : 'candidatos'}`} />
          {r.stage ? <Chip label={STAGE_LABELS[r.stage]} tint={colors.accent} /> : <Chip label="Aberta" tint={colors.like} />}
        </View>
      </View>
      <View style={s.sticker}>
        <Photo photo={coverFor(r.job)} style={StyleSheet.absoluteFill} />
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  face: { flex: 1, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.surfaceAlt, ...(shadow.float as object) },
  faceTop: { position: 'absolute', top: 14, left: 14, right: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ownerPill: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5, paddingLeft: 5, paddingRight: 12, borderRadius: radius.pill, backgroundColor: 'rgba(11,11,15,0.38)', borderWidth: 1, borderColor: glass.onPhotoBorder, maxWidth: '70%' },
  ownerAvatar: { width: 28, height: 28, borderRadius: 14, overflow: 'hidden', backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  ownerName: { color: '#fff', fontFamily: fonts.semibold, fontSize: 13, flexShrink: 1 },
  ringWrap: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(11,11,15,0.38)', borderWidth: 1, borderColor: glass.onPhotoBorder, alignItems: 'center', justifyContent: 'center' },
  facePanel: { position: 'absolute', left: 12, right: 12, bottom: 12, padding: 16, gap: 8, borderRadius: radius.lg, backgroundColor: glass.onPhoto, borderWidth: 1, borderColor: glass.onPhotoBorder },
  faceRole: { color: 'rgba(255,255,255,0.88)', fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1.2 },
  faceTitle: { color: '#fff', fontFamily: fonts.semibold, fontSize: 26, lineHeight: 31, letterSpacing: -0.4 },
  moreRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  more: { color: 'rgba(255,255,255,0.85)', fontSize: 11.5 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  photoChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: 'rgba(11,11,15,0.36)', borderWidth: 1, borderColor: glass.onPhotoBorder },
  photoChipText: { color: '#fff', fontSize: 12, fontFamily: fonts.semibold },
  bubbleCard: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: radius.lg, borderTopLeftRadius: 8, alignItems: 'center' },
  bubbleOwner: { fontFamily: fonts.semibold, fontSize: 12, color: 'rgba(11,11,15,0.62)' },
  bubbleTitle: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22, color: colors.text },
  bubbleMeta: { fontSize: 12.5, color: 'rgba(11,11,15,0.7)' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  scorePill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: colors.ink },
  scoreText: { color: colors.onInk, fontSize: 12, fontFamily: fonts.semibold },
  sticker: { width: 76, height: 92, borderRadius: 22, overflow: 'hidden', borderWidth: 3, borderColor: '#fff', transform: [{ rotate: '4deg' }], ...(shadow.card as object) },
  tile: { width: 168, height: 220, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surfaceAlt, ...(shadow.card as object) },
  tileScore: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: 'rgba(11,11,15,0.4)', borderWidth: 1, borderColor: glass.onPhotoBorder },
  tileScoreText: { color: '#fff', fontFamily: fonts.bold, fontSize: 12 },
  tileTitle: { color: '#fff', fontFamily: fonts.semibold, fontSize: 15, lineHeight: 19 },
  tileMeta: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
});
