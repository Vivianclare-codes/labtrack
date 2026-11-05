"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import type { SampleRecord } from "@/app/lib/sample-data";

interface TestProcessingProps {
  sample: SampleRecord;
}

export default function TestProcessing({ sample }: TestProcessingProps) {
  const [result, setResult] = useState("");
  const [unit, setUnit] = useState("");
  const [referenceRange, setReferenceRange] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!result.trim()) {
      setError("Please enter the test result before submitting.");
      return;
    }

    if (!interpretation) {
      setError("Please select a result interpretation.");
      return;
    }

    setError("");
    setSubmitted(true);
  }

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
          The result for {sample.sampleNumber} has been submitted in this demo.
          In the integrated system, it will be sent to the supervisor for
          review and approval.
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
            href={`/samples/${sample.id}`}
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
      {/* Breadcrumb */}
      <div className="text-xs text-muted">
        <Link href="/processing-queue" className="hover:text-primary">
          Processing queue
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Test processing</span>
      </div>

      {/* Heading */}
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

      {/* Sample and patient information */}
      <section className="rounded-xl border border-border bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs text-muted">Sample reference</p>
            <h2 className="mt-1 text-lg font-semibold text-primary">
              {sample.sampleNumber}
            </h2>
          </div>

          <span className="inline-flex w-fit rounded-full bg-info-soft px-3 py-1 text-xs font-medium text-info">
            {sample.status}
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
            <p className="text-xs text-muted">Priority</p>
            <p
              className={`mt-1 text-sm font-medium ${
                sample.priority === "Urgent"
                  ? "text-warning"
                  : "text-foreground"
              }`}
            >
              {sample.priority}
            </p>
          </div>
        </div>
      </section>

      {/* Result entry form */}
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
          {/* Result */}
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

          {/* Units and reference range */}
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

          {/* Interpretation */}
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

          {/* Notes */}
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
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Submit result for review
          </button>
        </div>
      </form>
    </div>
  );
}