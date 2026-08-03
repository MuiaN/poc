"use client";

import type { ReactNode } from "react";
import { RoleLayout } from "@/components/RoleLayout";

export default function Layout({ children }: { children: ReactNode }) {
  return <RoleLayout role="operator" title="Operator Dashboard">{children}</RoleLayout>;
}