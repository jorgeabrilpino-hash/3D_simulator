export async function GET() {
  return Response.json({
    openrouter: Boolean(process.env.OPENROUTER_API_KEY),
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    supabase: Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY)),
  })
}
