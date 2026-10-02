import { PERSONAS } from '../constants/personas';
import { ROLES } from '../constants/roles';
import { contractClauses, quote, revisionsFor, type Clause, type Quote } from './contract';
import { addDays, daysBetween } from './dates';
import { availabilityLabel, isAvailableToday } from './availability';
import { distanceKm } from './geo';
import { applyAction, average, nextActionFor, type Action } from './engagement';
import {
  chanceOfCall, rankingScore, scoreMatch, suggestions,
  type Breakdown, type Chance, type ProInput, type Suggestion,
} from './matchScore';
import {
  ALL_BADGES, GOOD_REVIEW_MIN, XP, earnedBadges, emptyProgress, levelFor,
  type Badge, type LevelInfo, type Progress,
} from './xp';
import type {
  Application, Availability, Credit, Engagement, Genre, Job, Profile, Reputation, Review, ReviewScores,
} from './types';

type Extras = {
  availability: Availability;
  availableFrom: string | null;
  radiusKm: number;
  createdAt: string; // YYYY-MM-DD
  blocked: Set<string>;
  credits: Credit[];
  reputation: Reputation;
  trainingBadges: string[];
  progress: Progress;
};

export type JobCard = {
  job: Job; ownerName: string; ownerPhoto: string | null; score: number; chance: Chance; applied: boolean; selected: boolean;
  distanceKm: number | null; saved: boolean;
};
/** O que o profissional decidiu sobre uma vaga no deck (candidatar fica em `Application`). */
export type JobChoice = 'pass' | 'save';
export type OwnerJobRow = { job: Job; applicants: number; stage: Engagement['stage'] | null };
export type CandidateRow = {
  profile: Profile; score: number; breakdown: Breakdown; chance: Chance; status: Application['status']; isNew: boolean;
};
export type EngagementView = {
  engagement: Engagement; job: Job; pro: Profile; owner: Profile; matchId: string | null;
  quote: Quote; clauses: Clause[]; review: Review | null; next: Action | null; side: 'pro' | 'owner';
};
export type JobDetail = {
  job: Job; owner: Profile; side: 'pro' | 'owner'; applicants: number; applied: boolean; saved: boolean; similar: JobCard[];
  breakdown: Breakdown | null; suggestions: Suggestion[]; chance: Chance | null;
  candidates: CandidateRow[]; engagement: EngagementView | null;
};
export type ProgressView = {
  progress: Progress; level: LevelInfo; badges: Badge[]; allBadges: Badge[];
  credits: Credit[]; blockedDates: string[]; today: string; reputation: Reputation; radiusKm: number;
  availability: Availability; availableFrom: string | null; availabilityText: string;
};
export type NewJob = {
  title: string; role: string; genre: Genre; date: string; days: number; city: string | null;
  budget_per_day: number; gear: string[]; description: string;
  cover?: string | null; requirements?: string[]; perks?: string[];
};

type Ctx = {
  profiles: Map<string, Profile>;
  today: () => string;
  /** Abre (ou reaproveita) a conversa entre duas pessoas e devolve o id do match/conversa. */
  ensureConversation: (a: string, b: string) => string;
};

const fail = (msg: string): never => { throw new Error(msg); };

export class JobsModule {
  private jobs: Job[] = [];
  private apps: Application[] = [];
  private engagements: Engagement[] = [];
  private reviews: Review[] = [];
  private extras = new Map<string, Extras>();
  private convos = new Map<string, string>(); // engagement id -> match id
  private choices = new Map<string, Map<string, JobChoice>>(); // profissional -> vaga -> escolha
  private seq = 0;

  constructor(private ctx: Ctx) {}

  reset() {
    this.jobs = [];
    this.apps = [];
    this.engagements = [];
    this.reviews = [];
    this.extras.clear();
    this.convos.clear();
    this.choices.clear();
    const today = this.ctx.today();
    for (const p of PERSONAS) {
      const x = p.extras;
      this.extras.set(p.profile.id, {
        availability: x.availability,
        availableFrom: x.availableFromOffset == null ? null : addDays(today, x.availableFromOffset),
        radiusKm: x.radiusKm,
        createdAt: addDays(today, -x.createdDaysAgo),
        blocked: new Set(x.blockedOffsets.map((o) => addDays(today, o))),
        credits: x.credits.map((c, i) => ({ ...c, id: `${p.key}-c${i + 1}` })),
        reputation: { ...x.reputation },
        trainingBadges: [...x.trainingBadges],
        progress: { ...x.progress },
      });
      for (const j of p.jobs) {
        this.jobs.push({
          id: j.key, owner_id: p.profile.id, title: j.title, role: j.role, genre: j.genre,
          date: addDays(today, j.offsetDays), days: j.days, city: j.city, budget_per_day: j.budgetPerDay,
          gear: j.gear, description: j.description, status: 'open', created_at: today,
        });
      }
    }
    // Candidaturas já existentes para a lista do contratante não começar vazia.
    this.seedApplication('j1', 'f5');
    this.seedApplication('j3', 'f4');
  }

