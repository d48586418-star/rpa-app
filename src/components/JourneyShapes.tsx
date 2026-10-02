import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { roundedPolygonPath, type Pt } from '../lib/shapes';
import { colors, fonts } from '../theme';
import { T } from './ui';

// Unidades de design (derivadas da referência): 760 x 1130.
const W = 760;
const H = 1130;
const R = 70;

const orange: Pt[] = [[0, 0], [W, 0], [W, 432], [372, 432], [372, 672], [0, 672]];
const blue: Pt[] = [[387, 457], [W, 457], [W, H], [0, H], [0, 692], [387, 692]];

type Props = { onFreelancer: () => void; onCompany: () => void };

/** Dois cards encaixados com gradiente, como na tela "Selecione a sua jornada". */
export function JourneyShapes({ onFreelancer, onCompany }: Props) {
  return (
    <View style={s.wrap}>
      <Svg viewBox={`0 0 ${W} ${H}`} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="og" x1="0" y1="0" x2="1" y2="0.9">
            <Stop offset="0" stopColor="#050505" />
            <Stop offset="0.38" stopColor="#8A3100" />
            <Stop offset="0.7" stopColor="#C44A0A" />
            <Stop offset="0.9" stopColor="#E07338" />
            <Stop offset="1" stopColor="#F0B79A" />
          </LinearGradient>
          <LinearGradient id="bg" x1="0" y1="0.3" x2="1" y2="0.85">
            <Stop offset="0" stopColor="#B9B9F5" />
            <Stop offset="0.1" stopColor="#2A2AE0" />
            <Stop offset="0.4" stopColor="#1915D4" />
            <Stop offset="0.75" stopColor="#14142A" />
            <Stop offset="1" stopColor="#111111" />
          </LinearGradient>
        </Defs>
        <Path d={roundedPolygonPath(orange, R)} fill="url(#og)" onPress={onFreelancer} />
        <Path d={roundedPolygonPath(blue, R)} fill="url(#bg)" stroke="#2A2A2E" strokeWidth={2} onPress={onCompany} />
      </Svg>
      <View style={[s.label, { top: '5%', left: '17%' }]} pointerEvents="none">
        <T style={s.light}>Sou <T style={s.strong}>Freelancer</T></T>
      </View>
      <View style={[s.label, { bottom: '5%', right: '9%' }]} pointerEvents="none">
        <T style={s.light}>Sou <T style={s.strong}>Empresa</T></T>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { width: '100%', aspectRatio: W / H },
  label: { position: 'absolute' },
  light: { fontFamily: fonts.light, fontSize: 24, color: colors.text },
  strong: { fontFamily: fonts.semibold, fontSize: 24, color: colors.text },
});
