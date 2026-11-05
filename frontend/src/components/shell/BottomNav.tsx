"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { MenuIcon } from "@/components/ui/icons";

import {
  getMobileNav,
  isNavActive,
  type Role,
} from "@/app/lib/navigation";

import { NavIcon } from "./NavIcon";

const MORE_MENU_ID = "mobile-more-menu";

export function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const { tabs, more } = getMobileNav(role);

  const [openAtPath, setOpenAtPath] = useState<string | null>(null);

  const open = openAtPath === pathname;

  const moreButtonRef = useRef<HTMLButtonElement>(null);

  const moreActive = more.some((item) =>
    isNavActive(pathname, item.href)
  );

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape" && open) {
      setOpenAtPath(null);
      moreButtonRef.current?.focus();
    }
  }

  return (
    <>
      {open && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-30 lg:hidden"
          onClick={() => setOpenAtPath(null)}
        />
      )}

      <nav
        aria-label="Primary"
        onKeyDown={handleKeyDown}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-safe lg:hidden"
      >
        <ul className="flex h-bottom-nav">

          {tabs.map((item) => {
            const active = isNavActive(pathname, item.href);

            return (
              <li key={item.id} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-full flex-col items-center pt-3 ${
                    active ? "text-primary" : "text-muted"
                  }`}
                >
                  <NavIcon id={item.id} size={20} />

                  <span
                    className={`mt-[6px] text-micro ${
                      active ? "font-semibold" : "font-normal"
                    }`}
                  >
                    {item.tabLabel}
                  </span>
                </Link>
              </li>
            );
          })}

          <li className="flex-1">
            <button
              ref={moreButtonRef}
              type="button"
              aria-expanded={open}
              aria-controls={MORE_MENU_ID}
              onClick={() =>
                setOpenAtPath(open ? null : pathname)
              }
              className={`flex h-full w-full flex-col items-center pt-3 ${
                open || moreActive ? "text-primary" : "text-muted"
              }`}
            >
              <MenuIcon size={20} />

              <span
                className={`mt-[6px] text-micro ${
                  open || moreActive
                    ? "font-semibold"
                    : "font-normal"
                }`}
              >
                More
              </span>
            </button>
          </li>

        </ul>

        {open && (
          <div
            id={MORE_MENU_ID}
            className="absolute bottom-full right-gutter mb-2 w-60 rounded-card border border-line bg-surface p-2"
          >
            {more.length > 0 ? (
              <ul>
                {more.map((item) => {
                  const active = isNavActive(
                    pathname,
                    item.href
                  );

                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpenAtPath(null)}
                        className={`flex h-control items-center gap-3 rounded-control px-3 text-body ${
                          active
                            ? "bg-primary-soft font-semibold text-primary"
                            : "text-ink"
                        }`}
                      >
                        <NavIcon id={item.id} size={18} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-3 py-2 text-body text-muted">
                No other sections for your role.
              </p>
            )}
          </div>
        )}

      </nav>
    </>
  );
}