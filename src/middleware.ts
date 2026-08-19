import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default auth((req) => {
  const rawPathname = req.nextUrl.pathname;
  const pathname =
    basePath && rawPathname.startsWith(basePath)
      ? rawPathname.slice(basePath.length) || "/"
      : rawPathname;

  const session = req.auth;
  const isAuthenticated = !!session;
  const userRole = session?.user?.role;

  // Public routes — allow without auth
  if (pathname.startsWith("/login")) {
    if (isAuthenticated) {
      const redirectTo = userRole === "ADMIN" ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(`${basePath}${redirectTo}`, req.nextUrl));
    }
    return NextResponse.next();
  }

  // All other routes require authentication
  if (!isAuthenticated) {
    const loginUrl = new URL(`${basePath}/login`, req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", rawPathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only routes
  if (pathname.startsWith("/admin")) {
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL(`${basePath}/dashboard`, req.nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
