// ==============================================================================
// KAMINI COLLECTIONS - BROWSER SUPABASE CLIENT
// ==============================================================================

import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from './config';

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  
  if (typeof window !== 'undefined' && clientInstance) {
    return clientInstance;
  }

  const client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  if (typeof window !== 'undefined') {
    clientInstance = client;
  }
  return client;
}
