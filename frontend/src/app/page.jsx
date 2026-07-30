'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import CategoryCards from '@/components/home/CategoryCards';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (query) => {
    const q = query.trim().toLowerCase();
    if (!q) return;

    const KEYWORD_MAP = [
      {
        slug: 'Funnel',
        keywords: ['funnel', 'sales', 'pipeline', 'marketing', 'conversion', 'lead', 'customer journey'],
      },
      {
        slug: 'Loop',
        keywords: ['loop', 'cycle', 'iteration', 'continuous', 'improvement', 'recurring', 'circular', 'infinity'],
      },
      {
        slug: 'Matrix',
        keywords: ['matrix', 'grid', 'comparison', 'prioritization', 'framework', 'analysis', 'decision', 'swot'],
      },
      {
        slug: 'Mind Map',
        keywords: ['mind map', 'mindmap', 'brainstorm', 'concept', 'idea', 'knowledge', 'mapping'],
      },
      {
        slug: 'n point infographic',
        keywords: ['infographic', 'points', 'features', 'highlights', 'visual', 'list', 'multi point'],
      },
      {
        slug: 'Organizational Tree',
        keywords: ['org', 'chart', 'hierarchy', 'team', 'structure', 'company', 'organization', 'organisation', 'reporting'],
      },
      {
        slug: 'Process & Flow',
        keywords: ['process', 'flow', 'workflow', 'diagram', 'automation', 'decision tree', 'flowchart', 'operational'],
      },
      {
        slug: 'Steps',
        keywords: ['steps', 'staircase', 'guide', 'procedure', 'how to', 'instructions', 'progression', 'stages'],
      },
      {
        slug: 'Timeline',
        keywords: ['timeline', 'schedule', 'history', 'project', 'milestone', 'chronological', 'linear'],
      },
      {
        slug: 'Venn Diagram',
        keywords: ['venn', 'overlap', 'intersection', 'comparison', 'relationship', 'shared', 'common'],
      },
    ];

    const match = KEYWORD_MAP.find(({ keywords }) =>
      keywords.some((kw) => q.includes(kw) || kw.includes(q))
    );

    if (match) {
      router.push(`/templates/${encodeURIComponent(match.slug)}`);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <HeroSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
      />

      <CategoryCards searchQuery={searchQuery} />

      <Footer />
    </main>
  );
}