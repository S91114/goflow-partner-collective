import { createClient } from "@supabase/supabase-js";

// Supabase client for the Partner Collective (server-side use in the leads API).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function collectiveConfigured(): boolean {
  return Boolean(url && key);
}

export function getSupabase() {
  if (!url || !key) {
    throw new Error(
      "Supabase env vars are not set. Add NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
