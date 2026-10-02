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
            <Stop offset="0" stopColor="#2F5BFF" />
            <Stop offset="0.55" stopColor="#5B7FFF" />
            <Stop offset="1" stopColor="#B9C8FF" />
          </LinearGradient>
          <LinearGradient id="bg" x1="0" y1="0.3" x2="1" y2="0.85">
            <Stop offset="0" stopColor="#3A3A46" />
            <Stop offset="0.5" stopColor="#16161C" />
            <Stop offset="1" stopColor="#0B0B0F" />
          </LinearGradient>
        </Defs>
        <Path d={roundedPolygonPath(orange, R)} fill="url(#og)" onPress={onFreelancer} />
        <Path d={roundedPolygonPath(blue, R)} fill="url(#bg)" onPress={onCompany} />
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
  light: { fontFamily: fonts.light, fontSize: 24, color: '#fff' },
  strong: { fontFamily: fonts.semibold, fontSize: 24, color: '#fff' },
});
