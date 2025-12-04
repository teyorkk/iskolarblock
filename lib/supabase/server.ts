import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function getSupabaseServerClient() {
  // cookies() in Next 15 returns a Promise in RSC/route handlers, so we access in async wrappers.
  const cookieStorePromise = cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase env vars are missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local"
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStorePromise.then((store) => store.getAll());
      },
      setAll(cookiesToSet) {
        return cookieStorePromise.then((store) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            store.set(name, value, { ...options, maxAge: 86400 });
          });
        });
      },
    },
  });
}
