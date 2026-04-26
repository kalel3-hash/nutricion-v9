/**
 * Guardrails de environment variables
 * Si algo está mal, la app NO arranca.
 */

function requireEnv(name: string): string {
    const value = process.env[name];
  
    if (!value || value.trim() === "") {
      throw new Error(`[ENV] Missing environment variable: ${name}`);
    }
  
    return value;
  }
  
  // ✅ Supabase URL
  export const SUPABASE_URL = (() => {
    const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  
    if (!url.startsWith("https://")) {
      throw new Error("[ENV] SUPABASE_URL must start with https://");
    }
  
    if (!url.endsWith(".supabase.co")) {
      throw new Error(
        "[ENV] SUPABASE_URL must end with .supabase.co (check .com vs .co)",
      );
    }
  
    return url;
  })();
  
  // ✅ Supabase anon key (frontend)
  export const SUPABASE_ANON_KEY = (() => {
    const key = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  
    if (!key.startsWith("sb_publishable_")) {
      throw new Error(
        "[ENV] SUPABASE_ANON_KEY must be a publishable key (sb_publishable_...)",
      );
    }
  
    return key;
  })();
  
  // ✅ Supabase service role (backend only)
  export const SUPABASE_SERVICE_ROLE_KEY = (() => {
    const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  
    if (!key.startsWith("sb_secret_")) {
      throw new Error(
        "[ENV] SUPABASE_SERVICE_ROLE_KEY must be a secret key (sb_secret_...)",
      );
    }
  
    return key;
  })();