  /** Conta criada pelo cadastro livre: zera o que for dela. */
  resetUser(id: string) {
    this.extras.delete(id);
    const mine = new Set(this.jobs.filter((j) => j.owner_id === id).map((j) => j.id));
    this.engagements = this.engagements.filter((e) => e.pro_id !== id && e.owner_id !== id);
    this.apps = this.apps.filter((a) => a.pro_id !== id && !mine.has(a.job_id));
    this.jobs = this.jobs.filter((j) => j.owner_id !== id);
    this.choices.delete(id);
    this.reviews = this.reviews.filter((r) => r.reviewer_id !== id && r.reviewee_id !== id);
  }

  private seedApplication(jobId: string, personaKey: string) {
    const p = PERSONAS.find((x) => x.key === personaKey)!;
    this.apps.push({ job_id: jobId, pro_id: p.profile.id, status: 'applied', created_at: this.ctx.today() });
  }

  // ---------- dados do profissional ----------

  private extrasOf(id: string): Extras {
    let x = this.extras.get(id);
    if (!x) {
      x = {
        availability: 'now', availableFrom: null,
        radiusKm: 80, createdAt: this.ctx.today(), blocked: new Set(), credits: [],
        reputation: { ratingAvg: null, ratingCount: 0, attendance: null, onTime: null },
        trainingBadges: [], progress: emptyProgress(),
      };
      this.extras.set(id, x);
    }
    return x;
  }

  private proInput(id: string): ProInput {
    const p = this.ctx.profiles.get(id);
    const x = this.extrasOf(id);
    return {
      roles: p?.roles ?? [], credits: x.credits, gear: p?.gear ?? null, blockedDates: [...x.blocked],
      city: p?.city ?? null, radiusKm: x.radiusKm, rateMin: p?.day_rate_min ?? null,
      reputation: x.reputation, trainingBadges: x.trainingBadges,
      accountAgeDays: Math.max(0, daysBetween(x.createdAt, this.ctx.today())),
    };
  }

  private profile(id: string): Profile {
    return this.ctx.profiles.get(id) ?? fail('Perfil não encontrado.');
  }

  private job(id: string): Job {
    return this.jobs.find((j) => j.id === id) ?? fail('Job não encontrado.');
  }

  private application(jobId: string, proId: string) {
    return this.apps.find((a) => a.job_id === jobId && a.pro_id === proId);
  }

  private score(jobId: string, proId: string): Breakdown {
    return scoreMatch(this.job(jobId), this.proInput(proId));
  }

  /** Posição (1 = melhor) de um profissional entre os candidatos, contando-o mesmo que ainda não tenha se candidatado. */
  private rankOf(jobId: string, proId: string): number {
    const ids = new Set(this.apps.filter((a) => a.job_id === jobId && a.status !== 'declined').map((a) => a.pro_id));
    ids.add(proId);
    const rows = [...ids]
      .map((id) => ({ id, rs: rankingScore(this.score(jobId, id).total, this.proInput(id).accountAgeDays) }))
      .sort((a, b) => b.rs - a.rs || a.id.localeCompare(b.id));
    return rows.findIndex((r) => r.id === proId) + 1;
  }

  // ---------- feeds ----------

  /** Profissional: jobs abertos (e os que ele fechou), do melhor match para o pior. */
  feedForPro(me: string): JobCard[] {
    return this.jobs
      .filter((j) => j.owner_id !== me && (j.status === 'open' || this.engagements.some((e) => e.job_id === j.id && e.pro_id === me)))
      .map((job) => {
        const total = this.score(job.id, me).total;
        const app = this.application(job.id, me);
        return {
          job, ownerName: this.profile(job.owner_id).name, ownerPhoto: this.profile(job.owner_id).avatar_url, score: total,
          chance: chanceOfCall(total, this.rankOf(job.id, me)),
          applied: Boolean(app), selected: app?.status === 'selected',
          saved: this.choices.get(me)?.get(job.id) === 'save',
          distanceKm: job.city ? distanceKm(this.ctx.profiles.get(me)?.city, job.city) : null,
        };
      })
      .sort((a, b) => b.score - a.score || a.job.date.localeCompare(b.job.date));
  }

