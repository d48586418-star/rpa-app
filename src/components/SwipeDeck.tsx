import { useCallback } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming,
} from 'react-native-reanimated';
import type { Profile } from '../lib/types';
import { colors } from '../theme';
import { ProfileCard } from './ProfileCard';

const { width: SCREEN_W } = Dimensions.get('window');
const THRESHOLD = SCREEN_W * 0.3;

type Props = { profiles: Profile[]; onSwipe: (p: Profile, dir: 'like' | 'pass') => void };

export function SwipeDeck({ profiles, onSwipe }: Props) {
  const x = useSharedValue(0);
  const top = profiles[0];
  const next = profiles[1];

  const finish = useCallback(
    (dir: 'like' | 'pass') => {
      if (!top) return;
      onSwipe(top, dir);
      x.value = 0;
    },
    [top, onSwipe, x],
  );

  const fling = useCallback(
    (dir: 'like' | 'pass') => {
      x.value = withTiming((dir === 'like' ? 1 : -1) * SCREEN_W * 1.3, { duration: 220 }, (done) => {
        if (done) runOnJS(finish)(dir);
      });
    },
    [x, finish],
  );

  const pan = Gesture.Pan()
    .onUpdate((e) => { x.value = e.translationX; })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > THRESHOLD) {
        const dir = e.translationX > 0 ? 'like' : 'pass';
        x.value = withTiming(Math.sign(e.translationX) * SCREEN_W * 1.3, { duration: 200 }, (done) => {
          if (done) runOnJS(finish)(dir);
        });
      } else {
        x.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { rotate: `${interpolate(x.value, [-SCREEN_W, SCREEN_W], [-12, 12])}deg` }],
  }));
  const likeStyle = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [0, THRESHOLD], [0, 1], 'clamp') }));
  const passStyle = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [-THRESHOLD, 0], [1, 0], 'clamp') }));

  if (!top) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyTitle}>Acabaram os perfis 🎬</Text>
        <Text style={s.emptyText}>Volte mais tarde ou ajuste os filtros.</Text>
      </View>
    );
  }

  return (
    <View style={s.wrap}>
      <View style={s.stack}>
        {next && <View style={[StyleSheet.absoluteFill, { transform: [{ scale: 0.95 }] }]}><ProfileCard profile={next} /></View>}
        <GestureDetector gesture={pan}>
          <Animated.View style={[StyleSheet.absoluteFill, cardStyle]}>
            <ProfileCard profile={top} />
            <Animated.View style={[s.badge, s.badgeLike, likeStyle]}><Text style={[s.badgeText, { color: colors.like }]}>CHAMAR</Text></Animated.View>
            <Animated.View style={[s.badge, s.badgePass, passStyle]}><Text style={[s.badgeText, { color: colors.pass }]}>PULAR</Text></Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>
      <View style={s.actions}>
        <Pressable accessibilityLabel="Pular" onPress={() => fling('pass')} style={[s.action, { borderColor: colors.pass }]}>
          <Text style={{ fontSize: 28 }}>✕</Text>
        </Pressable>
        <Pressable accessibilityLabel="Chamar para trabalhar" onPress={() => fling('like')} style={[s.action, { borderColor: colors.like }]}>
          <Text style={{ fontSize: 28 }}>🎬</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1 },
  stack: { flex: 1, margin: 16 },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 32, paddingBottom: 16 },
  action: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  badge: { position: 'absolute', top: 28, borderWidth: 3, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeLike: { left: 20, borderColor: colors.like, transform: [{ rotate: '-12deg' }] },
  badgePass: { right: 20, borderColor: colors.pass, transform: [{ rotate: '12deg' }] },
  badgeText: { fontSize: 24, fontWeight: '900' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 },
  emptyTitle: { color: colors.text, fontSize: 22, fontWeight: '800' },
  emptyText: { color: colors.muted },
});
