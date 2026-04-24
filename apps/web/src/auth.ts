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
        password: { label: "Contrasena", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        console.log("=== AUTH DEBUG ===");
        console.log("URL:", supabaseUrl);
        console.log("KEY prefix:", serviceKey?.slice(0, 20));
        console.log("Email:", credentials.email);

        const supabase = createClient(supabaseUrl, serviceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email as string,
          password: credentials.password as string,
        });

        console.log("Supabase error:", JSON.stringify(error));
        console.log("Supabase user:", data?.user?.email);
        console.log("=== END DEBUG ===");

        if (error || !data.user) return null;

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name ?? data.user.email,
        };
      },
    }),
  ],

  pages: { signIn: "/login" },
  session: { strategy: "jwt" },

  callbacks: {
    async redirect({ url, baseUrl }) {
      try {
        const dest = new URL(url);
        const base = new URL(baseUrl);
        if (dest.origin === base.origin) {
          if (dest.pathname === "/") return `${baseUrl}/dashboard`;
          return url;
        }
      } catch { }
      return `${baseUrl}/dashboard`;
    },
  },
});