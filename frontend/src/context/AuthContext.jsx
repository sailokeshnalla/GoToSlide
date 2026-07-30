'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext({
  user: null,
  loading: true,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Initial check, runs once for the whole app lifetime (this provider
    // lives in the root layout, so it is not remounted on route changes).
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (mounted) {
        setUser(user);
        setLoading(false);
      }
    };

    getCurrentUser();

    // Keep state in sync with login/logout/token refresh events.
const {
  data: { subscription },
} = supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'USER_UPDATED') {
    // Re-fetch the full user so updated metadata (ai_api_key) is reflected
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null);
    });
  } else {
    setUser(session?.user ?? null);
  }
  setLoading(false);
});

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}