"use client";

import { useEffect, useMemo, useState } from "react";
import { apiRequest, apiRequestAll } from "@/app/lib/api";
import {
  reportPeriods,
  type DepartmentReport,
  type ReportMetric,
  type ReportPeriod,
  type StatusReport,
  type TrendReport,
} from "@/app/lib/report-data";

interface ApiSample {
  id: number;
  received_datetime: string;
  status: string;
}

interface ApiTestRequest {
  id: number;
  sample_id: number;
  department_id: number;
  status: string;
}

interface ApiResult {
  test_request_id: number;
  status: string;
}

interface ApiDepartment {
  id: number;
  name: string;
}

interface ReportSource {
  samples: ApiSample[];
  requests: ApiTestRequest[];
  results: ApiResult[];
  departments: ApiDepartment[];
}

interface LiveReportData {
  metrics: ReportMetric[];
  departments: DepartmentReport[];
  statuses: StatusReport[];
  trend: TrendReport[];
}

const sampleStatusColors: Record<string, string> = {
  Registered: "#4B708E",
  Received: "#24776D",
  "On Hold": "#D5B47C",
  Cancelled: "#A2ADB1",
};

function buildReportData(
  source: ReportSource,
  period: ReportPeriod,
): LiveReportData {
  const now = new Date();
  const days = period === "7 days" ? 7 : period === "30 days" ? 30 : 90;
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const inPeriodSamples = source.samples.filter((sample) => {
    const received = new Date(sample.received_datetime).getTime();
    return received >= start.getTime() && received <= now.getTime();
  });
  const sampleIds = new Set(inPeriodSamples.map((sample) => sample.id));
  const inPeriodRequests = source.requests.filter((request) =>
    sampleIds.has(request.sample_id),
  );
  const requestsById = new Map(
    source.requests.map((request) => [request.id, request]),
  );
  const approvedResults = source.results.filter((result) => {
    const request = requestsById.get(result.test_request_id);
    return result.status === "Approved" && request && sampleIds.has(request.sample_id);
  }).length;

  const pendingSamples = inPeriodSamples.filter(
    (sample) => sample.status === "Registered" || sample.status === "On Hold",
  ).length;
  const totalSamples = inPeriodSamples.length;
  const metrics: ReportMetric[] = [
    {
      label: "Total samples",
      value: String(totalSamples),
      change: "Live",
      direction: "neutral",
      description: `Received in the selected ${period} period`,
    },
    {
      label: "Completed tests",
      value: String(
        inPeriodRequests.filter((request) => request.status === "Completed")
          .length,
      ),
      change: "Live",
      direction: "neutral",
      description: `${approvedResults} supervisor-approved results`,
    },
    {
      label: "Pending samples",
      value: String(pendingSamples),
      change: "Live",
      direction: "neutral",
      description: "Registered or on-hold samples",
    },
    {
      label: "Urgent samples",
      value: "Unavailable",
      change: "Not tracked",
      direction: "neutral",
      description: "Priority is not recorded by the backend",
    },
  ];

  const sampleCountsByStatus = new Map<string, number>();
  for (const sample of inPeriodSamples) {
    sampleCountsByStatus.set(
      sample.status,
      (sampleCountsByStatus.get(sample.status) ?? 0) + 1,
    );
  }
  const statuses: StatusReport[] = Object.entries(sampleStatusColors).map(
    ([name, color]) => {
      const count = sampleCountsByStatus.get(name) ?? 0;
      return {
        name,
        count,
        percentage: totalSamples ? Math.round((count / totalSamples) * 100) : 0,
        color,
      };
    },
  );

  const samplesByDepartment = new Map<number, Set<number>>();
  for (const request of inPeriodRequests) {
    const departmentSamples =
      samplesByDepartment.get(request.department_id) ?? new Set<number>();
    departmentSamples.add(request.sample_id);
    samplesByDepartment.set(request.department_id, departmentSamples);
  }
  const departmentReports: DepartmentReport[] = source.departments
    .map((department) => ({
      name: department.name,
      samples: samplesByDepartment.get(department.id)?.size ?? 0,
      percentage: 0,
    }))
    .sort((left, right) => right.samples - left.samples);
  const maxDepartmentSamples = departmentReports[0]?.samples ?? 0;
  for (const department of departmentReports) {
    department.percentage = maxDepartmentSamples
      ? Math.round((department.samples / maxDepartmentSamples) * 100)
      : 0;
  }

  const bucketCount = period === "7 days" ? 7 : period === "30 days" ? 5 : 3;
  const bucketTotals = Array.from({ length: bucketCount }, () => 0);
  const bucketDuration = (now.getTime() - start.getTime()) / bucketCount;
  for (const sample of inPeriodSamples) {
    const received = new Date(sample.received_datetime).getTime();
    const bucket = Math.min(
      bucketCount - 1,
      Math.floor((received - start.getTime()) / bucketDuration),
    );
    bucketTotals[bucket] += 1;
  }
  const trend: TrendReport[] = bucketTotals.map((samples, index) => {
    if (period === "7 days") {
      const day = new Date(start.getTime() + bucketDuration * (index + 0.5));
      return {
        label: day.toLocaleDateString("en-GB", { weekday: "short" }),
        samples,
      };
    }

    return {
      label: period === "30 days" ? `Week ${index + 1}` : `Month ${index + 1}`,
      samples,
    };
  });

  return { metrics, departments: departmentReports, statuses, trend };
}

