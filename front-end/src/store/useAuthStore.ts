// src/store/useAuthStore.ts
// Global auth state. Stores Supabase session + synced backend User.
// Persists across restarts via Supabase's own AsyncStorage persistence.

import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { create } from 'zustand';

import { User, usersApi } from '@/services/api';
import { supabase } from '@/services/supabase';

interface AuthState {
  session: Session | null;
  supabaseUser: SupabaseUser | null;
  backendUser: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  supabaseUser: null,
  backendUser: null,
  isLoading: false,
  error: null,

  /**
   * Called once on app startup (_layout.tsx).
   * Restores existing session from storage and syncs backend user.
   */
  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        set({ session, supabaseUser: session.user });
        await syncBackendUser(session, set);
      }
    } catch (err) {
      console.error('[Auth] initialize error:', err);
      set({ error: (err as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Trigger Google OAuth sign-in via Supabase.
   * Uses expo-auth-session under the hood (Supabase handles the redirect).
   */
  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Deep link scheme — must match app.json scheme
          redirectTo: 'jeda://auth/callback',
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) throw error;
      // Session will arrive via onAuthStateChange listener in initialize()
    } catch (err) {
      console.error('[Auth] signInWithGoogle error:', err);
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    await supabase.auth.signOut();
    set({
      session: null,
      supabaseUser: null,
      backendUser: null,
      isLoading: false,
      error: null,
    });
  },

  setSession: (session) => {
    set({ session, supabaseUser: session?.user ?? null });
    if (session) {
      syncBackendUser(session, set).catch(console.error);
    }
  },
}));

// --------------------------------------------------------------------------
// Helper: sync Supabase user into our backend DB
// --------------------------------------------------------------------------

async function syncBackendUser(
  session: Session,
  set: (partial: Partial<AuthState>) => void
) {
  try {
    const { user } = session;
    const result = await usersApi.sync({
      email: user.email ?? '',
      display_name:
        user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? '',
      avatar_url: user.user_metadata?.avatar_url ?? '',
    });
    set({ backendUser: result.user });
  } catch (err) {
    // Non-fatal: app can still work with local Supabase session
    console.error('[Auth] syncBackendUser error:', err);
  }
}
