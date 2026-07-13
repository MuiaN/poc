import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import type { SessionUser } from "@/lib/types";

/** Reads and verifies the session cookie in a server component. Middleware
 *  already guarantees a valid, role-matching session for dashboard routes,
 *  so this should only return null if something is very wrong. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session) return null;
  return { name: session.name, email: session.email, role: session.role, company: session.company };
}
