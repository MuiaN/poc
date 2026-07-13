"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon, UserIcon } from "@/components/icons";
import { Spinner } from "@/components/ui";
import { DEMO_LOGINS, MockUser } from "@/data/mock-users";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);

  // Sign In state
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Demo login from URL param
  useEffect(() => {
    const demoRole = searchParams.get("demo");
    if (demoRole === "insurer" || demoRole === "operator") {
      const email =
        demoRole === "insurer" ? "demo.insurer@fredblack.demo" : "demo.operator@fredblack.demo";
      const password = "FredBlack-Demo-2026!";
      setSiEmail(email);
      setSiPassword(password);
      // Automatically submit after a short delay
      setTimeout(() => {
        handleSignIn(null, email, password);
      }, 100);
    }
  }, [searchParams]);

  async function handleSignIn(e?: React.FormEvent | null, email = siEmail, password = siPassword) {
    e?.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Sign in failed. Please try again.");
        return;
      }
      // Redirect to the dashboard specified by the API response
      router.push(data.redirect);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
    return false; // prevent form submission
  }

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center bg-bg p-6 lg:p-8">
      {/* Background Gradient */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(26,111,232,0.18)_0%,transparent_70%)]" />

      <div className="relative z-10 flex w-full max-w-5xl flex-1 items-center justify-center gap-12">
        {/* Left side: Login Form */}
        <div className="w-full max-w-md flex-shrink-0">
          <div className="relative z-10 mb-6 flex items-center justify-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent shadow-[0_4px_16px_var(--accent-glow)]">
              <Icon name="fleet" className="h-[22px] w-[22px] fill-white" />
            </div>
            <div>
              <div className="text-[17px] font-extrabold tracking-[0.05em] text-text">FRED BLACK</div>
              <div className="mt-0.5 text-[11px] text-text-3">Aviation Intelligence Platform</div>
            </div>
          </div>

          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-bg-2 shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
            {/* Tab Header */}
            <div className="border-b border-border">
              <div className="bg-bg-2 p-3 text-center text-xs font-semibold text-accent shadow-[inset_0_-2px_0_var(--accent)]">
                Sign In
              </div>
            </div>
            {/* Sign In Pane */}
            <div className="p-8 pt-7">
              <h2 className="text-xl font-bold tracking-tight text-text">Welcome back</h2>
              <p className="mb-6 mt-1 text-[13px] leading-relaxed text-text-2">Sign in to access the dashboard.</p>

              {error && (
                <div className="mb-4 rounded-lg border border-danger/30 bg-danger-dim p-3 text-xs text-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignIn} className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-text-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={siEmail}
                    onChange={(e) => setSiEmail(e.target.value)}
                    placeholder="you@airline.com"
                    className="w-full rounded-[9px] border border-border-2 bg-bg-3 px-3.5 py-2.5 text-sm text-text outline-none transition-all placeholder:text-text-3 focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-dim)]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-text-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={siPassword}
                      onChange={(e) => setSiPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-[9px] border border-border-2 bg-bg-3 px-3.5 py-2.5 pr-14 text-sm text-text outline-none transition-all placeholder:text-text-3 focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-dim)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-[11px] font-semibold text-text-3 transition-colors hover:text-text-2"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-[9px] bg-accent text-sm font-semibold text-white transition hover:bg-accent-h active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Spinner />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="relative z-10 mt-5 text-center text-[11px] text-text-3">
            © 2026 Stone Africa &nbsp;·&nbsp; FRED BLACK Aviation Intelligence
          </div>
        </div>

        {/* Right side: Demo Logins */}
        <div className="hidden w-full max-w-xs flex-shrink-0 lg:block">
          <div className="mb-4 text-center text-xs font-bold uppercase tracking-wider text-text-2">
            One-Click Demo Login
          </div>
          <div className="flex flex-col gap-3">
            {DEMO_LOGINS.map((user) => (
              <DemoLoginButton key={user.role} user={user} handleSignIn={handleSignIn} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    // Suspense is required to use useSearchParams()
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function DemoLoginButton({ user, handleSignIn }: { user: MockUser; handleSignIn: (e: null, email: string, password: string) => void }) {
  return (
    <button
      onClick={() => handleSignIn(null, user.email, user.password)}
      className="group flex items-center gap-3 rounded-lg border border-border-2 bg-bg-3 p-3 text-left transition-all hover:border-accent hover:bg-accent-dim"
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-bg text-text-2 transition-colors group-hover:bg-accent group-hover:text-white">
        <UserIcon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-text">{user.roleLabel}</div>
        <div className="truncate text-[11px] text-text-3">{user.email}</div>
      </div>
    </button>
  );
}
