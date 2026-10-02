import { PERSONAS } from '../constants/personas';
import { ROLES } from '../constants/roles';
import type { OpenProject, Profile, ProjectRole } from './types';

type Ctx = {
  profiles: Map<string, Profile>;
  today: () => string;
  ensureConversation: (a: string, b: string) => string;
};

export type NewProject = {
  title: string; description: string; city: string | null; budget_total: number; roles: string[];
};

export type ProjectCard = {
  project: OpenProject;
  ownerName: string;
  open: number; // funções ainda procurando
  total: number;
  /** Funções abertas que combinam com as funções do profissional. */
  matching: string[];
  mine: boolean;
};

const fail = (msg: string): never => { throw new Error(msg); };

export class ProjectsModule {
  private projects: OpenProject[] = [];
  private seq = 0;

  constructor(private ctx: Ctx) {}

  reset() {
    this.projects = [];
    const today = this.ctx.today();
    for (const p of PERSONAS) {
      for (const q of p.projects) {
        this.projects.push({
          id: q.key, owner_id: p.profile.id, title: q.title, description: q.description, city: q.city,
          budget_total: q.budgetTotal, created_at: today,
          roles: q.roles.map((role) => ({ role, filledBy: null, interested: [] })),
        });
      }
    }
  }

  resetUser(id: string) {
    this.projects = this.projects.filter((p) => p.owner_id !== id);
    for (const p of this.projects) {
      for (const r of p.roles) {
        r.interested = r.interested.filter((x) => x !== id);
        if (r.filledBy === id) r.filledBy = null;
      }
    }
  }

  private get(id: string): OpenProject {
    return this.projects.find((p) => p.id === id) ?? fail('Projeto não encontrado.');
  }

  private ownerName(p: OpenProject) {
    return this.ctx.profiles.get(p.owner_id)?.name ?? 'Alguém da cena';
  }

  /** Qualquer pessoa pode publicar um projeto, inclusive profissionais (perfil híbrido). */
  create(me: string, input: NewProject): OpenProject {
    if (!this.ctx.profiles.has(me)) fail('Complete seu perfil antes de publicar.');
    if (input.title.trim().length < 3) fail('Dê um título ao projeto.');
    const roles = [...new Set(input.roles)];
    if (roles.length === 0) fail('Escolha ao menos uma função que você procura.');
    for (const r of roles) if (!ROLES.includes(r as (typeof ROLES)[number])) fail('Função inválida.');
    if (!(input.budget_total >= 0)) fail('Informe um orçamento válido.');
    const project: OpenProject = {
      id: `proj-${++this.seq}`, owner_id: me, title: input.title.trim(), description: input.description.trim(),
      city: input.city, budget_total: input.budget_total, created_at: this.ctx.today(),
      roles: roles.map((role) => ({ role, filledBy: null, interested: [] })),
    };
    this.projects.unshift(project);
    return project;
  }

  /** Projetos para o profissional: os que têm função aberta parecida com a dele vêm primeiro. */
  feed(me: string): ProjectCard[] {
    const myRoles = this.ctx.profiles.get(me)?.roles ?? [];
    return this.projects
      .map((project) => {
        const open = project.roles.filter((r) => !r.filledBy);
        return {
          project, ownerName: this.ownerName(project), open: open.length, total: project.roles.length,
          matching: open.filter((r) => myRoles.includes(r.role)).map((r) => r.role), mine: project.owner_id === me,
        };
      })
      .filter((c) => c.mine || c.open > 0)
      .sort((a, b) => Number(b.mine) - Number(a.mine) || b.matching.length - a.matching.length || b.open - a.open || a.project.id.localeCompare(b.project.id));
  }

  detail(id: string, me: string) {
    const project = this.get(id);
    const owner = this.ctx.profiles.get(project.owner_id)!;
    const mine = project.owner_id === me;
    return {
      project: JSON.parse(JSON.stringify(project)) as OpenProject,
      owner, mine,
      interestedProfiles: Object.fromEntries(
        project.roles.map((r) => [r.role, r.interested.map((x) => this.ctx.profiles.get(x)).filter((x): x is Profile => Boolean(x))]),
      ) as Record<string, Profile[]>,
      filledProfiles: Object.fromEntries(
        project.roles.filter((r) => r.filledBy).map((r) => [r.role, this.ctx.profiles.get(r.filledBy!)]),
      ) as Record<string, Profile | undefined>,
      status: statusOf(project.roles),
    };
  }

  /** "Tenho interesse" em uma função. Alternar de novo retira o interesse. */
  toggleInterest(id: string, me: string, role: string): boolean {
    const project = this.get(id);
    if (project.owner_id === me) fail('Você não pode se candidatar ao próprio projeto.');
    const slot = project.roles.find((r) => r.role === role) ?? fail('Função não encontrada neste projeto.');
    if (slot.filledBy) fail('Esta função já foi preenchida.');
    const prof = this.ctx.profiles.get(me) ?? fail('Complete seu perfil antes.');
    if (prof.account_type !== 'freelancer') fail('Só profissionais marcam interesse em funções.');
    const i = slot.interested.indexOf(me);
    if (i >= 0) { slot.interested.splice(i, 1); return false; }
    slot.interested.push(me);
    return true;
  }

  /** O dono escolhe alguém que marcou interesse e a conversa é aberta no chat. Devolve o id da conversa. */
  choose(id: string, owner: string, role: string, proId: string): string {
    const project = this.get(id);
    if (project.owner_id !== owner) fail('Só quem criou o projeto escolhe a equipe.');
    const slot = project.roles.find((r) => r.role === role) ?? fail('Função não encontrada neste projeto.');
    if (slot.filledBy) fail('Esta função já foi preenchida.');
    if (!slot.interested.includes(proId)) fail('Essa pessoa não marcou interesse nesta função.');
    slot.filledBy = proId;
    return this.ctx.ensureConversation(owner, proId);
  }

  /** Abre a conversa com alguém interessado sem fechar a função ainda. */
  talk(id: string, owner: string, proId: string): string {
    const project = this.get(id);
    if (project.owner_id !== owner) fail('Só quem criou o projeto conversa com os interessados.');
    if (!project.roles.some((r) => r.interested.includes(proId) || r.filledBy === proId)) fail('Essa pessoa não marcou interesse neste projeto.');
    return this.ctx.ensureConversation(owner, proId);
  }
}

export type ProjectStatus = 'procurando' | 'quase' | 'completa';

/** "Procurando equipe", "Quase completa" (falta uma função) ou "Equipe completa". */
export function statusOf(roles: ProjectRole[]): ProjectStatus {
  const open = roles.filter((r) => !r.filledBy).length;
  return open === 0 ? 'completa' : open === 1 && roles.length > 1 ? 'quase' : 'procurando';
}

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  procurando: 'Procurando equipe',
  quase: 'Falta uma função',
  completa: 'Equipe completa',
};
