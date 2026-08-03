'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ApiKeyGuide from '@/components/auth/ApiKeyGuide';

const PROVIDERS = [
  { id: 'gemini', label: 'Google Gemini', prefix: 'AIza' },
  { id: 'grok', label: 'xAI Grok', prefix: 'xai-' },
];

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [provider, setProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const activeProvider = PROVIDERS.find((p) => p.id === provider);

  // Gentle format check so people notice an obviously-wrong key, without hard-blocking.
  const keyLooksValid = useMemo(() => {
    if (!apiKey) return null;
    return apiKey.trim().startsWith(activeProvider.prefix);
  }, [apiKey, activeProvider]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Without this, Supabase falls back to whatever "Site URL" is set in
          // Authentication > URL Configuration in the dashboard, which is easy
          // to leave pointed at the wrong place (e.g. localhost) and is why the
          // confirmation link wasn't landing back on the app.
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          // Stored on the user so the backend can use the customer's own key (BYOK).
          // For production, prefer a dedicated `profiles` table with Row Level Security,
          // or encrypt the key — user_metadata is readable by the signed-in client.
          data: {
            ai_provider: provider,
            ai_api_key: apiKey.trim(),
          },
        },
      });
      if (error) throw error;

      // Supabase intentionally returns success (no error) even when the email
      // already belongs to a confirmed account, to avoid leaking which emails
      // are registered. The tell is an empty `identities` array on the user
      // object — that's the only way to detect "already signed up" client-side.
      const alreadyRegistered = data?.user?.identities?.length === 0;
      if (alreadyRegistered) {
        setError('An account with this email already exists. Try logging in instead.');
        return;
      }

      setMessage('Account created! Check your email for a confirmation link to finish signing up.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 bg-white overflow-hidden">
      {/* Ambient brand background */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[10%] w-[460px] h-[460px] rounded-full bg-gradient-to-tr from-[#7C3AED]/10 to-[#6366F1]/10 blur-[110px]" />
        <div className="absolute bottom-[-15%] left-[8%] w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-[#A855F7]/10 to-[#6366F1]/10 blur-[110px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-[#E2E8F0] shadow-[0_24px_70px_rgba(15,23,42,0.08)]"
      >
        {/* Back */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-[#475569] hover:text-[#0F172A] transition text-sm mb-7 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-7 justify-center group">
          <div className="w-9 h-9 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] rounded-lg flex items-center justify-center font-bold text-white shadow-sm transition-transform group-hover:scale-105">
            G
          </div>
          <span className="text-[#0F172A] font-extrabold text-xl tracking-tight">
            GoTo<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#A855F7]">Slide</span>
          </span>
        </Link>

        <h1 className="text-[#0F172A] text-2xl font-extrabold text-center tracking-tight mb-1.5">
          Create your account
        </h1>
        <p className="text-[#475569] text-center mb-7 text-sm">
          Connect your own AI key and start generating boardroom-ready decks.
        </p>

        {/* Google */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white text-[#0F172A] font-medium py-2.5 rounded-xl mb-2 border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#7C3AED]/30 active:scale-[0.99] transition-all cursor-pointer"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="" />
          Continue with Google
        </button>
        <p className="text-[#94A3B8] text-[11px] text-center mb-5">
          Signing up with Google? You'll be prompted to add your AI key right after.
        </p>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-[#E2E8F0]" />
          <span className="text-[#94A3B8] text-xs">or sign up with email</span>
          <div className="flex-1 h-px bg-[#E2E8F0]" />
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-[#475569] text-sm mb-1.5 block font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 transition placeholder-[#94A3B8]"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-[#475569] text-sm mb-1.5 block font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl pl-10 pr-11 py-2.5 outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 transition placeholder-[#94A3B8]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Provider selector */}
          <div>
            <label className="text-[#475569] text-sm mb-1.5 block font-medium">AI provider</label>
            <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
              {PROVIDERS.map((p) => {
                const isActive = provider === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProvider(p.id)}
                    className={`relative px-4 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                      isActive ? 'text-white' : 'text-[#475569] hover:text-[#0F172A]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="providerPill"
                        className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] rounded-xl shadow-sm"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* API key */}
          <div>
            <label className="text-[#475569] text-sm mb-1.5 block font-medium">
              {activeProvider.label} API key
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`${activeProvider.prefix}…`}
                spellCheck={false}
                autoComplete="off"
                className={`w-full bg-white border text-[#0F172A] rounded-xl pl-10 pr-11 py-2.5 outline-none focus:ring-2 transition placeholder-[#94A3B8] font-mono text-sm ${
                  keyLooksValid === false
                    ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-200'
                    : 'border-[#E2E8F0] focus:border-[#7C3AED] focus:ring-[#7C3AED]/15'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowKey((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition cursor-pointer"
                aria-label={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Inline format hint */}
            {keyLooksValid === true && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" /> Looks like a valid {activeProvider.label} key.
              </p>
            )}
            {keyLooksValid === false && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-600">
                <AlertCircle className="w-3.5 h-3.5" />
                A {activeProvider.label} key usually starts with “{activeProvider.prefix}”. Double-check before continuing.
              </p>
            )}
          </div>

          {/* How-to guide for the selected provider */}
          <ApiKeyGuide provider={provider} />

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && (
            <p className="flex items-start gap-2 text-emerald-600 text-sm bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          <p className="text-[#94A3B8] text-[11px] text-center leading-relaxed">
            Your key is stored on your account and used only to generate your decks. You can update or remove it anytime.
          </p>
        </form>

        <p className="text-[#475569] text-sm text-center mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-[#7C3AED] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}