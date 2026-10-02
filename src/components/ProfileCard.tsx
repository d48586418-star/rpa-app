import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Svg, { ClipPath, Defs, Path, Text as SvgText } from 'react-native-svg';
import { formatRate } from '../lib/matching';
import { profileSubtitle } from '../lib/profileText';
import { blobPath, hashString } from '../lib/shapes';
import type { Profile } from '../lib/types';
import { auras, colors, fonts, glass, gradients, radius, shadow } from '../theme';
import { Photo, photoSource } from './Photo';
import { Chip, T } from './ui';

export function blobColor(id: string): string {
  return colors.blobs[hashString(id) % colors.blobs.length];
}

/** Linha principal do cartão: freelancer = função e cidade; empresa = cidade (as "funções" dela são o que procura). */
const subtitleOf = profileSubtitle;
const extraChips = (p: Profile) =>
  p.account_type === 'empresa' ? p.roles.slice(0, 2).map((r) => `Procura ${r}`) : p.roles.slice(1, 3);

function statusOf(p: Profile) {
  return p.account_type === 'empresa'
    ? p.available ? 'Contratando' : 'Sem vagas agora'
    : p.available ? 'Disponível' : 'Ocupado(a)';
}

/** Carta de perfil. Com foto: retrato inteiro e painel de vidro; sem foto: blob colorido com a inicial. */
export function ProfileCard({ profile }: { profile: Profile }) {
  const tint = blobColor(profile.id);
  const rate = profile.account_type === 'freelancer' ? formatRate(profile.day_rate_min, profile.day_rate_max) : null;
  const hasPhoto = Boolean(photoSource(profile.avatar_url));

  if (hasPhoto) {
    return (
      <View style={s.card}>
        <Photo photo={profile.avatar_url} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={gradients.photoShade} start={{ x: 0.5, y: 0.4 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={s.statusPill}>
          <View style={[s.dot, { backgroundColor: profile.available ? colors.like : '#B8B8C0' }]} />
          <T style={s.statusText}>{statusOf(profile)}</T>
        </View>
        <View style={s.photoPanel}>
          <T style={s.photoName} numberOfLines={1}>{profile.name}</T>
          <T style={s.photoSub} numberOfLines={1}>{subtitleOf(profile)}</T>
          <View style={s.row}>
            {extraChips(profile).map((r) => <View key={r} style={s.photoChip}><T style={s.photoChipText}>{r}</T></View>)}
            {rate && <View style={s.photoChip}><T style={s.photoChipText}>{rate}</T></View>}
          </View>
          {profile.bio ? <T style={s.photoBio} numberOfLines={2}>{profile.bio}</T> : null}
        </View>
      </View>
    );
  }

  const clipId = `clip-${profile.id}`;
  return (
    <View style={[s.card, { backgroundColor: colors.surface }]}>
      <LinearGradient colors={auras.blue} start={{ x: 1, y: 0 }} end={{ x: 0.1, y: 0.8 }} style={StyleSheet.absoluteFill} />
      <View style={s.art}>
        <Svg viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
          <Defs><ClipPath id={clipId}><Path d={blobPath(profile.id + 'photo')} /></ClipPath></Defs>
          <Path d={blobPath(profile.id)} fill={tint} transform="translate(-2 -4) scale(1.04)" />
          <SvgText x="50" y="64" fontSize="46" fontFamily={fonts.black} fill="#fff" textAnchor="middle">
            {profile.name.charAt(0).toUpperCase()}
          </SvgText>
        </Svg>
      </View>
      <View style={s.info}>
        <T style={s.name} numberOfLines={1}>{profile.name}</T>
        <T style={[s.sub, { color: colors.accent }]} numberOfLines={1}>
          {subtitleOf(profile)}
        </T>
        <View style={s.row}>
          <Chip label={statusOf(profile)} tint={tint} />
          {extraChips(profile).map((r) => <Chip key={r} label={r} />)}
          {rate && <Chip label={rate} />}
        </View>
        {profile.bio ? <T style={s.bio} numberOfLines={2}>{profile.bio}</T> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { flex: 1, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.surfaceAlt, ...(shadow.float as object) },
  statusPill: { position: 'absolute', top: 14, left: 14, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: 'rgba(11,11,15,0.38)', borderWidth: 1, borderColor: glass.onPhotoBorder },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { color: '#fff', fontFamily: fonts.semibold, fontSize: 12 },
  photoPanel: { position: 'absolute', left: 12, right: 12, bottom: 12, padding: 16, gap: 6, borderRadius: radius.lg, backgroundColor: glass.onPhoto, borderWidth: 1, borderColor: glass.onPhotoBorder },
  photoName: { color: '#fff', fontFamily: fonts.semibold, fontSize: 28, letterSpacing: -0.4 },
  photoSub: { color: 'rgba(255,255,255,0.9)', fontFamily: fonts.semibold, fontSize: 14 },
  photoChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: 'rgba(11,11,15,0.36)', borderWidth: 1, borderColor: glass.onPhotoBorder },
  photoChipText: { color: '#fff', fontSize: 12, fontFamily: fonts.semibold },
  photoBio: { color: 'rgba(255,255,255,0.88)', fontSize: 13, lineHeight: 19, marginTop: 2 },
  art: { height: '58%', margin: 12, marginBottom: 0 },
  info: { marginHorizontal: 10, marginTop: 8, paddingHorizontal: 14, paddingVertical: 12, gap: 6, borderRadius: radius.lg, backgroundColor: glass.fillStrong, borderWidth: 1, borderColor: glass.border },
  name: { fontFamily: fonts.semibold, fontSize: 26 },
  sub: { fontFamily: fonts.semibold, fontSize: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  bio: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 2 },
});
