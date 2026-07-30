'use client';

import { useEffect, useState } from 'react';
import {
  Brain,
  ChevronRight,
  Circle,
  Filter,
  GitBranch,
  Grid2x2,
  LayoutList,
  Milestone,
  Infinity,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getTableForCategory } from '@/lib/categoryTables';

const CATEGORIES = [
  {
    id: 'Funnel',
    name: 'Funnel',
    description: 'Sales pipelines, customer journeys, lead generation stages, and conversion optimization frameworks.',
    icon: Filter,
    color: '#10B981',
    keywords: ['funnel', 'sales', 'marketing', 'conversion', 'lead'],
  },
  {
    id: 'Loop',
    name: 'Loop',
    description: 'Circular roadmaps, iterative cycles, continuous improvement frameworks, and recurring business processes.',
    icon: Infinity,
    color: '#7C3AED',
    keywords: ['loop', 'cycle', 'iteration', 'continuous improvement', 'roadmap'],
  },
  {
    id: 'Matrix',
    name: 'Matrix',
    description: 'Strategic frameworks, comparison grids, prioritization matrices, and analytical decision models.',
    icon: Grid2x2,
    color: '#10B981',
    keywords: ['matrix', 'comparison', 'analysis', 'grid', 'framework'],
  },
  {
    id: 'Mind Map',
    name: 'Mind Map',
    description: 'Idea generation, brainstorming sessions, concept mapping, and knowledge organization diagrams.',
    icon: Brain,
    color: '#06B6D4',
    keywords: ['mind map', 'brainstorm', 'concept', 'idea', 'knowledge'],
  },
  {
    id: 'n point infographic',
    name: 'N-Point Infographic',
    description: 'Multi-point presentations, feature highlights, key takeaways, and visual storytelling layouts.',
    icon: LayoutList,
    color: '#F59E0B',
    keywords: ['infographic', 'points', 'features', 'highlights', 'visual'],
  },
  {
    id: 'Organizational Tree',
    name: 'Org Tree',
    description: 'Company hierarchies, reporting structures, departmental relationships, and team organization charts.',
    icon: GitBranch,
    color: '#F59E0B',
    keywords: ['organization', 'hierarchy', 'team', 'org chart', 'structure'],
  },
  {
    id: 'Process & Flow',
    name: 'Process & Flow',
    description: 'Business workflows, operational processes, decision trees, and process automation diagrams.',
    icon: ChevronRight,
    color: '#A855F7',
    keywords: ['process', 'flow', 'workflow', 'diagram', 'automation'],
  },
  {
    id: 'Steps',
    name: 'Steps',
    description: 'Procedures, implementation guides, task tracking, compliance checks, and action plans.',
    icon: TrendingUp,
    color: '#EF4444',
    keywords: ['steps', 'checklist', 'guide', 'procedure', 'tasks'],
  },
  {
    id: 'Timeline',
    name: 'Timelines',
    description: 'Chronological events, project milestones, company history, and strategic planning schedules.',
    icon: Milestone,
    color: '#6366F1',
    keywords: ['timeline', 'schedule', 'history', 'project', 'milestone'],
  },
  {
    id: 'Venn Diagram',
    name: 'Venn Diagram',
    description: 'Comparisons, overlaps, intersections, relationships, and shared characteristics between concepts.',
    icon: Circle,
    color: '#8B5CF6',
    keywords: ['venn', 'comparison', 'overlap', 'intersection', 'relationship'],
  },
];

function CountBadge({ loading, count }) {
  if (loading) {
    return (
      <span className="inline-block h-[18px] w-20 rounded-md bg-slate-100 animate-pulse" />
    );
  }

  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
      style={{ color: '#6366F1', backgroundColor: '#6366F10F' }}
    >
      {count.toLocaleString()} {count === 1 ? 'template' : 'templates'}
    </span>
  );
}

export default function CategoryCards({ searchQuery = '' }) {
  const router = useRouter();

  const [counts, setCounts] = useState({});
  const [countsLoading, setCountsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchCounts = async () => {
      const results = await Promise.all(
        CATEGORIES.map(({ id }) => {
          const tableName = getTableForCategory(id);
          if (!tableName) {
            return Promise.resolve({ count: 0, error: new Error(`No table for ${id}`) });
          }
          return supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
        })
      );

      if (!mounted) return;

      const next = {};
      results.forEach(({ count, error }, idx) => {
        const id = CATEGORIES[idx].id;
        if (error) {
          console.error(`Failed to fetch count for ${id}:`, error);
          next[id] = 0;
        } else {
          next[id] = count ?? 0;
        }
      });

      setCounts(next);
      setCountsLoading(false);
    };

    fetchCounts();

    return () => {
      mounted = false;
    };
  }, []);

  const handleCardClick = (id) => {
    router.push(`/templates/${encodeURIComponent(id)}`);
  };

  const q = searchQuery.trim().toLowerCase();
  const visibleCategories = q
    ? CATEGORIES.filter((cat) =>
        cat.keywords.some((kw) => kw.includes(q) || q.includes(kw)) ||
        cat.name.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q)
      )
    : CATEGORIES;

  const hasQuery = q.length > 0;
  const noResults = hasQuery && visibleCategories.length === 0;

  return (
    <section id="categories" className="py-16 bg-[#F8FAFC] border-y border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            {hasQuery ? `Results for "${searchQuery}"` : 'Explore 10,000+ Business Templates'}
          </h2>
          <p className="mt-3 text-[#475569] text-sm sm:text-base">
            {hasQuery
              ? `${visibleCategories.length} categor${visibleCategories.length === 1 ? 'y' : 'ies'} match your search. Click to browse templates.`
              : 'Choose from a comprehensive range of design frameworks engineered for clarity, professionalism, and high-impact communication.'}
          </p>
        </div>

        {noResults ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-16 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center mb-4 text-2xl shadow-sm">
              🔍
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-1">No categories found</h3>
            <p className="text-sm text-[#475569]">
              Try "roadmap", "SWOT", "timeline", or "org chart".
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {visibleCategories.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <motion.div
                    key={cat.id}
                    layout
                    initial={{ opacity: 0, scale: 1.1, filter: 'blur(5px)' }}
                    whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    viewport={{ once: false, amount: 0.1 }}
                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }}
                    transition={{ 
                      duration: 0.5,
                      ease: [0.25, 1, 0.5, 1], // Custom smooth ease-out
                      delay: idx * 0.05 
                    }}
                    onClick={() => handleCardClick(cat.id)}
                    className="group cursor-pointer p-5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#7C3AED]/40 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center text-center gap-3"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${cat.color}12`, color: cat.color }}
                    >
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </div>

                    <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-[#7C3AED] transition-colors leading-tight">
                      {cat.name}
                    </h3>

                    <p className="text-xs text-[#475569] leading-relaxed max-w-xs">
                      {cat.description}
                    </p>

                    <CountBadge
                      loading={countsLoading}
                      count={counts[cat.id] ?? 0}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}