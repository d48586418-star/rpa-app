import { genreLabel } from '../constants/genres';
import type { Job } from './types';

/** Requisitos da vaga: os que a empresa escreveu ou, na falta deles, os derivados dos dados da vaga. */
export function requirementsFor(job: Job): string[] {
  if (job.requirements?.length) return job.requirements;
  const out = [`Atuar como ${job.role.toLowerCase()}`, `Experiência em ${genreLabel(job.genre).toLowerCase()}`];
  if (job.gear.length) out.push(`Equipamento próprio: ${job.gear.join(', ')}`);
  out.push(`Disponível ${job.days === 1 ? 'na data' : `nas ${job.days} diárias`}`);
  return out;
}

/** O que a vaga oferece, sem prometer nada além do que o app mostra. */
export function perksFor(job: Job): string[] {
  if (job.perks?.length) return job.perks;
  return ['Contrato gerado no app', 'Pagamento em custódia (simulado na demo)', 'Crédito verificado no seu perfil'];
}
