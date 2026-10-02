import { formatShort } from './dates';
import type { Availability } from './types';

export const AVAILABILITY_OPTIONS: { id: Availability; label: string; hint: string }[] = [
  { id: 'now', label: 'Disponível agora', hint: 'Posso começar já' },
  { id: 'open', label: 'Posso aceitar trabalhos', hint: 'Depende do projeto' },
  { id: 'busy', label: 'Estou ocupado', hint: 'Sem espaço agora' },
  { id: 'from', label: 'Disponível a partir de…', hint: 'Escolha uma data' },
];

/** O profissional aparece como disponível nos filtros quando pode pegar trabalho hoje. */
export function isAvailableToday(a: Availability, availableFrom: string | null, today: string): boolean {
  if (a === 'busy') return false;
  if (a === 'from') return availableFrom != null && availableFrom <= today;
  return true;
}

export function availabilityLabel(a: Availability, availableFrom: string | null): string {
  if (a === 'from') return availableFrom ? `Disponível a partir de ${formatShort(availableFrom)}` : 'Disponível a partir de…';
  return AVAILABILITY_OPTIONS.find((o) => o.id === a)!.label;
}

/** Cor semântica do estado, sempre acompanhada do texto. */
export const availabilityTone = (a: Availability): 'good' | 'warn' | 'bad' | 'info' =>
  a === 'now' ? 'good' : a === 'open' ? 'warn' : a === 'busy' ? 'bad' : 'info';
