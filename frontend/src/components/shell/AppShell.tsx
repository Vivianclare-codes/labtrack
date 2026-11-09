import type { ReactNode } from "react";

import type { NavId } from "@/app/lib/navigation";
import type { SessionUser } from "@/app/lib/session";

import { BottomNav } from "./BottomNav";
import { DesktopHeader } from "./DesktopHeader";
import { MobileHeader } from "./MobileHeader";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
  user: SessionUser;
  badges?: Partial<Record<NavId, number>>;
  children: ReactNode;
}

export function AppShell({
  user,
  badges,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen">

      <Sidebar
        role={user.role}
        badges={badges}
      />

      <div className="flex min-h-screen flex-col lg:pl-sidebar">

        <DesktopHeader user={user} />

        <MobileHeader user={user} />

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 px-gutter pb-mobile-nav pt-6 outline-none lg:pb-12 lg:pt-8"
        >
          <div className="mx-auto w-full max-w-content">
            {children}
          </div>
        </main>

      </div>

      <BottomNav role={user.role} />

    </div>
  );
}