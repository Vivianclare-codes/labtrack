"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import PatientTable from "./PatientTable";

import { apiRequestAll } from "@/app/lib/api";
import type { Patient, PatientType } from "@/app/lib/patient-data";

type FilterType = "All" | PatientType;

const FILTERS: FilterType[] = [
  "All",
  "Outpatient",
  "Inpatient",
  "Emergency",
];

const PAGE_SIZE = 8;

interface ApiPatient {
  id: number;
  patient_id: string;
  first_name: string;
  last_name: string;
  hospital_number: string;
  date_of_birth: string;
  sex_at_birth: string;
  phone_number: string | null;
  patient_type: string;
  clinic_or_ward: string;
  registration_date: string;
}

function formatPatientDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

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
  const [currentPage, setCurrentPage] = useState(1);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    async function loadPatients() {
      try {
        setLoading(true);
        setFetchError("");
        const patientData = await apiRequestAll<ApiPatient>("/patients/");
        setPatients(
          patientData.map((patient) => ({
            id: patient.id,
            patientId: patient.patient_id,
            firstName: patient.first_name,
            lastName: patient.last_name,
            hospitalNumber: patient.hospital_number,
            dateOfBirth: formatPatientDate(patient.date_of_birth),
            sexAtBirth: patient.sex_at_birth,
            phoneNumber: patient.phone_number,
            patientType: patient.patient_type,
            clinicOrWard: patient.clinic_or_ward,
            registrationDate: formatPatientDate(patient.registration_date),
          })),
        );
        setCurrentPage(1);
      } catch (error) {
        setFetchError(
          error instanceof Error ? error.message : "Unable to load patients.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadPatients();
  }, [loadAttempt]);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const searchTerm = search.toLowerCase();

      const matchesSearch = [
        patient.hospitalNumber,
        patient.patientId,
        patient.firstName,
        patient.lastName,
        patient.phoneNumber ?? "",
      ].some((value) => value.toLowerCase().includes(searchTerm));

      const matchesType =
        filter === "All" || patient.patientType === filter;

      return matchesSearch && matchesType;
    });
  }, [patients, search, filter]);

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

          <p className="text-caption text-muted">Live backend records</p>
        </div>

        {/* Patient records */}
        {loading ? (
          <div role="status" className="px-5 py-16 text-center text-body text-muted">
            Loading patients...
          </div>
        ) : fetchError ? (
          <div className="px-5 py-12 text-center">
            <p role="alert" className="text-body font-medium text-danger">
              {fetchError}
            </p>
            <button
              type="button"
              onClick={() => setLoadAttempt((attempt) => attempt + 1)}
              className="mt-3 text-caption font-medium text-primary hover:underline"
            >
              Retry
            </button>
          </div>
        ) : visiblePatients.length > 0 ? (
          <PatientTable patients={visiblePatients} />
        ) : (
          <div className="px-5 py-16 text-center">
            <p className="text-body font-medium text-ink">
              {patients.length === 0
                ? "No patients are registered."
                : "No patients found"}
            </p>

            {patients.length > 0 && (
              <p className="mt-1 text-caption text-muted">
                Try changing your search or filters.
              </p>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && !fetchError && filteredPatients.length > 0 && (
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