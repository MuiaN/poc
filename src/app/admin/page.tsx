"use client";

import { useStore } from "@/lib/store";
import { Overview } from "@/components/pages/Overview";

export default function AdminOverviewPage() {
  const { currentUser, isAuthenticated } = useStore();
  
  if (!isAuthenticated || !currentUser) {
    return null;
  }

  return <Overview user={currentUser} role="admin" />;
}