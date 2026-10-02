import { ROLES } from '../constants/roles';

/** Piso de referência por função (R$ por diária). VALORES DE EXEMPLO: validar com profissionais da região. */
const RATES: Record<string, { min: number; max: number }> = {
  'Diretor(a)': { min: 1200, max: 2500 },
  'Produtor(a)': { min: 600, max: 1400 },
  'Roteirista': { min: 500, max: 1200 },
  'Diretor(a) de Fotografia': { min: 900, max: 2200 },
  'Operador(a) de Câmera': { min: 500, max: 1000 },
  'Assistente de Câmera': { min: 250, max: 450 },
  'Gaffer / Iluminador(a)': { min: 400, max: 800 },
  'Técnico(a) de Som Direto': { min: 600, max: 1200 },
  'Desenhista de Som': { min: 500, max: 1100 },
  'Editor(a)': { min: 350, max: 800 },
  'Colorista': { min: 400, max: 900 },
  'Motion Designer': { min: 350, max: 800 },
  'VFX / Animador(a)': { min: 450, max: 1000 },
  'Direção de Arte': { min: 450, max: 1000 },
  'Figurinista': { min: 400, max: 900 },
  'Maquiador(a)': { min: 300, max: 700 },
  'Compositor(a) / Trilha': { min: 500, max: 1300 },
  'Drone / Imagens aéreas': { min: 400, max: 900 },
  'Ator / Atriz': { min: 300, max: 900 },
};

export const referenceRate = (role: string) => RATES[role] ?? null;
export const ROLES_WITH_RATE = ROLES.filter((r) => RATES[r]);
