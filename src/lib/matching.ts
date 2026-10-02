import type { AccountType, Profile } from './types';

export type DiscoverFilters = {
  accountType?: AccountType;
  role?: string;
  city?: string;
  onlyAvailable?: boolean;
};

/** Normaliza o par de um match: user_a sempre menor que user_b (igual ao CHECK do banco). */
export function matchPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

/** Retorna o outro participante de um match. */
export function otherUserId(match: { user_a: string; user_b: string }, me: string): string {
  return match.user_a === me ? match.user_b : match.user_a;
}

export const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Filtra o deck de descoberta: exclui o próprio usuário e quem já recebeu swipe. */
export function filterCandidates(
  profiles: Profile[],
  me: string,
  swipedIds: ReadonlySet<string>,
  filters: DiscoverFilters = {},
): Profile[] {
  return profiles.filter((p) => {
    if (p.id === me || swipedIds.has(p.id)) return false;
    if (filters.accountType && p.account_type !== filters.accountType) return false;
    if (filters.role && !p.roles.includes(filters.role)) return false;
    if (filters.city && !(p.city && norm(p.city).includes(norm(filters.city)))) return false;
    if (filters.onlyAvailable && !p.available) return false;
    return true;
  });
}

/** Por padrão o deck mostra o lado oposto: freelancer vê empresas e vice-versa. */
export function oppositeType(t: AccountType): AccountType {
  return t === 'freelancer' ? 'empresa' : 'freelancer';
}

export function formatRate(min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null;
  const f = (n: number) => `R$ ${n.toLocaleString('pt-BR')}`;
  if (min != null && max != null) return min === max ? `${f(min)}/dia` : `${f(min)} – ${f(max)}/dia`;
  return `${f((min ?? max) as number)}/dia`;
}
