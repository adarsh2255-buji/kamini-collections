// ==============================================================================
// KAMINI COLLECTIONS - SERVER SUPABASE CLIENT (Cookies & Session)
// ==============================================================================

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from './config';

/**
 * Public server client for static & ISR storefront data fetching.
 * Does not read cookies, preventing Next.js DYNAMIC_SERVER_USAGE bailouts during build.
 */
export function createPublicSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return createSupabaseJsClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function createServerSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}
