// ==============================================================================
// KAMINI COLLECTIONS - PRIVILEGED ADMIN SUPABASE CLIENT (Service Role)
// STRICTLY SERVER-SIDE. Never import or use in client components.
// ==============================================================================

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, isSupabaseAdminConfigured } from './config';

export function getAdminClient() {
  if (!isSupabaseAdminConfigured()) {
    return null;
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
