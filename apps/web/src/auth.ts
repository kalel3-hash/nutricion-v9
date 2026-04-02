// apps/web/src/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },

  // Logs para entender por qué vuelve a /login
  debug: true,

  callbacks: {
    async signIn({ account, profile }) {
      console.log("[auth] signIn", {
        provider: account?.provider,
        email: (profile as any)?.email,
      });
      return true;
    },
    async jwt({ token, account, profile }) {
      if (account) {
        console.log("[auth] jwt (account)", {
          provider: account.provider,
        });
      }
      if (profile) {
        console.log("[auth] jwt (profile)", {
          email: (profile as any)?.email,
        });
      }
      return token;
    },
    async session({ session, token }) {
      console.log("[auth] session", {
        hasUser: !!session?.user,
        sub: token?.sub,
        email: session?.user?.email,
      });
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("[auth] redirect", { url, baseUrl });
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
});