import type { ReactNode } from "react";

import type { SampleStatus } from "@/app/lib/dashboard-data";

type MetricType = "neutral" | "warning" | "info" | "success";

const metricStyles: Record<MetricType, string> = {
  neutral: "bg-surface-muted text-muted",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
  success: "bg-primary-soft text-primary",
};

interface MetricCardProps {
  label: string;
  value: string;
  change: string;
  description: string;
  type: MetricType;
  icon: ReactNode;
}

export function MetricCard({
  label,
  value,
  change,
  description,
  type,
  icon,
}: MetricCardProps) {
  return (
    <article className="min-w-0 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-label text-muted">{label}</p>

        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-control ${metricStyles[type]}`}
        >
          {icon}
        </span>
      </div>

      <p className="mt-3 text-kpi font-light tracking-tight text-ink">
        {value}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span
          className={`text-caption font-semibold ${
            type === "warning"
              ? "text-warning"
              : type === "success"
                ? "text-primary"
                : "text-muted"
          }`}
        >
          {change}
        </span>

        <span className="text-caption text-muted">
          {description}
        </span>
      </div>
    </article>
  );
}

const statusStyles: Record<SampleStatus, string> = {
  Received: "bg-info-soft text-info",
  Processing: "bg-info-soft text-info",
  Completed: "bg-primary-soft text-primary",
  Pending: "bg-warning-soft text-warning",
  Urgent: "bg-danger-soft text-danger",
};

export function StatusBadge({
  status,
}: {
  status: SampleStatus;
}) {
  return (
    <span
      className={`inline-flex min-h-badge items-center justify-center rounded-badge px-2 text-caption font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

export function PriorityBadge({
  priority,
}: {
  priority: "Routine" | "Urgent";
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-caption ${
        priority === "Urgent" ? "text-danger" : "text-muted"
      }`}
    >
      {priority === "Urgent" ? (
        <span className="size-1.5 rounded-full bg-danger" />
      ) : (
        <span className="size-1.5 rounded-full bg-faint" />
      )}

      {priority}
    </span>
  );
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-body font-semibold text-ink">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-caption text-muted">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-card border border-line bg-surface ${className}`}
    >
      {children}
    </section>
  );
}

export function EmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="flex min-h-28 items-center justify-center text-center text-body text-muted">
      {message}
    </div>
  );
}