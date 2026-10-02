import Svg, { Circle, Path } from 'react-native-svg';

export type IconName =
  | 'home' | 'compass' | 'plus' | 'spark' | 'film' | 'user' | 'chat' | 'pin' | 'calendar' | 'check' | 'filter'
  | 'heart' | 'x' | 'star' | 'bookmark' | 'share' | 'send' | 'camera' | 'mic' | 'clapper' | 'drone' | 'money'
  | 'clock' | 'bell' | 'search' | 'image' | 'arrow-right' | 'arrow-left' | 'undo' | 'briefcase' | 'layers'
  | 'comment' | 'shield' | 'chevron-down' | 'users';

// Ícones de traço 24x24, desenhados aqui (sem biblioteca externa). Substituem emojis e glifos de texto.
const PATHS: Record<IconName, string[]> = {
  home: ['M4 11.5 12 4l8 7.5', 'M6 10v9h12v-9'],
  compass: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'm15.5 8.5-2 5-5 2 2-5 5-2Z'],
  plus: ['M12 5v14', 'M5 12h14'],
  spark: ['M12 3v5', 'M12 16v5', 'M3 12h5', 'M16 12h5', 'm6 6 3 3', 'm15 15 3 3', 'm18 6-3 3', 'm9 15-3 3'],
  film: ['M4 6h16v12H4Z', 'M8 6v12', 'M16 6v12', 'M4 10h4', 'M4 14h4', 'M16 10h4', 'M16 14h4'],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M5 20c1-3.5 3.8-5 7-5s6 1.5 7 5'],
  users: ['M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z', 'M3 20c.8-3.2 3.1-4.8 6-4.8s5.2 1.6 6 4.8', 'M16 4.4a3.5 3.5 0 0 1 0 6.2', 'M18 15.4c1.5.6 2.6 2 3 4.6'],
  chat: ['M5 5h14v10H10l-4 4v-4H5Z'],
  comment: ['M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12Z'],
  pin: ['M12 21s6-5.5 6-10a6 6 0 1 0-12 0c0 4.5 6 10 6 10Z'],
  calendar: ['M5 6h14v14H5Z', 'M5 10h14', 'M9 4v4', 'M15 4v4'],
  check: ['m5 12.5 4.5 4.5L19 7.5'],
  filter: ['M4 7h16', 'M7 12h10', 'M10 17h4'],
  heart: ['M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z'],
  x: ['M6 6l12 12', 'M18 6 6 18'],
  star: ['m12 3.6 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.8 1-5.9L3.5 9.8l5.9-.8L12 3.6Z'],
  bookmark: ['M7 4h10v16l-5-3.6L7 20V4Z'],
  share: ['M12 15V4', 'm8 8 4-4 4 4', 'M5 13v6h14v-6'],
  send: ['M4 12 20 4l-5 16-3.2-6.2L4 12Z', 'M11.8 13.8 20 4'],
  camera: ['M4 8h3l1.6-2.4h6.8L17 8h3v11H4V8Z', 'M12 16.5a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6Z'],
  mic: ['M12 14.5a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5.5a3 3 0 0 0 3 3Z', 'M6 11.5a6 6 0 0 0 12 0', 'M12 17.5V21', 'M9 21h6'],
  clapper: ['M4 10h16v9H4Z', 'M4 10 3.2 6.4l15-3L20 7', 'm8 7.6 2 3.2', 'm12.4 6.7 2 3.2'],
  drone: ['M12 13a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z', 'm9.6 11.6-4 3', 'm14.4 11.6 4 3', 'M3.5 14.5h4', 'M16.5 14.5h4', 'M9.4 8.5 7 6', 'M14.6 8.5 17 6'],
  money: ['M3.5 7h17v10h-17Z', 'M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z', 'M7 10v4', 'M17 10v4'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 7.5V12l3 2'],
  bell: ['M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Z', 'M10 20.5a2.2 2.2 0 0 0 4 0'],
  search: ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z', 'm20 20-4-4'],
  image: ['M4 5h16v14H4Z', 'm4 16 4.5-4.5 3.5 3.5 3-3L20 16', 'M9 10a1.2 1.2 0 1 0 0-2.4A1.2 1.2 0 0 0 9 10Z'],
  'arrow-right': ['M5 12h14', 'm13 6 6 6-6 6'],
  'arrow-left': ['M19 12H5', 'm11 6-6 6 6 6'],
  undo: ['M9 8 4.5 12.5 9 17', 'M5 12.5h9.5a5 5 0 0 1 0 10'],
  briefcase: ['M4 8h16v11H4Z', 'M9 8V5.5h6V8', 'M4 13h16'],
  layers: ['m12 4 8.5 4.5L12 13 3.5 8.5 12 4Z', 'm3.5 12.5 8.5 4.5 8.5-4.5', 'm3.5 16.5 8.5 4.5 8.5-4.5'],
  shield: ['M12 3.5 19 6v5.5c0 4.2-2.9 7.4-7 9-4.1-1.6-7-4.8-7-9V6l7-2.5Z', 'm9 12 2.2 2.2L15.5 10'],
  'chevron-down': ['m6 9 6 6 6-6'],
};

export function Icon({
  name, size = 22, color = '#fff', stroke = 1.8, fill,
}: { name: IconName; size?: number; color?: string; stroke?: number; fill?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden importantForAccessibility="no">
      {PATHS[name].map((d, i) => (
        <Path key={d} d={d} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" fill={i === 0 && fill ? fill : 'none'} />
      ))}
      {name === 'spark' ? <Circle cx="12" cy="12" r="1.6" fill={color} /> : null}
    </Svg>
  );
}
