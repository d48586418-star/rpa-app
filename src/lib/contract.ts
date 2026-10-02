import { genreLabel } from '../constants/genres';
import { formatShort } from './dates';
import type { Job } from './types';

/** Taxa de serviço paga pelo contratante, mostrada à parte. Valor de partida a testar. */
export const SERVICE_FEE_RATE = 0.08;
export const WORKDAY_HOURS = 10;
export const OVERTIME_MULTIPLIER = 1.5;
export const LATE_CANCEL_HOURS = 48;
export const LATE_CANCEL_FEE_RATE = 0.3;

const REVISION_ROLES = ['Editor(a)', 'Colorista', 'Motion Designer', 'VFX / Animador(a)'];

export type Quote = { subtotal: number; fee: number; total: number; proReceives: number };

/** O profissional recebe a diária inteira; a taxa é cobrada do contratante por cima. */
export function quote(budgetPerDay: number, days: number): Quote {
  const subtotal = budgetPerDay * days;
  const fee = Math.round(subtotal * SERVICE_FEE_RATE);
  return { subtotal, fee, total: subtotal + fee, proReceives: subtotal };
}

export const revisionsFor = (role: string) => (REVISION_ROLES.includes(role) ? 2 : 0);
export const overtimeRate = (budgetPerDay: number) => Math.round((budgetPerDay / WORKDAY_HOURS) * OVERTIME_MULTIPLIER);
export const lateCancelFee = (budgetPerDay: number, days: number) => Math.round(budgetPerDay * days * LATE_CANCEL_FEE_RATE);

export const brl = (n: number) => `R$ ${n.toLocaleString('pt-BR')}`;

export type Clause = { title: string; body: string };

/** Contrato de 1 toque gerado do job. Modelo de exemplo: precisa de revisão jurídica antes do uso real. */
export function contractClauses(job: Job, ownerName: string, proName: string): Clause[] {
  const q = quote(job.budget_per_day, job.days);
  const revisions = revisionsFor(job.role);
  const local = job.city ?? 'remoto';
  const dates = job.days > 1 ? `${formatShort(job.date)} (${job.days} diárias)` : formatShort(job.date);
  return [
    { title: 'Partes e objeto', body: `${ownerName} (contratante) contrata ${proName} (profissional) para atuar como ${job.role} no trabalho "${job.title}" (${genreLabel(job.genre).toLowerCase()}), em ${local}, em ${dates}.` },
    { title: 'Valor e pagamento', body: `Diária de ${brl(job.budget_per_day)} × ${job.days} = ${brl(q.subtotal)} para o profissional. O contratante paga também a taxa de serviço de ${brl(q.fee)} (total ${brl(q.total)}). O valor fica em custódia e é liberado 24 horas após o check-out, salvo contestação.` },
    { title: 'Jornada e hora extra', body: `Jornada de até ${WORKDAY_HOURS} horas por diária. Hora extra: ${brl(overtimeRate(job.budget_per_day))} por hora, com aviso e aceite no próprio app.` },
    { title: 'Revisões', body: revisions > 0 ? `Inclui até ${revisions} rodadas de revisão. Rodadas extras são combinadas à parte.` : 'Não se aplica a esta função.' },
    { title: 'Uso de imagem e créditos', body: 'A cessão de uso de imagem vale apenas para este trabalho e para a divulgação dele. O profissional recebe o crédito da função exercida, que passa a constar verificado no perfil.' },
    { title: 'Cancelamento', body: `Cancelamento com menos de ${LATE_CANCEL_HOURS} horas de antecedência gera multa de ${brl(lateCancelFee(job.budget_per_day, job.days))} (${Math.round(LATE_CANCEL_FEE_RATE * 100)}% do valor), devida por quem cancelou, seja contratante ou profissional.` },
    { title: 'Aviso', body: 'Modelo de exemplo gerado pelo app. Nesta versão de demonstração o pagamento é simulado e nenhum dinheiro real é movimentado.' },
  ];
}
