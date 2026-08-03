"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui";

interface RoleLayoutProps {
  children: ReactNode;
  role: "admin" | "underwriter" | "operator";
  title: string;
}

export function RoleLayout({ children, role, title }: RoleLayoutProps) {
  const router = useRouter();
  const { currentUser, isAuthenticated, initializeAuth, loading } = useStore();
  const [hasHydrated, setHasHydrated] = useState(false);

  // Check hydration status - use useEffect only for side effects
  useEffect(() => {
    if (useStore.persist.hasHydrated()) {
      setHasHydrated(true);
    } else {
      const unsubFinishHydration = useStore.persist.onFinishHydration(() => {
        setHasHydrated(true);
      });
      return () => unsubFinishHydration();
    }
  }, []);

  // Initialize auth on mount after hydration
  useEffect(() => {
    if (hasHydrated) {
      initializeAuth();
    }
  }, [hasHydrated, initializeAuth]);

  // Redirect to login if not authenticated (after hydration AND initialization)
  useEffect(() => {
    if (!hasHydrated || loading.auth) return;
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [hasHydrated, isAuthenticated, loading.auth, router]);

  // Show loading while hydrating or checking auth
  if (!hasHydrated || loading.auth) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  // Check role matches
  if (currentUser.role !== role) {
    return null;
  }

  return (
    <DashboardShell role={role} title={title} user={currentUser}>
      {children}
    </DashboardShell>
  );
}