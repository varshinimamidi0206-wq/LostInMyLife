import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithPassword: (email: string, password: string) => Promise<{ data: any; error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ data: any; error: Error | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase is not configured with valid URL & Key.');
      setLoading(false);
      return;
    }

    // 1. Check active session on startup
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error fetching Supabase session:', error);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Listen to authentication state changes (SIGN_IN, SIGN_OUT, TOKEN_REFRESHED, USER_UPDATED)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
    if (!isSupabaseConfigured || !supabase) {
      const err = new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.');
      return { error: err };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      return { error: err };
    }
  };

  const signInWithPassword = async (email: string, password: string): Promise<{ data: any; error: Error | null }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: new Error('Supabase is not configured.') };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  const signUp = async (email: string, password: string): Promise<{ data: any; error: Error | null }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: new Error('Supabase is not configured.') };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  const resetPasswordForEmail = async (email: string): Promise<{ error: Error | null }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: new Error('Supabase is not configured.') };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const updatePassword = async (password: string): Promise<{ error: Error | null }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: new Error('Supabase is not configured.') };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Sign Out Error:', err);
      }
    }
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithGoogle,
        signInWithPassword,
        signUp,
        resetPasswordForEmail,
        updatePassword,
        signOut,
        isConfigured: isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