  /** Deck de swipe do profissional: vagas abertas que ele ainda não candidatou, pulou nem salvou. */
  deckForPro(me: string): JobCard[] {
    const mine = this.choices.get(me);
    return this.feedForPro(me).filter((c) => c.job.status === 'open' && !c.applied && !mine?.has(c.job.id));
  }

  /** Vagas que o profissional salvou para ver depois. */
  savedForPro(me: string): JobCard[] {
    return this.feedForPro(me).filter((c) => c.saved && !c.applied);
  }

  skip(jobId: string, me: string) {
    this.job(jobId);
    this.setChoice(me, jobId, 'pass');
  }

  save(jobId: string, me: string) {
    this.job(jobId);
    if (this.application(jobId, me)) fail('Você já se candidatou a esta vaga.');
    this.setChoice(me, jobId, 'save');
  }

  /** Desfaz a última decisão sobre a vaga: tira de "pulada"/"salva" ou cancela a candidatura ainda não respondida. */
  undo(jobId: string, me: string) {
    const app = this.application(jobId, me);
    if (app) {
      if (app.status !== 'applied') fail('A empresa já respondeu; não dá para desfazer.');
      this.apps = this.apps.filter((a) => a !== app);
    }
    this.choices.get(me)?.delete(jobId);
  }

  private setChoice(me: string, jobId: string, c: JobChoice) {
    const m = this.choices.get(me) ?? new Map<string, JobChoice>();
    m.set(jobId, c);
    this.choices.set(me, m);
  }

  /** Vagas parecidas (mesma função ou gênero), melhores primeiro. */
  similarTo(jobId: string, me: string, limit = 3): JobCard[] {
    const base = this.job(jobId);
    return this.feedForPro(me)
      .filter((c) => c.job.id !== jobId && c.job.status === 'open' && (c.job.role === base.role || c.job.genre === base.genre))
      .slice(0, limit);
  }

  /** Contratante: os próprios jobs. */
  feedForOwner(me: string): OwnerJobRow[] {
    return this.jobs
      .filter((j) => j.owner_id === me)
      .map((job) => ({
        job,
        applicants: this.apps.filter((a) => a.job_id === job.id && a.status !== 'declined').length,
        stage: this.engagements.find((e) => e.job_id === job.id)?.stage ?? null,
      }));
  }

  detail(jobId: string, me: string): JobDetail {
    const job = this.job(jobId);
    const owner = this.profile(job.owner_id);
    const side = job.owner_id === me ? 'owner' : 'pro';
    const eng = this.engagementView(jobId, me);
    const base = {
      job, owner, side, engagement: eng,
      applicants: this.apps.filter((a) => a.job_id === jobId && a.status !== 'declined').length,
    } as const;
    if (side === 'owner') {
      return { ...base, applied: false, saved: false, similar: [], breakdown: null, suggestions: [], chance: null, candidates: this.candidates(jobId, me) };
    }
    const breakdown = this.score(jobId, me);
    return {
      ...base, applied: Boolean(this.application(jobId, me)), saved: this.choices.get(me)?.get(jobId) === 'save',
      similar: this.similarTo(jobId, me), breakdown,
      suggestions: suggestions(job, this.proInput(me), breakdown),
      chance: chanceOfCall(breakdown.total, this.rankOf(jobId, me)), candidates: [],
    };
  }

  // ---------- ações do contratante e do profissional ----------

  createJob(me: string, input: NewJob): Job {
    if (this.profile(me).account_type !== 'empresa') fail('Só contas de empresa publicam jobs.');
    if (input.title.trim().length < 3) fail('Dê um título ao job.');
    if (!ROLES.includes(input.role as (typeof ROLES)[number])) fail('Escolha a função que você procura.');
    if (!(input.budget_per_day > 0)) fail('Informe o orçamento por diária.');
    if (input.days < 1 || input.days > 30) fail('O número de diárias deve ficar entre 1 e 30.');
    if (input.date < this.ctx.today()) fail('A data do job não pode estar no passado.');
    const job: Job = {
      ...input, title: input.title.trim(), gear: input.gear.map((g) => g.trim()).filter(Boolean),
      id: `job-${++this.seq}`, owner_id: me, status: 'open', created_at: this.ctx.today(),
    };
    this.jobs.unshift(job);
    return job;
  }

