'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import TemplateCard from './TemplateCard';
import { motion, AnimatePresence } from 'framer-motion';
import TemplatePreviewModal from './TemplatePreviewModal';
import AuthPromptModal from '../auth/AuthPromptModal';
import { LayoutGrid } from 'lucide-react';

export default function TemplateGrid({ templates, loading, user }) {
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [authPromptTemplate, setAuthPromptTemplate] = useState(null);
  const [mounted, setMounted] = useState(false);

  const isAuthenticated = !!user;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm animate-pulse">
            <div className="aspect-[4/3] w-full bg-slate-100" />
            <div className="p-6 space-y-4">
              <div className="h-5 bg-slate-100 rounded w-1/4" />
              <div className="h-7 bg-slate-100 rounded w-3/4" />
              <div className="pt-5 border-t border-[#F1F5F9]">
                <div className="h-5 bg-slate-100 rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center px-4 max-w-7xl mx-auto"
      >
        <div className="w-16 h-16 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <LayoutGrid className="w-6 h-6 text-[#94A3B8]" />
        </div>
        <h3 className="text-xl font-bold text-[#0F172A] mb-2">No templates found</h3>
        <p className="text-[#475569] max-w-md text-sm">
          We couldn&apos;t find any premium templates matching your search. Try another keyword or browse our categories above.
        </p>
      </motion.div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {templates.map((template, index) => (
          <TemplateCard
            key={template.id}
            template={template}
            index={index}
            isAuthenticated={isAuthenticated}
            onPreview={() => setPreviewTemplate(template)}
            onRequireAuth={() => setAuthPromptTemplate(template)}
          />
        ))}
      </div>

      {/* Modals are rendered into <body> to escape any parent stacking context */}
      {mounted && createPortal(
        <>
          {/* Editor — members only */}
          <AnimatePresence>
            {previewTemplate && (
              <TemplatePreviewModal
                previewTemplate={previewTemplate}
                onClose={() => setPreviewTemplate(null)}
              />
            )}
          </AnimatePresence>

          {/* Log in / Sign up prompt — guests who try to use a template */}
          <AnimatePresence>
            {authPromptTemplate && (
              <AuthPromptModal
                template={authPromptTemplate}
                onClose={() => setAuthPromptTemplate(null)}
              />
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </>
  );
}