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
  // Paleta dos blobs do deck (CircleUp)
  blobs: ['#C9DB2A', '#FE6754', '#FC8AC8', '#784CDF', '#2D7DF0'],
};

export const gradients = {
  orange: ['#050505', '#A43B01', '#E07338', '#F0B79A'] as const,
  blue: ['#1915D4', '#0B0A5C', '#111111'] as const,
};

export const radius = { sm: 12, md: 20, lg: 28, xl: 40, pill: 999 };

export const fonts = {
  light: 'Montserrat_300Light',
  regular: 'Montserrat_400Regular',
  semibold: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
  black: 'Montserrat_900Black',
};
