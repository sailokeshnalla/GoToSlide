'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Eye, EyeOff, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ApiKeyGuide from '@/components/auth/ApiKeyGuide';

const PROVIDERS = [
  { id: 'gemini', label: 'Google Gemini', prefix: 'AIza' },
  { id: 'gemini_new', label: 'Google Gemini (New)', prefix: 'AQ.' }
];

// Global, mandatory popup. Mounted once in the root layout (inside AuthProvider).
// Appears whenever a signed-in user has no ai_api_key in their metadata — which
// covers Google sign-up AND Google login of an existing key-less account.
export default function ApiKeyGate() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const [provider, setProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dismissed, setDismissed] = useState(false);

  const activeProvider = PROVIDERS.find((p) => p.id === provider);
  const hasKey = !!user?.user_metadata?.ai_api_key;

  // Don't cover the Settings page (they can add the key there directly).
  const onSettings = pathname?.startsWith('/settings');

  const visible = !loading && !!user && !hasKey && !dismissed && !onSettings;

  const keyLooksValid = apiKey ? apiKey.trim().startsWith(activeProvider.prefix) : null;

  const handleSave = async () => {
    setError('');
    if (!apiKey.trim()) {
      setError('Please enter your API key to continue.');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { ai_provider: provider, ai_api_key: apiKey.trim() },
      });
      if (error) throw error;
      // AuthContext receives USER_UPDATED → user now has a key → gate hides.
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLater = () => {
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#2a2a2a]/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="relative w-full max-w-md bg-white rounded-3xl border border-[#E2E8F0] shadow-[0_24px_70px_rgba(15,23,42,0.18)] overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="absolute -top-24 -right-20 w-56 h-56 rounded-full bg-gradient-to-tr from-[#f16917]/15 to-[#fcbd24]/15 blur-3xl pointer-events-none" />

            <div className="relative z-[1] p-7">
              <div className="w-12 h-12 mb-4 rounded-2xl bg-gradient-to-r from-[#f16917] to-[#fcbd24] flex items-center justify-center shadow-[0_8px_24px_rgba(124,58,237,0.35)]">
                <KeyRound className="w-5 h-5 text-white" />
              </div>

              <h2 className="text-xl font-extrabold text-[#2a2a2a] tracking-tight mb-1.5">
                Connect your AI key
              </h2>
              <p className="text-[#475569] text-sm leading-relaxed mb-5">
                GoToSlide uses your own Gemini key to generate content. Add it now to
                start creating decks.
              </p>

              {/* Provider toggle */}
              <div className="hidden grid-cols-2 gap-1.5 p-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl mb-4">
                {PROVIDERS.map((p) => {
                  const isActive = provider === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProvider(p.id)}
                      className={`relative px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                        isActive ? 'text-white' : 'text-[#475569] hover:text-[#2a2a2a]'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="gateProviderPill"
                          className="absolute inset-0 bg-gradient-to-r from-[#f16917] to-[#fcbd24] rounded-xl shadow-sm"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{p.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Key input */}
              <div className="relative mb-1.5">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`${activeProvider.prefix}…`}
                  spellCheck={false}
                  autoComplete="off"
                  className={`w-full bg-white border text-[#2a2a2a] rounded-xl pl-10 pr-11 py-2.5 outline-none focus:ring-2 transition placeholder-[#94A3B8] font-mono text-sm ${
                    keyLooksValid === false
                      ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-200'
                      : 'border-[#E2E8F0] focus:border-[#f16917] focus:ring-[#f16917]/15'
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
              {keyLooksValid === false && (
                <p className="mb-2 flex items-center gap-1.5 text-xs text-amber-600">
                  <AlertCircle className="w-3.5 h-3.5" />
                  A {activeProvider.label} key usually starts with “{activeProvider.prefix}”.
                </p>
              )}

              {/* How-to */}
              <div className="my-4">
                <ApiKeyGuide provider={provider} />
              </div>

              {error && (
                <p className="mb-3 flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </p>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#f16917] to-[#fcbd24] text-white font-semibold py-2.5 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Save & continue
                  </>
                )}
              </button>

              <button
                onClick={handleLater}
                className="w-full mt-2 text-center text-sm text-[#94A3B8] hover:text-[#475569] transition cursor-pointer py-1"
              >
                I&apos;ll do this later
              </button>

              <p className="mt-2 text-[11px] text-[#94A3B8] text-center leading-relaxed">
                You can also add or update your API key later from Settings.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}