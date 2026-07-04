import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Create a Supabase client.
 *
 * Defaults to the service-role key for server-side/admin usage; pass the
 * anon key explicitly for client-facing contexts. Session persistence is
 * disabled since this is intended for backend use.
 */
export function createSupabaseClient(
  url: string | undefined = process.env.SUPABASE_URL,
  key: string | undefined = process.env.SUPABASE_SERVICE_ROLE_KEY,
): SupabaseClient {
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
