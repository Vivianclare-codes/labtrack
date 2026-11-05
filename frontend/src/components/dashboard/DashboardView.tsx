"use client";

import { useMemo, useState } from "react";

import {
  ActivityIcon,
  DashboardIcon,
  HospitalIcon,
  PlusIcon,
  QueueIcon,
  SamplesIcon,
} from "@/components/ui/icons";

import {
  Card,
  EmptyState,
  MetricCard,
  PriorityBadge,
  SectionHeading,
  StatusBadge,
} from "./DashboardComponents";

import {
  dashboardStats,
  departmentWorkload,
  prioritySamples,
  recentSamples,
} from "@/app/lib/dashboard-data";

import type { SampleStatus } from "@/app/lib/dashboard-data";

type FilterType = "All" | "Registered" | "In progress" | "Completed" | "Exceptions";

const filters: FilterType[] = [
  "All",
  "Registered",
  "In progress",
  "Completed",
  "Exceptions",
];

function DashboardIconSmall({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary">
      {children}
    </span>
  );
}

function DashboardHeader() {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-micro font-medium uppercase tracking-wide text-muted">
        <span>Laboratory</span>
        <span>/</span>
        <span className="text-primary">Dashboard</span>
      </div>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-title font-semibold tracking-tight text-ink">
            Dashboard
          </h1>

          <p className="mt-2 max-w-xl text-body text-muted">
            Overview of laboratory activity and sample processing.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            window.alert(
              "Sample registration will be available when we build the sample registration screen."
            )
          }
          className="flex h-control w-full items-center justify-center gap-2 rounded-control bg-primary px-4 text-label font-semibold text-white transition-colors hover:bg-sidebar sm:w-auto"
        >
          <PlusIcon size={17} />
          Register sample
        </button>
      </div>
    </div>
  );
}

function MetricsSection() {
  const icons = [
    <SamplesIcon key="samples" size={17} />,
    <QueueIcon key="pending" size={17} />,
    <ActivityIcon key="processing" size={17} />,
    <DashboardIcon key="completed" size={17} />,
  ];

  return (
    <Card className="mt-7">
      <div className="grid grid-cols-2 divide-x divide-y divide-line lg:grid-cols-4 lg:divide-y-0">
        {dashboardStats.map((stat, index) => (
          <MetricCard
            key={stat.label}
            {...stat}
            icon={icons[index]}
          />
        ))}
      </div>
    </Card>
  );
}

