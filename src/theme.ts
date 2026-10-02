import { Platform } from 'react-native';

/**
 * Tokens de cor. O app é claro primeiro; o modo escuro está preparado em `palette.dark`
 * e será ligado depois (basta apontar `colors` para ele).
 * Referências de estilo: off-white quente com grade fina, vidro fosco, azul elétrico como única cor de ação.
 */
const light = {
  bg: '#F6F4F1',
  bgGrid: 'rgba(11,11,15,0.045)',
  surface: '#FFFFFF',
  surfaceAlt: '#EFECE7',
  border: '#E4E1DC',
  text: '#0B0B0F',
  muted: '#62626D', // 5,5:1 sobre o fundo claro
  accent: '#2F5BFF', // azul elétrico
  accentSoft: '#E4EAFF',
  accentGlow: '#6E8BFF',
  onAccent: '#FFFFFF',
  ink: '#0B0B0F', // barra preta e botões escuros
  onInk: '#FFFFFF',
  like: '#0B8043',
  pass: '#D6383E',
  danger: '#C72A30',
  onPhoto: '#FFFFFF',
};

const dark: typeof light = {
  bg: '#0B0B0F',
  bgGrid: 'rgba(255,255,255,0.05)',
  surface: '#16161B',
  surfaceAlt: '#1E1E24',
  border: '#2A2A30',
  text: '#F5F5F7',
  muted: '#A0A0AB',
  accent: '#5B7FFF',
  accentSoft: '#1B2550',
  accentGlow: '#8FA6FF',
  onAccent: '#FFFFFF',
  ink: '#F5F5F7',
  onInk: '#0B0B0F',
  like: '#2ECC71',
  pass: '#FF6369',
  danger: '#FF6369',
  onPhoto: '#FFFFFF',
};

export const palette = { light, dark };

export const colors = {
  ...palette.light,
  // aliases usados em telas antigas
  light: '#FFFFFF',
  onLight: '#0B0B0F',
  blue: '#2F5BFF',
  // Cores dos cartões em balão (referência "Chats"): só como fundo de cartões de conversa e vaga.
  bubbles: ['#DCE5FF', '#FFF0B8', '#E6DBFF', '#CFF3E3', '#FFD9CF'] as readonly string[],
  // Paleta dos blobs do deck de perfis
  blobs: ['#2F5BFF', '#FFC83D', '#9B7BFF', '#2BC48A', '#FF7A5C'] as readonly string[],
};

export const gradients = {
  blue: ['#6E8BFF', '#2F5BFF', '#1B35C8'] as const,
  photoShade: ['rgba(11,11,15,0)', 'rgba(11,11,15,0.72)'] as const,
};

export const radius = { sm: 12, md: 20, lg: 28, xl: 40, pill: 999, squircle: 32 };

/** Vidro fosco. `fill` é claro (padrão); `onPhoto` serve para painéis sobre foto. */
export const glass = {
  fill: 'rgba(255,255,255,0.62)',
  fillStrong: 'rgba(255,255,255,0.82)',
  border: 'rgba(255,255,255,0.75)',
  hairline: 'rgba(11,11,15,0.08)',
  onPhoto: 'rgba(255,255,255,0.18)',
  onPhotoBorder: 'rgba(255,255,255,0.35)',
  dark: 'rgba(11,11,15,0.72)',
  blur: 28,
};

/** Sombras suaves (iOS/Android/web). */
export const shadow = {
  card: Platform.select({
    web: { boxShadow: '0 10px 30px rgba(11,11,15,0.10)' } as object,
    default: { shadowColor: '#0B0B0F', shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  }),
  float: Platform.select({
    web: { boxShadow: '0 16px 40px rgba(11,11,15,0.22)' } as object,
    default: { shadowColor: '#0B0B0F', shadowOpacity: 0.22, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 10 },
  }),
  glow: Platform.select({
    web: { boxShadow: '0 10px 28px rgba(47,91,255,0.45)' } as object,
    default: { shadowColor: '#2F5BFF', shadowOpacity: 0.45, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  }),
};

/** Auras suaves atrás de cartões de destaque. Cada par vai da cor ao transparente. */
export const auras = {
  blue: ['rgba(47,91,255,0.28)', 'rgba(47,91,255,0.0)'] as const,
  violet: ['rgba(155,123,255,0.30)', 'rgba(155,123,255,0.0)'] as const,
  mint: ['rgba(43,196,138,0.26)', 'rgba(43,196,138,0.0)'] as const,
  peach: ['rgba(255,150,120,0.28)', 'rgba(255,150,120,0.0)'] as const,
};
export const auraOrder = ['blue', 'violet', 'mint', 'peach'] as const;
export type AuraName = (typeof auraOrder)[number];

// Na web, uma fonte reserva evita cair em serifada se o arquivo da Montserrat não carregar.
const fallback = Platform.OS === 'web' ? ', system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' : '';

export const fonts = {
  light: `Montserrat_300Light${fallback}`,
  regular: `Montserrat_400Regular${fallback}`,
  semibold: `Montserrat_600SemiBold${fallback}`,
  bold: `Montserrat_700Bold${fallback}`,
  black: `Montserrat_900Black${fallback}`,
};
