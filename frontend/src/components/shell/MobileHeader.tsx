import Link from "next/link";

import { BellIcon } from "@/components/ui/icons";
import { ROLE_LABELS } from "@/app/lib/navigation";
import type { SessionUser } from "@/app/lib/session";

import { LogoMark, Wordmark } from "./Logo";
import { UserAvatar } from "./UserAvatar";

export function MobileHeader({
  user,
}: {
  user: SessionUser;
}) {
  return (
    <header className="sticky top-0 z-10 flex h-header items-center justify-between border-b border-line bg-surface px-gutter text-ink lg:hidden">

      <Link
        href="/dashboard"
        aria-label="LabTrack dashboard"
        className="flex items-center gap-[10px]"
      >
        <LogoMark variant="soft" />
        <Wordmark />
      </Link>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-control p-1 text-muted hover:text-ink"
        >
          <BellIcon size={18} />
        </button>

        <UserAvatar
          name={user.name}
          label={`${user.name}, ${ROLE_LABELS[user.role]}`}
        />
      </div>

    </header>
  );
}