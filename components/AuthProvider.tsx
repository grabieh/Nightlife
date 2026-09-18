'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  profileMissing: boolean;
}

const AuthContext = createContext<AuthContextValue>({ session: null, user: null, isLoading: true, profileMissing: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileMissing, setProfileMissing] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    let mounted = true;

    const applySession = async (nextSession: Session | null) => {
      if (!nextSession) {
        if (mounted) {
          setSession(null);
          setIsLoading(false);
        }
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', nextSession.user.id)
        .maybeSingle();

      if (error) {
        if (mounted) setIsLoading(false);
        return;
      }

      if (!profile) {
        if (mounted) setProfileMissing(true);
        await supabase.auth.signOut();
        if (mounted) {
          setSession(null);
          setIsLoading(false);
        }
        return;
      }

      if (mounted) {
        setProfileMissing(false);
        setSession(nextSession);
        setIsLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data }) => applySession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setTimeout(() => void applySession(nextSession), 0);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, isLoading, profileMissing }),
    [session, isLoading, profileMissing],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}