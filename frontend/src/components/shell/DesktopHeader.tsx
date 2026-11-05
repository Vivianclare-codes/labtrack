import {
  BellIcon,
  HospitalIcon,
} from "@/components/ui/icons";

import { HOSPITAL_NAME } from "@/app/lib/hospital";
import { ROLE_LABELS } from "@/app/lib/navigation";
import type { SessionUser } from "@/app/lib/session";

import { CurrentDate } from "./CurrentDate";
import { UserAvatar } from "./UserAvatar";

export function DesktopHeader({
  user,
}: {
  user: SessionUser;
}) {
  return (
    <header className="sticky top-0 z-10 hidden h-header items-center justify-between border-b border-line bg-surface px-gutter lg:flex">

      <div className="flex items-center gap-[10px] text-body">
        <HospitalIcon size={20} className="text-muted" />

        <p>
          <span className="text-ink">{HOSPITAL_NAME}</span>{" "}
          <span className="text-muted">/ Laboratory services</span>
        </p>
      </div>

      <div className="flex items-center">
        <CurrentDate className="mr-6 text-label text-muted" />

        <button
          type="button"
          aria-label="Notifications"
          className="mr-7 rounded-control p-1 text-muted hover:text-ink"
        >
          <BellIcon size={18} />
        </button>

        <div className="flex items-center gap-[11px]">
          <UserAvatar name={user.name} />

          <div>
            <p className="text-label font-medium text-ink">
              {user.name}
            </p>

            <p className="text-micro text-muted">
              {ROLE_LABELS[user.role]}
            </p>
          </div>
        </div>
      </div>

    </header>
  );
}