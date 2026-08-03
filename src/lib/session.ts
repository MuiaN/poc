// Legacy session utilities - kept for build compatibility
// These are no longer used in the new client-side auth system

export const SESSION_COOKIE = "fb_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export interface SessionPayload {
  email: string;
  name: string;
  role: "admin" | "underwriter" | "operator";
  company: string;
  exp: number;
}

export async function createSessionToken(_payload: SessionPayload): Promise<string> {
  return "";
}

export async function verifySessionToken(_token: string | undefined | null): Promise<SessionPayload | null> {
  return null;
}