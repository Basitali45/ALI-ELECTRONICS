import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { getSupabase } from '../lib/supabase';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { username: string } | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Remove stale tokens left by the old localStorage-based login
    localStorage.removeItem('ali_electronic_token');
    localStorage.removeItem('ali_electronics_token');

    checkCurrentAuth();

    // Keep UI in sync with the real Supabase session (expiry, logout in another tab, refresh)
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
      setUser(session?.user?.email ? { username: session.user.email } : null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function checkCurrentAuth() {
    try {
      const email = await api.getSessionEmail();
      if (email) {
        setIsAuthenticated(true);
        setUser({ username: email });
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const data = await api.login(email, password);
    setIsAuthenticated(true);
    setUser(data.user);
  }

  async function logout() {
    await api.logout();
    setIsAuthenticated(false);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  user: null,
  loading: false,
  login: async () => {},
  logout: () => {},
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) return defaultAuthContext;
  return ctx;
}
