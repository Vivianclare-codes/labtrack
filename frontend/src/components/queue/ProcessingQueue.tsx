
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/app/lib/api";

type QueueStatus =
  | "Pending"
  | "In Progress"
  | "Awaiting Result Submission";

interface ApiTestRequest {
  id: number;
  request_id: string;
  sample_id: number;
  test_id: number | null;
  department_id: number;
  custom_test_name: string | null;
  status: string;
}

interface ApiSample {
  id: number;
  sample_id: string;
  patient_id: number;
  received_datetime: string;
}

interface ApiPatient {
  id: number;
  first_name: string;
  last_name: string;
}

interface ApiTest {
  id: number;
  name: string;
}

interface ApiDepartment {
  id: number;
  name: string;
  is_active: boolean;
}

interface QueueItem {
  id: string;
  sampleNumber: string;
  patientName: string;
  test: string;
  department: string;
  receivedAt: string;
  receivedTime: string;
  status: QueueStatus;
}

const statusFilters = [
  "All",
  "Pending",
  "In Progress",
  "Awaiting Result Submission",
] as const;

type StatusFilter = (typeof statusFilters)[number];

function QueueStatusBadge({ status }: { status: QueueStatus }) {
  const styles: Record<QueueStatus, string> = {
    Pending: "bg-warning-soft text-warning",
    "In Progress": "bg-info-soft text-info",
    "Awaiting Result Submission": "bg-primary-soft text-primary",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <circle
        cx="10.8"
        cy="10.8"
        r="6.8"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m16 16 4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ProcessingQueue() {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All departments");
  const [status, setStatus] = useState<StatusFilter>("All");

  useEffect(() => {
    async function fetchQueue() {
      try {
        setLoading(true);
        setFetchError("");

        const [
          requestData,
          sampleData,
          patientData,
          testData,
          departmentData,
        ] = await Promise.all([
          apiRequest("/test-requests/"),
          apiRequest("/samples/"),
          apiRequest("/patients/"),
          apiRequest("/tests/"),
          apiRequest("/departments/"),
        ]);

        const requests = requestData as ApiTestRequest[];
        const samples = sampleData as ApiSample[];
        const patients = patientData as ApiPatient[];
        const tests = testData as ApiTest[];
        const departmentList = departmentData as ApiDepartment[];

        setDepartments(
          departmentList
            .filter((item) => item.is_active)
            .map((item) => item.name)
        );

        const formattedItems: QueueItem[] = requests
          .filter((request) =>
            ["Requested", "Processing", "Awaiting Review"].includes(
              request.status
            )
          )
          .map((request) => {
            const sample = samples.find(
              (item) => item.id === request.sample_id
            );

            const patient = sample
              ? patients.find((item) => item.id === sample.patient_id)
              : undefined;

            const test = tests.find(
              (item) => item.id === request.test_id
            );

            const departmentRecord = departmentList.find(
              (item) => item.id === request.department_id
            );

            if (!sample || !patient) {
              return null;
            }

            const receivedDate = new Date(sample.received_datetime);

            const receivedAt = receivedDate.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });

            const receivedTime = receivedDate.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            });

            let displayStatus: QueueStatus;

            if (request.status === "Requested") {
              displayStatus = "Pending";
            } else if (request.status === "Processing") {
              displayStatus = "In Progress";
            } else {
              displayStatus = "Awaiting Result Submission";
            }

            return {
              // Business request ID is used by the processing route.
              id: request.request_id,
              sampleNumber: sample.sample_id,
              patientName: `${patient.first_name} ${patient.last_name}`,
              test: test?.name || request.custom_test_name || "Custom test",
              department: departmentRecord?.name || "Unknown department",
              receivedAt,
              receivedTime,
              status: displayStatus,
            };
          })
          .filter((item): item is QueueItem => item !== null);

        setQueueItems(formattedItems);
      } catch (err) {
        setFetchError(
          err instanceof Error
            ? err.message
            : "Failed to load the processing queue."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchQueue();
  }, []);

  const filteredItems = useMemo(() => {
    return queueItems.filter((item) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        item.test.toLowerCase().includes(searchValue) ||
        item.sampleNumber.toLowerCase().includes(searchValue) ||
        item.patientName.toLowerCase().includes(searchValue);

      const matchesDepartment =
        department === "All departments" ||
        item.department === department;

      const matchesStatus =
        status === "All" || item.status === status;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [queueItems, search, department, status]);

  const pendingCount = queueItems.filter(
    (item) => item.status === "Pending"
  ).length;

  const inProgressCount = queueItems.filter(
    (item) => item.status === "In Progress"
  ).length;

  const awaitingCount = queueItems.filter(
    (item) => item.status === "Awaiting Result Submission"
  ).length;

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center">
        <p className="text-sm text-muted">Loading processing queue...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="rounded-xl border border-border bg-white p-6">
        <p className="text-sm font-medium text-danger">
          Could not load the processing queue.
        </p>
        <p className="mt-2 text-sm text-muted">{fetchError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Laboratory / Work
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Processing queue
        </h1>

        <p className="mt-2 text-sm text-muted">
          View and manage laboratory tests awaiting processing.
        </p>
      </div>

      {/* Queue status summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">Pending</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">In progress</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {inProgressCount}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">
            Awaiting result submission
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {awaitingCount}
          </p>
        </div>
      </div>

      {/* Queue filters */}
      <section className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative w-full lg:max-w-sm">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              <SearchIcon />
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tests, samples or patients"
              className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {/* Department filter */}
          <div className="w-full lg:w-56">
            <select
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              aria-label="Filter by department"
            >
              <option value="All departments">All departments</option>

              {departments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status filters */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {statusFilters.map((filter) => {
            const active = status === filter;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setStatus(filter)}
                className={`shrink-0 rounded-lg px-4 py-2 text-xs font-medium transition ${
                  active
                    ? "bg-primary text-white"
                    : "border border-border bg-white text-muted hover:bg-muted-surface"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </section>

      {/* Results heading */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Test requests
          </h2>
          <p className="mt-1 text-xs text-muted">
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "record" : "records"} found
          </p>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-white md:block">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted-surface">
                {[
                  "Test name",
                  "Sample reference",
                  "Patient",
                  "Department",
                  "Time received",
                  "Status",
                  "",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap px-4 py-4 text-xs font-semibold text-muted"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border last:border-0 hover:bg-muted-surface/50"
                >
                  <td className="px-4 py-4 text-sm font-medium text-foreground">
                    {item.test}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-xs font-medium text-primary">
                    {item.sampleNumber}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-sm text-foreground">
                    {item.patientName}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-xs text-muted">
                    {item.department}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <p className="text-xs text-foreground">
                      {item.receivedAt}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {item.receivedTime}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <QueueStatusBadge status={item.status} />
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-right">
                    <div className="flex flex-col items-end gap-2">
                      <Link
                        href={`/test-processing/${item.id}`}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Process test
                      </Link>

                      <Link
                        href={`/samples/${item.sampleNumber}`}
                        className="text-xs text-muted hover:text-primary"
                      >
                        View sample
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-foreground">
              No test requests found
            </p>
            <p className="mt-1 text-xs text-muted">
              Try changing your search or filters.
            </p>
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {filteredItems.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-border bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground">
                  {item.test}
                </h3>

                <p className="mt-1 text-xs font-medium text-primary">
                  {item.sampleNumber}
                </p>
              </div>

              <QueueStatusBadge status={item.status} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4">
              <div>
                <p className="text-xs text-muted">Patient</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {item.patientName}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">Department</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {item.department}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">Time received</p>
                <p className="mt-1 text-sm text-foreground">
                  {item.receivedTime}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {item.receivedAt}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 border-t border-border pt-3">
              <Link
                href={`/test-processing/${item.id}`}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Process test
              </Link>

              <Link
                href={`/samples/${item.sampleNumber}`}
                className="text-sm font-medium text-muted hover:text-primary"
              >
                View sample details
              </Link>
            </div>
          </article>
        ))}

        {filteredItems.length === 0 && (
          <div className="rounded-xl border border-border bg-white px-5 py-12 text-center">
            <p className="text-sm font-medium text-foreground">
              No test requests found
            </p>
            <p className="mt-1 text-xs text-muted">
              Try changing your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
