import type { Profile } from './types';

type P = Pick<Profile, 'account_type' | 'roles' | 'city'>;

/** Linha curta do perfil. Freelancer: função e cidade. Empresa: cidade e "Empresa" (as funções dela são o que ela procura). */
export function profileSubtitle(p: P): string {
  if (p.account_type === 'empresa') return [p.city, 'Empresa'].filter(Boolean).join(' · ');
  return [p.roles[0], p.city].filter(Boolean).join(' · ');
}

/** Funções do perfil em texto: "Procura A, B" para empresa. */
export function rolesText(p: P): string {
  if (p.roles.length === 0) return '';
  return p.account_type === 'empresa' ? `Procura ${p.roles.join(', ')}` : p.roles.join(' · ');
}
