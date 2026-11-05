
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { apiRequest } from "@/app/lib/api";

interface TestProcessingProps {
  testRequestId: string;
}

interface ApiTestRequest {
  id: number;
  request_id: string;
  sample_id: number;
  test_id: number | null;
  department_id: number;
  custom_test_name: string | null;
  custom_test_description?: string | null;
  status: string;
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

interface ApiTest {
  id: number;
  name: string;
}

interface ApiDepartment {
  id: number;
  name: string;
}

interface ProcessingRecord {
  sampleNumber: string;
  patientName: string;
  hospitalNumber: string;
  test: string;
  department: string;
  receivedAt: string;
  status: string;
  requestStatus: string;
}

export default function TestProcessing({
  testRequestId,
}: TestProcessingProps) {
  const [sample, setSample] = useState<ProcessingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState("");
  const [unit, setUnit] = useState("");
  const [referenceRange, setReferenceRange] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchProcessingRecord() {
      try {
        setLoading(true);
        setError("");

        // Fetch the test request using its business ID.
        const request: ApiTestRequest = await apiRequest(
          `/test-requests/${testRequestId}`
        );

        // Fetch the lists so we can match the internal database IDs.
        const [sampleData, patientData, departmentData, testData] =
          await Promise.all([
            apiRequest("/samples/"),
            apiRequest("/patients/"),
            apiRequest("/departments/"),
            apiRequest("/tests/"),
          ]);

        const samples = sampleData as ApiSample[];
        const patients = patientData as ApiPatient[];
        const departments = departmentData as ApiDepartment[];
        const tests = testData as ApiTest[];

        // Match the sample using its internal database ID.
        const sampleRecord = samples.find(
          (item) => item.id === request.sample_id
        );

        if (!sampleRecord) {
          throw new Error("Sample linked to this test request was not found.");
        }

        const patient = patients.find(
          (item) => item.id === sampleRecord.patient_id
        );

        if (!patient) {
          throw new Error("Patient linked to this sample was not found.");
        }

        const department = departments.find(
          (item) => item.id === request.department_id
        );

        const test = tests.find(
          (item) => item.id === request.test_id
        );

        const receivedDate = new Date(sampleRecord.received_datetime);

        const formattedDate = receivedDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        setSample({
          sampleNumber: sampleRecord.sample_id,
          patientName: `${patient.first_name} ${patient.last_name}`,
          hospitalNumber: patient.hospital_number,
          test:
            test?.name ||
            request.custom_test_name ||
            "Custom test",
          department: department?.name || "Unknown department",
          receivedAt: formattedDate,
          status: sampleRecord.status,
          requestStatus: request.status,
        });

        // Move a requested test into Processing.
        if (request.status === "Requested") {
          await apiRequest(
            `/test-requests/${request.request_id}/status`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                status: "Processing",
              }),
            }
          );

          setSample((current) =>
            current
              ? { ...current, requestStatus: "Processing" }
              : current
          );
        } else if (request.status !== "Processing") {
          throw new Error(
            `This test cannot be processed because its current status is "${request.status}".`
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load test request."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProcessingRecord();
  }, [testRequestId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!result.trim()) {
      setError("Please enter the test result before submitting.");
      return;
    }

    if (!interpretation) {
      setError("Please select a result interpretation.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // Retrieve the request so we have its numeric database ID.
      const request: ApiTestRequest = await apiRequest(
        `/test-requests/${testRequestId}`
      );

      // Save the result as a Draft.
      const createdResult = await apiRequest("/results/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test_request_id: request.id,
          result_value: result.trim(),
          unit: unit.trim() || null,
          reference_range: referenceRange.trim() || null,
          interpretation,
          comments: notes.trim() || null,
          performed_by: "Laboratory Scientist",
        }),
      });

