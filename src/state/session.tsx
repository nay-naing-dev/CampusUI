import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import type { RegisterInput, User } from '@/lib/api/types';

type SessionValue = {
  user: User | null;
  /** Browsing without an account: can look, can't sell or message. */
  isGuest: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  continueAsGuest: () => void;
  logout: () => void;
  /** Swap in a fresh copy of the user after the API changed it. */
  setUser: (user: User) => void;
};

const SessionContext = createContext<SessionValue | null>(null);

// Kept in memory only. With the real API this would hold a JWT in expo-secure-store.
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    const signedIn = await api.auth.login(email, password);
    setUser(signedIn);
    setIsGuest(false);
    return signedIn;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const created = await api.auth.register(input);
    setUser(created);
    setIsGuest(false);
    return created;
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      user,
      isGuest,
      login,
      register,
      continueAsGuest: () => {
        setUser(null);
        setIsGuest(true);
      },
      logout: () => {
        setUser(null);
        setIsGuest(false);
      },
      setUser,
    }),
    [user, isGuest, login, register],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside SessionProvider');
  return value;
}
