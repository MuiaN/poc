"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DEMO_LOGINS, DEMO_PASSWORD } from "@/data/mock-users";
import { ROLE_LABEL } from "@/lib/nav";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.push(next && next.startsWith(data.redirect) ? next : data.redirect);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function quickFill(demoEmail: string) {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setError(null);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 py-16">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-base font-bold text-white">
          FB
        </div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-text">FRED BLACK</h1>
        <p className="mt-2 max-w-sm text-[13px] text-text-2">Sign in to your aviation intelligence workspace.</p>
      </div>

      <div className="w-full max-w-sm rounded-lg border border-border bg-bg-2 p-6 shadow-card">
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-3">Email</label>
            <input
              type="email"
              required
              autoFocus
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[13px] text-text outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-3">Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md border border-border-2 bg-bg-3 px-3 py-2 text-[13px] text-text outline-none focus:border-accent"
            />
          </div>

          {error && (
            <div className="rounded-md border border-danger bg-danger-dim px-3 py-2 text-[12px] text-danger">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-md bg-accent px-3 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>

      <div className="mt-6 w-full max-w-sm">
        <div className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wide text-text-3">
          Demo accounts — password: {DEMO_PASSWORD}
        </div>
        <div className="flex flex-col gap-2">
          {DEMO_LOGINS.map((u) => (
            <button
              key={u.email}
              onClick={() => quickFill(u.email)}
              className="flex items-center justify-between rounded-md border border-border bg-bg-2 px-3 py-2 text-left text-[12px] transition-colors hover:border-accent"
            >
              <span className="text-text-2">
                <span className="font-semibold text-text">{ROLE_LABEL[u.role]}</span> · {u.company}
              </span>
              <span className="text-text-3">{u.email}</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
