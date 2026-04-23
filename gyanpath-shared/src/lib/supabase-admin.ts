import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types';

/**
 * Create an admin Supabase client with service role key.
 * ONLY use this in server-side code (Edge Functions, API routes).
 * This client bypasses RLS.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export type AdminClient = ReturnType<typeof createAdminClient>;
