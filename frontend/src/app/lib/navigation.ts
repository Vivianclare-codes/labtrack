export type Role = "admin" | "receptionist" | "scientist" | "supervisor";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  receptionist: "Receptionist",
  scientist: "Scientist",
  supervisor: "Supervisor",
};

export type NavId =
  | "dashboard"
  | "patients"
  | "samples"
  | "queue"
  | "review"
  | "reports"
  | "activity"
  | "catalogue";

export interface NavItem {
  id: NavId;
  label: string;
  tabLabel: string;
  href: string;
}

export const NAV_ITEMS: Record<NavId, NavItem> = {
  dashboard: {
    id: "dashboard",
    label: "Dashboard",
    tabLabel: "Home",
    href: "/dashboard",
  },
  patients: {
    id: "patients",
    label: "Patient registry",
    tabLabel: "Patients",
    href: "/patients",
  },
  samples: {
    id: "samples",
    label: "Samples",
    tabLabel: "Samples",
    href: "/samples",
  },
  queue: {
    id: "queue",
    label: "Processing queue",
    tabLabel: "Work",
    href: "/processing-queue",
  },
  review: {
    id: "review",
    label: "Result review",
    tabLabel: "Review",
    href: "/result-review",
  },
  reports: {
    id: "reports",
    label: "Reports",
    tabLabel: "Reports",
    href: "/reports",
  },
  activity: {
    id: "activity",
    label: "Activity logs",
    tabLabel: "Logs",
    href: "/activity-logs",
  },
  catalogue: {
    id: "catalogue",
    label: "Laboratory setup",
    tabLabel: "Setup",
    href: "/settings/catalogue",
  },
};

const ALL_NAV: NavId[] = [
  "dashboard",
  "patients",
  "samples",
  "queue",
  "review",
  "reports",
  "activity",
];

interface RoleNav {
  sidebar: NavId[];
  tabs: NavId[];
}

const ROLE_NAV: Record<Role, RoleNav> = {
  admin: {
    sidebar: [...ALL_NAV, "catalogue"],
    tabs: ["dashboard", "patients", "samples", "reports"],
  },
  receptionist: {
    sidebar: ["dashboard", "patients", "samples", "queue"],
    tabs: ["dashboard", "patients", "samples"],
  },
  scientist: {
    sidebar: ["dashboard", "samples", "queue", "review"],
    tabs: ["dashboard", "samples", "queue", "review"],
  },
  supervisor: {
    sidebar: ALL_NAV,
    tabs: ["dashboard", "samples", "review", "reports"],
  },
};

export function getSidebarItems(role: Role): NavItem[] {
  return ROLE_NAV[role].sidebar.map((id) => NAV_ITEMS[id]);
}

export function getMobileNav(
  role: Role
): { tabs: NavItem[]; more: NavItem[] } {
  const { sidebar, tabs } = ROLE_NAV[role];

  return {
    tabs: tabs.map((id) => NAV_ITEMS[id]),
    more: sidebar
      .filter((id) => !tabs.includes(id))
      .map((id) => NAV_ITEMS[id]),
  };
}

export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}