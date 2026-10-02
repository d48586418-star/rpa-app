import { StyleSheet, View } from 'react-native';
import Svg, { ClipPath, Defs, Image as SvgImage, Path, Text as SvgText } from 'react-native-svg';
import { formatRate } from '../lib/matching';
import { blobPath, hashString } from '../lib/shapes';
import type { Profile } from '../lib/types';
import { colors, fonts, radius } from '../theme';
import { Chip, T } from './ui';

export function blobColor(id: string): string {
  return colors.blobs[hashString(id) % colors.blobs.length];
}

export function ProfileCard({ profile }: { profile: Profile }) {
  const tint = blobColor(profile.id);
  const rate = profile.account_type === 'freelancer' ? formatRate(profile.day_rate_min, profile.day_rate_max) : null;
  const clipId = `clip-${profile.id}`;
  const status =
    profile.account_type === 'empresa'
      ? profile.available ? 'Contratando' : 'Sem vagas agora'
      : profile.available ? 'Disponível' : 'Ocupado(a)';
  return (
    <View style={s.card}>
      <View style={s.art}>
        <Svg viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
          <Defs>
            <ClipPath id={clipId}><Path d={blobPath(profile.id + 'photo')} /></ClipPath>
          </Defs>
          <Path d={blobPath(profile.id)} fill={tint} transform="translate(-2 -4) scale(1.04)" />
          {profile.avatar_url ? (
            <SvgImage
              href={{ uri: profile.avatar_url }}
              x="0" y="0" width="100" height="100"
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#${clipId})`}
            />
          ) : (
            <SvgText x="50" y="64" fontSize="46" fontFamily={fonts.black} fill={colors.bg} textAnchor="middle">
              {profile.name.charAt(0).toUpperCase()}
            </SvgText>
          )}
        </Svg>
      </View>
      <View style={s.info}>
        <T style={s.name} numberOfLines={1}>{profile.name}</T>
        <T style={[s.sub, { color: tint }]} numberOfLines={1}>
          {[profile.roles[0], profile.city].filter(Boolean).join(' · ')}
        </T>
        <View style={s.row}>
          <Chip label={status} tint={tint} />
          {profile.roles.slice(1, 3).map((r) => <Chip key={r} label={r} />)}
          {rate && <Chip label={rate} />}
        </View>
        {profile.bio ? <T style={s.bio} numberOfLines={2}>{profile.bio}</T> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  art: { height: '58%', margin: 12, marginBottom: 0 },
  info: { paddingHorizontal: 20, paddingVertical: 12, gap: 6 },
  name: { fontFamily: fonts.semibold, fontSize: 26 },
  sub: { fontFamily: fonts.semibold, fontSize: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  bio: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 2 },
});
