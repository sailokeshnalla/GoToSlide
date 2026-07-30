'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ExternalLink, KeyRound } from 'lucide-react';

// Verified against Google AI Studio + xAI console flows (current as of mid-2026).
const GUIDES = {
  gemini: {
    label: 'Google Gemini',
    console: 'https://aistudio.google.com/app/apikey',
    consoleLabel: 'Open Google AI Studio',
    keyHint: 'Starts with “AIza…” (about 39 characters).',
    steps: [
      'Go to Google AI Studio (aistudio.google.com) and sign in with your Google account.',
      'In the left sidebar, click “Get API key”.',
      'Click “Create API key”, then choose or create a Google Cloud project.',
      'Copy the generated key and paste it into the field above.',
      'Keep the key restricted to the Generative Language API (new keys are restricted by default) and never commit it to public code.',
    ],
    note: 'Gemini has a free tier — no credit card needed to start prototyping.',
  },
  grok: {
    label: 'xAI Grok',
    console: 'https://console.x.ai',
    consoleLabel: 'Open xAI Console',
    keyHint: 'Starts with “xai-” followed by a long string.',
    steps: [
      'Go to console.x.ai and sign up with your email or Google sign-in.',
      'Open “Billing” in the sidebar and add a payment method (new accounts get promotional credits).',
      'Click “API Keys” in the sidebar, then “Create API Key”.',
      'Name the key and select the models/endpoints it can use.',
      'Copy the key immediately — xAI shows the secret only once — and paste it above.',
    ],
    note: 'Grok has no permanent free tier, but new accounts start with promotional credits.',
  },
};

export default function ApiKeyGuide({ provider = 'gemini', defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const guide = GUIDES[provider] || GUIDES.gemini;

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer hover:bg-[#F1F5F9] transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
          <KeyRound className="w-4 h-4 text-[#7C3AED]" />
          How do I get a {guide.label} API key?
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#94A3B8] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-[#E2E8F0]">
              <ol className="space-y-2.5 mt-3">
                {guide.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-[#475569] leading-relaxed">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white text-[11px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              <p className="mt-3 text-xs text-[#94A3B8]">
                {guide.keyHint} {guide.note}
              </p>

              <a
                href={guide.console}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#7C3AED] hover:text-[#A855F7] transition-colors"
              >
                {guide.consoleLabel}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}