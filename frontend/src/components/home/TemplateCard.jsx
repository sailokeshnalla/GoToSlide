'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Star, Lock } from 'lucide-react';
import Image from 'next/image';

export default function TemplateCard({
  template,
  index,
  onPreview,
  isAuthenticated = false,
  onRequireAuth,
}) {
  const getMockStats = (id) => {
    let hash = 0;
    const str = id || '';
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const downloads = Math.abs(hash % 850) + 180;
    const rating = (4.7 + (Math.abs(hash % 3) * 0.1)).toFixed(1);
    return { downloads, rating };
  };

  const { downloads, rating } = getMockStats(template.id);

  const handleEdit = () => {
    if (isAuthenticated) onPreview?.();
    else onRequireAuth?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -6 }}
      className="group premium-card flex flex-col overflow-hidden bg-white"
    >
      {/* IMAGE SECTION */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <Image
          src={template.preview_image}
          alt={template.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          priority={index < 3}
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-[#0F172A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* CONTENT SECTION */}
      <div className="p-5 flex flex-col flex-grow relative z-20">

        {/* Category & Rating Bar */}
        <div className="flex justify-between items-center mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 bg-[#7C3AED]/5 border border-[#7C3AED]/10 text-[#7C3AED] text-[10px] font-bold rounded uppercase tracking-wider">
            {template.category}
          </span>

          <div className="flex items-center gap-1.5">
            <div className="flex text-amber-500">
              <Star className="w-3 h-3 fill-current" />
            </div>
            <span className="text-xs font-bold text-[#475569]">{rating}</span>
            <span className="text-[10px] text-[#94A3B8]">({downloads})</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-extrabold text-[#0F172A] leading-snug mb-3 group-hover:text-[#7C3AED] transition-colors duration-200">
          {template.title}
        </h3>

        {/* Tags + Customize CTA */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#F1F5F9] text-xs">
          <div className="flex gap-1.5 overflow-hidden max-w-[70%]">
            {template.tags
              ?.split(',')
              .slice(0, 2)
              .map((tag, i) => (
                <span
                  key={i}
                  className="text-[#475569] px-2 py-0.5 bg-[#F8FAFC] rounded border border-[#E2E8F0] text-[10px]"
                >
                  #{tag.trim()}
                </span>
              ))}
          </div>

          <button
            onClick={handleEdit}
            className="flex items-center gap-1 text-[#6366F1] font-bold hover:text-[#7C3AED] transition-colors duration-200 cursor-pointer"
          >
            <span>Edit Here</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

      </div>
    </motion.div>
  );
}