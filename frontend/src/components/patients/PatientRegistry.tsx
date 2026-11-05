"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import PatientTable from "./PatientTable";

import {
  patients,
  type Patient,
  type PatientType,
} from "@/app/lib/patient-data";

type FilterType = "All" | PatientType;

const FILTERS: FilterType[] = [
  "All",
  "Outpatient",
  "Inpatient",
  "Emergency",
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

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function PatientRegistry() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("All");
  const [status, setStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const searchTerm = search.toLowerCase();

      const matchesSearch = [
        patient.hospitalNumber,
        patient.firstName,
        patient.lastName,
        patient.phone,
      ].some((value) => value.toLowerCase().includes(searchTerm));

      const matchesType =
        filter === "All" || patient.patientType === filter;

      const matchesStatus =
        status === "All" || patient.status === status;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [search, filter, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPatients.length / PAGE_SIZE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const startIndex = (safePage - 1) * PAGE_SIZE;

  const visiblePatients = filteredPatients.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  function updateSearch(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  function updateFilter(value: FilterType) {
    setFilter(value);
    setCurrentPage(1);
  }

  function updateStatus(value: string) {
    setStatus(value);
    setCurrentPage(1);
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <p className="mb-2 text-micro font-medium uppercase tracking-wider text-muted">
          Laboratory / Patients
        </p>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-title font-semibold tracking-tight text-ink">
              Patient registry
            </h1>

            <p className="mt-2 text-body text-muted">
              View and manage registered hospital patients.
            </p>
          </div>

          <Link
            href="/patients/register"
            className="inline-flex h-control items-center justify-center gap-2 rounded-control bg-primary px-4 text-label font-medium text-white transition-colors hover:bg-primary/90"
          >
            <PlusIcon />
            Register patient
          </Link>
        </div>
      </div>

      {/* Registry card */}
      <section className="overflow-hidden rounded-card border border-line bg-surface">
        {/* Search and filters */}
        <div className="space-y-4 border-b border-line p-4 lg:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Search patients</span>

              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                <SearchIcon />
              </span>

              <input
                type="search"
                value={search}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="Search by name, hospital number or phone..."
                className="h-field w-full rounded-control border border-line bg-surface pl-10 pr-3 text-body outline-none transition-colors focus:border-primary"
              />
            </label>

            <label className="flex items-center gap-2">
              <span className="sr-only">Filter by patient status</span>

              <select
                value={status}
                onChange={(event) => updateStatus(event.target.value)}
                className="h-field w-full rounded-control border border-line bg-surface px-3 text-body outline-none focus:border-primary sm:w-36"
              >
                <option value="All">All statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </label>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => updateFilter(item)}
                aria-pressed={filter === item}
                className={`h-chip shrink-0 rounded-chip px-3 text-label transition-colors ${
                  filter === item
                    ? "bg-primary-soft font-semibold text-primary"
                    : "border border-line bg-surface text-muted hover:text-ink"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Results summary */}
        <div className="flex items-center justify-between px-4 py-4 lg:px-5">
          <p className="text-label text-muted">
            <span className="font-semibold text-ink">
              {filteredPatients.length}
            </span>{" "}
            patients found
          </p>

          <p className="text-caption text-muted">
            Updated just now
          </p>
        </div>

        {/* Patient records */}
        {visiblePatients.length > 0 ? (
          <PatientTable patients={visiblePatients} />
        ) : (
          <div className="px-5 py-16 text-center">
            <p className="text-body font-medium text-ink">
              No patients found
            </p>

            <p className="mt-1 text-caption text-muted">
              Try changing your search or filters.
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredPatients.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-line px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-5">
            <p className="text-caption text-muted">
              Showing {startIndex + 1}–
              {Math.min(startIndex + PAGE_SIZE, filteredPatients.length)}{" "}
              of {filteredPatients.length} patients
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => setCurrentPage(safePage - 1)}
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
                onClick={() => setCurrentPage(safePage + 1)}
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