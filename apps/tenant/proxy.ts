// proxy.ts  ← renamed from middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Tenant App Proxy (formerly Middleware)
 *
 * Next.js 16: middleware.ts → proxy.ts, export `proxy` instead of `middleware`.
 * Now runs on the Node.js runtime (no longer Edge-only), so better-auth's
 * getSessionCookie works here without any runtime restrictions.
 *
 * Still a fast "gate" check — full session validation happens deeper
 * in tRPC middleware (isTenantMember) and server components.
 */

const PUBLIC_ROUTES = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/accept-invitation",
] as const;
const AUTH_ROUTES = ["/auth/sign-in", "/auth/sign-up"] as const;
const API_PREFIXES = ["/api/auth", "/api/trpc"] as const;

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // 1. Always allow API routes through (auth API handles its own validation, tRPC has its own middleware)
  if (API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // 2. Check for session token
  const sessionCookie = getSessionCookie(req);

  // 3. If user is authenticated and trying to visit auth pages, redirect to dashboard
  if (
    AUTH_ROUTES.some((route) => pathname.startsWith(route)) &&
    sessionCookie
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 4. Allow public pages for unauthenticated users
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 5. No session token → redirect to sign-in with callback URL
  if (!sessionCookie) {
    const signInUrl = new URL("/auth/sign-in", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // 6. Token exists → allow through
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
