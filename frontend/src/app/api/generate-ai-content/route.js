// Deprecated.
// AI generation is now handled securely in the Python backend at /api/generate-ai-content
// using the managed API key pool.
export async function POST() {
  return new Response("Deprecated", { status: 410 });
}