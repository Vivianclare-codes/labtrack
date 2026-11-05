import type { ReactNode } from "react";

import { AppShell } from "@/components/shell/AppShell";
import {
  demoBadges,
  demoUser,
} from "@/app/lib/session";

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppShell
      user={demoUser}
      badges={demoBadges}
    >
      {children}
    </AppShell>
  );
}