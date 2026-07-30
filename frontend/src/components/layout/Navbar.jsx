'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Settings, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

import { backendApi } from '@/lib/backendApi';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const TAGLINES = [
  'Turn ideas into presentation-ready decks',
  'From prompt to polished slides',
  'Design smarter with AI',
  'Create polished presentations in minutes',
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const { user, loading: authLoading } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const initials = useMemo(() => {
    return user?.email ? user.email.charAt(0).toUpperCase() : 'U';
  }, [user]);

  // Scroll to top on every page navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [dropdownOpen]);

  const handleLogout = useCallback(async () => {
    setDropdownOpen(false);

    try {
      await backendApi.post('/api/key-assignment/release');
    } catch (e) {
      console.error('Failed to release key:', e);
    }

    const { error } = await supabase.auth.signOut();

    if (!error) {
      router.push('/');
    }
  }, [router]);

  const handleSettings = useCallback(() => {
    setDropdownOpen(false);
    router.push('/settings');
  }, [router]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-white/80 px-6 py-3.5 backdrop-blur-md transition-all duration-300 sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          onClick={(e) => {
            if (pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="group flex shrink-0 items-center gap-2.5"
          aria-label="GoToSlide home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#A855F7] font-bold text-white shadow-sm transition-transform group-hover:scale-105">
            G
          </div>

          <span className="text-xl font-extrabold tracking-tight text-[#0F172A]">
            GoTo<span className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] bg-clip-text text-transparent">
              Slide
            </span>
          </span>
        </Link>

        {/* Center scrolling tagline */}
        <div className="hidden min-w-0 flex-1 justify-center px-6 lg:flex">
          <div
            className="relative w-full max-w-[560px] overflow-hidden"
            aria-label="GoToSlide tagline"
            style={{
              WebkitMaskImage:
                'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
              maskImage:
                'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
            }}
          >
            {shouldReduceMotion ? (
              <p className="truncate text-center text-sm font-semibold tracking-wide text-[#0F172A]">
                Turn ideas into presentation-ready decks
              </p>
            ) : (
              <motion.div
                className="flex w-max items-center"
                animate={{ x: ['0%', '-50%'] }}
                transition={{
                  duration: 28,
                  ease: 'linear',
                  repeat: Infinity,
                }}
              >
                {[...TAGLINES, ...TAGLINES].map((text, index) => (
                  <div
                    key={`${text}-${index}`}
                    className="flex shrink-0 items-center gap-4 pr-4"
                  >
                    <span className="whitespace-nowrap text-sm font-semibold tracking-wide text-black">
                      {text}
                    </span>
                    <span className="text-[#00000]" aria-hidden="true">
                      •
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Auth */}
        <div className="flex shrink-0 items-center justify-end gap-3">
          {authLoading ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-slate-100" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((open) => !open)}
                className="group flex items-center gap-2 rounded-full border border-transparent py-1 pl-1 pr-2.5 transition-all hover:border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer"
                aria-label="Open account menu"
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A855F7] text-sm font-bold text-white shadow-sm">
                  {initials}
                </div>

                <ChevronDown
                  className={`h-3.5 w-3.5 text-[#94A3B8] transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
                    role="menu"
                  >
                    <div className="border-b border-[#F1F5F9] px-4 py-3">
                      <p className="text-xs font-medium text-[#94A3B8]">
                        Signed in as
                      </p>
                      <p className="mt-0.5 truncate text-sm font-semibold text-[#0F172A]">
                        {user.email}
                      </p>
                    </div>

                    <div className="p-1.5">
                      <button
                        type="button"
                        onClick={handleSettings}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#475569] transition-all hover:bg-[#F8FAFC] hover:text-[#0F172A] cursor-pointer"
                        role="menuitem"
                      >
                        <Settings className="h-4 w-4 text-[#7C3AED]" />
                        Settings
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#475569] transition-all hover:bg-red-50 hover:text-red-600 cursor-pointer"
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4" />
                        Log out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="rounded-xl px-3.5 py-2 text-sm font-medium text-[#475569] transition hover:text-[#0F172A] cursor-pointer"
              >
                Log In
              </button>

              <button
                type="button"
                onClick={() => router.push('/signup')}
                className="rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-md hover:shadow-purple-500/25 active:scale-95 cursor-pointer"
              >
                Get Started Free
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}