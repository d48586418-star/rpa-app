import type { ReviewScores, Stage } from './types';

export type Action = 'accept_contract' | 'pay_escrow' | 'check_in' | 'check_out' | 'release' | 'review';
export type Side = 'pro' | 'owner';

export const STAGE_ORDER: Stage[] = ['contrato_pendente', 'aguardando_pagamento', 'em_custodia', 'em_andamento', 'entregue', 'liberado', 'concluido'];

export const STAGE_LABELS: Record<Stage, string> = {
  contrato_pendente: 'Contrato',
  aguardando_pagamento: 'Pagamento',
  em_custodia: 'Em custódia',
  em_andamento: 'No set',
  entregue: 'Entregue',
  liberado: 'Liberado',
  concluido: 'Concluído',
};

const TABLE: Record<Action, { from: Stage; to: Stage; by: Side }> = {
  accept_contract: { from: 'contrato_pendente', to: 'aguardando_pagamento', by: 'pro' },
  pay_escrow: { from: 'aguardando_pagamento', to: 'em_custodia', by: 'owner' },
  check_in: { from: 'em_custodia', to: 'em_andamento', by: 'pro' },
  check_out: { from: 'em_andamento', to: 'entregue', by: 'pro' },
  release: { from: 'entregue', to: 'liberado', by: 'owner' },
  review: { from: 'liberado', to: 'concluido', by: 'owner' },
};

/** Aplica uma ação à etapa atual. Lança erro se a ordem ou quem age estiver errado. */
export function applyAction(stage: Stage, action: Action, by: Side): Stage {
  const t = TABLE[action];
  if (t.by !== by) throw new Error(by === 'pro' ? 'Essa etapa é feita pelo contratante.' : 'Essa etapa é feita pelo profissional.');
  if (t.from !== stage) throw new Error('Essa ação não está disponível nesta etapa.');
  return t.to;
}

/** Ação que cada lado pode fazer agora (null = aguardando o outro lado ou já concluído). */
export function nextActionFor(stage: Stage, side: Side): Action | null {
  const entry = (Object.entries(TABLE) as [Action, (typeof TABLE)[Action]][]).find(([, t]) => t.from === stage);
  return entry && entry[1].by === side ? entry[0] : null;
}

export const waitingOn = (stage: Stage): Side | null => {
  const entry = Object.values(TABLE).find((t) => t.from === stage);
  return entry ? entry.by : null;
};

export const CRITERIA: { key: keyof ReviewScores; label: string }[] = [
  { key: 'tecnica', label: 'Qualidade técnica' },
  { key: 'comunicacao', label: 'Comunicação' },
  { key: 'prazo', label: 'Prazo e pontualidade' },
];

export const average = (s: ReviewScores) => (s.tecnica + s.comunicacao + s.prazo) / 3;

/** Critério com a menor nota, para sugerir o ponto a melhorar. */
export function weakestCriterion(s: ReviewScores): string {
  return [...CRITERIA].sort((a, b) => s[a.key] - s[b.key])[0].label;
}
