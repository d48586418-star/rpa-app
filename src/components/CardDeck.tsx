import { useCallback, type ReactNode } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming,
} from 'react-native-reanimated';
import { colors, fonts } from '../theme';
import { Icon } from './Icon';
import { IconButton, T } from './ui';

const { width: SCREEN_W } = Dimensions.get('window');
const W = Math.min(SCREEN_W, 480);
const THRESHOLD = W * 0.28;
const UP_THRESHOLD = 120;

export type Decision = 'like' | 'pass' | 'save';

type Props<I> = {
  items: I[];
  keyOf: (i: I) => string;
  renderCard: (i: I) => ReactNode;
  onDecision: (i: I, d: Decision) => void;
  /** Rótulos acessíveis e carimbos: ex. { like: 'Candidatar', pass: 'Pular', save: 'Salvar' }. */
  labels: { like: string; pass: string; save?: string };
  canUndo?: boolean;
  onUndo?: () => void;
  /** Toque (sem arrastar) na carta da frente. */
  onOpen?: (i: I) => void;
  empty: ReactNode;
};

/** Pilha de cartas em leque: arraste para a direita (aceitar), esquerda (pular) ou para cima (salvar). */
export function CardDeck<I>({ items, keyOf, renderCard, onDecision, labels, canUndo, onUndo, onOpen, empty }: Props<I>) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const top = items[0];
  const second = items[1];
  const third = items[2];
  const canSave = Boolean(labels.save);

  const finish = useCallback(
    (d: Decision) => {
      if (!top) return;
      onDecision(top, d);
      x.value = 0;
      y.value = 0;
    },
    [top, onDecision, x, y],
  );

  const fling = useCallback(
    (d: Decision) => {
      if (d === 'save') {
        y.value = withTiming(-900, { duration: 240 }, (done) => { if (done) runOnJS(finish)(d); });
      } else {
        x.value = withTiming((d === 'like' ? 1 : -1) * W * 1.3, { duration: 220 }, (done) => { if (done) runOnJS(finish)(d); });
      }
    },
    [x, y, finish],
  );

  const pan = Gesture.Pan()
    .onUpdate((e) => { x.value = e.translationX; y.value = Math.min(0, e.translationY); })
    .onEnd((e) => {
      if (canSave && e.translationY < -UP_THRESHOLD && Math.abs(e.translationX) < THRESHOLD) {
        y.value = withTiming(-900, { duration: 200 }, (done) => { if (done) runOnJS(finish)('save'); });
      } else if (Math.abs(e.translationX) > THRESHOLD) {
        const d: Decision = e.translationX > 0 ? 'like' : 'pass';
        x.value = withTiming(Math.sign(e.translationX) * W * 1.3, { duration: 200 }, (done) => { if (done) runOnJS(finish)(d); });
      } else {
        x.value = withSpring(0);
        y.value = withSpring(0);
      }
    });

  const open = useCallback(() => { if (top && onOpen) onOpen(top); }, [top, onOpen]);
  const tap = Gesture.Tap().maxDistance(10).onEnd((_e, ok) => { if (ok) runOnJS(open)(); });
  const gesture = Gesture.Race(pan, tap);

  const topStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value }, { translateY: y.value },
      { rotate: `${interpolate(x.value, [-W, W], [-14, 14])}deg` },
    ],
  }));
  // As cartas de trás sobem um pouco conforme a da frente sai.
  const secondStyle = useAnimatedStyle(() => {
    const p = Math.min(1, Math.max(Math.abs(x.value) / THRESHOLD, Math.abs(y.value) / UP_THRESHOLD));
    return { transform: [{ translateY: interpolate(p, [0, 1], [14, 0]) }, { rotate: `${interpolate(p, [0, 1], [3.5, 0])}deg` }, { scale: interpolate(p, [0, 1], [0.95, 1]) }] };
  });
  const thirdStyle = useAnimatedStyle(() => {
    const p = Math.min(1, Math.max(Math.abs(x.value) / THRESHOLD, Math.abs(y.value) / UP_THRESHOLD));
    return { transform: [{ translateY: interpolate(p, [0, 1], [28, 14]) }, { rotate: `${interpolate(p, [0, 1], [-3.5, 3.5])}deg` }, { scale: interpolate(p, [0, 1], [0.9, 0.95]) }] };
  });
  const likeStyle = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [0, THRESHOLD], [0, 1], 'clamp') }));
  const passStyle = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [-THRESHOLD, 0], [1, 0], 'clamp') }));
  const saveStyle = useAnimatedStyle(() => ({ opacity: interpolate(y.value, [-UP_THRESHOLD, 0], [1, 0], 'clamp') }));

  if (!top) {
    return (
      <View style={s.wrap}>
        <View style={s.emptyBox}>{empty}</View>
        {canUndo && onUndo ? <View style={s.actions}><IconButton icon="undo" label="Desfazer" onPress={onUndo} size={52} /></View> : null}
      </View>
    );
  }

  return (
    <View style={s.wrap}>
      <View style={s.stackOuter}>
      <View style={s.stack}>
        {third && <Animated.View key={keyOf(third)} pointerEvents="none" style={[StyleSheet.absoluteFill, thirdStyle]}>{renderCard(third)}</Animated.View>}
        {second && <Animated.View key={keyOf(second)} pointerEvents="none" style={[StyleSheet.absoluteFill, secondStyle]}>{renderCard(second)}</Animated.View>}
        <GestureDetector gesture={gesture}>
          <Animated.View key={keyOf(top)} style={[StyleSheet.absoluteFill, topStyle]}>
            {renderCard(top)}
            <Animated.View pointerEvents="none" style={[s.stamp, s.stampLike, likeStyle]}><T style={[s.stampText, { color: colors.like }]}>{labels.like.toUpperCase()}</T></Animated.View>
            <Animated.View pointerEvents="none" style={[s.stamp, s.stampPass, passStyle]}><T style={[s.stampText, { color: colors.pass }]}>{labels.pass.toUpperCase()}</T></Animated.View>
            {canSave && (
              <Animated.View pointerEvents="none" style={[s.stamp, s.stampSave, saveStyle]}><T style={[s.stampText, { color: colors.accent }]}>{labels.save!.toUpperCase()}</T></Animated.View>
            )}
          </Animated.View>
        </GestureDetector>
      </View>
      </View>
      <View style={s.actions}>
        {onUndo ? <IconButton icon="undo" label="Desfazer a última escolha" onPress={() => canUndo && onUndo()} size={44} color={canUndo ? colors.text : colors.border} /> : null}
        <IconButton icon="x" label={labels.pass} onPress={() => fling('pass')} size={60} color={colors.pass} />
        {canSave && <IconButton icon="bookmark" label={labels.save!} onPress={() => fling('save')} size={48} color={colors.accent} />}
        <IconButton icon="heart" label={labels.like} onPress={() => fling('like')} size={68} tone="accent" />
      </View>
    </View>
  );
}

/** Estado vazio padrão dos decks. */
export function DeckEmpty({ title, text }: { title: string; text: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 10 }}>
      <View style={s.emptyIcon}><Icon name="check" size={28} color={colors.accent} /></View>
      <T style={{ fontFamily: fonts.semibold, fontSize: 20 }}>{title}</T>
      <T style={{ color: colors.muted, textAlign: 'center' }}>{text}</T>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1 },
  stackOuter: { flex: 1, alignItems: 'center', paddingHorizontal: 20, marginTop: 8, marginBottom: 34 },
  stack: { flex: 1, width: '100%', maxWidth: 440 },
  actions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, paddingBottom: 12 },
  stamp: { position: 'absolute', borderWidth: 3, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(255,255,255,0.85)' },
  stampLike: { top: 30, left: 22, borderColor: colors.like, transform: [{ rotate: '-10deg' }] },
  stampPass: { top: 30, right: 22, borderColor: colors.pass, transform: [{ rotate: '10deg' }] },
  stampSave: { top: 30, alignSelf: 'center', borderColor: colors.accent },
  stampText: { fontSize: 20, fontFamily: fonts.black, letterSpacing: 1 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
});
