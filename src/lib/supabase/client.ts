import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig, getSupabaseEnv, SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

export { getSupabaseConfig, getSupabaseEnv, SUPABASE_URL, SUPABASE_ANON_KEY };

const memoryCookies: Record<string, string> = {};

export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  if (typeof window === "undefined") {
    return createBrowserClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return Object.entries(memoryCookies).map(([name, value]) => ({ name, value }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            memoryCookies[name] = value;
          });
        },
      },
    });
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
