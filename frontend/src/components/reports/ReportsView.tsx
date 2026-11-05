"use client";

import { useState } from "react";
import {
  reportData,
  reportPeriods,
  type ReportPeriod,
} from "@/app/lib/report-data";

function MetricCard({
  metric,
}: {
  metric: (typeof reportData)["7 days"]["metrics"][number];
}) {
  const changeColor =
    metric.direction === "up"
      ? "text-primary"
      : metric.direction === "down"
        ? "text-primary"
        : "text-muted";

  return (
    <div className="rounded-[10px] border border-border bg-white p-5">
      <p className="text-xs font-medium text-muted">{metric.label}</p>

      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-[30px] font-semibold leading-none tracking-tight text-foreground">
          {metric.value}
        </p>

        <span className={`text-xs font-semibold ${changeColor}`}>
          {metric.change}
        </span>
      </div>

      <p className="mt-3 text-[11px] text-muted">{metric.description}</p>
    </div>
  );
}

export default function ReportsView() {
  const [period, setPeriod] = useState<ReportPeriod>("30 days");

  const data = reportData[period];
  const maxDepartmentSamples = Math.max(
    ...data.departments.map((department) => department.samples),
  );
  const maxTrendSamples = Math.max(
    ...data.trend.map((item) => item.samples),
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            Laboratory / Reports
          </p>

          <h1 className="mt-2 text-[26px] font-semibold tracking-tight text-foreground">
            Reports
          </h1>

          <p className="mt-1 text-[13px] text-muted">
            Monitor laboratory activity and operational performance.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {reportPeriods.map((item) => {
            const active = period === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setPeriod(item)}
                className={`rounded-lg border px-4 py-2.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-white text-muted hover:bg-muted-surface"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Demo notice */}
      <div className="rounded-lg border border-border bg-muted-surface px-4 py-3">
        <p className="text-xs text-muted">
          <span className="font-semibold text-foreground">Demo report data:</span>{" "}
          Figures are illustrative and will be replaced with live laboratory
          records when the frontend is connected to the backend.
        </p>
      </div>

      {/* Metrics */}
      <section>
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-foreground">
            Overview
          </h2>
          <p className="mt-1 text-xs text-muted">
            Key laboratory activity for the selected period.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {data.metrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </div>
      </section>

      {/* Department workload and sample status */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="rounded-[10px] border border-border bg-white p-5">
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-foreground">
              Department workload
            </h2>
            <p className="mt-1 text-xs text-muted">
              Samples handled by each department.
            </p>
          </div>

          <div className="space-y-5">
            {data.departments.map((department) => (
              <div key={department.name}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-foreground">
                    {department.name}
                  </span>
                  <span className="text-xs tabular-nums text-muted">
                    {department.samples}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted-surface">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${
                        (department.samples / maxDepartmentSamples) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-border pt-4">
            <p className="text-[11px] text-muted">
              Highest workload:{" "}
              <span className="font-semibold text-foreground">
                {data.departments[0].name}
              </span>
            </p>
          </div>
        </div>

        <div className="rounded-[10px] border border-border bg-white p-5">
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-foreground">
              Sample status distribution
            </h2>
            <p className="mt-1 text-xs text-muted">
              Breakdown of samples by their current status.
            </p>
          </div>

          <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted-surface">
            {data.statuses.map((status) => (
              <div
                key={status.name}
                style={{
                  width: `${status.percentage}%`,
                  backgroundColor: status.color,
                }}
                title={`${status.name}: ${status.count}`}
              />
            ))}
          </div>

          <div className="mt-7 space-y-5">
            {data.statuses.map((status) => (
              <div
                key={status.name}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="text-xs text-foreground">
                    {status.name}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs tabular-nums text-muted">
                    {status.count}
                  </span>
                  <span className="w-10 text-right text-xs tabular-nums text-muted">
                    {status.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-border pt-4">
            <p className="text-[11px] text-muted">
              Most common status:{" "}
              <span className="font-semibold text-foreground">
                {data.statuses[0].name}
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Sample volume trend */}
      <section className="rounded-[10px] border border-border bg-white p-5">
        <div className="mb-7">
          <h2 className="text-sm font-semibold text-foreground">
            Sample volume trend
          </h2>
          <p className="mt-1 text-xs text-muted">
            Number of samples received across the selected period.
          </p>
        </div>

        <div className="flex h-[210px] items-end gap-3 sm:gap-6">
          {data.trend.map((item) => {
            const height = (item.samples / maxTrendSamples) * 100;

            return (
              <div
                key={item.label}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-[10px] tabular-nums text-muted">
                  {item.samples}
                </span>

                <div className="flex h-full w-full items-end justify-center">
                  <div
                    className="w-full max-w-[54px] rounded-t-md bg-[#99B8B0]"
                    style={{ height: `${height}%` }}
                  />
                </div>

                <span className="whitespace-nowrap text-[10px] text-muted">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Report availability */}
      <section className="rounded-[10px] border border-border bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Report generation
            </h2>
            <p className="mt-1 text-xs text-muted">
              Downloadable reports and scheduled report delivery are not
              connected in this demo.
            </p>
          </div>

          <span className="w-fit rounded-full bg-warning-soft px-3 py-1.5 text-[10px] font-semibold text-warning">
            Demo only
          </span>
        </div>
      </section>
    </div>
  );
}