function DepartmentWorkload() {
  return (
    <Card className="p-5">
      <SectionHeading
        title="Department workload"
        description="Sample activity across laboratory departments"
      />

      <div className="mt-6 space-y-5">
        {departmentWorkload.map((department) => {
          const percentage = Math.round(
            (department.completed / department.total) * 100
          );

          return (
            <div key={department.name}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-label font-medium text-ink">
                  {department.name}
                </p>

                <p className="shrink-0 text-caption text-muted">
                  {department.completed}/{department.total}
                </p>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: department.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-2 border-t border-line pt-4">
        <HospitalIcon size={16} className="text-muted" />

        <p className="text-caption text-muted">
          Five connected laboratory departments
        </p>
      </div>
    </Card>
  );
}

function PrioritySection() {
  return (
    <Card className="p-5">
      <SectionHeading
        title="Priority samples"
        description="Urgent samples requiring attention"
        action={
          <span className="rounded-badge bg-danger-soft px-2 py-1 text-caption font-medium text-danger">
            {prioritySamples.length} urgent
          </span>
        }
      />

      <div className="mt-5 space-y-0">
        {prioritySamples.map((sample, index) => (
          <div
            key={sample.id}
            className={`py-4 ${
              index !== prioritySamples.length - 1
                ? "border-b border-line"
                : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-label font-semibold text-ink">
                  {sample.patient}
                </p>

                <p className="mt-1 text-caption text-muted">
                  {sample.test}
                </p>

                <p className="mt-2 text-micro text-muted">
                  {sample.department}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <span className="rounded-badge bg-danger-soft px-2 py-1 text-micro font-medium text-danger">
                  Urgent
                </span>

                <p className="mt-3 text-caption text-muted">
                  {sample.wait}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function RecentSamples() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");

  const filteredSamples = useMemo(() => {
    switch (activeFilter) {
      case "Registered":
        return recentSamples.filter(
          (sample) => sample.status === "Received"
        );

      case "In progress":
        return recentSamples.filter(
          (sample) => sample.status === "Processing"
        );

      case "Completed":
        return recentSamples.filter(
          (sample) => sample.status === "Completed"
        );

      case "Exceptions":
        return recentSamples.filter(
          (sample) =>
            sample.status === "Pending" ||
            sample.priority === "Urgent"
        );

      default:
        return recentSamples;
    }
  }, [activeFilter]);

  return (
    <Card className="overflow-hidden">
      <div className="p-5 pb-4">
        <SectionHeading
          title="Recent samples"
          description="Latest samples registered in the laboratory"
        />

        <div
          role="tablist"
          aria-label="Filter recent samples"
          className="mt-5 flex gap-1 overflow-x-auto border-b border-line"
        >
          {filters.map((filter) => {
            const active = activeFilter === filter;

            return (
              <button
                key={filter}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveFilter(filter)}
                className={`relative shrink-0 px-3 py-3 text-caption transition-colors ${
                  active
                    ? "font-semibold text-primary"
                    : "text-muted hover:text-ink"
                }`}
              >
                {filter}

                {active && (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {filteredSamples.length === 0 ? (
        <div className="px-5 pb-5">
          <EmptyState message="No samples found for this filter." />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead className="bg-surface-muted">
                <tr className="h-table-head">
                  <th className="px-5 text-micro font-medium uppercase text-muted">
                    Sample ID
                  </th>

                  <th className="px-3 text-micro font-medium uppercase text-muted">
                    Patient
                  </th>

                  <th className="px-3 text-micro font-medium uppercase text-muted">
                    Department
                  </th>

                  <th className="px-3 text-micro font-medium uppercase text-muted">
                    Time received
                  </th>

                  <th className="px-3 text-micro font-medium uppercase text-muted">
                    Status
                  </th>

                  <th className="px-5 text-micro font-medium uppercase text-muted">
                    Priority
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredSamples.map((sample) => (
                  <tr
                    key={sample.id}
                    className="h-table-row border-b border-line last:border-b-0"
                  >
                    <td className="px-5">
                      <span className="whitespace-nowrap text-caption font-medium text-primary">
                        {sample.id}
                      </span>
                    </td>

                    <td className="px-3">
                      <p className="text-label font-medium text-ink">
                        {sample.patient}
                      </p>

                      <p className="mt-1 text-micro text-muted">
                        {sample.hospitalNumber}
                      </p>
                    </td>

                    <td className="px-3">
                      <p className="text-caption text-ink">
                        {sample.department}
                      </p>

                      <p className="mt-1 text-micro text-muted">
                        {sample.test}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-3 text-caption text-muted">
                      {sample.receivedAt}
                    </td>

                    <td className="px-3">
                      <StatusBadge status={sample.status} />
                    </td>

                    <td className="px-5">
                      <PriorityBadge priority={sample.priority} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile stacked sample cards */}
          <div className="divide-y divide-line md:hidden">
            {filteredSamples.map((sample) => (
              <article
                key={sample.id}
                className="p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-caption font-semibold text-primary">
                      {sample.id}
                    </p>

                    <h3 className="mt-2 text-label font-semibold text-ink">
                      {sample.patient}
                    </h3>

                    <p className="mt-1 text-caption text-muted">
                      {sample.hospitalNumber}
                    </p>
                  </div>

                  <StatusBadge status={sample.status} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3">
                  <div>
                    <p className="text-micro text-muted">
                      Department
                    </p>

                    <p className="mt-1 text-caption text-ink">
                      {sample.department}
                    </p>
                  </div>

                  <div>
                    <p className="text-micro text-muted">
                      Test
                    </p>

                    <p className="mt-1 text-caption text-ink">
                      {sample.test}
                    </p>
                  </div>

                  <div>
                    <p className="text-micro text-muted">
                      Time received
                    </p>

                    <p className="mt-1 text-caption text-ink">
                      {sample.receivedAt}
                    </p>
                  </div>

                  <div>
                    <p className="text-micro text-muted">
                      Priority
                    </p>

                    <div className="mt-1">
                      <PriorityBadge priority={sample.priority} />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

export default function DashboardView() {
  return (
    <div className="space-y-7">
      <DashboardHeader />

      <MetricsSection />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_1fr]">
        <DepartmentWorkload />

        <PrioritySection />
      </div>

      <RecentSamples />
    </div>
  );
}