      // Submit the saved result for supervisor review.
      await apiRequest(
        `/results/${createdResult.result_id}/submit`,
        {
          method: "PATCH",
        }
      );

      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit test result."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center">
        <p className="text-sm text-muted">
          Loading test request...
        </p>
      </div>
    );
  }

  if (error && !sample) {
    return (
      <div className="rounded-xl border border-border bg-white p-6">
        <p className="text-sm font-medium text-danger">{error}</p>
        <Link
          href="/processing-queue"
          className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
        >
          Return to processing queue
        </Link>
      </div>
    );
  }

  if (!sample) return null;

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-white p-6 text-center sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-2xl text-primary">
          ✓
        </div>

        <h1 className="mt-5 text-xl font-semibold text-foreground">
          Result submitted
        </h1>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
          The result for {sample.sampleNumber} has been saved and submitted
          to the supervisor for review and approval.
        </p>

        <div className="mt-6 rounded-lg bg-muted-surface p-4 text-left">
          <p className="text-xs text-muted">Test</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {sample.test}
          </p>

          <p className="mt-4 text-xs text-muted">Entered result</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {result} {unit}
          </p>

          <p className="mt-4 text-xs text-muted">Interpretation</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {interpretation}
          </p>
        </div>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/processing-queue"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-white hover:opacity-90"
          >
            Return to processing queue
          </Link>

          <Link
            href={`/samples/${sample.sampleNumber}`}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-5 text-sm font-medium text-foreground hover:bg-muted-surface"
          >
            View sample
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-xs text-muted">
        <Link href="/processing-queue" className="hover:text-primary">
          Processing queue
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Test processing</span>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Laboratory / Test processing
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Test processing
        </h1>

        <p className="mt-2 text-sm text-muted">
          Review the test request and record the laboratory result.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs text-muted">Sample reference</p>
            <h2 className="mt-1 text-lg font-semibold text-primary">
              {sample.sampleNumber}
            </h2>
          </div>

          <span className="inline-flex w-fit rounded-full bg-info-soft px-3 py-1 text-xs font-medium text-info">
            {sample.requestStatus}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-muted">Patient name</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {sample.patientName}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted">Hospital number</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {sample.hospitalNumber}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted">Department</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {sample.department}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted">Requested test</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {sample.test}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted">Received date</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {sample.receivedAt}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted">Sample status</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {sample.status}
            </p>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-border bg-white p-5 sm:p-6"
      >
        <div className="mb-6">
          <h2 className="text-base font-semibold text-foreground">
            Record test result
          </h2>
          <p className="mt-1 text-sm text-muted">
            Enter the findings recorded during laboratory analysis.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label
              htmlFor="result"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Test result <span className="text-danger">*</span>
            </label>

            <textarea
              id="result"
              value={result}
              onChange={(event) => setResult(event.target.value)}
              placeholder="Enter the test result or laboratory findings"
              rows={4}
              className="w-full rounded-lg border border-border bg-white px-3 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="unit"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Unit of measurement
              </label>

              <input
                id="unit"
                type="text"
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                placeholder="e.g. g/dL, mmol/L"
                className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div>
              <label
                htmlFor="referenceRange"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Reference range
              </label>

              <input
                id="referenceRange"
                type="text"
                value={referenceRange}
                onChange={(event) => setReferenceRange(event.target.value)}
                placeholder="Enter applicable reference range"
                className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="interpretation"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Result interpretation{" "}
              <span className="text-danger">*</span>
            </label>

            <select
              id="interpretation"
              value={interpretation}
              onChange={(event) => setInterpretation(event.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value="">Select interpretation</option>
              <option value="Normal">Normal</option>
              <option value="Abnormal">Abnormal</option>
              <option value="Critical">Critical</option>
              <option value="Inconclusive">Inconclusive</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="notes"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Laboratory notes
            </label>

            <textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add any relevant observations or comments"
              rows={3}
              className="w-full rounded-lg border border-border bg-white px-3 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger"
          >
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <Link
            href="/processing-queue"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-5 text-sm font-medium text-foreground hover:bg-muted-surface"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Submitting..." : "Submit result for review"}
          </button>
        </div>
      </form>
    </div>
  );
}
