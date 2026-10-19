// Session de l'utilisateur : restaurée au démarrage depuis settings, exposée par un contexte.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useDb } from '@/db/DbContext';
import type { User } from '@/data/types';
import { settingsRepo } from '@/data/settings';
import { usersRepo } from '@/data/users';
import { login, register, sha256, type LoginError, type RegisterError } from '@/services/auth';

type AuthValue = {
  status: 'loading' | 'signedOut' | 'signedIn';
  user: User | null;
  signIn(email: string, password: string): Promise<LoginError | null>;
  signUp(name: string, email: string, password: string): Promise<RegisterError | null>;
  signOut(): Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const db = useDb();
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let restored: User | null = null;
      try {
        const id = await settingsRepo.get(db, 'session_user_id');
        // Un compte supprimé depuis (réinitialisation de la démo) rend l'identifiant orphelin.
        restored = id ? await usersRepo.findById(db, Number(id)) : null;
      } catch {
        // Une session illisible ne doit pas bloquer l'app : on repart déconnecté.
      }
      if (cancelled) return;
      setUser(restored);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [db]);

  const open = useCallback(
    async (u: User) => {
      await settingsRepo.set(db, 'session_user_id', String(u.id));
      setUser(u);
    },
    [db],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const res = await login(db, { email, password }, { digest: sha256 });
      if (!res.ok) return res.error;
      await open(res.user);
      return null;
    },
    [db, open],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await register(db, { name, email, password }, { digest: sha256, now: new Date() });
      if (!res.ok) return res.error;
      await open(res.user);
      return null;
    },
    [db, open],
  );

  const signOut = useCallback(async () => {
    await settingsRepo.remove(db, 'session_user_id');
    setUser(null);
  }, [db]);

  const value = useMemo<AuthValue>(
    () => ({ status: !loaded ? 'loading' : user ? 'signedIn' : 'signedOut', user, signIn, signUp, signOut }),
    [loaded, user, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth doit être appelé sous un AuthProvider');
  return value;
}
