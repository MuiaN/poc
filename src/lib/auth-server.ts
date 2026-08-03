const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

export async function callBackendLogout(accessToken: string): Promise<void> {
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    // Ignore network errors on logout
  }
}