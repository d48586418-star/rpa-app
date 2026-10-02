import Svg, { Circle, Path } from 'react-native-svg';

export type IconName = 'home' | 'compass' | 'plus' | 'spark' | 'film' | 'user' | 'chat' | 'pin' | 'calendar' | 'check' | 'filter';

// Ícones de traço 24x24, desenhados aqui (sem biblioteca externa de ícones).
const PATHS: Record<IconName, string[]> = {
  home: ['M4 11.5 12 4l8 7.5', 'M6 10v9h12v-9'],
  compass: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'm15.5 8.5-2 5-5 2 2-5 5-2Z'],
  plus: ['M12 5v14', 'M5 12h14'],
  spark: ['M12 3v5', 'M12 16v5', 'M3 12h5', 'M16 12h5', 'm6 6 3 3', 'm15 15 3 3', 'm18 6-3 3', 'm9 15-3 3'],
  film: ['M4 6h16v12H4Z', 'M8 6v12', 'M16 6v12', 'M4 10h4', 'M4 14h4', 'M16 10h4', 'M16 14h4'],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M5 20c1-3.5 3.8-5 7-5s6 1.5 7 5'],
  chat: ['M5 5h14v10H10l-4 4v-4H5Z'],
  pin: ['M12 21s6-5.5 6-10a6 6 0 1 0-12 0c0 4.5 6 10 6 10Z'],
  calendar: ['M5 6h14v14H5Z', 'M5 10h14', 'M9 4v4', 'M15 4v4'],
  check: ['m5 12.5 4.5 4.5L19 7.5'],
  filter: ['M4 7h16', 'M7 12h10', 'M10 17h4'],
};

export function Icon({ name, size = 22, color = '#fff', stroke = 1.8 }: { name: IconName; size?: number; color?: string; stroke?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden importantForAccessibility="no">
      {PATHS[name].map((d) => (
        <Path key={d} d={d} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {name === 'spark' ? <Circle cx="12" cy="12" r="1.6" fill={color} /> : null}
    </Svg>
  );
}
