import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { api } from './api';
import type { LoginResponse, User } from './types';

interface AuthContextValue {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readSavedUser(): User | null {
  try {
    const raw = localStorage.getItem('ems_user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    localStorage.removeItem('ems_user');
    localStorage.removeItem('ems_token');
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readSavedUser);

  async function signIn(email: string, password: string) {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    const { token, ...profile } = response.data;
    localStorage.setItem('ems_token', token);
    localStorage.setItem('ems_user', JSON.stringify(profile));
    setUser(profile);
  }

  function signOut() {
    localStorage.removeItem('ems_token');
    localStorage.removeItem('ems_user');
    setUser(null);
  }

  const value = useMemo(() => ({ user, signIn, signOut }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
