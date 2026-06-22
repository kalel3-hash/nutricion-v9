import {
  createBrowserClient,
  createServerClient as createSupabaseServerClient,
} from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

/**
 * Guardrails de Supabase
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`[ENV] Missing environment variable: ${name}`);
  }
  return value;
}

export const SUPABASE_URL = (() => {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  if (!url.startsWith("https://") || !url.endsWith(".supabase.co")) {
    throw new Error("[ENV] Invalid Supabase URL");
  }
  return url;
})();

export const SUPABASE_ANON_KEY = (() => {
  const key = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (
    !key.startsWith("sb_publishable_") &&
    !key.startsWith("eyJ")
  ) {
    throw new Error("[ENV] Invalid Supabase anon key");
  }
  return key;
})();

export const SUPABASE_SERVICE_ROLE_KEY = (() => {
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!key.startsWith("sb_secret_")) {
    throw new Error("[ENV] Invalid Supabase service role key");
  }
  return key;
})();

/**
 * Cliente para frontend
 */
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * Cliente para Server Components / SSR
 */
export async function createServerClient() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  return createSupabaseServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {}
      },
    },
  });
}

/**
 * ✅ Cliente ADMIN (SOLO backend /api)
 */
export function createAdminClient() {
  return createSupabaseJsClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}