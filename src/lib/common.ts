import { norm } from './matching';
import type { Profile } from './types';

/** Pontos em comum entre duas pessoas, em linguagem humana (usado na tela "Vocês combinam"). */
export function commonPoints(a: Profile, b: Profile): string[] {
  const points: string[] = [];
  const shared = a.roles.filter((r) => b.roles.includes(r));
  for (const r of shared.slice(0, 2)) points.push(`Função em comum: ${r}`);
  // Freelancer procura o que a empresa oferece: função de um aparece nas funções procuradas do outro.
  if (shared.length === 0 && a.roles.length && b.roles.length) points.push('Funções complementares no mesmo tipo de produção');
  if (a.city && b.city && norm(a.city) === norm(b.city)) points.push(`Os dois estão em ${a.city}`);
  if (a.available && b.available) points.push('Os dois estão disponíveis agora');
  return points.slice(0, 4);
}
