// src/app/api/generate-preview/route.js
// Endpoint: POST /api/generate-preview
// Purpose:  Builds the blank base preview image (the cached one) shown in the
//           modal. Proxies to the backend's /generate-preview.

import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { templateUrl, replacements } = await req.json();

    if (!templateUrl) {
      return NextResponse.json({ error: 'Template URL is required' }, { status: 400 });
    }

    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

    const response = await fetch(`${backendUrl}/generate-preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateUrl, replacements: replacements || {} }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || result.detail || 'Generate preview failed');
    }

    // Backend already uploaded to Supabase and returned public URLs.
    return NextResponse.json({
      previewUrls: result.preview_urls || [],
      previewUrl: result.preview_url || '',
      downloadUrl: result.pptx_url || '',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}