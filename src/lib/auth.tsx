import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getSession, onAuthChange, type AppSession } from './authActions';

type AuthState = { session: AppSession | null; loading: boolean };
const AuthContext = createContext<AuthState>({ session: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AppSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession()
      .then(setSession)
      .finally(() => setLoading(false));
    return onAuthChange(setSession);
  }, []);

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
