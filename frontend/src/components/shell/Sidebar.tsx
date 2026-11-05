"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { HelpIcon } from "@/components/ui/icons";
import {
  CONNECTED_DEPARTMENTS,
  HOSPITAL_NAME,
} from "@/app/lib/hospital";

import {
  getSidebarItems,
  isNavActive,
  type NavId,
  type Role,
} from "@/app/lib/navigation";

import { LogoMark, Wordmark } from "./Logo";
import { NavIcon } from "./NavIcon";

interface SidebarProps {
  role: Role;
  badges?: Partial<Record<NavId, number>>;
}

export function Sidebar({
  role,
  badges = {},
}: SidebarProps) {
  const pathname = usePathname();
  const items = getSidebarItems(role);

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-sidebar overflow-y-auto bg-sidebar text-sidebar-text lg:block">
      <div className="flex min-h-full flex-col px-5">

        {/* Brand */}
        <Link
          href="/dashboard"
          aria-label="LabTrack dashboard"
          className="flex items-center gap-[10px] pb-[29px] pt-[30px] text-white outline-offset-4 focus-visible:outline-sidebar-accent"
        >
          <LogoMark variant="solid" />
          <Wordmark />
        </Link>

        {/* Hospital */}
        <div className="flex h-[69px] flex-col justify-center border-y border-white/[0.11]">
          <p className="text-body font-medium text-white">
            {HOSPITAL_NAME}
          </p>

          <p className="text-micro uppercase tracking-[0.02em]">
            Laboratory workspace
          </p>
        </div>

        {/* Primary navigation */}
        <nav aria-label="Primary" className="mt-[29px]">
          <ul className="flex flex-col gap-[7px]">
            {items.map((item) => {
              const active = isNavActive(pathname, item.href);
              const count = badges[item.id];

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex h-control items-center gap-[11px] rounded-control px-3 text-label transition-colors focus-visible:outline-sidebar-accent ${
                      active
                        ? "bg-sidebar-active font-semibold text-white"
                        : "text-sidebar-text hover:text-white"
                    }`}
                  >
                    <NavIcon
                      id={item.id}
                      size={18}
                      className={
                        active ? "text-sidebar-accent" : undefined
                      }
                    />

                    <span className="flex-1">{item.label}</span>

                    {count ? (
                      <span className="text-micro font-medium text-sidebar-accent">
                        {count}
                        <span className="sr-only"> pending</span>
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Connected departments */}
        <section
          aria-labelledby="sidebar-departments"
          className="mt-12"
        >
          <h2
            id="sidebar-departments"
            className="text-micro font-normal uppercase tracking-[0.02em]"
          >
            Connected departments
          </h2>

          <ul className="mt-[19px] flex flex-col gap-3 text-micro">
            {CONNECTED_DEPARTMENTS.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </section>

        {/* Sidebar bottom */}
        <div className="mt-auto pb-6 pt-10">
          <p className="flex items-center gap-[9px] text-label">
            <HelpIcon size={18} />
            Help &amp; support
          </p>
        </div>

      </div>
    </aside>
  );
}