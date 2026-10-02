import { isDemo } from './demo';
import { demoStore } from './demoStore';
import { supabase } from './supabase';
import type { Match, Message, Profile } from './types';
import { filterCandidates, type DiscoverFilters } from './matching';

const PROFILE_COLS =
  'id,account_type,website,name,avatar_url,city,bio,roles,day_rate_min,day_rate_max,available,portfolio_links,gear';

export async function fetchMyProfile(userId: string): Promise<Profile | null> {
  if (isDemo) return demoStore.profileOf(userId);
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLS)
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function upsertProfile(profile: Profile): Promise<void> {
  if (isDemo) return demoStore.saveProfile(profile);
  const { error } = await supabase.from('profiles').upsert(profile);
  if (error) throw error;
}

export async function uploadAvatar(userId: string, uri: string): Promise<string> {
  if (isDemo) return uri;
  const res = await fetch(uri);
  const buffer = await res.arrayBuffer();
  const path = `${userId}/avatar-${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, buffer, { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
}

export async function fetchCandidates(
  me: string,
  filters: DiscoverFilters,
): Promise<Profile[]> {
  if (isDemo) return demoStore.candidates(me, filters);
  const [{ data: profiles, error: e1 }, { data: swipes, error: e2 }] = await Promise.all([
    supabase.from('profiles').select(PROFILE_COLS).neq('id', me).limit(200),
    supabase.from('swipes').select('target_id').eq('swiper_id', me),
  ]);
  if (e1) throw e1;
  if (e2) throw e2;
  const swiped = new Set((swipes ?? []).map((s) => s.target_id as string));
  return filterCandidates((profiles ?? []) as Profile[], me, swiped, filters);
}

/** Registra o swipe. Retorna true se o like gerou um match. */
export async function recordSwipe(
  me: string,
  target: string,
  direction: 'like' | 'pass',
): Promise<boolean> {
  if (isDemo) return demoStore.swipe(me, target, direction);
  const { error } = await supabase
    .from('swipes')
    .insert({ swiper_id: me, target_id: target, direction });
  if (error) throw error;
  if (direction !== 'like') return false;
  const a = me < target ? me : target;
  const b = me < target ? target : me;
  const { data } = await supabase
    .from('matches')
    .select('id')
    .eq('user_a', a)
    .eq('user_b', b)
    .maybeSingle();
  return Boolean(data);
}

export type MatchWithProfile = Match & { other: Profile };

export async function fetchMatches(me: string): Promise<MatchWithProfile[]> {
  if (isDemo) return demoStore.listMatches(me);
  const { data, error } = await supabase
    .from('matches')
    .select('id,user_a,user_b,created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  const matches = (data ?? []) as Match[];
  if (!matches.length) return [];
  const otherIds = matches.map((m) => (m.user_a === me ? m.user_b : m.user_a));
  const { data: profiles, error: e2 } = await supabase
    .from('profiles')
    .select(PROFILE_COLS)
    .in('id', otherIds);
  if (e2) throw e2;
  const byId = new Map((profiles as Profile[]).map((p) => [p.id, p]));
  return matches
    .map((m) => ({ ...m, other: byId.get(m.user_a === me ? m.user_b : m.user_a)! }))
    .filter((m) => m.other);
}

export async function fetchMessages(matchId: string): Promise<Message[]> {
  if (isDemo) return demoStore.listMessages(matchId);
  const { data, error } = await supabase
    .from('messages')
    .select('id,match_id,sender_id,body,created_at')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true })
    .limit(500);
  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function sendMessage(matchId: string, senderId: string, body: string) {
  if (isDemo) return demoStore.send(matchId, senderId, body.trim());
  const { error } = await supabase
    .from('messages')
    .insert({ match_id: matchId, sender_id: senderId, body: body.trim() });
  if (error) throw error;
}

/** Novas mensagens de uma conversa (Realtime no Supabase, emissor local na demo). */
export function subscribeMessages(matchId: string, onMessage: (m: Message) => void): () => void {
  if (isDemo) return demoStore.onMessages(matchId, onMessage);
  const ch = supabase
    .channel(`chat-${matchId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
      (payload) => onMessage(payload.new as Message),
    )
    .subscribe();
  return () => { supabase.removeChannel(ch); };
}

/** Novos matches (Realtime no Supabase, emissor local na demo). */
export function subscribeMatches(onMatch: () => void): () => void {
  if (isDemo) return demoStore.onMatches(onMatch);
  const ch = supabase
    .channel('matches-feed')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches' }, onMatch)
    .subscribe();
  return () => { supabase.removeChannel(ch); };
}

// ---------- Jobs (só na demo por enquanto) ----------

import type { Action } from './engagement';
import type { Credit, Genre, ReviewScores } from './types';
import type { CandidateRow, EngagementView, JobCard, JobDetail, NewJob, OwnerJobRow, ProgressView } from './demoJobs';

export type { CandidateRow, EngagementView, JobCard, JobDetail, NewJob, OwnerJobRow, ProgressView };

/** O backend Supabase dos jobs ainda não existe: a aba Jobs só aparece na demo. */
export const jobsEnabled = isDemo;

const demoOnly = (): never => {
  throw new Error('Jobs ainda não estão disponíveis fora da demo.');
};
const jobs = () => (isDemo ? demoStore.jobs : demoOnly());

