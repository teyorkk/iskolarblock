import { createClient } from "@supabase/supabase-js";

/**
 * Static Supabase client for unauthenticated requests
 * Use this for public data fetching in static pages (ISR/SSG)
 * DO NOT use this for authenticated requests - use getSupabaseServerClient() instead
 */
export function getSupabaseStaticClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase env vars are missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local"
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}
