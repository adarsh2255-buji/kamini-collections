// ==============================================================================
// KAMINI COLLECTIONS - CLIENT-SAFE SUPABASE CONFIG & HEALTH CHECK
// Only public, client-safe environment variables are exposed here.
// ==============================================================================

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function isSupabaseConfigured(): boolean {
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    SUPABASE_ANON_KEY &&
    SUPABASE_ANON_KEY !== 'your_supabase_anon_public_key'
  );
}