export const fetchJobFeed = async (me: string): Promise<JobCard[]> => jobs().feedForPro(me);
export const fetchMyJobs = async (me: string): Promise<OwnerJobRow[]> => jobs().feedForOwner(me);
export const fetchJob = async (jobId: string, me: string): Promise<JobDetail> => jobs().detail(jobId, me);
export const createJob = async (me: string, input: NewJob) => jobs().createJob(me, input);
export const fetchJobDeck = async (me: string): Promise<JobCard[]> => jobs().deckForPro(me);
export const fetchSavedJobs = async (me: string): Promise<JobCard[]> => jobs().savedForPro(me);
export const skipJob = async (jobId: string, me: string) => jobs().skip(jobId, me);
export const saveJob = async (jobId: string, me: string) => jobs().save(jobId, me);
export const undoJobChoice = async (jobId: string, me: string) => jobs().undo(jobId, me);
export const applyToJob = async (jobId: string, me: string) => jobs().apply(jobId, me);
export const inviteCandidate = async (jobId: string, me: string, proId: string) => jobs().invite(jobId, me, proId);
export const selectCandidate = async (jobId: string, me: string, proId: string) => jobs().select(jobId, me, proId);
export const actOnEngagement = async (
  jobId: string, me: string, action: Action, payload?: { scores: ReviewScores; tip?: string },
) => jobs().act(jobId, me, action, payload);
export const fetchProgress = async (me: string): Promise<ProgressView> => jobs().progress(me);
export const addCredit = async (me: string, c: { title: string; role: string; genre: Genre; year: number }): Promise<Credit> => jobs().addCredit(me, c);
export const confirmCreditDemo = async (me: string, creditId: string) => jobs().simulateConfirm(me, creditId);
export const toggleBusyDay = async (me: string, date: string) => jobs().toggleBusy(me, date);

// ---------- Projetos abertos, disponibilidade, Cena e Início (só na demo) ----------

import { upcomingCena, type CenaView } from './cena';
import type { NewProject, ProjectCard } from './demoProjects';
import type { Availability, CenaKind, OpenProject } from './types';
import { oppositeType } from './matching';
import { textMatches } from './search';
import { genreLabel } from '../constants/genres';

export type { NewProject, ProjectCard, CenaView };

const projects = () => (isDemo ? demoStore.projects : demoOnly());

export const fetchProjects = async (me: string): Promise<ProjectCard[]> => projects().feed(me);
export const fetchProject = async (id: string, me: string) => projects().detail(id, me);
export const createProject = async (me: string, input: NewProject): Promise<OpenProject> => projects().create(me, input);
export const toggleProjectInterest = async (id: string, me: string, role: string) => projects().toggleInterest(id, me, role);
export const chooseForRole = async (id: string, me: string, role: string, proId: string) => projects().choose(id, me, role, proId);
export const talkToInterested = async (id: string, me: string, proId: string) => projects().talk(id, me, proId);
export const setMyAvailability = async (me: string, state: Availability, from: string | null = null) => jobs().setAvailability(me, state, from);
export const fetchCena = async (opts: { kind?: CenaKind; city?: string; limit?: number } = {}): Promise<CenaView[]> =>
  upcomingCena(isDemo ? demoStore.todayISO() : demoOnly(), opts);

/** Tudo que o Início mostra, numa chamada só. */
export async function fetchHome(me: string) {
  if (!isDemo) return demoOnly();
  const profile = demoStore.profileOf(me);
  const isOwner = profile?.account_type === 'empresa';
  return {
    profile,
    isOwner,
    jobs: isOwner ? demoStore.jobs.feedForOwner(me).slice(0, 3) : [],
    matchingJobs: isOwner ? [] : demoStore.jobs.feedForPro(me).slice(0, 3),
    projects: demoStore.projects.feed(me).slice(0, 3),
    people: profile ? demoStore.candidates(me, { accountType: oppositeType(profile.account_type) }).slice(0, 6) : [],
    cena: upcomingCena(demoStore.todayISO(), { limit: 3 }),
    conversations: demoStore.listMatches(me).length,
    recent: demoStore.listMatches(me).slice(0, 2),
  };
}
export type HomeData = Awaited<ReturnType<typeof fetchHome>>;

// ---------- Rede (só na demo) ----------

import type { NewPost, PostView } from './demoFeed';
export type { NewPost, PostView };

const feed = () => (isDemo ? demoStore.feed : demoOnly());

export const fetchPosts = async (me: string, opts: { authorId?: string; savedOnly?: boolean } = {}): Promise<PostView[]> => feed().list(me, opts);
export const createPost = async (me: string, input: NewPost) => feed().create(me, input);
export const likePost = async (id: string, me: string) => feed().toggleLike(id, me);
export const savePost = async (id: string, me: string) => feed().toggleSave(id, me);
export const commentOnPost = async (id: string, me: string, body: string) => feed().comment(id, me, body);
export const fetchPostComments = async (id: string) => feed().commentViews(id);

/** Busca do Início: vagas abertas e pessoas cujo texto contém o termo (sem acento, sem maiúsculas). */
export async function fetchSearch(me: string, q: string): Promise<{ jobs: JobCard[]; people: Profile[] }> {
  if (!isDemo) return demoOnly();
  const profile = demoStore.profileOf(me);
  const jobsFound = profile?.account_type === 'empresa'
    ? []
    : demoStore.jobs.feedForPro(me).filter((c) => textMatches(q, c.job.title, c.job.role, c.job.city ?? 'remoto', genreLabel(c.job.genre), c.ownerName));
  const people = profile
    ? demoStore.candidates(me, { accountType: oppositeType(profile.account_type) })
        .filter((p) => textMatches(q, p.name, p.city ?? '', ...p.roles))
    : [];
  return { jobs: jobsFound.slice(0, 6), people: people.slice(0, 6) };
}
