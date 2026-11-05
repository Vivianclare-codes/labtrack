"use client";

import { useEffect, useMemo, useState } from "react";

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
  SectionHeading,
  StatusBadge,
} from "./DashboardComponents";

import { departmentWorkload as departmentPalette } from "@/app/lib/dashboard-data";

import type { SampleStatus } from "@/app/lib/dashboard-data";
import { apiRequest, apiRequestAll } from "@/app/lib/api";

type FilterType = "All" | "Registered" | "In progress" | "Completed" | "Exceptions";

const filters: FilterType[] = [
  "All",
  "Registered",
  "In progress",
  "Completed",
  "Exceptions",
];

interface ApiPatient {
  id: number;
  first_name: string;
  last_name: string;
  hospital_number: string;
}

interface ApiSample {
  id: number;
  sample_id: string;
  patient_id: number;
  received_datetime: string;
  status: string;
}

interface ApiTestRequest {
  id: number;
  sample_id: number;
  test_id: number | null;
  department_id: number;
  custom_test_name: string | null;
  status: string;
}

interface ApiTest {
  id: number;
  name: string;
}

interface ApiResult {
  id: number;
  status: string;
}

interface ApiDepartment {
  id: number;
  name: string;
}

interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  description: string;
  type: "neutral" | "warning" | "info" | "success";
}

interface DashboardSample {
  id: string;
  sampleNumber: string;
  patient: string;
  hospitalNumber: string;
  test: string;
  department: string;
  receivedAt: string;
  status: SampleStatus;
}

interface DepartmentWorkloadItem {
  name: string;
  total: number;
  completed: number;
  color: string;
}

interface AttentionItem {
  id: number;
  patient: string;
  sampleNumber: string;
  test: string;
  department: string;
  status: "Awaiting approval" | "Awaiting review";
}

interface DashboardData {
  metrics: DashboardMetric[];
  departments: DepartmentWorkloadItem[];
  attentionItems: AttentionItem[];
  recentSamples: DashboardSample[];
}

