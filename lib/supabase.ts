import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Klien Supabase khusus server. Memakai service role key supaya route handler
 * bisa menulis tanpa login ke Supabase Auth (login admin tetap memakai env
 * ADMIN_EMAIL / ADMIN_PASSWORD). Jangan pernah mengimpor modul ini dari
 * komponen client.
 */
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase belum dikonfigurasi. Set NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "X-Client-Info": "ki-2026-server" } },
  });
  return client;
}
