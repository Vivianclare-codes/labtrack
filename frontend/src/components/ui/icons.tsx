import type { ReactNode, SVGProps } from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  size?: number;
};

function createIcon(content: ReactNode) {
  return function Icon({ size = 20, ...props }: IconProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        {...props}
      >
        {content}
      </svg>
    );
  };
}

export const DashboardIcon = createIcon(
  <>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </>
);

export const PatientsIcon = createIcon(
  <>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
    <path d="M15.5 4.7a3.5 3.5 0 0 1 0 6.6" />
    <path d="M18 14.4c2.1.7 3.5 2.6 3.5 5.6" />
  </>
);

export const SamplesIcon = createIcon(
  <>
    <path d="M3 3h7" />
    <path d="M4.5 3v14a2.5 2.5 0 0 0 5 0V3" />
    <path d="M4.5 11h5" />
    <path d="M14 3h7" />
    <path d="M15.5 3v14a2.5 2.5 0 0 0 5 0V3" />
    <path d="M15.5 11h5" />
  </>
);

export const QueueIcon = createIcon(
  <>
    <path d="M9.5 3h5" />
    <path d="M10 3v6.3L4.7 18.2A2 2 0 0 0 6.4 21h11.2a2 2 0 0 0 1.7-2.8L14 9.3V3" />
    <path d="M7.6 15h8.8" />
  </>
);

export const ReviewIcon = createIcon(
  <>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 4V3.5A1.5 1.5 0 0 1 10.5 2h3A1.5 1.5 0 0 1 15 3.5V4" />
    <path d="m9.2 13.2 2.2 2.2 3.9-4.2" />
  </>
);

export const ReportsIcon = createIcon(
  <>
    <path d="M5 20v-4" />
    <path d="M9.5 20v-7" />
    <path d="M14 20v-5" />
    <path d="M18.5 20V9" />
    <path d="m3.5 11 5-4 4 2.5L20 4" />
  </>
);

export const ActivityIcon = createIcon(
  <>
    <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.4" />
    <path d="M3.5 3.8v4.6h4.6" />
    <path d="M12 7.5V12l3 1.8" />
  </>
);

export const HelpIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.4 9.4a2.7 2.7 0 0 1 5.2.9c0 1.8-2.6 2.3-2.6 4" />
    <path d="M12 17.3h.01" />
  </>
);

export const BellIcon = createIcon(
  <>
    <path d="M6 9a6 6 0 0 1 12 0c0 6.5 2.5 8 2.5 8h-17S6 15.5 6 9" />
    <path d="M10.2 20.5a2 2 0 0 0 3.6 0" />
  </>
);

export const HospitalIcon = createIcon(
  <>
    <path d="M4 21V6.5A2.5 2.5 0 0 1 6.5 4h7A2.5 2.5 0 0 1 16 6.5V21" />
    <path d="M16 10h1.5a2.5 2.5 0 0 1 2.5 2.5V21" />
    <path d="M2.5 21h19" />
    <path d="M10 8v5M7.5 10.5h5" />
  </>
);

export const ShieldIcon = createIcon(
  <>
    <path d="M12 3 5 5.8v5.4c0 4.4 2.9 8 7 9.3 4.1-1.3 7-4.9 7-9.3V5.8z" />
    <path d="m9.2 12 2.1 2.1 3.6-3.8" />
  </>
);

export const MenuIcon = createIcon(
  <>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </>
);

export const PlusIcon = createIcon(<path d="M12 5v14M5 12h14" />);