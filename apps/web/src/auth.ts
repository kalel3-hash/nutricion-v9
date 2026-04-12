import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

export const { handlers, auth, signIn, signOut } = NextAuth({
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

        // Validamos el usuario contra Supabase Auth
        // (misma forma en que se registran en /register)
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
        );

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email as string,
          password: credentials.password as string,
        });

        if (error || !data.user) {
          // Credenciales incorrectas → NextAuth redirige a /login?error=CredentialsSignin
          return null;
        }

        // Devolvemos el usuario para que NextAuth cree la sesión JWT
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

  session: { strategy: "jwt" },

  callbacks: {
    async redirect({ url, baseUrl }) {
      try {
        const dest = new URL(url);
        const base = new URL(baseUrl);

        if (dest.origin === base.origin) {
          if (dest.pathname === "/") {
            return `${baseUrl}/dashboard`;
          }
          return url;
        }
      } catch {
        // si algo falla, mandamos al dashboard
      }

      return `${baseUrl}/dashboard`;
    },
  },
});