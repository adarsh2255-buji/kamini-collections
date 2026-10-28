// ==============================================================================
// KAMINI COLLECTIONS - SERVER-SIDE AUTHORIZATION & ACCESS CONTROL
// Strictly server-side. Verifies user identity and confirms administrative role.
// ==============================================================================

import { User } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export interface AdminAuthResult {
  authorized: boolean;
  user: User | null;
  role: string | null;
  error?: string;
  status: 200 | 401 | 403;
}

/**
 * Server-side admin authorization verification:
 * 1. Cryptographically validates user identity with Supabase Auth (via getUser()).
 * 2. Accepts either browser session cookies OR Authorization: Bearer <jwt> headers.
 * 3. Independently queries the `profiles` table using the privileged server client
 *    to confirm the user's role is strictly 'admin'.
 * 4. Never trusts client-side metadata, request body claims, or session presence alone.
 */
export async function verifyAdminSession(request?: Request): Promise<AdminAuthResult> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return {
      authorized: false,
      user: null,
      role: null,
      error: 'Authentication service is not configured',
      status: 401,
    };
  }

  let user: User | null = null;

  // 1a. Check Authorization: Bearer <token> header if provided (API / integration tests)
  const authHeader = request?.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user) {
        user = data.user;
      }
    }
  }

  // 1b. Fall back to secure HTTP-only cookies if no bearer token
  if (!user) {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data?.user) {
      user = data.user;
    }
  }

  if (!user) {
    return {
      authorized: false,
      user: null,
      role: null,
      error: 'Unauthorized: Authentication required. Please log in.',
      status: 401,
    };
  }

  // 2. Independently verify the user's role in the database
  const adminDb = getAdminClient();
  if (!adminDb) {
    return {
      authorized: false,
      user,
      role: null,
      error: 'Internal authorization error: admin database client unavailable',
      status: 403,
    };
  }

  const { data: profile, error: profileErr } = await adminDb
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileErr || !profile) {
    return {
      authorized: false,
      user,
      role: null,
      error: 'Forbidden: User profile not found in authorization directory',
      status: 403,
    };
  }

  if (profile.role !== 'admin') {
    return {
      authorized: false,
      user,
      role: profile.role,
      error: `Forbidden: Administrative privileges required. Current role is '${profile.role}'.`,
      status: 403,
    };
  }

  return {
    authorized: true,
    user,
    role: 'admin',
    status: 200,
  };
}
