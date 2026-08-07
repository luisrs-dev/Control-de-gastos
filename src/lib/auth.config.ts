import type { NextAuthConfig } from "next-auth";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const authConfig = {
  basePath: "/api/auth",
  session: { strategy: "jwt" },
  pages: {
    signIn: `${basePath}/login`,
    error: `${basePath}/login`,
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
