"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { SampleRecord } from "@/app/lib/sample-data";
import { apiRequest } from "@/app/lib/api";
import SampleJourney from "@/components/samples/SampleJourney";

interface SampleDetailsProps {
  sampleId: string;
}

interface ApiSample {
  id: number;
  sample_id: string;
  patient_id: number;
  sample_type: string;
  collection_datetime: string;
  received_datetime: string;
  sample_condition: string;
  receiving_staff: string;
  status: string;
}

interface ApiPatient {
  id: number;
  first_name: string;
  last_name: string;
  hospital_number: string;
}

interface ApiDepartment {
  id: number;
  name: string;
}

interface ApiTest {
  id: number;
  name: string;
}

interface ApiTestRequest {
  id: number;
  sample_id: number;
  test_id: number | null;
  department_id: number;
  status: string;
}

function StatusBadge({ status }: { status: SampleRecord["status"] }) {
  const styles = {
    Received: "bg-info-soft text-info",
    Processing: "bg-info-soft text-info",
    Completed: "bg-primary-soft text-primary",
    Pending: "bg-warning-soft text-warning",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: SampleRecord["priority"];
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
        priority === "Urgent"
          ? "bg-warning-soft text-warning"
          : "bg-muted-surface text-muted"
      }`}
    >
      {priority}
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
    <div className="border-b border-border py-4 last:border-0">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export default function SampleDetails({ sampleId }: SampleDetailsProps) {
  const [sample, setSample] = useState<SampleRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSample() {
      try {
        setLoading(true);
        setError("");

        const response: ApiSample = await apiRequest(
          `/samples/${sampleId}`
        );

       const [
  patientData,
  requestData,
] = await Promise.all([
  apiRequest("/patients/"),
  apiRequest("/test-requests/"),
]);

const patient = (patientData as ApiPatient[]).find(
  (item) => item.id === response.patient_id
);

if (!patient) {
  throw new Error("Patient linked to this sample was not found.");
}

const requests = requestData as ApiTestRequest[];

        const sampleRequests = requests.filter(
          (request) => request.sample_id === response.id
        );

        const testData: ApiTest[] = await apiRequest("/tests/");
        const departmentData: ApiDepartment[] =
          await apiRequest("/departments/");

        const requestedTests = sampleRequests
          .map((request) =>
            testData.find((test) => test.id === request.test_id)
          )
          .filter((test) => test !== undefined);

        const requestedDepartments = sampleRequests
          .map((request) =>
            departmentData.find(
              (department) =>
                department.id === request.department_id
            )
          )
          .filter((department) => department !== undefined);

        const hasCompletedRequest = sampleRequests.some(
          (request) => request.status === "Completed"
        );

        const hasProcessingRequest = sampleRequests.some(
          (request) =>
            request.status === "Processing" ||
            request.status === "Awaiting Review"
        );

        const displayStatus =
          response.status === "On Hold" ||
          response.status === "Cancelled"
            ? "Pending"
            : hasCompletedRequest
              ? "Completed"
              : hasProcessingRequest
                ? "Processing"
                : "Received";

        const receivedDate = new Date(response.received_datetime);

        const sampleData: SampleRecord = {
          id: String(response.id),
          sampleNumber: response.sample_id,
          patientName: `${patient.first_name} ${patient.last_name}`,
          hospitalNumber: patient.hospital_number,
          test:
            requestedTests.map((test) => test.name).join(", ") ||
            "Not assigned",
          department:
            [...new Set(
              requestedDepartments.map((department) => department.name)
            )].join(", ") || "Not assigned",
          status: displayStatus,
          priority: "Routine",
          receivedAt: receivedDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          receivedTime: receivedDate.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        };

        setSample(sampleData);
      } catch (err) {
  console.error("Sample details error:", err);

  setError(
    err instanceof Error
      ? err.message
      : "Failed to fetch sample details."
  );
} finally {
        setLoading(false);
      }
    }

    fetchSample();
  }, [sampleId]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-muted">
        Loading sample details...
      </div>
    );
  }

  if (error || !sample) {
    return (
      <div className="rounded-lg border border-danger/20 bg-danger-soft p-5 text-sm text-danger">
        {error || "Sample not found."}
        <Link
          href="/samples"
          className="ml-2 font-medium underline"
        >
          Return to sample registry
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-xs text-muted">
        <Link href="/samples" className="hover:text-primary">
          Sample registry
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Sample details</span>
      </div>

      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Sample details
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-foreground">
            {sample.sampleNumber}
          </h1>

          <p className="mt-2 text-sm text-muted">
            View sample information and track its laboratory journey.
          </p>
        </div>

        <Link
          href="/samples"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium text-foreground transition hover:bg-muted-surface"
        >
          Back to samples
        </Link>
      </div>

      {/* Status overview */}
      <section className="rounded-xl border border-border bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted">Current status</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={sample.status} />
              <PriorityBadge priority={sample.priority} />
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs text-muted">Received on</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {sample.receivedAt}
            </p>
            <p className="mt-1 text-xs text-muted">
              {sample.receivedTime}
            </p>
          </div>
        </div>
      </section>

      {/* Sample journey */}
      <SampleJourney status={sample.status} />

      {/* Information grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Patient information */}
        <section className="rounded-xl border border-border bg-white p-5 sm:p-6">
          <div className="mb-2">
            <h2 className="text-base font-semibold text-foreground">
              Patient information
            </h2>
            <p className="mt-1 text-sm text-muted">
              Patient linked to this sample.
            </p>
          </div>

          <DetailItem label="Patient name" value={sample.patientName} />
          <DetailItem
            label="Hospital number"
            value={sample.hospitalNumber}
          />
        </section>

        {/* Test information */}
        <section className="rounded-xl border border-border bg-white p-5 sm:p-6">
          <div className="mb-2">
            <h2 className="text-base font-semibold text-foreground">
              Test information
            </h2>
            <p className="mt-1 text-sm text-muted">
              Requested laboratory investigation.
            </p>
          </div>

          <DetailItem label="Requested test" value={sample.test} />
          <DetailItem label="Department" value={sample.department} />
          <DetailItem label="Priority" value={sample.priority} />
        </section>

        {/* Collection information */}
        <section className="rounded-xl border border-border bg-white p-5 sm:p-6">
          <div className="mb-2">
            <h2 className="text-base font-semibold text-foreground">
              Collection information
            </h2>
            <p className="mt-1 text-sm text-muted">
              Sample collection and receipt details.
            </p>
          </div>

          <DetailItem
            label="Recorded receipt date"
            value={sample.receivedAt}
          />
          <DetailItem
            label="Recorded receipt time"
            value={sample.receivedTime}
          />
          <DetailItem
            label="Collected by"
            value="Not recorded"
          />
        </section>

        {/* Processing information */}
        <section className="rounded-xl border border-border bg-white p-5 sm:p-6">
          <div className="mb-2">
            <h2 className="text-base font-semibold text-foreground">
              Processing information
            </h2>
            <p className="mt-1 text-sm text-muted">
              Current laboratory processing details.
            </p>
          </div>

          <DetailItem
            label="Assigned department"
            value={sample.department}
          />
          <DetailItem
            label="Processing status"
            value={sample.status}
          />
          <DetailItem
            label="Additional notes"
            value="No additional notes recorded."
          />
        </section>
      </div>
    </div>
  );
}