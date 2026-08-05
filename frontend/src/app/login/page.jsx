'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push('/');
      router.refresh();
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
        <div className="absolute top-[-10%] left-[10%] w-[460px] h-[460px] rounded-full bg-gradient-to-tr from-[#f16917]/10 to-[#f16917]/10 blur-[110px]" />
        <div className="absolute bottom-[-15%] right-[8%] w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-[#fcbd24]/10 to-[#f16917]/10 blur-[110px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-[#E2E8F0] shadow-[0_24px_70px_rgba(15,23,42,0.08)]"
      >
        {/* Back */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-[#475569] hover:text-[#2a2a2a] transition text-sm mb-7 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-8 justify-center group">
          <div className="w-9 h-9 bg-gradient-to-r from-[#f16917] to-[#fcbd24] rounded-lg flex items-center justify-center font-bold text-white shadow-sm transition-transform group-hover:scale-105">
            G
          </div>
          <span className="text-[#2a2a2a] font-extrabold text-xl tracking-tight">
            GoTo<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f16917] to-[#fcbd24]">Slide</span>
          </span>
        </Link>

        <h1 className="text-[#2a2a2a] text-2xl font-extrabold text-center tracking-tight mb-1.5">
          Welcome back
        </h1>
        <p className="text-[#475569] text-center mb-7 text-sm">
          Sign in to customize and download premium templates.
        </p>

        {/* Google */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white text-[#2a2a2a] font-medium py-2.5 rounded-xl mb-5 border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#f16917]/30 active:scale-[0.99] transition-all cursor-pointer"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="" />
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-[#E2E8F0]" />
          <span className="text-[#94A3B8] text-xs">or</span>
          <div className="flex-1 h-px bg-[#E2E8F0]" />
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
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
                className="w-full bg-white border border-[#E2E8F0] text-[#2a2a2a] rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-[#f16917] focus:ring-2 focus:ring-[#f16917]/15 transition placeholder-[#94A3B8]"
              />
            </div>
          </div>

          <div>
            <label className="text-[#475569] text-sm mb-1.5 block font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
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

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#f16917] to-[#fcbd24] text-white font-semibold py-2.5 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-[#475569] text-sm text-center mt-5">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#f16917] font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}