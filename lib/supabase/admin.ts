// ==============================================================================
// KAMINI COLLECTIONS - PRIVILEGED ADMIN SUPABASE CLIENT (Service Role)
// STRICTLY SERVER-SIDE. Never import or use in client components.
// ==============================================================================

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from './config';

export function isSupabaseAdminConfigured(): boolean {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    serviceKey &&
    serviceKey !== 'your_supabase_service_role_secret_key'
  );
}

export function getAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!isSupabaseAdminConfigured() || !serviceKey) {
    return null;
  }

  return createClient(SUPABASE_URL, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
