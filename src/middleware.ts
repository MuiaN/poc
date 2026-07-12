import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { ROLE_BASE } from "@/lib/nav";
import type { Role } from "@/lib/types";

const ROLE_FOR_PREFIX: Record<string, Role> = {
  "/admin": "admin",
  "/underwriters": "underwriter",
  "/operators": "operator",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/login") {
    if (session) {
      return NextResponse.redirect(new URL(ROLE_BASE[session.role], request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL(session ? ROLE_BASE[session.role] : "/login", request.url));
  }

  const matchedPrefix = Object.keys(ROLE_FOR_PREFIX).find((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!matchedPrefix) return NextResponse.next();

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const requiredRole = ROLE_FOR_PREFIX[matchedPrefix];
  if (session.role !== requiredRole) {
    // Signed in, but as the wrong role for this dashboard — send them home.
    return NextResponse.redirect(new URL(ROLE_BASE[session.role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/admin/:path*", "/underwriters/:path*", "/operators/:path*"],
};
