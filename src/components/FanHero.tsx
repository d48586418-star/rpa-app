import { StyleSheet, View } from 'react-native';
import { glass, radius, shadow } from '../theme';
import { Icon, type IconName } from './Icon';
import { Photo } from './Photo';
import { T } from './ui';

const CARDS: { photo: string; rot: number; x: number; y: number; z: number }[] = [
  { photo: 'show-luzes', rot: -12, x: -92, y: 22, z: 1 },
  { photo: 'casamento-lago', rot: 11, x: 92, y: 26, z: 1 },
  { photo: 'steadicam', rot: -2, x: 0, y: 0, z: 2 },
];

function Pill({ icon, text, style }: { icon: IconName; text: string; style: object }) {
  return (
    <View style={[s.pill, style]}>
      <Icon name={icon} size={14} color="#fff" />
      <T style={s.pillText}>{text}</T>
    </View>
  );
}

/** Cartas em leque com fotos (referência Eyewear), na abertura do app. Fotos ilustrativas. */
export function FanHero() {
  return (
    <View style={s.wrap} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {CARDS.map((c) => (
        <View key={c.photo} style={[s.card, { zIndex: c.z, transform: [{ translateX: c.x }, { translateY: c.y }, { rotate: `${c.rot}deg` }] }]}>
          <Photo photo={c.photo} style={StyleSheet.absoluteFill} />
        </View>
      ))}
      <Pill icon="clapper" text="Operador(a) de câmera" style={{ top: 46, left: 4, zIndex: 3 }} />
      <Pill icon="pin" text="Itacaré" style={{ bottom: 36, right: 14, zIndex: 3 }} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { height: 330, alignItems: 'center', justifyContent: 'center' },
  card: { position: 'absolute', width: 180, height: 250, borderRadius: radius.xl - 8, overflow: 'hidden', borderWidth: 4, borderColor: '#fff', ...(shadow.float as object) },
  pill: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: 'rgba(11,11,15,0.55)', borderWidth: 1, borderColor: glass.onPhotoBorder },
  pillText: { color: '#fff', fontSize: 12, fontFamily: 'Montserrat_600SemiBold' },
});
