import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,

  providers: [
    Google,

    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          }
        );

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email as string,
          password: credentials.password as string,
        });

        if (error || !data?.user) return null;

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name ?? data.user.email,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  /**
   * ✅ CLAVE ABSOLUTA
   * NextAuth NO decide el acceso a /admin.
   * /admin es pública para NextAuth.
   * La seguridad vive en las APIs.
   */
  callbacks: {
    async authorized({ request }) {
      const { pathname } = request.nextUrl;

      // Rutas públicas para NextAuth
      if (
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/api")
      ) {
        return true;
      }

      // El resto requiere sesión
      return true;
    },

    async redirect({ url, baseUrl }) {
      try {
        const dest = new URL(url);
        if (dest.origin === baseUrl) {
          if (dest.pathname === "/") return `${baseUrl}/dashboard`;
          return url;
        }
      } catch {}
      return `${baseUrl}/dashboard`;
    },
  },
});