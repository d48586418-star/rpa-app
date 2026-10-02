import { genreLabel } from '../constants/genres';
import { dateSpan, formatShort } from './dates';
import { distanceKm } from './geo';
import { norm } from './matching';
import type { Credit, Genre, Reputation } from './types';

/** Pesos fixos do match (somam 100). */
export const WEIGHTS = {
  skills: 30,
  experience: 20,
  availability: 15,
  distance: 10,
  reputation: 15,
  price: 5,
  training: 5,
} as const;
export type FactorKey = keyof typeof WEIGHTS;

export const FACTOR_LABELS: Record<FactorKey, string> = {
  skills: 'Função e habilidades',
  experience: 'Experiência no tipo de trabalho',
  availability: 'Disponibilidade na data',
  distance: 'Distância',
  reputation: 'Reputação',
  price: 'Faixa de valor',
  training: 'Formação no app',
};

/** Funções que já têm trilha de formação no app (por enquanto só Montagem). */
export const ROLE_TRAINING: Record<string, string> = { 'Editor(a)': 'Formado em Montagem' };

export const NEW_ACCOUNT_DAYS = 60;
export const NEW_ACCOUNT_BONUS = 5;

export type JobInput = {
  role: string;
  genre: Genre;
  date: string;
  days: number;
  city: string | null;
  budget_per_day: number;
  gear: string[];
};

/** Só dados profissionais: nada de foto, gênero, idade ou bairro entra no cálculo. */
export type ProInput = {
  roles: string[];
  credits: Credit[];
  gear: string | null;
  blockedDates: string[];
  city: string | null;
  radiusKm: number;
  rateMin: number | null;
  reputation: Reputation;
  trainingBadges: string[];
  accountAgeDays: number;
};

export type Factor = {
  key: FactorKey;
  label: string;
  max: number;
  points: number;
  /** Fatores sem como medir (ex.: função sem trilha) saem da conta, e a nota é reescalada. */
  applicable: boolean;
  note: string;
};

export type Breakdown = { total: number; factors: Factor[] };
export type Suggestion = { text: string; gain: number; newTotal: number };
export type Chance = 'Alta' | 'Média' | 'Baixa';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function scoreMatch(job: JobInput, pro: ProInput): Breakdown {
  const factors: Factor[] = [];
  const add = (key: FactorKey, ratio: number, note: string, applicable = true) =>
    factors.push({ key, label: FACTOR_LABELS[key], max: WEIGHTS[key], points: WEIGHTS[key] * Math.max(0, Math.min(1, ratio)), applicable, note });

  // 1) Função e habilidades: 70% função (com crédito verificado), 30% equipamentos pedidos.
  const verifiedInRole = pro.credits.filter((c) => c.verified && c.role === job.role).length;
  const declared = pro.roles.includes(job.role) || verifiedInRole > 0;
  const roleScore = !declared ? 0 : verifiedInRole >= 2 ? 1 : verifiedInRole === 1 ? 0.75 : 0.4;
  const haveGear = norm(pro.gear ?? '');
  const missingGear = job.gear.filter((g) => !haveGear.includes(norm(g)));
  const gearScore = job.gear.length === 0 ? 1 : (job.gear.length - missingGear.length) / job.gear.length;
  const roleNote = !declared
    ? `${job.role} não está nas suas funções.`
    : verifiedInRole === 0
      ? `Você declarou ${job.role}, mas ainda sem crédito verificado.`
      : `${plural(verifiedInRole, 'crédito verificado', 'créditos verificados')} como ${job.role}.`;
  const gearNote = job.gear.length === 0 ? '' : missingGear.length === 0 ? ' Você tem o equipamento pedido.' : ` Falta declarar: ${missingGear.join(', ')}.`;
  add('skills', 0.7 * roleScore + 0.3 * gearScore, roleNote + gearNote);

  // 2) Experiência no gênero: 3 créditos verificados no mesmo tipo de trabalho = nota cheia.
  const inGenre = pro.credits.filter((c) => c.verified && c.genre === job.genre).length;
  add('experience', Math.min(1, inGenre / 3), `${plural(inGenre, 'crédito verificado', 'créditos verificados')} em ${genreLabel(job.genre).toLowerCase()}.`);

  // 3) Disponibilidade: qualquer data do job marcada como ocupada zera o fator.
  const span = dateSpan(job.date, job.days);
  const busy = span.find((d) => pro.blockedDates.includes(d));
  add('availability', busy ? 0 : 1, busy ? `Você marcou ${formatShort(busy)} como ocupado.` : 'Agenda livre nas datas do job.');

  // 4) Distância: dentro de metade do raio vale tudo; cai até zero no limite do raio.
  if (!job.city) {
    add('distance', 1, 'Job remoto.');
  } else {
    const d = distanceKm(pro.city, job.city);
    if (d == null) add('distance', 0.5, 'Sem como medir a distância até o set.');
    else {
      const r = Math.max(1, pro.radiusKm);
      const ratio = d <= r / 2 ? 1 : d >= r ? 0 : (r - d) / (r / 2);
      add('distance', ratio, d === 0 ? `Você está em ${job.city}.` : `A ${d} km do set (seu raio: ${r} km).`);
    }
  }

  // 5) Reputação: sem avaliações a nota é neutra (conta nova não é punida).
  const rep = pro.reputation;
  if (rep.ratingCount === 0 || rep.ratingAvg == null) {
    add('reputation', 0.5, 'Conta nova: ainda sem avaliações (nota neutra).');
  } else {
    const ratio = 0.5 * (rep.ratingAvg / 5) + 0.25 * (rep.attendance ?? 1) + 0.25 * (rep.onTime ?? 1);
    const pct = Math.round((rep.attendance ?? 1) * 100);
    add('reputation', ratio, `Nota ${rep.ratingAvg.toFixed(1).replace('.', ',')} em ${plural(rep.ratingCount, 'avaliação', 'avaliações')} e ${pct}% de comparecimento.`);
  }

  // 6) Faixa de valor: orçamento cobre a diária mínima do profissional?
  if (pro.rateMin == null) add('price', 1, 'Você não definiu diária mínima.');
  else if (job.budget_per_day >= pro.rateMin) add('price', 1, 'O orçamento cobre a sua diária mínima.');
  else if (job.budget_per_day >= pro.rateMin * 0.8) add('price', 0.5, 'O orçamento fica um pouco abaixo da sua diária mínima.');
  else add('price', 0, 'O orçamento fica bem abaixo da sua diária mínima.');

  // 7) Formação no app: selo da trilha ligada à função.
  const badge = ROLE_TRAINING[job.role];
  if (!badge) add('training', 0, 'Ainda não há trilha de formação para esta função.', false);
  else if (pro.trainingBadges.includes(badge)) add('training', 1, `Você tem o selo ${badge}.`);
  else add('training', 0, `Concluir a trilha ${badge} soma pontos aqui.`);

  const usable = factors.filter((f) => f.applicable);
  const total = Math.round((100 * usable.reduce((s, f) => s + f.points, 0)) / usable.reduce((s, f) => s + f.max, 0));
  return { total, factors };
}

