"use client";

import { useMemo, useState } from "react";

import SampleTable from "./SampleTable";

import {
  samples,
  type SampleRecord,
} from "@/app/lib/sample-data";

type SampleFilter =
  | "All"
  | "Registered"
  | "In progress"
  | "Completed"
  | "Exceptions"
  | "Priority";

const DESKTOP_FILTERS: SampleFilter[] = [
  "All",
  "Registered",
  "In progress",
  "Completed",
  "Exceptions",
];

const MOBILE_FILTERS: SampleFilter[] = [
  "All",
  "Priority",
  "Exceptions",
];

const PAGE_SIZE = 8;

function SearchIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m16 16 4 4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function matchesFilter(
  sample: SampleRecord,
  filter: SampleFilter
): boolean {
  switch (filter) {
    case "All":
      return true;

    case "Registered":
      return sample.status === "Received";

    case "In progress":
      return sample.status === "Processing";

    case "Completed":
      return sample.status === "Completed";

    case "Exceptions":
      return sample.status === "Pending";

    case "Priority":
      return sample.priority === "Urgent";

    default:
      return true;
  }
}

export default function SampleRegistry() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<SampleFilter>("All");
  const [department, setDepartment] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredSamples = useMemo(() => {
    return samples.filter((sample) => {
      const searchTerm = search.toLowerCase();

      const matchesSearch = [
        sample.sampleNumber,
        sample.patientName,
        sample.hospitalNumber,
        sample.test,
        sample.department,
      ].some((value) =>
        value.toLowerCase().includes(searchTerm)
      );

      const matchesDepartment =
        department === "All" ||
        sample.department === department;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesFilter(sample, filter)
      );
    });
  }, [search, filter, department]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSamples.length / PAGE_SIZE)
  );

  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;

  const visibleSamples = filteredSamples.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  function updateSearch(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  function updateFilter(value: SampleFilter) {
    setFilter(value);
    setCurrentPage(1);
  }

  function updateDepartment(value: string) {
    setDepartment(value);
    setCurrentPage(1);
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <p className="mb-2 text-micro font-medium uppercase tracking-wider text-muted">
          Laboratory / Samples
        </p>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-title font-semibold tracking-tight text-ink">
              Sample registry
            </h1>

            <p className="mt-2 text-body text-muted">
              View and track samples received by the laboratory.
            </p>
          </div>

          <a
            href="/samples/register"
            className="inline-flex h-control items-center justify-center rounded-control bg-primary px-4 text-label font-medium text-white transition-colors hover:bg-primary/90"
          >
            <span className="mr-2 text-base">+</span>
            Register sample
          </a>
        </div>
      </div>

      {/* Registry */}
      <section className="overflow-hidden rounded-card border border-line bg-surface">
        {/* Search and department filter */}
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row lg:p-5">
          <label className="relative flex-1">
            <span className="sr-only">Search samples</span>

            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              <SearchIcon />
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) =>
                updateSearch(event.target.value)
              }
              placeholder="Search by sample ID, patient or test..."
              className="h-field w-full rounded-control border border-line bg-surface pl-10 pr-3 text-body outline-none transition-colors focus:border-primary"
            />
          </label>

          <label>
            <span className="sr-only">Filter by department</span>

            <select
              value={department}
              onChange={(event) =>
                updateDepartment(event.target.value)
              }
              className="h-field w-full rounded-control border border-line bg-surface px-3 text-body outline-none focus:border-primary sm:w-52"
            >
              <option value="All">All departments</option>
              <option value="Haematology">Haematology</option>
              <option value="Microbiology">Microbiology</option>
              <option value="Chemical Pathology">
                Chemical Pathology
              </option>
              <option value="Histopathology">
                Histopathology
              </option>
              <option value="Serology/Immunology">
                Serology/Immunology
              </option>
            </select>
          </label>
        </div>

        {/* Desktop filters */}
        <div className="hidden gap-2 border-b border-line px-5 py-4 lg:flex">
          {DESKTOP_FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => updateFilter(item)}
              aria-pressed={filter === item}
              className={`h-chip rounded-chip px-4 text-label transition-colors ${
                filter === item
                  ? "bg-primary-soft font-semibold text-primary"
                  : "border border-line bg-surface text-muted hover:text-ink"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Mobile filters */}
        <div className="flex gap-2 overflow-x-auto border-b border-line px-4 py-4 lg:hidden">
          {MOBILE_FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => updateFilter(item)}
              aria-pressed={filter === item}
              className={`h-chip shrink-0 rounded-chip px-4 text-label transition-colors ${
                filter === item
                  ? "bg-primary-soft font-semibold text-primary"
                  : "border border-line bg-surface text-muted"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Results summary */}
        <div className="flex items-center justify-between px-4 py-4 lg:px-5">
          <p className="text-label text-muted">
            <span className="font-semibold text-ink">
              {filteredSamples.length}
            </span>{" "}
            samples found
          </p>

          <p className="text-caption text-muted">
            Laboratory records
          </p>
        </div>

        {/* Records */}
        {visibleSamples.length > 0 ? (
          <SampleTable samples={visibleSamples} />
        ) : (
          <div className="px-5 py-16 text-center">
            <p className="text-body font-medium text-ink">
              No samples found
            </p>

            <p className="mt-1 text-caption text-muted">
              Try changing your search or filters.
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredSamples.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-line px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-5">
            <p className="text-caption text-muted">
              Showing {startIndex + 1}–
              {Math.min(
                startIndex + PAGE_SIZE,
                filteredSamples.length
              )}{" "}
              of {filteredSamples.length} samples
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() =>
                  setCurrentPage(safePage - 1)
                }
                className="h-9 rounded-control border border-line px-3 text-caption text-ink disabled:opacity-40"
              >
                Previous
              </button>

              <span className="px-2 text-caption text-muted">
                Page {safePage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={safePage === totalPages}
                onClick={() =>
                  setCurrentPage(safePage + 1)
                }
                className="h-9 rounded-control border border-line px-3 text-caption text-ink disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}