"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { samples } from "@/app/lib/sample-data";
import { CONNECTED_DEPARTMENTS } from "@/app/lib/hospital";

type QueueStatus =
  | "Pending"
  | "In Progress"
  | "Awaiting Result Submission";

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

const queueItems: QueueItem[] = samples.map((sample) => ({
  id: sample.id,
  sampleNumber: sample.sampleNumber,
  patientName: sample.patientName,
  test: sample.test,
  department: sample.department,
  receivedAt: sample.receivedAt,
  receivedTime: sample.receivedTime,
  status:
    sample.status === "Pending"
      ? "Pending"
      : sample.status === "Completed"
        ? "Awaiting Result Submission"
        : "In Progress",
}));

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
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All departments");
  const [status, setStatus] = useState<StatusFilter>("All");

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
  }, [search, department, status]);

  const pendingCount = queueItems.filter(
    (item) => item.status === "Pending",
  ).length;

  const inProgressCount = queueItems.filter(
    (item) => item.status === "In Progress",
  ).length;

  const awaitingCount = queueItems.filter(
    (item) => item.status === "Awaiting Result Submission",
  ).length;

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

              {CONNECTED_DEPARTMENTS.map((item) => (
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
                    <Link
                      href={`/samples/${item.id}`}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      View sample
                    </Link>
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

            <div className="mt-4 border-t border-border pt-3">
              <Link
                href={`/samples/${item.id}`}
                className="text-sm font-semibold text-primary hover:underline"
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