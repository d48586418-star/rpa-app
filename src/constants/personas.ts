import data from './personas.json';
import { PERSONA_PHOTO, photoRef } from '../lib/photoKeys';
import type { AccountType, Credit, Genre, Profile, Reputation } from '../lib/types';
import type { Progress } from '../lib/xp';

export type PersonaJob = {
  key: string;
  title: string;
  role: string;
  genre: Genre;
  offsetDays: number;
  city: string | null;
  days: number;
  budgetPerDay: number;
  gear: string[];
  description: string;
};

export type Availability = 'now' | 'open' | 'busy' | 'from';

export type PersonaProject = {
  key: string;
  title: string;
  description: string;
  city: string | null;
  budgetTotal: number;
  roles: string[];
};

export type PersonaExtras = {
  availability: Availability;
  availableFromOffset: number | null;
  radiusKm: number;
  createdDaysAgo: number;
  blockedOffsets: number[];
  credits: Omit<Credit, 'id'>[];
  reputation: Reputation;
  trainingBadges: string[];
  progress: Progress;
};

export type Persona = {
  key: string;
  email: string;
  cargo: string;
  personality: string;
  replies: string[];
  /** Chaves das personas que esta já curtiu (um lado só; o match fecha quando a outra curte de volta). */
  preLikes: string[];
  profile: Profile;
  extras: PersonaExtras;
  jobs: PersonaJob[];
  projects: PersonaProject[];
};

export const TEST_PASSWORD: string = data.password;

export const PERSONAS: Persona[] = data.personas.map((p) => ({
  key: p.key,
  email: p.email,
  cargo: p.cargo,
  personality: p.personality,
  replies: p.replies,
  preLikes: p.pre_likes,
  extras: {
    availability: p.availability as Availability,
    availableFromOffset: (p as { available_from_offset?: number }).available_from_offset ?? null,
    radiusKm: p.radius_km,
    createdDaysAgo: p.created_days_ago,
    blockedOffsets: p.blocked_offsets,
    credits: p.credits as Omit<Credit, 'id'>[],
    reputation: {
      ratingAvg: p.reputation.rating_avg,
      ratingCount: p.reputation.rating_count,
      attendance: p.reputation.attendance,
      onTime: p.reputation.on_time,
    },
    trainingBadges: p.training_badges,
    progress: {
      xp: p.progress.xp,
      jobsDone: p.progress.jobs_done,
      onTimeCheckins: p.progress.on_time_checkins,
      onTimeDeliveries: p.progress.on_time_deliveries,
      pioneer: p.progress.pioneer,
    },
  },
  projects: p.projects.map((q) => ({
    key: q.key, title: q.title, description: q.description, city: q.city, budgetTotal: q.budget_total, roles: q.roles,
  })),
  jobs: p.jobs.map((j) => ({
    key: j.key,
    title: j.title,
    role: j.role,
    genre: j.genre as Genre,
    offsetDays: j.offset_days,
    city: j.city,
    days: j.days,
    budgetPerDay: j.budget_per_day,
    gear: j.gear,
    description: j.description,
  })),
  profile: {
    id: p.id,
    account_type: p.account_type as AccountType,
    name: p.name,
    avatar_url: PERSONA_PHOTO[p.key] ? photoRef(PERSONA_PHOTO[p.key]) : null,
    city: p.city,
    bio: p.bio,
    roles: p.roles,
    day_rate_min: p.day_rate_min,
    day_rate_max: p.day_rate_max,
    available: p.available,
    portfolio_links: p.portfolio_links,
    gear: p.gear,
    website: p.website,
  },
}));

export const personaByKey = (key: string) => PERSONAS.find((p) => p.key === key);
export const personaById = (id: string) => PERSONAS.find((p) => p.profile.id === id);
export const personaByEmail = (email: string) =>
  PERSONAS.find((p) => p.email === email.trim().toLowerCase());
