'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import {
  ChevronLeft, ChevronRight, ArrowLeft,
  Infinity, Milestone, Brain, GitBranch,
  TrendingUp, Filter, Grid2x2, LayoutList,
  ChevronRight as FlowIcon, Circle,
} from 'lucide-react';

import TemplateCard from '@/components/home/TemplateCard';
import TemplatePreviewModal from '@/components/home/TemplatePreviewModal';
import AuthPromptModal from '@/components/auth/AuthPromptModal';
import CategoryTransition from '@/components/home/CategoryTransition';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { getTableForCategory } from '@/lib/categoryTables';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_META = {
  'Funnel': {
    label: 'Funnel',
    description: 'Sales pipelines, customer journeys, lead generation stages, and conversion optimization frameworks.',
    color: '#10B981',
    bg: '#10B98110',
    icon: Filter,
  },
  'Loop': {
    label: 'Loop',
    description: 'Circular roadmaps, iterative cycles, continuous improvement frameworks, and recurring business processes.',
    color: '#7C3AED',
    bg: '#7C3AED10',
    icon: Infinity,
  },
  'Matrix': {
    label: 'Matrix',
    description: 'Strategic frameworks, comparison grids, prioritization matrices, and analytical decision models.',
    color: '#10B981',
    bg: '#10B98110',
    icon: Grid2x2,
  },
  'Mind Map': {
    label: 'Mind Map',
    description: 'Idea generation, brainstorming sessions, concept mapping, and knowledge organization diagrams.',
    color: '#06B6D4',
    bg: '#06B6D410',
    icon: Brain,
  },
  'n point infographic': {
    label: 'N-Point Infographic',
    description: 'Multi-point presentations, feature highlights, key takeaways, and visual storytelling layouts.',
    color: '#F59E0B',
    bg: '#F59E0B10',
    icon: LayoutList,
  },
  'Organizational Tree': {
    label: 'Org Tree',
    description: 'Company hierarchies, reporting structures, departmental relationships, and team organization charts.',
    color: '#F59E0B',
    bg: '#F59E0B10',
    icon: GitBranch,
  },
  'Process & Flow': {
    label: 'Process & Flow',
    description: 'Business workflows, operational processes, decision trees, and process automation diagrams.',
    color: '#A855F7',
    bg: '#A855F710',
    icon: FlowIcon,
  },
  'Steps': {
    label: 'Steps',
    description: 'Procedures, implementation guides, task tracking, compliance checks, and action plans.',
    color: '#EF4444',
    bg: '#EF444410',
    icon: TrendingUp,
  },
  'Timeline': {
    label: 'Timelines',
    description: 'Chronological events, project milestones, company history, and strategic planning schedules.',
    color: '#6366F1',
    bg: '#6366F110',
    icon: Milestone,
  },
  'Venn Diagram': {
    label: 'Venn Diagram',
    description: 'Comparisons, overlaps, intersections, relationships, and shared characteristics between concepts.',
    color: '#8B5CF6',
    bg: '#8B5CF610',
    icon: Circle,
  },
};

// Alphabetical order — matches CategoryCards
const ALL_CATEGORIES = [
  'Funnel',
  'Loop',
  'Matrix',
  'Mind Map',
  'n point infographic',
  'Organizational Tree',
  'Process & Flow',
  'Steps',
  'Timeline',
  'Venn Diagram',
];

