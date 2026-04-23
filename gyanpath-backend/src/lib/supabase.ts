import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';

let supabaseClient: SupabaseClient | null = null;

/**
 * Get Supabase client for user-level operations (respects RLS)
 */
export function getSupabaseClient(accessToken?: string): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(config.supabase.url, config.supabase.anonKey);
  }

  if (accessToken) {
    return createClient(config.supabase.url, config.supabase.anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
  }

  return supabaseClient;
}

/**
 * Get Supabase admin client with service role (bypasses RLS)
 * Use with caution - only in edge functions and admin operations
 */
export function getSupabaseAdmin(): SupabaseClient {
  return createClient(config.supabase.url, config.supabase.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export default getSupabaseClient;
