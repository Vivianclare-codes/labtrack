import type { Metadata } from "next";

import DashboardView from "@/components/dashboard/DashboardView";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Laboratory activity overview for St. Anne's Hospital.",
};

export default function DashboardPage() {
  return <DashboardView />;
}