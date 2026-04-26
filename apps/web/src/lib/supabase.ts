import {
  createBrowserClient,
  createServerClient as createSupabaseServerClient,
} from "@supabase/ssr";

/**
 * Guardrails de Supabase
 * Si algo está mal configurado, la app NO arranca.
 */

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(`[ENV] Missing environment variable: ${name}`);
  }

  return value;
}

function getValidatedSupabaseEnv(): { url: string; anonKey: string } {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!url.startsWith("https://")) {
    throw new Error("[ENV] Supabase URL must start with https://");
  }

  if (!url.endsWith(".supabase.co")) {
    throw new Error(
      "[ENV] Supabase URL must end with .supabase.co (check .com vs .co)",
    );
  }

  if (!anonKey.startsWith("sb_publishable_")) {
    throw new Error(
      "[ENV] NEXT_PUBLIC_SUPABASE_ANON_KEY must be a publishable key (sb_publishable_...)",
    );
  }

  return { url, anonKey };
}

/**
 * Cliente Supabase para el navegador.
 * Usar SOLO en Client Components y eventos del cliente.
 */
export function createClient() {
  const { url, anonKey } = getValidatedSupabaseEnv();
  return createBrowserClient(url, anonKey);
}

/**
 * Cliente Supabase para el servidor (SSR, Server Components).
 */
export async function createServerClient() {
  const { url, anonKey } = getValidatedSupabaseEnv();
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  return createSupabaseServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Llamado desde un contexto sin posibilidad de setear cookies
        }
      },
    },
  });
}