import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase ADMIN (server-only).
 * Usa SUPABASE_SERVICE_ROLE_KEY = sb_secret_...
 * NO usar en componentes client. NO exponer en NEXT_PUBLIC.
 */
export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!url) throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceKey) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}