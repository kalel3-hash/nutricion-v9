import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],

  pages: {
    signIn: "/login",
  },

  session: { strategy: "jwt" },

  callbacks: {
    /**
     * Regla:
     * - Si NextAuth intenta volver a "/" (home), lo mandamos a "/dashboard"
     * - Si viene con callbackUrl a una ruta interna distinta de "/", la respetamos
     */
    async redirect({ url, baseUrl }) {
      try {
        const dest = new URL(url);
        const base = new URL(baseUrl);

        // Solo permitimos redirects dentro del mismo origen
        if (dest.origin === base.origin) {
          // Si el destino es la home, mejor mandarlo al dashboard
          if (dest.pathname === "/") {
            return `${baseUrl}/dashboard`;
          }
          return url;
        }
      } catch {
        // si algo falla, caemos al dashboard
      }

      return `${baseUrl}/dashboard`;
    },
  },
});