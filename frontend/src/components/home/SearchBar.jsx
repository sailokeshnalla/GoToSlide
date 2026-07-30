import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchBar({ searchQuery, setSearchQuery }) {
  return (
    <div className="relative w-full max-w-2xl mx-auto group">
      {/* Subtle outer glow on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] rounded-full blur-sm opacity-10 group-hover:opacity-20 transition duration-500"></div>
      
      <div className="relative flex items-center w-full h-14 rounded-full bg-white border border-[#E2E8F0] shadow-sm overflow-hidden transition-all duration-300 focus-within:border-[#7C3AED] focus-within:shadow-md">
        <div className="grid place-items-center h-full w-14 text-[#475569] group-focus-within:text-[#7C3AED] transition-colors">
          <Search className="w-5 h-5" />
        </div>

        <input
          className="peer h-full w-full outline-none text-[#0F172A] text-base pr-4 bg-transparent placeholder-[#94A3B8]"
          type="text"
          id="search"
          placeholder="Search funnels, timelines, org trees and more..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <AnimatePresence>
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setSearchQuery('')}
              className="absolute right-4 p-1.5 text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-full transition-all"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}