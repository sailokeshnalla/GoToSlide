import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Zap, KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ApiKeyGuide from '@/components/auth/ApiKeyGuide';

export default function ApiKeyPromptModal({ isOpen, onClose, provider }) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#2a2a2a]/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="relative p-6 sm:p-8 bg-gradient-to-br from-indigo-50 to-white border-b border-indigo-100/50 flex-shrink-0">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-5 border border-amber-200 shadow-sm">
              <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              High Traffic Alert
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base max-w-xl">
              Our shared AI pool is currently experiencing heavy usage. To skip the line and unlock uninterrupted, high-speed generation, please connect your own free personal API key.
            </p>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 sm:p-8 overflow-y-auto">
            <div className="mb-6">
              <ApiKeyGuide provider={provider} />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 sm:p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 justify-end flex-shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => router.push('/settings')}
              className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
            >
              <Settings className="w-4 h-4" />
              Go to Settings to Add Key
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
