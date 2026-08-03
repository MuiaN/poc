"use client";

import { useStore } from "@/lib/store";
import { Overview } from "@/components/pages/Overview";

export default function OperatorsOverviewPage() {
  const { currentUser, isAuthenticated } = useStore();
  
  if (!isAuthenticated || !currentUser) {
    return null;
  }

  return <Overview user={currentUser} role="operator" />;
}