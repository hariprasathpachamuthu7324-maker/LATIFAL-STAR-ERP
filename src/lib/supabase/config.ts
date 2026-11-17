/**
 * PREEDHAR Technical Services - Supabase Environment Configuration
 * 
 * IMPORTANT: This module is side-effect-free and does not import browser or server runtimes.
 * It uses direct literal access to process.env.NEXT_PUBLIC_* to ensure Next.js / Turbopack
 * statically inlines public environment variables into client and edge bundles at build time.
 */

// Direct static access for Next.js build-time AST compiler replacement
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function sanitizeUrl(val: string): string {
  return (val || "").trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "");
}

function sanitizeKey(val: string): string {
  return (val || "").trim().replace(/^["']|["']$/g, "");
}

export const SUPABASE_URL = sanitizeUrl(rawUrl);
export const SUPABASE_ANON_KEY = sanitizeKey(rawKey);

export function getSupabaseConfig() {
  const url = SUPABASE_URL;
  const anonKey = SUPABASE_ANON_KEY;

  const isConfigured =
    url.length > 0 &&
    url.startsWith("https://") &&
    !url.includes("placeholder-project.supabase.co") &&
    anonKey.length > 0 &&
    anonKey !== "placeholder-anon-key";

  return {
    supabaseUrl: isConfigured ? url : (url || "https://placeholder-project.supabase.co"),
    supabaseAnonKey: isConfigured ? anonKey : (anonKey || "placeholder-anon-key"),
    isConfigured,
  };
}

// Backward compatibility alias
export const getSupabaseEnv = getSupabaseConfig;
