import { filterCandidates, type DiscoverFilters } from './matching';
import type { Match, Message, Profile } from './types';

export const DEMO_ME = 'demo-me';

type Seed = Profile & { likesBack: boolean };

const base = {
  avatar_url: null, website: null, gear: null, portfolio_links: [] as string[],
  day_rate_min: null, day_rate_max: null, available: true, bio: null,
};

const SEEDS: Seed[] = [
  { ...base, id: 'd1', account_type: 'empresa', name: 'Lume Filmes', city: 'São Paulo', roles: ['Diretor(a) de Fotografia', 'Operador(a) de Câmera'], bio: 'Produtora de publicidade e videoclipes. Procuramos equipe para campanhas de moda neste trimestre.', website: '@lumefilmes', likesBack: true },
  { ...base, id: 'd2', account_type: 'empresa', name: 'Casa Vermelha Produções', city: 'Rio de Janeiro', roles: ['Editor(a)', 'Colorista'], bio: 'Documentários e séries para streaming. Pós-produção remota ou presencial.', website: 'casavermelha.example', likesBack: false },
  { ...base, id: 'd3', account_type: 'empresa', name: 'Estúdio Neon', city: 'Belo Horizonte', roles: ['Motion Designer', 'VFX / Animador(a)'], bio: 'Vinhetas, lyric videos e animação 2D/3D para marcas.', available: false, likesBack: true },
  { ...base, id: 'd4', account_type: 'empresa', name: 'Pulso Audiovisual', city: 'Curitiba', roles: ['Técnico(a) de Som Direto', 'Desenhista de Som'], bio: 'Cobertura de shows e festivais. Equipe de som sempre bem-vinda.', likesBack: false },
  { ...base, id: 'f1', account_type: 'freelancer', name: 'Marina Duarte', city: 'São Paulo', roles: ['Diretor(a) de Fotografia'], bio: 'DP com 8 anos em publicidade e ficção. Disponível para diárias e projetos longos.', day_rate_min: 1800, day_rate_max: 2800, gear: 'FX6, lentes Sigma Cine, Aputure 600d', portfolio_links: ['vimeo.com/marinaduarte'], likesBack: true },
  { ...base, id: 'f2', account_type: 'freelancer', name: 'Caio Ribeiro', city: 'Rio de Janeiro', roles: ['Editor(a)', 'Colorista'], bio: 'Edição e color grading para documentário e clipes. DaVinci Resolve.', day_rate_min: 900, day_rate_max: 1500, likesBack: false },
  { ...base, id: 'f3', account_type: 'freelancer', name: 'Joana Alencar', city: 'Recife', roles: ['Técnico(a) de Som Direto'], bio: 'Som direto para cinema e TV, equipe própria de boom e mixer.', day_rate_min: 1200, day_rate_max: 1900, available: false, likesBack: true },
  { ...base, id: 'f4', account_type: 'freelancer', name: 'Theo Nakamura', city: 'São Paulo', roles: ['Motion Designer', 'VFX / Animador(a)'], bio: 'Motion para redes e TV, After Effects e Cinema 4D.', day_rate_min: 700, day_rate_max: 1300, likesBack: false },
  { ...base, id: 'f5', account_type: 'freelancer', name: 'Bia Camargo', city: 'Porto Alegre', roles: ['Direção de Arte', 'Figurinista'], bio: 'Direção de arte para curtas e publicidade, com acervo próprio de objetos de cena.', day_rate_min: 800, day_rate_max: 1400, likesBack: false },
];

const REPLIES = [
  'Oi! Adorei seu perfil. Você está livre nas próximas semanas?',
  'Show! Posso te mandar o roteiro e as datas ainda hoje.',
  'Combinado. Tenho uma diária na semana que vem, topa conversar?',
  'Boa! Me passa seu portfólio atualizado que eu levo pra equipe.',
];

type Listener = () => void;

export class DemoStore {
  me: Profile | null = null;
  private profiles: Seed[] = SEEDS.map((s) => ({ ...s }));
  private swiped = new Set<string>();
  private matches: Match[] = [];
  private messages: Message[] = [];
  private seq = 0;
  private replyIdx = 0;
  private matchListeners = new Set<Listener>();
  private msgListeners = new Map<string, Set<(m: Message) => void>>();
  replyDelayMs = 1200;

  /** Conta nova: zera perfil, swipes, matches e mensagens. */
  reset() {
    this.me = null;
    this.swiped.clear();
    this.matches = [];
    this.messages = [];
  }

  saveProfile(p: Profile) {
    this.me = { ...p, id: DEMO_ME };
  }

  candidates(filters: DiscoverFilters): Profile[] {
    return filterCandidates(this.profiles, DEMO_ME, this.swiped, filters);
  }

  /** Registra o swipe; retorna true se gerou match (só com perfis que "curtem de volta"). */
  swipe(targetId: string, direction: 'like' | 'pass'): boolean {
    this.swiped.add(targetId);
    if (direction !== 'like') return false;
    const target = this.profiles.find((p) => p.id === targetId);
    if (!target?.likesBack) return false;
    if (this.matches.some((m) => m.user_a === targetId || m.user_b === targetId)) return false;
    this.matches.unshift({
      id: `m-${++this.seq}`, user_a: DEMO_ME, user_b: targetId, created_at: new Date().toISOString(),
    });
    this.matchListeners.forEach((l) => l());
    return true;
  }

  listMatches(): (Match & { other: Profile })[] {
    return this.matches.map((m) => ({ ...m, other: this.profiles.find((p) => p.id === m.user_b)! }));
  }

  listMessages(matchId: string): Message[] {
    return this.messages.filter((m) => m.match_id === matchId);
  }

  send(matchId: string, senderId: string, body: string) {
    if (!this.matches.some((m) => m.id === matchId)) throw new Error('Conversa não encontrada.');
    this.push({ id: `msg-${++this.seq}`, match_id: matchId, sender_id: senderId, body, created_at: new Date().toISOString() });
    if (senderId !== DEMO_ME) return;
    const match = this.matches.find((m) => m.id === matchId)!;
    const reply = REPLIES[this.replyIdx++ % REPLIES.length];
    setTimeout(() => this.send(matchId, match.user_b, reply), this.replyDelayMs);
  }

  private push(m: Message) {
    this.messages.push(m);
    this.msgListeners.get(m.match_id)?.forEach((l) => l(m));
  }

  onMatches(cb: Listener) {
    this.matchListeners.add(cb);
    return () => { this.matchListeners.delete(cb); };
  }

  onMessages(matchId: string, cb: (m: Message) => void) {
    const set = this.msgListeners.get(matchId) ?? new Set();
    set.add(cb);
    this.msgListeners.set(matchId, set);
    return () => { set.delete(cb); };
  }
}

export const demoStore = new DemoStore();
