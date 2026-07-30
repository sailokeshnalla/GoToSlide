'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let settled = false;

    const finish = (session) => {
      if (settled) return;
      settled = true;
      // Land on the home page either way. The global ApiKeyGate (mounted in
      // the layout) decides whether to show the "add your API key" popup.
      router.replace(session ? '/' : '/login?error=oauth');
    };

    // IMPORTANT: we do NOT call supabase.auth.exchangeCodeForSession() here.
    // The browser client auto-exchanges the ?code in the URL using the PKCE
    // verifier it saved (in localStorage) during signInWithOAuth. Calling
    // exchange manually on top of that double-consumes the code and throws
    // "both auth code and code verifier should be non-empty".
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) finish(session);
      }
    );

    // In case the session resolved before the listener attached.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) finish(session);
    });

    // Safety net if nothing fires (e.g. user denied access).
    const timeout = setTimeout(() => finish(null), 6000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return null; // or a loading spinner if you want
}