const TEMPLATES_PER_PAGE = 8;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden animate-pulse">
          <div className="aspect-[4/3] bg-slate-100" />
          <div className="p-4 space-y-3">
            <div className="h-3 bg-slate-100 rounded w-1/4" />
            <div className="h-4 bg-slate-100 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );
  const withEllipsis = [];
  let prev = 0;
  for (const p of visiblePages) {
    if (p - prev > 1) withEllipsis.push('...');
    withEllipsis.push(p);
    prev = p;
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#475569] hover:border-[#7C3AED] hover:text-[#7C3AED] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {withEllipsis.map((item, i) =>
        item === '...' ? (
          <span key={`e-${i}`} className="w-9 h-9 flex items-center justify-center text-[#94A3B8] text-sm">…</span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all ${
              currentPage === item
                ? 'bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white shadow-md'
                : 'border border-[#E2E8F0] bg-white text-[#475569] hover:border-[#7C3AED] hover:text-[#7C3AED]'
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#475569] hover:border-[#7C3AED] hover:text-[#7C3AED] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();

  const categorySlug = decodeURIComponent(params.category || '');
  const meta = CATEGORY_META[categorySlug];

  const { user } = useAuth();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [authPromptTemplate, setAuthPromptTemplate] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [introTimeDone, setIntroTimeDone] = useState(false);

  useEffect(() => {
    if (!meta) return;
    setLoading(true);
    setCurrentPage(1);

    const tableName = getTableForCategory(categorySlug);

    if (!tableName) {
      console.error('No table found for category:', categorySlug);
      setTemplates([]);
      setLoading(false);
      return;
    }

    supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('Supabase error:', JSON.stringify(error, null, 2));
        setTemplates(data || []);
        setLoading(false);
      });
  }, [categorySlug, meta]);

  useEffect(() => {
    setIntroTimeDone(false);
    const t = setTimeout(() => setIntroTimeDone(true), 1100);
    return () => clearTimeout(t);
  }, [categorySlug]);

  useEffect(() => { setMounted(true); }, []);

  if (!meta) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <p className="text-2xl font-bold text-[#0F172A] mb-2">Category not found</p>
        <Link href="/" className="mt-4 inline-flex items-center gap-2 text-[#7C3AED] font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
      </div>
    );
  }

  const showIntro = !introTimeDone || loading;

  const totalPages = Math.ceil(templates.length / TEMPLATES_PER_PAGE);
  const paginated = templates.slice(
    (currentPage - 1) * TEMPLATES_PER_PAGE,
    currentPage * TEMPLATES_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/');
    }
  };

  const CategoryIcon = meta.icon;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      <AnimatePresence>
        {showIntro && <CategoryTransition key={categorySlug} category={categorySlug} />}
      </AnimatePresence>

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#475569] hover:text-[#7C3AED] transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            {currentPage > 1 ? 'Back' : 'Back to Home'}
          </button>

          <div className="flex items-center gap-4">
            <div
              className="hidden sm:flex w-14 h-14 rounded-2xl items-center justify-center flex-shrink-0"
              style={{ backgroundColor: meta.bg, color: meta.color }}
            >
              <CategoryIcon className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight"
              >
                {meta.label}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.07 }}
                className="mt-1 text-[#475569] text-sm sm:text-base max-w-2xl"
              >
                {meta.description}
              </motion.p>
              {!loading && (
                <p className="mt-2 text-sm font-semibold" style={{ color: meta.color }}>
                  {templates.length} templates available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Category tab strip ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {ALL_CATEGORIES.map((cat) => {
              const isActive = cat === categorySlug;
              return (
                <button
                  key={cat}
                  onClick={() => router.push(`/templates/${encodeURIComponent(cat)}`)}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white shadow-md'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-100'
                  }`}
                >
                  {CATEGORY_META[cat].label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Template grid ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <SkeletonGrid />
        ) : templates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border border-[#E2E8F0] bg-white"
              style={{ color: meta.color }}
            >
              <CategoryIcon className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-xl font-bold text-[#0F172A] mb-2">No templates yet</h3>
            <p className="text-[#475569] text-sm max-w-sm">
              We're adding new {meta.label} templates soon. Browse another category in the meantime.
            </p>
          </motion.div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {paginated.map((template, index) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    index={index}
                    isAuthenticated={!!user}
                    onPreview={() => setPreviewTemplate(template)}
                    onRequireAuth={() => setAuthPromptTemplate(template)}
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            {totalPages > 1 && (
              <p className="text-center text-sm text-[#94A3B8] mt-8">
                Page {currentPage} of {totalPages} · {templates.length} total templates
              </p>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      {mounted && createPortal(
        <>
          <AnimatePresence>
            {previewTemplate && (
              <TemplatePreviewModal
                previewTemplate={previewTemplate}
                onClose={() => setPreviewTemplate(null)}
              />
            )}
          </AnimatePresence>
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
    </div>
  );
}