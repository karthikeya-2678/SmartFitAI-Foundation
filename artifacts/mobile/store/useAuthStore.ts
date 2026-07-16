import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  /** Supabase session (null = not authenticated) */
  session: Session | null;
  /** Supabase user object */
  user: User | null;
  /** True after first session check completes */
  isInitialized: boolean;
  /** True during an async auth operation */
  isLoading: boolean;

  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isInitialized: false,
  isLoading: false,

  setSession: (session) =>
    set({ session, user: session?.user ?? null }),

  setLoading: (isLoading) => set({ isLoading }),

  setInitialized: () => set({ isInitialized: true }),

  reset: () =>
    set({ session: null, user: null, isLoading: false }),
}));