function MetricCard({
  metric,
}: {
  metric: ReportMetric;
}) {
  const changeColor = "text-muted";

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
  const [source, setSource] = useState<ReportSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    async function loadReportData() {
      try {
        setLoading(true);
        setLoadError("");

        const [samples, requests, results, departments] = await Promise.all([
          apiRequestAll<ApiSample>("/samples/"),
          apiRequestAll<ApiTestRequest>("/test-requests/"),
          apiRequestAll<ApiResult>("/results/"),
          apiRequest("/departments/") as Promise<ApiDepartment[]>,
        ]);
        setSource({ samples, requests, results, departments });
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "Unable to load report data.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadReportData();
  }, [loadAttempt]);

  const data = useMemo(
    () => (source ? buildReportData(source, period) : null),
    [source, period],
  );
  const metrics = data?.metrics ?? [
    "Total samples",
    "Completed tests",
    "Pending samples",
    "Urgent samples",
  ].map((label) => ({
    label,
    value: "—",
    change: loading ? "Loading" : "Unavailable",
    direction: "neutral" as const,
    description: "Backend data not available",
  }));
  const mostCommonStatus =
    data?.statuses.reduce<StatusReport | null>(
      (mostCommon, status) =>
        !mostCommon || status.count > mostCommon.count ? status : mostCommon,
      null,
    ) ?? null;
  const maxTrendSamples = Math.max(
    0,
    ...(data?.trend.map((item) => item.samples) ?? []),
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

      {/* Data availability */}
      <div className="rounded-lg border border-border bg-muted-surface px-4 py-3">
        <p className="text-xs text-muted">
          <span className="font-semibold text-foreground">Live backend data:</span>{" "}
          Periods filter records locally by sample received date; the backend
          does not provide date-filtered report endpoints. Priority is not
          recorded by the backend.
        </p>
      </div>

      {loading && (
        <p role="status" className="text-sm text-muted">
          Loading report data...
        </p>
      )}
      {loadError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-danger/30 bg-danger-soft/40 px-4 py-3">
          <p role="alert" className="text-sm text-danger">
            {loadError}
          </p>
          <button
            type="button"
            onClick={() => setLoadAttempt((attempt) => attempt + 1)}
            className="text-sm font-medium text-danger underline"
          >
            Retry
          </button>
        </div>
      )}

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
          {metrics.map((metric) => (
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
              Distinct samples with test requests for each department.
            </p>
          </div>

          {(data?.departments.length ?? 0) === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              {data
                ? "No department data is available for this period."
                : "Department data is unavailable until reports load."}
            </p>
          ) : (
          <div className="space-y-5">
            {data?.departments.map((department) => (
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
                      width: `${department.percentage}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          )}

          <div className="mt-6 border-t border-border pt-4">
            <p className="text-[11px] text-muted">
              Highest workload:{" "}
              <span className="font-semibold text-foreground">
                {data?.departments[0]?.name ?? "Unavailable"}
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
            {data?.statuses.map((status) => (
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
            {data?.statuses.map((status) => (
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
                {data
                  ? mostCommonStatus?.count
                    ? mostCommonStatus.name
                    : "None"
                  : "Unavailable"}
              </span>
            </p>
          </div>

          {data?.metrics[0]?.value === "0" && (
            <p className="mt-4 text-center text-xs text-muted">
              No samples were received in the selected period.
            </p>
          )}
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
          {data?.trend.map((item) => {
            const height = maxTrendSamples
              ? (item.samples / maxTrendSamples) * 100
              : 0;

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