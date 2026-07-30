'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyRound,
  Mail,
  CalendarDays,
  ShieldCheck,
  Eye,
  EyeOff,
  Save,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  X,
} from 'lucide-react';
import { backendApi } from '@/lib/backendApi';
import { supabase } from '@/lib/supabase';
import ApiKeyGuide from '@/components/auth/ApiKeyGuide';

const PROVIDERS = [
  { id: 'gemini', label: 'Google Gemini', prefix: 'AIza' },
  { id: 'grok', label: 'xAI Grok', prefix: 'xai-' },
];



// ── Confirmation modal ────────────────────────────────────────────────────────
function ConfirmRemoveModal({ onConfirm, onCancel, removing }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="relative bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] w-full max-w-sm p-6 z-10"
        >
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-1.5 text-[#94A3B8] hover:text-[#475569] hover:bg-[#F8FAFC] rounded-full transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>

          <h3 className="text-lg font-extrabold text-[#0F172A] mb-1">Remove API Key?</h3>
          <p className="text-sm text-[#475569] leading-relaxed mb-6">
            Your AI key will be permanently removed from your account.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={removing}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all disabled:opacity-60 cursor-pointer"
            >
              {removing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Removing…
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Yes, Remove
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);

  const [provider, setProvider] = useState('gemini');
  const [hasKey, setHasKey] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [showNew, setShowNew] = useState(false);

  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const activeProvider = PROVIDERS.find((p) => p.id === provider) || PROVIDERS[0];

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      setUser(user);
      setProvider(user.user_metadata?.ai_provider || 'gemini');
      setChecking(false);
    });
  }, [router]);

  useEffect(() => {
    if (!user) return;
    let isActive = true;

    backendApi.get('/api/key-assignment/user-key?provider=' + provider)
      .then((res) => {
        if (isActive && res?.status === 'success') {
          setHasKey(res.has_key);
        }
      })
      .catch(console.error);

    return () => { isActive = false; };
  }, [user, provider]);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const newKeyLooksValid = useMemo(() => {
    if (!newKey) return null;
    return newKey.trim().startsWith(activeProvider.prefix);
  }, [newKey, activeProvider]);

  const refreshFromUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleSave = async () => {
    setMessage('');
    setError('');
    const keyToSave = newKey.trim();
    if (!keyToSave) {
      setError('Enter an API key to save.');
      return;
    }
    setSaving(true);
    try {
      // 1. Save provider preference
      const { data, error: authError } = await supabase.auth.updateUser({
        data: { ai_provider: provider },
      });
      if (authError) throw authError;

      // 2. Securely send the key to the backend to be encrypted and stored
      await backendApi.post('/api/key-assignment/user-key', {
        provider: provider,
        key: keyToSave
      });

      refreshFromUser(data.user);
      setHasKey(true);
      setNewKey('');
      setShowNew(false);
      setMessage('Your AI key was updated.');
    } catch (err) {
      setError(err.message || 'Failed to save key');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setMessage('');
    setError('');
    setRemoving(true);
    try {
      await backendApi.delete('/api/key-assignment/user-key?provider=' + provider);
      setHasKey(false);
      setNewKey('');
      setMessage('Your personal AI key was removed. The managed pool will now be used.');
    } catch (err) {
      setError(err.message || 'Failed to remove key');
    } finally {
      setRemoving(false);
      setShowConfirmRemove(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <svg className="animate-spin h-7 w-7 text-[#7C3AED]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const joined = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : '—';

  return (
    <main className="min-h-screen bg-white flex flex-col">

      {/* Confirmation modal */}
      {showConfirmRemove && (
        <ConfirmRemoveModal
          removing={removing}
          onConfirm={handleRemove}
          onCancel={() => setShowConfirmRemove(false)}
        />
      )}

      <div className="relative flex-grow">
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-[-8%] right-[6%] w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-[#7C3AED]/8 to-[#6366F1]/8 blur-[110px]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <button
              type="button"
              onClick={handleBack}
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#475569] hover:text-[#7C3AED] transition-colors cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>

            <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Settings</h1>
            <p className="text-[#475569] mt-1.5 text-sm">
              Manage your account and the AI key GoToSlide uses to generate your decks.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Account overview */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-1 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] h-fit"
            >
              <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-5">Account</h2>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#7C3AED] mt-0.5" />
                  <div>
                    <p className="text-[#94A3B8] text-xs">Email</p>
                    <p className="text-[#0F172A] font-medium break-all">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarDays className="w-4 h-4 text-[#7C3AED] mt-0.5" />
                  <div>
                    <p className="text-[#94A3B8] text-xs">Member since</p>
                    <p className="text-[#0F172A] font-medium">{joined}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-[#7C3AED] mt-0.5" />
                  <div>
                    <p className="text-[#94A3B8] text-xs">AI connection</p>
                    {hasKey ? (
                      <p className="text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {activeProvider.label} connected
                      </p>
                    ) : (
                      <p className="text-amber-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        No key connected
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* API key management */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)]"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#A855F7] flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-[#0F172A]">AI API Key</h2>
              </div>

              <p className="text-[#475569] text-sm mb-6">
                To increase your generation speed and bypass shared rate limits, you can optionally connect your own API key. When provided, the backend will automatically prioritize your personal key over the default managed pool.
              </p>

              {/* Provider toggle */}
              <label className="text-[#475569] text-sm mb-1.5 block font-medium">Provider</label>
              <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl mb-5 max-w-sm">
                {PROVIDERS.map((p) => {
                  const isActive = provider === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProvider(p.id)}
                      className={`relative px-4 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer ${isActive ? 'text-white' : 'text-[#475569] hover:text-[#0F172A]'
                        }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="settingsProviderPill"
                          className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] rounded-xl shadow-sm"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{p.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Current key Status */}
              {hasKey && (
                <div className="mb-5">
                  <label className="text-[#475569] text-sm mb-1.5 block font-medium">Status</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-sm text-emerald-700 font-medium">
                      Personal Key Configured
                    </code>
                  </div>
                </div>
              )}

              {/* New / replacement key */}
              <div className="mb-2">
                <label className="text-[#475569] text-sm mb-1.5 block font-medium">
                  {hasKey ? 'Replace key' : 'Add key'}
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder={`${activeProvider.prefix}…`}
                    spellCheck={false}
                    autoComplete="off"
                    className={`w-full bg-white border text-[#0F172A] rounded-xl pl-10 pr-11 py-2.5 outline-none focus:ring-2 transition placeholder-[#94A3B8] font-mono text-sm ${newKeyLooksValid === false
                        ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-200'
                        : 'border-[#E2E8F0] focus:border-[#7C3AED] focus:ring-[#7C3AED]/15'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition cursor-pointer"
                    aria-label={showNew ? 'Hide key' : 'Show key'}
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newKeyLooksValid === false && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                    A {activeProvider.label} key usually starts with "{activeProvider.prefix}".
                  </p>
                )}
              </div>

              {/* Status messages */}
              {message && (
                <p className="mt-3 flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {message}
                </p>
              )}
              {error && (
                <p className="mt-3 flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </p>
              )}

              {/* Actions */}
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white font-semibold py-2.5 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving…' : 'Save changes'}
                </button>

                {hasKey && (
                  <button
                    onClick={() => setShowConfirmRemove(true)}
                    disabled={removing}
                    className="flex items-center justify-center gap-2 text-red-600 font-semibold py-2.5 px-5 rounded-xl border border-red-200 hover:bg-red-50 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    {removing ? 'Removing…' : 'Remove key'}
                  </button>
                )}
              </div>

              {/* How-to guide */}
              <div className="mt-6">
                <ApiKeyGuide provider={provider} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

    </main>
  );
}