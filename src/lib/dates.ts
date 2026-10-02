/** Datas como "YYYY-MM-DD" em UTC, para não depender do fuso do aparelho. */
const DAY = 86_400_000;
const parse = (iso: string) => new Date(`${iso}T00:00:00Z`).getTime();
const fmt = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export const todayISO = (): string => fmt(Date.now() - (Date.now() % DAY));
export const addDays = (iso: string, n: number): string => fmt(parse(iso) + n * DAY);
export const daysBetween = (a: string, b: string): number => Math.round((parse(b) - parse(a)) / DAY);

/** Todas as datas de um job: a primeira e as seguintes. */
export function dateSpan(iso: string, days: number): string[] {
  return Array.from({ length: Math.max(1, days) }, (_, i) => addDays(iso, i));
}

const WEEK = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
/** "qui 09/10" */
export function formatShort(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${WEEK[d.getUTCDay()]} ${dd}/${mm}`;
}

/** "Bom dia", "Boa tarde" ou "Boa noite" a partir da hora local (0 a 23). */
export function greeting(hour: number): string {
  if (hour < 5) return 'Boa noite';
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}
