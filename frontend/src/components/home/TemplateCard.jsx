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
      onClick={handleEdit}
      initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group premium-card flex flex-col overflow-hidden rounded-2xl p-[1.5px] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:-translate-y-1.5 hover:scale-[1.02] hover:z-10 transition-all duration-300 relative cursor-pointer"
    >
      {/* The animated spinning light background that acts as a border */}
      <div className="absolute inset-[-100%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#fcbd24_30%,#f16917_50%,transparent_70%)] animate-[spin_3s_linear_infinite]" />

      <div className="relative flex flex-col flex-grow w-full bg-white rounded-[15px] border border-[#E2E8F0] group-hover:border-transparent transition-colors duration-300 z-10 overflow-hidden">
        {/* IMAGE SECTION */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F8FAFC] border-b border-[#E2E8F0]">
          <Image
            src={template.preview_image}
            alt={template.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-2 transition-transform duration-700 ease-out"
            priority={index < 3}
          />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-[#2a2a2a]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        {/* CONTENT SECTION */}
        <div className="p-5 flex flex-col flex-grow relative z-20">

          {/* Category & Rating Bar */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              {template.category}
            </span>

            <div className="flex items-center gap-1.5">
              <div className="flex text-[#fcbd24]">
                <Star className="w-3 h-3 fill-current" />
              </div>
              <span className="text-xs font-bold text-[#475569]">{rating}</span>
              <span className="text-[10px] text-[#94A3B8]">({downloads})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-extrabold text-[#2a2a2a] leading-snug mb-3 group-hover:text-[#f16917] transition-colors duration-200">
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

            <div
              className="flex items-center gap-1 text-[#f16917] font-bold hover:text-[#f16917] transition-colors duration-200"
            >
              <span>Edit Here</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}