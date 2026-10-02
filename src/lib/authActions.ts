import { TEST_PASSWORD, personaByEmail } from '../constants/personas';
import { isDemo } from './demo';
import { DEMO_ME, demoStore } from './demoStore';
import { supabase } from './supabase';

export type AppSession = { user: { id: string } };
type Result = { error: string | null; needsConfirmation?: boolean };

let current: AppSession | null = null;
const listeners = new Set<(s: AppSession | null) => void>();

const setDemo = (id: string | null) => {
  current = id ? { user: { id } } : null;
  demoStore.setActive(id);
  listeners.forEach((l) => l(current));
};

export async function signIn(email: string, password: string): Promise<Result> {
  if (isDemo) {
    if (!email.trim()) return { error: 'Informe um e-mail.' };
    const persona = personaByEmail(email);
    if (persona) {
      if (password !== TEST_PASSWORD) return { error: `Senha incorreta. Nas personas de teste a senha é ${TEST_PASSWORD}.` };
      setDemo(persona.profile.id);
      return { error: null };
    }
    setDemo(DEMO_ME); // qualquer outro e-mail entra na conta livre da demo
    return { error: null };
  }
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  return { error: error?.message ?? null };
}

export async function signUp(email: string, password: string): Promise<Result> {
  if (isDemo) {
    demoStore.resetNewUser();
    setDemo(DEMO_ME);
    return { error: null };
  }
  const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
  return { error: error?.message ?? null, needsConfirmation: !error && !data.session };
}

export async function signOut(): Promise<void> {
  if (isDemo) return setDemo(null);
  await supabase.auth.signOut();
}

/** Só na demo: apaga likes, matches e mensagens feitos e volta ao estado inicial. */
export async function resetDemo(): Promise<void> {
  if (!isDemo) return;
  demoStore.reset();
  setDemo(null);
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
