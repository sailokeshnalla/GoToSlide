'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { X, Lock, LogIn, Sparkles } from 'lucide-react';

export default function AuthPromptModal({ template, onClose }) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-3xl border border-[#E2E8F0] shadow-[0_24px_70px_rgba(15,23,42,0.18)] overflow-hidden"
      >
        {/* Soft gradient header glow */}
        <div className="absolute -top-24 -right-20 w-56 h-56 rounded-full bg-gradient-to-tr from-[#7C3AED]/15 to-[#A855F7]/15 blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-[#94A3B8] hover:text-[#0F172A] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-full transition-all cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative z-[1] p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] flex items-center justify-center shadow-[0_8px_24px_rgba(124,58,237,0.35)]">
            <Lock className="w-6 h-6 text-white" />
          </div>

          <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight mb-2">
            Sign in to continue
          </h2>
          <p className="text-[#475569] text-sm leading-relaxed mb-1">
            Create a free account or log in to customize and download
          </p>
          {template?.title && (
            <p className="text-sm font-semibold text-[#7C3AED] mb-6">
              {template.title}
            </p>
          )}

          <div className="space-y-3">
            <button
              onClick={() => router.push('/signup')}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white font-semibold py-3 rounded-2xl hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Sign up free
            </button>

            <button
              onClick={() => router.push('/login')}
              className="w-full flex items-center justify-center gap-2 bg-white text-[#0F172A] font-semibold py-3 rounded-2xl border border-[#E2E8F0] hover:border-[#7C3AED]/40 hover:bg-[#F8FAFC] active:scale-[0.98] transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              I already have an account
            </button>
          </div>

          <p className="text-[#94A3B8] text-xs mt-5">
            Free to start. No credit card required.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}