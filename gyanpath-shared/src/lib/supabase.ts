import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types';

// Environment variables should be set by consuming apps
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 
                    process.env.NEXT_PUBLIC_SUPABASE_URL || 
                    '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
                        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                        '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Set SUPABASE_URL and SUPABASE_ANON_KEY.');
}

/**
 * Supabase client for use in mobile and web apps.
 * Uses the anonymous key which respects RLS policies.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Create a typed Supabase client with custom options.
 * Useful for React Native where storage needs to be configured.
 */
export function createSupabaseClient(
  url: string,
  anonKey: string,
  options?: {
    storage?: any;
    persistSession?: boolean;
  }
) {
  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: options?.persistSession ?? true,
      autoRefreshToken: true,
      storage: options?.storage,
    },
  });
}

export type SupabaseClient = typeof supabase;
