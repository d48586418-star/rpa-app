import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { formatRate } from '../lib/matching';
import type { Profile } from '../lib/types';
import { colors, radius } from '../theme';
import { Chip } from './ui';

export function ProfileCard({ profile }: { profile: Profile }) {
  const rate = formatRate(profile.day_rate_min, profile.day_rate_max);
  return (
    <View style={s.card}>
      {profile.avatar_url ? (
        <Image source={{ uri: profile.avatar_url }} style={s.photo} contentFit="cover" />
      ) : (
        <View style={[s.photo, s.placeholder]}>
          <Text style={s.initial}>{profile.name.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <View style={s.info}>
        <Text style={s.name}>{profile.name}</Text>
        <Text style={s.sub}>
          {[profile.city, profile.available ? '🟢 Disponível' : '⚪ Ocupado(a)'].filter(Boolean).join(' · ')}
        </Text>
        <View style={s.row}>
          {profile.roles.map((r) => <Chip key={r} label={r} />)}
        </View>
        {rate && <Text style={s.rate}>{rate}</Text>}
        {profile.bio ? <Text style={s.bio} numberOfLines={3}>{profile.bio}</Text> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  photo: { width: '100%', height: '55%' },
  placeholder: { backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  initial: { color: colors.accent, fontSize: 72, fontWeight: '800' },
  info: { padding: 16, gap: 8 },
  name: { color: colors.text, fontSize: 26, fontWeight: '800' },
  sub: { color: colors.muted, fontSize: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  rate: { color: colors.accent, fontWeight: '700' },
  bio: { color: colors.text, opacity: 0.85, lineHeight: 20 },
});
