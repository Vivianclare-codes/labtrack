"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiRequest, apiRequestAll } from "@/app/lib/api";

type ReviewStatus =
  | "Pending Review"
  | "Approved"
  | "Rejected"
  | "Draft"
  | "Unknown";

interface ApiResult {
  id: number;
  result_id: string;
  test_request_id: number;
  result_value: string;
  unit: string | null;
  reference_range: string | null;
  interpretation: string | null;
  comments: string | null;
  performed_by: string;
  status: string;
  created_at: string;
}

interface ApiTestRequest {
  id: number;
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
  hospital_number: string;
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
}

interface ReviewRecord {
  id: string;
  sampleId: string;
  sampleNumber: string;
  patientName: string;
  hospitalNumber: string;
  test: string;
  department: string;
  receivedAt: string;
  result: string;
  unit: string;
  referenceRange: string;
  interpretation: string;
  notes: string;
  submittedBy: string;
  submittedAt: string;
  status: ReviewStatus;
}

const filters = [
  "All",
  "Pending Review",
  "Approved",
  "Rejected",
] as const;

type ReviewFilter = (typeof filters)[number] | "All";

function mapResultStatus(status: string): ReviewStatus {
  switch (status) {
    case "Awaiting Review":
      return "Pending Review";
    case "Approved":
    case "Rejected":
    case "Draft":
      return status;
    default:
      return "Unknown";
  }
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  const styles: Record<ReviewStatus, string> = {
    "Pending Review": "bg-warning-soft text-warning",
    Approved: "bg-primary-soft text-primary",
    Rejected: "bg-danger-soft text-danger",
    Draft: "bg-muted-surface text-muted",
    Unknown: "bg-muted-surface text-muted",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-border py-3 last:border-0">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export default function ResultReview() {
  const [records, setRecords] = useState<ReviewRecord[]>([]);
  const [filter, setFilter] = useState<ReviewFilter>("Pending Review");
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [actionError, setActionError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadResults() {
      try {
        setLoading(true);
        setLoadError("");

        const [resultData, requestData, sampleData, patientData, testData, departmentData] =
          await Promise.all([
            apiRequestAll<ApiResult>("/results/"),
            apiRequestAll<ApiTestRequest>("/test-requests/"),
            apiRequestAll<ApiSample>("/samples/"),
            apiRequestAll<ApiPatient>("/patients/"),
            apiRequestAll<ApiTest>("/tests/?active_only=false"),
            apiRequest("/departments/") as Promise<ApiDepartment[]>,
          ]);

        const requestsById = new Map(
          requestData.map((request) => [request.id, request])
        );
        const samplesById = new Map(
          sampleData.map((sample) => [sample.id, sample])
        );
        const patientsById = new Map(
          patientData.map((patient) => [patient.id, patient])
        );
        const testsById = new Map(testData.map((test) => [test.id, test]));
        const departmentsById = new Map(
          departmentData.map((department) => [department.id, department])
        );

        const formattedResults = resultData.map((result): ReviewRecord => {
          const request = requestsById.get(result.test_request_id);
          const sample = request
            ? samplesById.get(request.sample_id)
            : undefined;
          const patient = sample
            ? patientsById.get(sample.patient_id)
            : undefined;
          const test =
            request?.test_id == null
              ? undefined
              : testsById.get(request.test_id);
          const department = request
            ? departmentsById.get(request.department_id)
            : undefined;

          return {
            id: result.result_id,
            sampleId: sample ? String(sample.id) : "",
            sampleNumber: sample?.sample_id ?? "Sample information unavailable",
            patientName: patient
              ? `${patient.first_name} ${patient.last_name}`
              : "Patient information unavailable",
            hospitalNumber: patient?.hospital_number ?? "Not available",
            test:
              test?.name ??
              request?.custom_test_name ??
              "Test information unavailable",
            department: department?.name ?? "Department information unavailable",
            receivedAt: sample
              ? new Date(sample.received_datetime).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Not available",
            result: result.result_value,
            unit: result.unit ?? "Not specified",
            referenceRange: result.reference_range ?? "Not specified",
            interpretation: result.interpretation ?? "Not specified",
            notes: result.comments ?? "No laboratory notes.",
            submittedBy: result.performed_by,
            submittedAt: new Date(result.created_at).toLocaleString("en-GB"),
            status: mapResultStatus(result.status),
          };
        });

        setRecords(formattedResults);
        setSelectedId((current) =>
          formattedResults.some((record) => record.id === current)
            ? current
            : formattedResults.find(
                (record) => record.status === "Pending Review",
              )?.id ?? ""
        );
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "Unable to load results."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadResults();
  }, [loadAttempt]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        record.patientName.toLowerCase().includes(searchValue) ||
        record.sampleNumber.toLowerCase().includes(searchValue) ||
        record.test.toLowerCase().includes(searchValue);

      const matchesFilter =
        filter === "All" || record.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [records, search, filter]);

  const selectedRecord =
    records.find((record) => record.id === selectedId) ?? null;

  const pendingCount = records.filter(
    (record) => record.status === "Pending Review",
  ).length;

  const approvedCount = records.filter(
    (record) => record.status === "Approved",
  ).length;

  const rejectedCount = records.filter(
    (record) => record.status === "Rejected",
  ).length;

  async function reviewResult(decision: "approve" | "reject") {
    if (!selectedRecord || saving) {
      return;
    }

    setSaving(true);
    setActionError("");
    setFeedback("");

    try {
      const updatedResult: ApiResult = await apiRequest(
        `/results/${selectedRecord.id}/review`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            decision,
            ...(decision === "reject"
              ? { review_comments: rejectionReason.trim() }
              : {}),
          }),
        }
      );

      setRecords((current) =>
        current.map((record) =>
          record.id === updatedResult.result_id
            ? {
                ...record,
                status: mapResultStatus(updatedResult.status),
                notes: updatedResult.comments ?? record.notes,
              }
            : record
        )
      );
      setRejecting(false);
      setRejectionReason("");
      setFeedback(
        decision === "approve"
          ? "Result approved successfully."
          : "Result rejected and returned for correction."
      );
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to update result."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleFilterChange(nextFilter: ReviewFilter) {
    setFilter(nextFilter);
    setFeedback("");
    setActionError("");
    setRejecting(false);
  }

  function selectRecord(recordId: string) {
    setSelectedId(recordId);
    setFeedback("");
    setActionError("");
    setRejecting(false);
    setRejectionReason("");
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Laboratory / Review
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Result review
        </h1>

        <p className="mt-2 text-sm text-muted">
          Review laboratory findings and approve or reject submitted results.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">Pending review</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">Approved</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {approvedCount}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">Rejected</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {rejectedCount}
          </p>
        </div>
      </div>

      {/* Filters and search */}
      <section className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Submitted results
            </h2>
            <p className="mt-1 text-xs text-muted">
              Select a result to inspect its details.
            </p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search patient, test or sample"
            aria-label="Search submitted results"
            className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10 lg:max-w-xs"
          />
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleFilterChange(item)}
              className={`shrink-0 rounded-lg px-4 py-2 text-xs font-medium transition ${
                filter === item
                  ? "bg-primary text-white"
                  : "border border-border bg-white text-muted hover:bg-muted-surface"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* Desktop: list and details side by side */}
      <div className="hidden gap-5 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="overflow-hidden rounded-xl border border-border bg-white">
          <div className="border-b border-border p-4">
            <h2 className="text-sm font-semibold text-foreground">
              Review list
            </h2>
            <p className="mt-1 text-xs text-muted">
              {filteredRecords.length} records
            </p>
          </div>

          <div className="max-h-[720px] overflow-y-auto">
            {loading ? (
              <p className="px-5 py-12 text-center text-sm text-muted">
                Loading results...
              </p>
            ) : loadError ? (
              <div className="px-5 py-8 text-center">
                <p role="alert" className="text-sm text-danger">
                  {loadError}
                </p>
                <button
                  type="button"
                  onClick={() => setLoadAttempt((attempt) => attempt + 1)}
                  className="mt-3 text-sm font-medium text-primary hover:underline"
                >
                  Retry
                </button>
              </div>
            ) : filteredRecords.map((record) => (
              <button
                key={record.id}
                type="button"
                onClick={() => selectRecord(record.id)}
                className={`w-full border-b border-border p-4 text-left transition last:border-0 hover:bg-muted-surface/60 ${
                  selectedId === record.id ? "bg-primary-soft/50" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {record.patientName}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {record.sampleNumber}
                    </p>
                  </div>

                  <StatusBadge status={record.status} />
                </div>

                <p className="mt-3 text-sm text-foreground">
                  {record.test}
                </p>

                <p className="mt-1 text-xs text-muted">
                  {record.department}
                </p>
              </button>
            ))}

            {!loading && !loadError && filteredRecords.length === 0 && (
              <p className="px-5 py-12 text-center text-sm text-muted">
                {records.length === 0
                  ? "No results are available."
                  : "No results match your search or filter."}
              </p>
            )}
          </div>
        </section>

        <ReviewDetails
          record={selectedRecord}
          feedback={feedback}
          actionError={actionError}
          rejecting={rejecting}
          rejectionReason={rejectionReason}
          saving={saving}
          onApprove={() => void reviewResult("approve")}
          onRejectStart={() => {
            setRejecting(true);
            setFeedback("");
            setActionError("");
          }}
          onRejectCancel={() => {
            setRejecting(false);
            setRejectionReason("");
          }}
          onRejectConfirm={() => void reviewResult("reject")}
          onReasonChange={setRejectionReason}
        />
      </div>

      {/* Mobile: list first, details below */}
      <div className="space-y-5 lg:hidden">
        <section className="overflow-hidden rounded-xl border border-border bg-white">
          <div className="border-b border-border p-4">
            <h2 className="text-sm font-semibold text-foreground">
              Review list
            </h2>
            <p className="mt-1 text-xs text-muted">
              {filteredRecords.length} records
            </p>
          </div>

          {loading ? (
            <p className="px-5 py-12 text-center text-sm text-muted">
              Loading results...
            </p>
          ) : loadError ? (
            <div className="px-5 py-8 text-center">
              <p role="alert" className="text-sm text-danger">
                {loadError}
              </p>
              <button
                type="button"
                onClick={() => setLoadAttempt((attempt) => attempt + 1)}
                className="mt-3 text-sm font-medium text-primary hover:underline"
              >
                Retry
              </button>
            </div>
          ) : filteredRecords.map((record) => (
            <button
              key={record.id}
              type="button"
              onClick={() => selectRecord(record.id)}
              className={`w-full border-b border-border p-4 text-left last:border-0 ${
                selectedId === record.id ? "bg-primary-soft/50" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {record.patientName}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {record.sampleNumber}
                  </p>
                </div>

                <StatusBadge status={record.status} />
              </div>

              <p className="mt-3 text-sm text-foreground">{record.test}</p>
              <p className="mt-1 text-xs text-muted">
                {record.department}
              </p>
            </button>
          ))}

          {!loading && !loadError && filteredRecords.length === 0 && (
            <p className="px-5 py-12 text-center text-sm text-muted">
              {records.length === 0
                ? "No results are available."
                : "No results match your search or filter."}
            </p>
          )}
        </section>

        <ReviewDetails
          record={selectedRecord}
          feedback={feedback}
          actionError={actionError}
          rejecting={rejecting}
          rejectionReason={rejectionReason}
          saving={saving}
          onApprove={() => void reviewResult("approve")}
          onRejectStart={() => {
            setRejecting(true);
            setFeedback("");
            setActionError("");
          }}
          onRejectCancel={() => {
            setRejecting(false);
            setRejectionReason("");
          }}
          onRejectConfirm={() => void reviewResult("reject")}
          onReasonChange={setRejectionReason}
        />
      </div>
    </div>
  );
}

interface ReviewDetailsProps {
  record: ReviewRecord | null;
  feedback: string;
  actionError: string;
  rejecting: boolean;
  rejectionReason: string;
  saving: boolean;
  onApprove: () => void;
  onRejectStart: () => void;
  onRejectCancel: () => void;
  onRejectConfirm: () => void;
  onReasonChange: (value: string) => void;
}

function ReviewDetails({
  record,
  feedback,
  actionError,
  rejecting,
  rejectionReason,
  saving,
  onApprove,
  onRejectStart,
  onRejectCancel,
  onRejectConfirm,
  onReasonChange,
}: ReviewDetailsProps) {
  if (!record) {
    return (
      <section className="flex min-h-72 items-center justify-center rounded-xl border border-border bg-white p-6">
        <p className="text-sm text-muted">
          Select a result from the review list to see its details.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-5">
        <div>
          <p className="text-xs text-muted">Selected result</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">
            {record.patientName}
          </h2>
          <p className="mt-1 text-xs text-primary">
            {record.sampleNumber}
          </p>
        </div>

        <StatusBadge status={record.status} />
      </div>

      <div className="py-4">
        <h3 className="text-sm font-semibold text-foreground">
          Patient and test information
        </h3>

        <DetailItem label="Hospital number" value={record.hospitalNumber} />
        <DetailItem label="Requested test" value={record.test} />
        <DetailItem label="Department" value={record.department} />
        <DetailItem label="Priority" value="Not tracked by the backend" />
        <DetailItem label="Received date" value={record.receivedAt} />
      </div>

      <div className="border-t border-border py-4">
        <h3 className="text-sm font-semibold text-foreground">
          Submitted result
        </h3>

        <div className="mt-4 rounded-lg bg-muted-surface p-4">
          <p className="text-xs text-muted">Result</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {record.result}
          </p>

          <p className="mt-4 text-xs text-muted">Unit</p>
          <p className="mt-1 text-sm text-foreground">{record.unit}</p>

          <p className="mt-4 text-xs text-muted">Reference range</p>
          <p className="mt-1 text-sm text-foreground">
            {record.referenceRange}
          </p>

          <p className="mt-4 text-xs text-muted">Interpretation</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {record.interpretation}
          </p>
        </div>
      </div>

      <div className="border-t border-border py-4">
        <h3 className="text-sm font-semibold text-foreground">
          Submission information
        </h3>

        <DetailItem label="Performed by" value={record.submittedBy} />
        <DetailItem label="Result recorded at" value={record.submittedAt} />

        <div className="pt-3">
          <p className="text-xs text-muted">Laboratory notes</p>
          <p className="mt-1 text-sm leading-6 text-foreground">
            {record.notes}
          </p>
        </div>
      </div>

      {feedback && (
        <p
          role="status"
          className="mb-4 rounded-lg bg-primary-soft px-4 py-3 text-sm text-primary"
        >
          {feedback}
        </p>
      )}

      {actionError && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-danger-soft/40 px-4 py-3 text-sm text-danger"
        >
          {actionError}
        </p>
      )}

      {rejecting && (
        <div className="mb-4 rounded-lg border border-danger/30 bg-danger-soft/40 p-4">
          <label
            htmlFor="rejectionReason"
            className="block text-sm font-medium text-foreground"
          >
            Reason for rejection
          </label>

          <textarea
            id="rejectionReason"
            value={rejectionReason}
            onChange={(event) => onReasonChange(event.target.value)}
            rows={3}
            placeholder="Explain why this result needs correction..."
            className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />

          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={onRejectCancel}
              className="h-10 rounded-lg border border-border bg-white px-4 text-sm font-medium text-foreground disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!rejectionReason.trim() || saving}
              onClick={onRejectConfirm}
              className="h-10 rounded-lg bg-danger px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Submitting..." : "Confirm rejection"}
            </button>
          </div>
        </div>
      )}

      {record.status === "Pending Review" && !rejecting && (
        <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={onRejectStart}
            className="h-11 rounded-lg border border-danger px-5 text-sm font-medium text-danger hover:bg-danger-soft disabled:opacity-50"
          >
            Reject result
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={onApprove}
            className="h-11 rounded-lg bg-primary px-5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Submitting..." : "Approve result"}
          </button>
        </div>
      )}

      {record.status !== "Pending Review" && (
        <div className="border-t border-border pt-5">
          <p className="text-sm text-muted">
            {record.status === "Draft"
              ? "This result has not yet been submitted for supervisor review."
              : `This result is ${record.status.toLowerCase()} and cannot be reviewed again.`}
          </p>
        </div>
      )}

      {record.sampleId && <div className="mt-5">
        <Link
          href={`/samples/${record.sampleId}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          View sample details
        </Link>
      </div>}
    </section>
  );
}