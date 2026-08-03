"use client";

import type { ReactNode } from "react";
import { RoleLayout } from "@/components/RoleLayout";

export default function Layout({ children }: { children: ReactNode }) {
  return <RoleLayout role="underwriter" title="Underwriter Dashboard">{children}</RoleLayout>;
}