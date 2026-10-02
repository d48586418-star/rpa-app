/** Níveis com nomes do set. Cada nível precisa valer algo no mundo real (visibilidade, jobs maiores). */
export const LEVELS = [
  { name: 'Claquete', min: 0 },
  { name: 'Assistente', min: 150 },
  { name: 'Operador(a)', min: 400 },
  { name: 'Chefe de Equipe', min: 800 },
  { name: 'Diretor(a) de Cena', min: 1500 },
] as const;

export const XP = { jobDone: 100, goodReview: 20, creditVerified: 30, firstJob: 50 } as const;
export const GOOD_REVIEW_MIN = 4;
export const PUNCTUAL_TARGET = 10;
export const DELIVERY_TARGET = 10;

export type Progress = {
  xp: number;
  jobsDone: number;
  onTimeCheckins: number;
  onTimeDeliveries: number;
  pioneer: boolean;
};

export type LevelInfo = { index: number; name: string; next: string | null; xpInto: number; xpSpan: number; progress: number };

export function levelFor(xp: number): LevelInfo {
  let index = 0;
  LEVELS.forEach((l, i) => { if (xp >= l.min) index = i; });
  const cur = LEVELS[index];
  const nxt = LEVELS[index + 1];
  if (!nxt) return { index, name: cur.name, next: null, xpInto: xp - cur.min, xpSpan: 0, progress: 1 };
  const span = nxt.min - cur.min;
  return { index, name: cur.name, next: nxt.name, xpInto: xp - cur.min, xpSpan: span, progress: (xp - cur.min) / span };
}

export type Badge = { id: string; name: string; how: string };

const BADGES: (Badge & { earned: (p: Progress) => boolean })[] = [
  { id: 'pontual', name: 'Pontual', how: `${PUNCTUAL_TARGET} sets sem atraso no check-in`, earned: (p) => p.onTimeCheckins >= PUNCTUAL_TARGET },
  { id: 'entrega', name: 'Entrega no prazo', how: `${DELIVERY_TARGET} entregas de pós-produção no prazo`, earned: (p) => p.onTimeDeliveries >= DELIVERY_TARGET },
  { id: 'primeiro', name: 'Primeiro job', how: 'Concluir o primeiro job pelo app', earned: (p) => p.jobsDone >= 1 },
  { id: 'pioneiro', name: 'Pioneiro(a)', how: 'Entre os 200 primeiros da região', earned: (p) => p.pioneer },
];

export const ALL_BADGES: Badge[] = BADGES.map(({ id, name, how }) => ({ id, name, how }));
export const earnedBadges = (p: Progress): Badge[] => BADGES.filter((b) => b.earned(p)).map(({ id, name, how }) => ({ id, name, how }));

export const emptyProgress = (): Progress => ({ xp: 0, jobsDone: 0, onTimeCheckins: 0, onTimeDeliveries: 0, pioneer: false });
