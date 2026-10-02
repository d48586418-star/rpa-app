import { Platform } from 'react-native';

// Valores amostrados das referências (TAKE ONE / CircleUp).
export const colors = {
  bg: '#050505',
  surface: '#111111',
  surfaceAlt: '#161616',
  border: '#2A2A2E',
  text: '#F5F5F7',
  muted: '#9A9AA5',
  accent: '#FC9335', // ponto laranja
  orange: '#C44A0A',
  orangeGlow: '#E07338',
  peach: '#E8A987',
  blue: '#1915D4',
  light: '#DEDEDE', // círculo do botão
  onLight: '#050505',
  like: '#2ECC71',
  pass: '#E74C3C',
  danger: '#E74C3C',
  onAccent: '#1A0E00', // texto sobre o laranja de ação
  // Paleta dos blobs do deck (CircleUp)
  blobs: ['#C9DB2A', '#FE6754', '#FC8AC8', '#784CDF', '#2D7DF0'],
};

export const gradients = {
  orange: ['#050505', '#A43B01', '#E07338', '#F0B79A'] as const,
  blue: ['#1915D4', '#0B0A5C', '#111111'] as const,
};

export const radius = { sm: 12, md: 20, lg: 28, xl: 40, pill: 999, squircle: 32 };

/** Vidro fosco: usado em barra inferior, painéis sobre foto e controles (referências 2, 4, 5 e 8). */
export const glass = {
  fill: 'rgba(255,255,255,0.08)',
  fillStrong: 'rgba(255,255,255,0.14)',
  border: 'rgba(255,255,255,0.18)',
};

/** Auras de degradê atrás de cards de destaque (referência 3). Cada par vai da cor ao transparente. */
export const auras = {
  orange: ['rgba(252,147,53,0.38)', 'rgba(224,115,56,0.0)'] as const,
  blue: ['rgba(25,21,212,0.45)', 'rgba(25,21,212,0.0)'] as const,
  rose: ['rgba(225,75,150,0.34)', 'rgba(225,75,150,0.0)'] as const,
  mint: ['rgba(43,217,160,0.28)', 'rgba(43,217,160,0.0)'] as const,
};
export const auraOrder = ['orange', 'blue', 'rose', 'mint'] as const;
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
