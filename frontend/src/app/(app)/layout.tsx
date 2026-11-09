import type { ReactNode } from "react";

import { AppShell } from "@/components/shell/AppShell";
import { demoUser } from "@/app/lib/session";

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppShell user={demoUser}>{children}</AppShell>
  );
}