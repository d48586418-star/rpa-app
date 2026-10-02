import { CENA_ITEMS } from '../constants/cena';
import { addDays } from './dates';
import type { CenaItem, CenaKind } from './types';

export type CenaView = CenaItem & { date: string };

/** Itens futuros, do mais próximo ao mais distante, com a data calculada a partir de hoje. */
export function upcomingCena(today: string, opts: { kind?: CenaKind; city?: string; limit?: number } = {}): CenaView[] {
  const rows = CENA_ITEMS
    .filter((c) => c.offsetDays >= 0)
    .filter((c) => !opts.kind || c.kind === opts.kind)
    .filter((c) => !opts.city || c.city === opts.city)
    .map((c) => ({ ...c, date: addDays(today, c.offsetDays) }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  return opts.limit ? rows.slice(0, opts.limit) : rows;
}
