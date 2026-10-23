// ==============================================================================
// KAMINI COLLECTIONS - SUPABASE CONFIG & HEALTH CHECK
// ==============================================================================

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export function isSupabaseConfigured(): boolean {
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    SUPABASE_ANON_KEY &&
    SUPABASE_ANON_KEY !== 'your_supabase_anon_public_key'
  );
}

export function isSupabaseAdminConfigured(): boolean {
  return Boolean(
    isSupabaseConfigured() &&
    SUPABASE_SERVICE_ROLE_KEY &&
    SUPABASE_SERVICE_ROLE_KEY !== 'your_supabase_service_role_secret_key'
  );
}
