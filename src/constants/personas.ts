import data from './personas.json';
import type { AccountType, Profile } from '../lib/types';

export type Persona = {
  key: string;
  email: string;
  cargo: string;
  personality: string;
  replies: string[];
  /** Chaves das personas que esta já curtiu (um lado só; o match fecha quando a outra curte de volta). */
  preLikes: string[];
  profile: Profile;
};

export const TEST_PASSWORD: string = data.password;

export const PERSONAS: Persona[] = data.personas.map((p) => ({
  key: p.key,
  email: p.email,
  cargo: p.cargo,
  personality: p.personality,
  replies: p.replies,
  preLikes: p.pre_likes,
  profile: {
    id: p.id,
    account_type: p.account_type as AccountType,
    name: p.name,
    avatar_url: null,
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
