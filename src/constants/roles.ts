export const ROLES = [
  'Diretor(a)',
  'Produtor(a)',
  'Roteirista',
  'Diretor(a) de Fotografia',
  'Operador(a) de Câmera',
  'Assistente de Câmera',
  'Gaffer / Iluminador(a)',
  'Técnico(a) de Som Direto',
  'Desenhista de Som',
  'Editor(a)',
  'Colorista',
  'Motion Designer',
  'VFX / Animador(a)',
  'Direção de Arte',
  'Figurinista',
  'Maquiador(a)',
  'Compositor(a) / Trilha',
  'Drone / Imagens aéreas',
  'Ator / Atriz',
] as const;

export type Role = (typeof ROLES)[number];