  apply(jobId: string, me: string) {
    const job = this.job(jobId);
    if (job.owner_id === me) fail('Você não pode se candidatar ao próprio job.');
    if (this.profile(me).account_type !== 'freelancer') fail('Só profissionais se candidatam.');
    if (job.status !== 'open') fail('Este job não está mais aberto.');
    if (this.application(jobId, me)) fail('Você já se candidatou a este job.');
    this.apps.push({ job_id: jobId, pro_id: me, status: 'applied', created_at: this.ctx.today() });
    this.choices.get(me)?.delete(jobId);
  }

  candidates(jobId: string, owner: string): CandidateRow[] {
    const job = this.job(jobId);
    if (job.owner_id !== owner) fail('Só o contratante vê os candidatos.');
    const rows = this.apps
      .filter((a) => a.job_id === jobId && a.status !== 'declined')
      .map((a) => {
        const input = this.proInput(a.pro_id);
        const breakdown = scoreMatch(job, input);
        return { a, breakdown, order: rankingScore(breakdown.total, input.accountAgeDays), isNew: input.accountAgeDays < 60 };
      })
      .sort((x, y) => y.order - x.order || x.a.pro_id.localeCompare(y.a.pro_id));
    return rows.map((r, i) => ({
      profile: this.profile(r.a.pro_id), score: r.breakdown.total, breakdown: r.breakdown,
      chance: chanceOfCall(r.breakdown.total, i + 1), status: r.a.status, isNew: r.isNew,
    }));
  }

  /** Abre a conversa com um candidato (usa o chat dos matches). Devolve o id da conversa. */
  invite(jobId: string, owner: string, proId: string): string {
    const job = this.job(jobId);
    if (job.owner_id !== owner) fail('Só o contratante convida.');
    const app = this.application(jobId, proId) ?? fail('Essa pessoa não se candidatou a este job.');
    if (app.status === 'applied') app.status = 'invited';
    return this.ctx.ensureConversation(owner, proId);
  }

  /** Fecha o job com um candidato e gera o contrato. */
  select(jobId: string, owner: string, proId: string): Engagement {
    const job = this.job(jobId);
    if (job.owner_id !== owner) fail('Só o contratante fecha o job.');
    if (job.status !== 'open') fail('Este job já foi fechado.');
    const app = this.application(jobId, proId) ?? fail('Essa pessoa não se candidatou a este job.');
    this.apps.filter((a) => a.job_id === jobId).forEach((a) => { a.status = a === app ? 'selected' : 'declined'; });
    job.status = 'closed';
    const eng: Engagement = {
      id: `eng-${++this.seq}`, job_id: jobId, pro_id: proId, owner_id: owner, stage: 'contrato_pendente',
      check_in_at: null, check_out_at: null, xp_awarded: [],
    };
    this.engagements.push(eng);
    this.convos.set(eng.id, this.ctx.ensureConversation(owner, proId));
    return eng;
  }

  private engagementView(jobId: string, me: string): EngagementView | null {
    const eng = this.engagements.find((e) => e.job_id === jobId);
    if (!eng || (eng.pro_id !== me && eng.owner_id !== me)) return null;
    const job = this.job(jobId);
    const pro = this.profile(eng.pro_id);
    const owner = this.profile(eng.owner_id);
    const side = eng.pro_id === me ? 'pro' : 'owner';
    return {
      engagement: { ...eng, xp_awarded: [...eng.xp_awarded] }, job, pro, owner, side,
      matchId: this.convos.get(eng.id) ?? null,
      quote: quote(job.budget_per_day, job.days),
      clauses: contractClauses(job, owner.name, pro.name),
      review: this.reviews.find((r) => r.engagement_id === eng.id) ?? null,
      next: nextActionFor(eng.stage, side),
    };
  }

  private award(eng: Engagement, label: string, xp: number) {
    this.extrasOf(eng.pro_id).progress.xp += xp;
    eng.xp_awarded.push({ label, xp });
  }

