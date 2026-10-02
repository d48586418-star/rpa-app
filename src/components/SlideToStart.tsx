import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming,
} from 'react-native-reanimated';
import { colors, fonts } from '../theme';
import { Icon } from './Icon';
import { Glass, T } from './ui';

const THUMB = 60;
const PAD = 8;

export function SlideToStart({ label, onComplete }: { label: string; onComplete: () => void }) {
  const x = useSharedValue(0);
  const max = useSharedValue(1);
  const done = useRef(false);

  const complete = () => {
    if (done.current) return;
    done.current = true;
    onComplete();
    setTimeout(() => { x.value = withTiming(0); done.current = false; }, 600);
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => { x.value = Math.min(Math.max(e.translationX, 0), max.value); })
    .onEnd(() => {
      if (x.value > max.value * 0.8) {
        x.value = withTiming(max.value, { duration: 120 }, (ok) => { if (ok) runOnJS(complete)(); });
      } else {
        x.value = withSpring(0);
      }
    });

  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const text = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [0, max.value * 0.6], [1, 0], 'clamp') }));

  return (
    <Glass
      style={s.track}
      >
      <View
        style={StyleSheet.absoluteFill}
        onLayout={(e) => { max.value = e.nativeEvent.layout.width - THUMB - PAD * 2; }}
        accessible
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityActions={[{ name: 'activate' }]}
        onAccessibilityAction={complete}
      />
      <Animated.View style={[s.labelWrap, text]} pointerEvents="none">
        <T style={s.label}>{label}</T>
        <Icon name="arrow-right" size={22} color={colors.muted} />
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[s.thumb, thumb]}>
          <Icon name="arrow-right" size={26} color={colors.onAccent} stroke={2.2} />
        </Animated.View>
      </GestureDetector>
    </Glass>
  );
}

const s = StyleSheet.create({
  track: { height: THUMB + PAD * 2, justifyContent: 'center', padding: PAD },
  thumb: {
    width: THUMB, height: THUMB, borderRadius: THUMB / 2, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  labelWrap: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingLeft: THUMB + PAD * 2 + 16, paddingRight: 24,
  },
  label: { fontFamily: fonts.light, fontSize: 18 },
});
