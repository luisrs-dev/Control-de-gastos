"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return (
    <NextAuthSessionProvider basePath={`${basePath}/api/auth`}>
      {children}
    </NextAuthSessionProvider>
  );
}
