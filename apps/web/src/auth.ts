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

        // ✅ Login SIEMPRE con anon key
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

  callbacks: {
    /**
     * ✅ CLAVE ABSOLUTA:
     * Evita que NextAuth redirija automáticamente a /login
     * cuando se accede a /admin o /dashboard.
     */
    async authorized({ auth, request }) {
      const { pathname } = request.nextUrl;

      // Rutas públicas
      if (
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/api")
      ) {
        return true;
      }

      // Rutas protegidas que deben permitir sesión existente
      if (
        pathname.startsWith("/admin") ||
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/perfil") ||
        pathname.startsWith("/analizar") ||
        pathname.startsWith("/historial") ||
        pathname.startsWith("/evolucion")
      ) {
        return !!auth;
      }

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
