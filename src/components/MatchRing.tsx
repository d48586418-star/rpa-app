import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts } from '../theme';
import { T } from './ui';

export const scoreColor = (score: number) => (score >= 80 ? colors.like : score >= 60 ? colors.accent : colors.muted);

/** Anel de compatibilidade: o círculo se completa conforme o match. */
export function MatchRing({ score, size = 56, onPhoto }: { score: number; size?: number; onPhoto?: boolean }) {
  const stroke = Math.max(4, Math.round(size / 12));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = onPhoto ? '#FFFFFF' : scoreColor(score);
  return (
    <View style={{ width: size, height: size }} accessible accessibilityLabel={`${score}% compatível`}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={onPhoto ? 'rgba(255,255,255,0.3)' : colors.border} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={`${(c * Math.max(0, Math.min(100, score))) / 100} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, s.center]}>
        <T style={{ fontFamily: fonts.semibold, fontSize: size * 0.3, color: onPhoto ? '#fff' : colors.text }}>{score}%</T>
      </View>
    </View>
  );
}

const s = StyleSheet.create({ center: { alignItems: 'center', justifyContent: 'center' } });
