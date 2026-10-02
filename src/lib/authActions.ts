import { isDemo } from './demo';
import { DEMO_ME, demoStore } from './demoStore';
import { supabase } from './supabase';

export type AppSession = { user: { id: string } };
type Result = { error: string | null; needsConfirmation?: boolean };

const demoSession: AppSession = { user: { id: DEMO_ME } };
let current: AppSession | null = null;
const listeners = new Set<(s: AppSession | null) => void>();

const setDemo = (s: AppSession | null) => {
  current = s;
  listeners.forEach((l) => l(s));
};

export async function signIn(email: string, password: string): Promise<Result> {
  if (isDemo) {
    if (!email.trim()) return { error: 'Informe um e-mail (na demo, qualquer um serve).' };
    setDemo(demoSession);
    return { error: null };
  }
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  return { error: error?.message ?? null };
}

export async function signUp(email: string, password: string): Promise<Result> {
  if (isDemo) {
    demoStore.reset();
    setDemo(demoSession);
    return { error: null };
  }
  const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
  return { error: error?.message ?? null, needsConfirmation: !error && !data.session };
}

export async function signOut(): Promise<void> {
  if (isDemo) return setDemo(null);
  await supabase.auth.signOut();
}

export async function getSession(): Promise<AppSession | null> {
  if (isDemo) return current;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthChange(cb: (s: AppSession | null) => void): () => void {
  if (isDemo) {
    listeners.add(cb);
    return () => { listeners.delete(cb); };
  }
  const { data } = supabase.auth.onAuthStateChange((_e, s) => cb(s));
  return () => data.subscription.unsubscribe();
}
