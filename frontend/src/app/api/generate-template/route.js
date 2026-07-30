// src/app/api/generate-template/route.js
// Endpoint: POST /api/generate-template
// Purpose:  The final "Generate & Download" render (pptx / pdf / png).
//           NOTE: proxies to the backend's /replace-pptx (folder name and
//           backend endpoint name differ here -- this is the download route).

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { templateUrl, replacements, styling, format } = await request.json();

    if (!templateUrl) {
      return NextResponse.json({ error: 'templateUrl is required' }, { status: 400 });
    }

    const allowed = ['pptx', 'pdf', 'image'];
    const requestedFormat = allowed.includes(format) ? format : 'pptx';

    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

    const response = await fetch(`${backendUrl}/replace-pptx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateUrl,
        replacements: replacements || {},
        styling: styling || {},
        format: requestedFormat,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || result.detail || 'Template generation failed');
    }

    // The file already lives in Supabase. Hand the URL to the browser, which
    // downloads it directly — no streaming through Vercel, no temp files.
    return NextResponse.json({
      downloadUrl: result.download_url,
      format: result.format,
      filename: result.filename,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}