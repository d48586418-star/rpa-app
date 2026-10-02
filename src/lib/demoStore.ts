import { PERSONAS, personaById, personaByKey } from '../constants/personas';
import { filterCandidates, matchPair, type DiscoverFilters } from './matching';
import type { Match, Message, Profile } from './types';

/** Conta criada pelo cadastro livre na demo (as personas têm contas próprias). */
export const DEMO_ME = 'demo-me';

/** Personas que já curtiram a conta nova, para o fluxo de match aparecer logo. */
const LIKES_NEWCOMER = ['e1', 'e3', 'f1', 'f3'];

const GENERIC_REPLIES = [
  'Oi! Adorei seu perfil. Você está livre nas próximas semanas?',
  'Show! Posso te mandar o roteiro e as datas ainda hoje.',
  'Combinado. Me passa seu portfólio atualizado que eu levo pra equipe.',
];

type Listener = () => void;
export type MatchWithOther = Match & { other: Profile };

export class DemoStore {
  replyDelayMs = 1200;
  private active: string | null = null;
  private profiles = new Map<string, Profile>();
  private likes = new Set<string>(); // "de>para"
  private swiped = new Map<string, Set<string>>(); // quem já avaliou quem
  private matches: Match[] = [];
  private messages: Message[] = [];
  private seq = 0;
  private replyCount = new Map<string, number>();
  private matchListeners = new Set<Listener>();
  private msgListeners = new Map<string, Set<(m: Message) => void>>();

  constructor() {
    this.reset();
  }

  /** Volta tudo ao estado inicial: personas, likes pré-existentes, sem matches nem mensagens. */
  reset() {
    this.profiles.clear();
    this.likes.clear();
    this.swiped.clear();
    this.matches = [];
    this.messages = [];
    this.replyCount.clear();
    for (const p of PERSONAS) this.profiles.set(p.profile.id, { ...p.profile });
    for (const p of PERSONAS) {
      for (const k of p.preLikes) this.recordLike(p.profile.id, personaByKey(k)!.profile.id);
    }
    this.addNewcomerLikes();
  }

  /** Zera só a conta do cadastro livre (perfil, avaliações e matches dela). */
  resetNewUser() {
    this.profiles.delete(DEMO_ME);
    this.swiped.delete(DEMO_ME);
    for (const l of [...this.likes]) if (l.endsWith(`>${DEMO_ME}`) || l.startsWith(`${DEMO_ME}>`)) this.likes.delete(l);
    const gone = new Set(this.matches.filter((m) => m.user_a === DEMO_ME || m.user_b === DEMO_ME).map((m) => m.id));
    this.matches = this.matches.filter((m) => !gone.has(m.id));
    this.messages = this.messages.filter((m) => !gone.has(m.match_id));
    this.addNewcomerLikes();
  }

  private addNewcomerLikes() {
    for (const k of LIKES_NEWCOMER) this.recordLike(personaByKey(k)!.profile.id, DEMO_ME);
  }

  private recordLike(from: string, to: string) {
    this.likes.add(`${from}>${to}`);
    this.markSwiped(from, to);
  }

  private markSwiped(from: string, to: string) {
    const s = this.swiped.get(from) ?? new Set<string>();
    s.add(to);
    this.swiped.set(from, s);
  }

  /** Define quem está logado (usado para decidir quando o outro lado responde no chat). */
  setActive(id: string | null) {
    this.active = id;
  }

  profileOf(id: string): Profile | null {
    return this.profiles.get(id) ?? null;
  }

  saveProfile(p: Profile) {
    this.profiles.set(p.id, { ...p });
  }

  candidates(me: string, filters: DiscoverFilters): Profile[] {
    const all = [...this.profiles.values()];
    return filterCandidates(all, me, this.swiped.get(me) ?? new Set(), filters);
  }

  /** Registra o swipe; retorna true se o like gerou match (a outra pessoa já tinha curtido). */
  swipe(me: string, targetId: string, direction: 'like' | 'pass'): boolean {
    this.markSwiped(me, targetId);
    if (direction !== 'like') return false;
    this.likes.add(`${me}>${targetId}`);
    if (!this.likes.has(`${targetId}>${me}`)) return false;
    const [a, b] = matchPair(me, targetId);
    if (this.matches.some((m) => m.user_a === a && m.user_b === b)) return false;
    this.matches.unshift({ id: `m-${++this.seq}`, user_a: a, user_b: b, created_at: new Date().toISOString() });
    this.matchListeners.forEach((l) => l());
    return true;
  }

  listMatches(me: string): MatchWithOther[] {
    return this.matches
      .filter((m) => m.user_a === me || m.user_b === me)
      .map((m) => ({ ...m, other: this.profiles.get(m.user_a === me ? m.user_b : m.user_a)! }));
  }

  listMessages(matchId: string): Message[] {
    return this.messages.filter((m) => m.match_id === matchId);
  }

  send(matchId: string, senderId: string, body: string) {
    const match = this.matches.find((m) => m.id === matchId);
    if (!match) throw new Error('Conversa não encontrada.');
    if (senderId !== match.user_a && senderId !== match.user_b) throw new Error('Você não participa desta conversa.');
    this.push({ id: `msg-${++this.seq}`, match_id: matchId, sender_id: senderId, body, created_at: new Date().toISOString() });
    if (senderId !== this.active) return; // só quem está logado dispara resposta
    const otherId = match.user_a === senderId ? match.user_b : match.user_a;
    const persona = personaById(otherId);
    if (!persona) return;
    const n = this.replyCount.get(matchId) ?? 0;
    this.replyCount.set(matchId, n + 1);
    const pool = persona.replies.length ? persona.replies : GENERIC_REPLIES;
    const reply = pool[n % pool.length];
    setTimeout(() => this.send(matchId, otherId, reply), this.replyDelayMs);
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
