'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Listen for auth state changes (e.g., when the user clicks the magic link in another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/'); // Redirect to home/dashboard once confirmed
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

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
          // Stored on the user
          data: {
            display_name: name.trim(),
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

      if (data.session) {
        // Auto-login (email confirmations are turned off in Supabase)
        // The onAuthStateChange listener will handle the redirect, so we don't show the success UI.
        return;
      }

      setMessage('Account created! Check your email for a confirmation link to finish signing up.');
      setIsSuccess(true);
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
        <div className="absolute top-[-10%] right-[10%] w-[460px] h-[460px] rounded-full bg-gradient-to-tr from-[#f16917]/10 to-[#f16917]/10 blur-[110px]" />
        <div className="absolute bottom-[-15%] left-[8%] w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-[#fcbd24]/10 to-[#f16917]/10 blur-[110px]" />
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
          className="flex items-center gap-1.5 text-[#475569] hover:text-[#2a2a2a] transition text-sm mb-7 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-7 justify-center group">
          <div className="w-9 h-9 bg-gradient-to-r from-[#f16917] to-[#fcbd24] rounded-lg flex items-center justify-center font-bold text-white shadow-sm transition-transform group-hover:scale-105">
            G
          </div>
          <span className="text-[#2a2a2a] font-extrabold text-xl tracking-tight">
            GoTo<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f16917] to-[#fcbd24]">Slide</span>
          </span>
        </Link>

        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center py-6"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-[#2a2a2a] text-2xl font-extrabold tracking-tight mb-3">
              Check your inbox
            </h2>
            <p className="text-[#475569] text-base leading-relaxed mb-8">
              We've sent a confirmation link to <span className="font-semibold text-[#2a2a2a]">{email}</span>.
              <br className="hidden sm:block" />
              Please click the link to activate your account.
            </p>
            
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 mb-2 flex flex-col items-center gap-3 w-full">
              <div className="w-6 h-6 border-2 border-[#f16917]/30 border-t-[#f16917] rounded-full animate-spin" />
              <p className="text-[#64748B] text-sm">
                Waiting for you to confirm...
                <br />
                This page will automatically redirect once you do.
              </p>
            </div>
            
            <p className="text-[#94A3B8] text-xs mt-6">
              You can safely close this tab if you confirmed on another device.
            </p>
          </motion.div>
        ) : (
          <>
            <h1 className="text-[#2a2a2a] text-2xl font-extrabold text-center tracking-tight mb-1.5">
              Create your account
            </h1>
            <p className="text-[#475569] text-center mb-7 text-sm">
              Create an account to start generating boardroom-ready decks.
            </p>

        {/* Google */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white text-[#2a2a2a] font-medium py-2.5 rounded-xl mb-7 border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#f16917]/30 active:scale-[0.99] transition-all cursor-pointer"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="" />
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-[#E2E8F0]" />
          <span className="text-[#94A3B8] text-xs">or sign up with email</span>
          <div className="flex-1 h-px bg-[#E2E8F0]" />
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-[#475569] text-sm mb-1.5 block font-medium">Name <span className="text-red-500">*</span></label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full bg-white border border-[#E2E8F0] text-[#2a2a2a] rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-[#f16917] focus:ring-2 focus:ring-[#f16917]/15 transition placeholder-[#94A3B8]"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-[#475569] text-sm mb-1.5 block font-medium">Email <span className="text-red-500">*</span></label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-white border border-[#E2E8F0] text-[#2a2a2a] rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-[#f16917] focus:ring-2 focus:ring-[#f16917]/15 transition placeholder-[#94A3B8]"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-[#475569] text-sm mb-1.5 block font-medium">Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full bg-white border border-[#E2E8F0] text-[#2a2a2a] rounded-xl pl-10 pr-11 py-2.5 outline-none focus:border-[#f16917] focus:ring-2 focus:ring-[#f16917]/15 transition placeholder-[#94A3B8]"
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

          {/* Confirm Password */}
          <div>
            <label className="text-[#475569] text-sm mb-1.5 block font-medium">Confirm Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                minLength={6}
                className="w-full bg-white border border-[#E2E8F0] text-[#2a2a2a] rounded-xl pl-10 pr-11 py-2.5 outline-none focus:border-[#f16917] focus:ring-2 focus:ring-[#f16917]/15 transition placeholder-[#94A3B8]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition cursor-pointer"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>


          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#f16917] to-[#fcbd24] text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>


        </form>

        <p className="text-[#475569] text-sm text-center mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-[#f16917] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
        </>
        )}
      </motion.div>
    </div>
  );
}