/** "O que falta": simula cada melhoria possível e mostra só as que realmente aumentam o match. */
export function suggestions(job: JobInput, pro: ProInput, base: Breakdown = scoreMatch(job, pro)): Suggestion[] {
  const sims: { text: string; pro: ProInput }[] = [];
  const genre = genreLabel(job.genre).toLowerCase();
  sims.push({
    text: `Um crédito verificado de ${genre} como ${job.role}`,
    pro: { ...pro, credits: [...pro.credits, { id: 'sim', title: '', role: job.role, genre: job.genre, year: 0, verified: true }] },
  });
  const span = dateSpan(job.date, job.days);
  if (span.some((d) => pro.blockedDates.includes(d))) {
    sims.push({ text: `Liberar ${formatShort(span.find((d) => pro.blockedDates.includes(d))!)} na agenda`, pro: { ...pro, blockedDates: pro.blockedDates.filter((d) => !span.includes(d)) } });
  }
  const haveGear = norm(pro.gear ?? '');
  const missing = job.gear.filter((g) => !haveGear.includes(norm(g)));
  if (missing.length) {
    sims.push({ text: `Declarar ${missing.join(', ')} no perfil (se você tem o equipamento)`, pro: { ...pro, gear: `${pro.gear ?? ''} ${missing.join(' ')}` } });
  }
  const badge = ROLE_TRAINING[job.role];
  if (badge && !pro.trainingBadges.includes(badge)) {
    sims.push({ text: `A trilha ${badge}`, pro: { ...pro, trainingBadges: [...pro.trainingBadges, badge] } });
  }
  return sims
    .map((s) => ({ s, total: scoreMatch(job, s.pro).total }))
    .map(({ s, total }) => ({ text: `${s.text} sobe seu match para ${total}% (+${total - base.total})`, gain: total - base.total, newTotal: total }))
    .filter((x) => x.gain >= 1)
    .sort((a, b) => b.gain - a.gain)
    .slice(0, 3);
}

/** Faixa de chance de ser chamado. Nunca um número que pareça promessa. */
export function chanceOfCall(score: number, rank: number): Chance {
  if (score >= 80 && rank <= 3) return 'Alta';
  if (score >= 60 && rank <= 5) return 'Média';
  return 'Baixa';
}

/** Nota usada só para ordenar candidatos ao contratante: conta nova ganha visibilidade extra. */
export function rankingScore(total: number, accountAgeDays: number): number {
  return total + (accountAgeDays < NEW_ACCOUNT_DAYS ? NEW_ACCOUNT_BONUS : 0);
}
