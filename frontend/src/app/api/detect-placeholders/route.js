// src/app/api/detect-placeholders/route.js
// Endpoint: POST /api/detect-placeholders
// Purpose:  Scans the template and returns the {{placeholder}} list + positions.
//           Proxies to the backend's /detect-placeholders.

import { NextResponse } from 'next/server';

// Title/Heading (no number) -> Point 1 -> Description 1 -> Point 2 ...
function sortPlaceholders(placeholders) {
  return [...(placeholders || [])].sort((a, b) => {
    const numA = parseInt(a.match(/(\d+)/)?.[1] ?? '0', 10);
    const numB = parseInt(b.match(/(\d+)/)?.[1] ?? '0', 10);
    const aHasNum = /\d/.test(a);
    const bHasNum = /\d/.test(b);
    if (!aHasNum && bHasNum) return -1;
    if (aHasNum && !bHasNum) return 1;
    if (numA !== numB) return numA - numB;
    const isDetail = (ph) => /description|detail|text|subtitle|body|content|sub/i.test(ph);
    const aIsDetail = isDetail(a);
    const bIsDetail = isDetail(b);
    if (!aIsDetail && bIsDetail) return -1;
    if (aIsDetail && !bIsDetail) return 1;
    return a.localeCompare(b);
  });
}

export async function POST(req) {
  try {
    const { templateUrl } = await req.json();

    if (!templateUrl) {
      return NextResponse.json({ error: 'Template URL is required' }, { status: 400 });
    }
    try {
      new URL(templateUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid template URL' }, { status: 400 });
    }

    // If you want to cache detect results, store the JSON in Supabase (a small
    // `template_placeholders` table keyed by templateUrl) or Upstash Redis and
    // read it here before calling the backend. Vercel's filesystem is read-only
    // (except ephemeral /tmp), so a public/cache dir can't persist there.

    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

    const response = await fetch(`${backendUrl}/detect-placeholders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateUrl }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || result.detail || 'detect-placeholders failed');
    }

    return NextResponse.json({
      fileType: result.file_type,
      placeholders: sortPlaceholders(result.placeholders),
      placeholderMappings: result.placeholder_mappings,
      slideWidth: result.slide_width,
      slideHeight: result.slide_height,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}