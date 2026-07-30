'use client';

import { useEffect, useRef } from 'react';
import { backendApi } from '@/lib/backendApi';
import { useAuth } from '@/context/AuthContext';

export default function SessionManager() {
  const { user } = useAuth();
  const providerRef = useRef('gemini');

  useEffect(() => {
    if (user && user.user_metadata?.ai_provider) {
      providerRef.current = user.user_metadata.ai_provider;
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Send a heartbeat every 5 minutes (300,000 ms)
    const intervalId = setInterval(() => {
      backendApi.post('/api/key-assignment/heartbeat', {
        provider: providerRef.current
      }).catch(err => console.error("Heartbeat failed:", err));
    }, 5 * 60 * 1000);

    // Also send an initial heartbeat on mount/login to ensure immediate assignment
    backendApi.post('/api/key-assignment/heartbeat', {
        provider: providerRef.current
    }).catch(err => console.error("Initial heartbeat failed:", err));

    return () => {
      clearInterval(intervalId);
    };
  }, [user]);

  return null;
}