  /** Avança o contrato. Tudo aqui é simulação: nenhum dinheiro, localização ou documento reais. */
  act(jobId: string, me: string, action: Action, payload?: { scores: ReviewScores; tip?: string }): EngagementView {
    const eng = this.engagements.find((e) => e.job_id === jobId) ?? fail('Ainda não há contrato para este job.');
    if (eng.pro_id !== me && eng.owner_id !== me) fail('Você não participa deste contrato.');
    const side = eng.pro_id === me ? 'pro' : 'owner';
    const job = this.job(jobId);
    const next = applyAction(eng.stage, action, side);
    const prog = this.extrasOf(eng.pro_id).progress;
    const now = new Date().toISOString();

    if (action === 'review') {
      const s = payload?.scores ?? fail('Avalie os três critérios.');
      for (const v of [s.tecnica, s.comunicacao, s.prazo]) if (!Number.isInteger(v) || v < 1 || v > 5) fail('As notas vão de 1 a 5.');
      const avg = average(s);
      this.reviews.push({ engagement_id: eng.id, reviewer_id: me, reviewee_id: eng.pro_id, scores: s, tip: payload?.tip?.trim() || null });
      const rep = this.extrasOf(eng.pro_id).reputation;
      const n = rep.ratingCount;
      rep.ratingAvg = ((rep.ratingAvg ?? 0) * n + avg) / (n + 1);
      rep.attendance = ((rep.attendance ?? 1) * n + 1) / (n + 1);
      rep.onTime = ((rep.onTime ?? 1) * n + (s.prazo >= 4 ? 1 : 0)) / (n + 1);
      rep.ratingCount = n + 1;
      if (avg >= GOOD_REVIEW_MIN) this.award(eng, 'Avaliação positiva', XP.goodReview);
    }
    if (action === 'check_in') { eng.check_in_at = now; prog.onTimeCheckins += 1; }
    if (action === 'check_out') eng.check_out_at = now;
    if (action === 'release') {
      const first = prog.jobsDone === 0;
      this.award(eng, 'Job concluído', XP.jobDone);
      if (first) this.award(eng, 'Primeiro job pelo app', XP.firstJob);
      prog.jobsDone += 1;
      if (revisionsFor(job.role) > 0) prog.onTimeDeliveries += 1;
      job.status = 'done';
    }
    eng.stage = next;
    return this.engagementView(jobId, me)!;
  }

  // ---------- perfil: progresso, créditos e agenda ----------

  progress(me: string): ProgressView {
    const x = this.extrasOf(me);
    return {
      progress: { ...x.progress }, level: levelFor(x.progress.xp), badges: earnedBadges(x.progress), allBadges: ALL_BADGES,
      credits: x.credits.map((c) => ({ ...c })), blockedDates: [...x.blocked].sort(), today: this.ctx.today(),
      reputation: { ...x.reputation }, radiusKm: x.radiusKm,
      availability: x.availability, availableFrom: x.availableFrom, availabilityText: availabilityLabel(x.availability, x.availableFrom),
    };
  }

  /** Muda o estado de disponibilidade e mantém o campo `available` do perfil em sincronia (filtros do Descobrir). */
  setAvailability(me: string, state: Availability, from: string | null = null) {
    if (state === 'from' && (!from || from < this.ctx.today())) fail('Escolha uma data a partir de hoje.');
    const x = this.extrasOf(me);
    x.availability = state;
    x.availableFrom = state === 'from' ? from : null;
    const p = this.ctx.profiles.get(me);
    if (p) this.ctx.profiles.set(me, { ...p, available: isAvailableToday(state, x.availableFrom, this.ctx.today()) });
  }

  availabilityOf(id: string): { state: Availability; from: string | null; text: string } {
    const x = this.extrasOf(id);
    return { state: x.availability, from: x.availableFrom, text: availabilityLabel(x.availability, x.availableFrom) };
  }

  addCredit(me: string, c: { title: string; role: string; genre: Genre; year: number }): Credit {
    if (c.title.trim().length < 3) fail('Dê um título ao trabalho.');
    const credit: Credit = { ...c, title: c.title.trim(), id: `cr-${++this.seq}`, verified: false };
    this.extrasOf(me).credits.push(credit);
    return credit;
  }

  /** Só na demo: simula a confirmação do crédito pelo contratante ou pela equipe. */
  simulateConfirm(me: string, creditId: string) {
    const x = this.extrasOf(me);
    const c = x.credits.find((k) => k.id === creditId) ?? fail('Crédito não encontrado.');
    if (c.verified) return;
    c.verified = true;
    x.progress.xp += XP.creditVerified;
  }

  toggleBusy(me: string, date: string) {
    const x = this.extrasOf(me);
    if (x.blocked.has(date)) x.blocked.delete(date);
    else x.blocked.add(date);
  }
}
