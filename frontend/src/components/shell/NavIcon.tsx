import {
  ActivityIcon,
  DashboardIcon,
  PatientsIcon,
  QueueIcon,
  ReportsIcon,
  ReviewIcon,
  SamplesIcon,
} from "@/components/ui/icons";

import type { NavId } from "@/app/lib/navigation";
import type { ComponentProps } from "react";

const ICONS = {
  dashboard: DashboardIcon,
  patients: PatientsIcon,
  samples: SamplesIcon,
  queue: QueueIcon,
  review: ReviewIcon,
  reports: ReportsIcon,
  activity: ActivityIcon,
} satisfies Record<NavId, unknown>;

type NavIconProps = {
  id: NavId;
} & Omit<ComponentProps<typeof DashboardIcon>, "children">;

export function NavIcon({ id, ...props }: NavIconProps) {
  const Icon = ICONS[id];

  return <Icon {...props} />;
}