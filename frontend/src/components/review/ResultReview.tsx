"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  initialReviewRecords,
  type ReviewRecord,
  type ReviewStatus,
} from "@/app/lib/review-data";

const filters = [
  "All",
  "Pending Review",
  "Approved",
  "Rejected",
] as const;

type ReviewFilter = (typeof filters)[number];

function StatusBadge({ status }: { status: ReviewStatus }) {
  const styles: Record<ReviewStatus, string> = {
    "Pending Review": "bg-warning-soft text-warning",
    Approved: "bg-primary-soft text-primary",
    Rejected: "bg-danger-soft text-danger",
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
  const [records, setRecords] = useState(initialReviewRecords);
  const [filter, setFilter] = useState<ReviewFilter>("Pending Review");
  const [selectedId, setSelectedId] = useState(
    initialReviewRecords[0]?.id ?? "",
  );
  const [search, setSearch] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [feedback, setFeedback] = useState("");

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

  function updateStatus(
    recordId: string,
    status: ReviewStatus,
  ) {
    setRecords((current) =>
      current.map((record) =>
        record.id === recordId ? { ...record, status } : record,
      ),
    );

    setRejecting(false);
    setRejectionReason("");
    setFeedback(
      status === "Approved"
        ? "Result approved successfully in this demo."
        : "Result rejected successfully in this demo.",
    );
  }

  function handleFilterChange(nextFilter: ReviewFilter) {
    setFilter(nextFilter);
    setFeedback("");
    setRejecting(false);
  }

  function selectRecord(recordId: string) {
    setSelectedId(recordId);
    setFeedback("");
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
            {filteredRecords.map((record) => (
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

            {filteredRecords.length === 0 && (
              <p className="px-5 py-12 text-center text-sm text-muted">
                No results match your search or filter.
              </p>
            )}
          </div>
        </section>

        <ReviewDetails
          record={selectedRecord}
          feedback={feedback}
          rejecting={rejecting}
          rejectionReason={rejectionReason}
          onApprove={() =>
            selectedRecord &&
            updateStatus(selectedRecord.id, "Approved")
          }
          onRejectStart={() => {
            setRejecting(true);
            setFeedback("");
          }}
          onRejectCancel={() => {
            setRejecting(false);
            setRejectionReason("");
          }}
          onRejectConfirm={() =>
            selectedRecord &&
            rejectionReason.trim() &&
            updateStatus(selectedRecord.id, "Rejected")
          }
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

          {filteredRecords.map((record) => (
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

          {filteredRecords.length === 0 && (
            <p className="px-5 py-12 text-center text-sm text-muted">
              No results match your search or filter.
            </p>
          )}
        </section>

        <ReviewDetails
          record={selectedRecord}
          feedback={feedback}
          rejecting={rejecting}
          rejectionReason={rejectionReason}
          onApprove={() =>
            selectedRecord &&
            updateStatus(selectedRecord.id, "Approved")
          }
          onRejectStart={() => {
            setRejecting(true);
            setFeedback("");
          }}
          onRejectCancel={() => {
            setRejecting(false);
            setRejectionReason("");
          }}
          onRejectConfirm={() =>
            selectedRecord &&
            rejectionReason.trim() &&
            updateStatus(selectedRecord.id, "Rejected")
          }
          onReasonChange={setRejectionReason}
        />
      </div>
    </div>
  );
}

interface ReviewDetailsProps {
  record: ReviewRecord | null;
  feedback: string;
  rejecting: boolean;
  rejectionReason: string;
  onApprove: () => void;
  onRejectStart: () => void;
  onRejectCancel: () => void;
  onRejectConfirm: () => void;
  onReasonChange: (value: string) => void;
}

function ReviewDetails({
  record,
  feedback,
  rejecting,
  rejectionReason,
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
        <DetailItem label="Priority" value={record.priority} />
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

        <DetailItem label="Submitted by" value={record.submittedBy} />
        <DetailItem label="Submitted date" value={record.submittedAt} />

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
              onClick={onRejectCancel}
              className="h-10 rounded-lg border border-border bg-white px-4 text-sm font-medium text-foreground"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!rejectionReason.trim()}
              onClick={onRejectConfirm}
              className="h-10 rounded-lg bg-danger px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Confirm rejection
            </button>
          </div>
        </div>
      )}

      {record.status === "Pending Review" && !rejecting && (
        <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onRejectStart}
            className="h-11 rounded-lg border border-danger px-5 text-sm font-medium text-danger hover:bg-danger-soft"
          >
            Reject result
          </button>

          <button
            type="button"
            onClick={onApprove}
            className="h-11 rounded-lg bg-primary px-5 text-sm font-medium text-white hover:opacity-90"
          >
            Approve result
          </button>
        </div>
      )}

      {record.status !== "Pending Review" && (
        <div className="border-t border-border pt-5">
          <p className="text-sm text-muted">
            This result has already been {record.status.toLowerCase()} in this
            demo.
          </p>
        </div>
      )}

      <div className="mt-5">
        <Link
          href={`/samples/${record.id}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          View sample details
        </Link>
      </div>
    </section>
  );
}