import {
  createBrowserClient,
  createServerClient as createSupabaseServerClient,
} from "@supabase/ssr";

/**
 * Obtiene las variables de entorno necesarias para Supabase.
 * IMPORTANTE:
 * - URL: NEXT_PUBLIC_SUPABASE_URL
 * - KEY: NEXT_PUBLIC_SUPABASE_ANON_KEY  ✅ (NO publishable)
 */
function getSupabaseEnv(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return { url, key };
}

/**
 * Cliente Supabase para el navegador.
 * Usar SOLO en Client Components y eventos del cliente.
 */
export function createClient() {
  const { url, key } = getSupabaseEnv();
  return createBrowserClient(url, key);
}

/**
 * Cliente Supabase para el servidor.
 * Usar en Server Components, Route Handlers y Server Actions.
 */
export async function createServerClient() {
  const { url, key } = getSupabaseEnv();
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  return createSupabaseServerClient(url, key, {
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
          // Ignorado: llamado desde un Server Component sin response directa
        }
      },
    },
  });
}