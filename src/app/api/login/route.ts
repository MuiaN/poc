import { NextResponse } from "next/server";
import { DEMO_PASSWORD, findUserByEmail } from "@/data/mock-users";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/session";
import { ROLE_BASE } from "@/lib/nav";

export async function POST(request: Request) {
  const body = await request.json();
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const user = findUserByEmail(email);

  // In this mock setup, all demo users share the same password.
  // A real app would use bcrypt.compare(password, user.passwordHash)
  if (!user || password !== DEMO_PASSWORD) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  if (user.status === "suspended") {
    return NextResponse.json({ error: "This account has been suspended. Contact your administrator." }, { status: 403 });
  }

  if (user.status === "invited") {
    return NextResponse.json({ error: "This invite hasn't been accepted yet. Check your email to activate the account." }, { status: 403 });
  }

  const token = await createSessionToken({
    email: user.email,
    name: user.name,
    role: user.role,
    company: user.company,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  });

  const response = NextResponse.json({ role: user.role, redirect: ROLE_BASE[user.role] });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