function buildDashboardData(
  patients: ApiPatient[],
  samples: ApiSample[],
  requests: ApiTestRequest[],
  tests: ApiTest[],
  departments: ApiDepartment[],
  results: ApiResult[],
): DashboardData {
  const patientsById = new Map(patients.map((patient) => [patient.id, patient]));
  const samplesById = new Map(samples.map((sample) => [sample.id, sample]));
  const testsById = new Map(tests.map((test) => [test.id, test]));
  const departmentsById = new Map(
    departments.map((department) => [department.id, department]),
  );
  const requestsBySample = new Map<number, ApiTestRequest[]>();

  for (const request of requests) {
    const sampleRequests = requestsBySample.get(request.sample_id) ?? [];
    sampleRequests.push(request);
    requestsBySample.set(request.sample_id, sampleRequests);
  }

  const recentSamples: DashboardSample[] = [...samples]
    .sort(
      (left, right) =>
        new Date(right.received_datetime).getTime() -
        new Date(left.received_datetime).getTime(),
    )
    .slice(0, 6)
    .map((sample) => {
      const patient = patientsById.get(sample.patient_id);
      const sampleRequests = requestsBySample.get(sample.id) ?? [];
      const requestedTests = sampleRequests
        .map((request) =>
          request.test_id === null
            ? request.custom_test_name
            : testsById.get(request.test_id)?.name,
        )
        .filter((name): name is string => Boolean(name));
      const requestedDepartments = sampleRequests
        .map(
          (request) => departmentsById.get(request.department_id)?.name,
        )
        .filter((name): name is string => Boolean(name));
      const hasCompletedRequest = sampleRequests.some(
        (request) => request.status === "Completed",
      );
      const hasActiveRequest = sampleRequests.some((request) =>
        ["Processing", "Awaiting Review"].includes(request.status),
      );
      const displayStatus: SampleStatus =
        sample.status === "On Hold" || sample.status === "Cancelled"
          ? "Pending"
          : hasCompletedRequest
            ? "Completed"
            : hasActiveRequest
              ? "Processing"
              : "Received";

      return {
        id: String(sample.id),
        sampleNumber: sample.sample_id,
        patient: patient
          ? `${patient.first_name} ${patient.last_name}`
          : "Patient information unavailable",
        hospitalNumber: patient?.hospital_number ?? "Not available",
        test: [...new Set(requestedTests)].join(", ") || "Not assigned",
        department:
          [...new Set(requestedDepartments)].join(", ") || "Not assigned",
        receivedAt: new Date(sample.received_datetime).toLocaleString(
          "en-GB",
          { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" },
        ),
        status: displayStatus,
      };
    });

  const workload = new Map<
    number,
    { total: number; completed: number }
  >();
  for (const request of requests) {
    const current = workload.get(request.department_id) ?? {
      total: 0,
      completed: 0,
    };
    current.total += 1;
    if (request.status === "Completed") {
      current.completed += 1;
    }
    workload.set(request.department_id, current);
  }

  const departmentItems = departments.map((department) => {
    const counts = workload.get(department.id) ?? { total: 0, completed: 0 };
    const paletteColor = departmentPalette.find(
      (item) => item.name === department.name,
    )?.color;

    return {
      name: department.name,
      ...counts,
      color: paletteColor ?? "#607D8B",
    };
  });

  const attentionItems: AttentionItem[] = requests
    .filter(
      (request) =>
        request.status === "Pending Approval" ||
        request.status === "Awaiting Review",
    )
    .map((request) => {
      const sample = samplesById.get(request.sample_id);
      const patient = sample
        ? patientsById.get(sample.patient_id)
        : undefined;
      const test =
        request.test_id === null
          ? request.custom_test_name
          : testsById.get(request.test_id)?.name;

      return {
        id: request.id,
        patient: patient
          ? `${patient.first_name} ${patient.last_name}`
          : "Patient information unavailable",
        sampleNumber: sample?.sample_id ?? "Sample information unavailable",
        test: test ?? "Test information unavailable",
        department:
          departmentsById.get(request.department_id)?.name ??
          "Department information unavailable",
        status:
          request.status === "Pending Approval"
            ? "Awaiting approval"
            : "Awaiting review",
      };
    });

  const pendingRequests = requests.filter(
    (request) =>
      request.status === "Requested" ||
      request.status === "Pending Approval",
  ).length;
  const processingRequests = requests.filter(
    (request) => request.status === "Processing",
  ).length;
  const completedRequests = requests.filter(
    (request) => request.status === "Completed",
  ).length;
  const approvedResultCount = results.filter(
    (result) => result.status === "Approved",
  ).length;

  return {
    metrics: [
      {
        label: "Total samples",
        value: String(samples.length),
        change: "Current",
        description: "samples in the backend",
        type: "neutral",
      },
      {
        label: "Pending requests",
        value: String(pendingRequests),
        change: "Current",
        description: "awaiting processing or approval",
        type: "warning",
      },
      {
        label: "Processing tests",
        value: String(processingRequests),
        change: "Current",
        description: "test requests in progress",
        type: "info",
      },
      {
        label: "Completed tests",
        value: String(completedRequests),
        change: "Current",
        description: `${approvedResultCount} approved results`,
        type: "success",
      },
    ],
    departments: departmentItems,
    attentionItems,
    recentSamples,
  };
}

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

function MetricsSection({ metrics }: { metrics: DashboardMetric[] }) {
  const icons = [
    <SamplesIcon key="samples" size={17} />,
    <QueueIcon key="pending" size={17} />,
    <ActivityIcon key="processing" size={17} />,
    <DashboardIcon key="completed" size={17} />,
  ];

  return (
    <Card className="mt-7">
      <div className="grid grid-cols-2 divide-x divide-y divide-line lg:grid-cols-4 lg:divide-y-0">
        {metrics.map((stat, index) => (
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

function DepartmentWorkload({
  departments,
}: {
  departments: DepartmentWorkloadItem[];
}) {
  return (
    <Card className="p-5">
      <SectionHeading
        title="Department workload"
        description="Test requests grouped by laboratory department"
      />

      {departments.length === 0 ? (
        <div className="mt-6">
          <EmptyState message="No department request data is available." />
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {departments.map((department) => {
            const percentage = department.total
              ? Math.round((department.completed / department.total) * 100)
              : 0;

            return (
              <div key={department.name}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-label font-medium text-ink">
                    {department.name}
                  </p>

                  <p className="shrink-0 text-caption text-muted">
                    {department.total} requests · {department.completed} completed
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
      )}

      <div className="mt-6 flex items-center gap-2 border-t border-line pt-4">
        <HospitalIcon size={16} className="text-muted" />

        <p className="text-caption text-muted">
          {departments.length} departments from the backend
        </p>
      </div>
    </Card>
  );
}

function PrioritySection({
  attentionItems,
}: {
  attentionItems: AttentionItem[];
}) {
  return (
    <Card className="p-5">
      <SectionHeading
        title="Requests needing attention"
        description="Custom tests awaiting approval and results awaiting review"
        action={
          <span className="rounded-badge bg-warning-soft px-2 py-1 text-caption font-medium text-warning">
            {attentionItems.length} requests
          </span>
        }
      />

      {attentionItems.length === 0 ? (
        <div className="mt-5">
          <EmptyState message="No requests are currently awaiting approval or review." />
        </div>
      ) : (
        <div className="mt-5 space-y-0">
          {attentionItems.map((item, index) => (
            <div
              key={item.id}
              className={`py-4 ${
                index !== attentionItems.length - 1
                  ? "border-b border-line"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-label font-semibold text-ink">
                    {item.patient}
                  </p>

                  <p className="mt-1 text-caption text-muted">
                    {item.sampleNumber} · {item.test}
                  </p>

                  <p className="mt-2 text-micro text-muted">
                    {item.department}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <span className="rounded-badge bg-warning-soft px-2 py-1 text-micro font-medium text-warning">
                    {item.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function RecentSamples({ samples }: { samples: DashboardSample[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");

  const filteredSamples = useMemo(() => {
    switch (activeFilter) {
      case "Registered":
        return samples.filter(
          (sample) => sample.status === "Received"
        );

      case "In progress":
        return samples.filter(
          (sample) => sample.status === "Processing"
        );

      case "Completed":
        return samples.filter(
          (sample) => sample.status === "Completed"
        );

      case "Exceptions":
        return samples.filter(
          (sample) =>
            sample.status === "Pending"
        );

      default:
        return samples;
    }
  }, [activeFilter, samples]);

  return (
    <Card className="overflow-hidden">
      <div className="p-5 pb-4">
        <SectionHeading
          title="Recent samples"
          description="Latest samples recorded in the backend"
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
          <EmptyState
            message={
              samples.length === 0
                ? "No samples are available."
                : "No samples found for this filter."
            }
          />
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
                        {sample.sampleNumber}
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
                      <span className="text-caption text-muted">
                        Not tracked
                      </span>
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
                      {sample.sampleNumber}
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
                      <span className="text-caption text-muted">
                        Not tracked
                      </span>
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
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setLoadError("");

        const [
          patients,
          samples,
          requests,
          tests,
          departments,
          results,
        ] = await Promise.all([
          apiRequestAll<ApiPatient>("/patients/"),
          apiRequestAll<ApiSample>("/samples/"),
          apiRequestAll<ApiTestRequest>("/test-requests/"),
          apiRequestAll<ApiTest>("/tests/?active_only=false"),
          apiRequest("/departments/") as Promise<ApiDepartment[]>,
          apiRequestAll<ApiResult>("/results/"),
        ]);

        setDashboardData(
          buildDashboardData(
            patients,
            samples,
            requests,
            tests,
            departments,
            results,
          ),
        );
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "Unable to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, [loadAttempt]);

  const metrics = dashboardData?.metrics ?? [
    {
      label: "Total samples",
      value: "—",
      change: loading ? "Loading" : "Unavailable",
      description: "backend data not available",
      type: "neutral" as const,
    },
    {
      label: "Pending requests",
      value: "—",
      change: loading ? "Loading" : "Unavailable",
      description: "backend data not available",
      type: "warning" as const,
    },
    {
      label: "Processing tests",
      value: "—",
      change: loading ? "Loading" : "Unavailable",
      description: "backend data not available",
      type: "info" as const,
    },
    {
      label: "Completed tests",
      value: "—",
      change: loading ? "Loading" : "Unavailable",
      description: "backend data not available",
      type: "success" as const,
    },
  ];

  return (
    <div className="space-y-7">
      <DashboardHeader />

      {loading && (
        <p role="status" className="text-sm text-muted">
          Loading dashboard data...
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

      <MetricsSection metrics={metrics} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_1fr]">
        <DepartmentWorkload departments={dashboardData?.departments ?? []} />

        <PrioritySection attentionItems={dashboardData?.attentionItems ?? []} />
      </div>

      <RecentSamples samples={dashboardData?.recentSamples ?? []} />
    </div>
  );
}