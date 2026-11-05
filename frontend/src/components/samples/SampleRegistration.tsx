"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";

interface SampleForm {
  patientId: string;
  sampleType: string;
  department: string;
  test: string;
  priority: string;
  collectionDate: string;
  collectionTime: string;
  collectedBy: string;
  notes: string;
}

const initialForm: SampleForm = {
  patientId: "",
  sampleType: "",
  department: "",
  test: "",
  priority: "Routine",
  collectionDate: "",
  collectionTime: "",
  collectedBy: "",
  notes: "",
};

const PATIENT_OPTIONS = [
  { id: "PT-000241", name: "Grace Okafor" },
  { id: "PT-000240", name: "David Williams" },
  { id: "PT-000239", name: "Amara Nwosu" },
  { id: "PT-000238", name: "Michael Brown" },
  { id: "PT-000237", name: "Chiamaka Eze" },
  { id: "PT-000236", name: "Samuel Johnson" },
  { id: "PT-000235", name: "Ngozi Adams" },
  { id: "PT-000234", name: "Peter Clarke" },
];

const DEPARTMENT_TESTS: Record<string, string[]> = {
  Haematology: [
    "Full Blood Count",
    "Blood Group",
    "ESR",
    "Packed Cell Volume",
    "Genotype",
    "Clotting Profile",
  ],
  Microbiology: [
    "Malaria Parasite",
    "Urine Culture",
    "Blood Culture",
    "Stool Culture",
    "High Vaginal Swab",
    "Sputum Culture",
  ],
  "Chemical Pathology": [
    "Liver Function Test",
    "Kidney Function Test",
    "Electrolytes",
    "Fasting Blood Sugar",
    "Lipid Profile",
    "Urea and Creatinine",
  ],
  Histopathology: [
    "Histology",
    "Cytology",
    "Biopsy Examination",
  ],
  "Serology/Immunology": [
    "HIV Screening",
    "Hepatitis B Screening",
    "Hepatitis C Screening",
    "Widal Test",
    "CRP",
    "Rheumatoid Factor",
  ],
};

const SAMPLE_TYPES = [
  "Blood",
  "Urine",
  "Stool",
  "Sputum",
  "Swab",
  "Tissue",
  "Other",
];

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-label font-medium text-ink">
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "h-field w-full rounded-control border border-line bg-surface px-3 text-body text-ink outline-none transition-colors focus:border-primary";

function generateSampleNumber() {
  const now = new Date();

  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const sequence = String(
    Math.floor(Math.random() * 9000) + 1000
  );

  return `LB-${year}${month}${day}-${sequence}`;
}

export default function SampleRegistration() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [sampleNumber, setSampleNumber] = useState("");

  const selectedPatient = PATIENT_OPTIONS.find(
    (patient) => patient.id === form.patientId
  );

  const availableTests = form.department
    ? DEPARTMENT_TESTS[form.department] ?? []
    : [];

  function updateField(field: keyof SampleForm, value: string) {
    setForm((current) => {
      const updated = {
        ...current,
        [field]: value,
      };

      // Changing the department resets the selected test.
      if (field === "department") {
        updated.test = "";
      }

      return updated;
    });

    setErrors([]);
    setSubmitted(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const requiredFields: {
      key: keyof SampleForm;
      label: string;
    }[] = [
      { key: "patientId", label: "Patient" },
      { key: "sampleType", label: "Sample type" },
      { key: "department", label: "Department" },
      { key: "test", label: "Test requested" },
      { key: "collectionDate", label: "Collection date" },
      { key: "collectionTime", label: "Collection time" },
    ];

    const missingFields = requiredFields
      .filter(({ key }) => !form[key].trim())
      .map(({ label }) => label);

    if (missingFields.length > 0) {
      setErrors(missingFields);
      return;
    }

    const generatedNumber = generateSampleNumber();

    setSampleNumber(generatedNumber);
    setErrors([]);
    setSubmitted(true);
  }

  function resetForm() {
    setForm(initialForm);
    setErrors([]);
    setSubmitted(false);
    setSampleNumber("");
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <p className="mb-2 text-micro font-medium uppercase tracking-wider text-muted">
          Laboratory / Samples / Registration
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-title font-semibold tracking-tight text-ink">
              Sample registration
            </h1>

            <p className="mt-2 text-body text-muted">
              Register a new sample for laboratory processing.
            </p>
          </div>

          <Link
            href="/samples"
            className="text-label font-medium text-primary hover:underline"
          >
            Back to sample registry
          </Link>
        </div>
      </div>

      {submitted ? (
        /* Submission confirmation */
        <section className="rounded-card border border-line bg-surface p-6 lg:p-8">
          <div className="mx-auto max-w-lg py-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="m5 12 4 4L19 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2 className="mt-5 text-lg font-semibold text-ink">
              Sample registered successfully
            </h2>

            <p className="mt-2 text-body text-muted">
              The demo sample record has been created.
            </p>

            <div className="mt-6 rounded-control bg-primary-soft px-5 py-4">
              <p className="text-caption text-muted">
                Sample identification number
              </p>

              <p className="mt-1 text-lg font-semibold tracking-wide text-primary">
                {sampleNumber}
              </p>
            </div>

            <div className="mt-5 space-y-2 text-body text-muted">
              <p>
                <span className="font-medium text-ink">Patient:</span>{" "}
                {selectedPatient?.name}
              </p>

              <p>
                <span className="font-medium text-ink">Test:</span>{" "}
                {form.test}
              </p>

              <p>
                <span className="font-medium text-ink">Department:</span>{" "}
                {form.department}
              </p>
            </div>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/samples"
                className="inline-flex h-control items-center justify-center rounded-control bg-primary px-5 text-label font-medium text-white hover:bg-primary/90"
              >
                Return to sample registry
              </Link>

              <button
                type="button"
                onClick={resetForm}
                className="h-control rounded-control border border-line px-5 text-label font-medium text-ink hover:bg-page"
              >
                Register another sample
              </button>
            </div>
          </div>
        </section>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Validation errors */}
          {errors.length > 0 && (
            <div
              role="alert"
              className="rounded-control border border-danger/30 bg-danger-soft px-4 py-3"
            >
              <p className="text-label font-semibold text-danger">
                Please complete the required fields.
              </p>

              <p className="mt-1 text-caption text-danger">
                {errors.join(", ")}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
            {/* Main form */}
            <div className="space-y-5">
              {/* Patient selection */}
              <section className="rounded-card border border-line bg-surface p-5 lg:p-6">
                <div className="mb-6">
                  <h2 className="text-body font-semibold text-ink">
                    Patient information
                  </h2>

                  <p className="mt-1 text-caption text-muted">
                    Select the patient associated with this sample.
                  </p>
                </div>

                <FormField label="Select patient" required>
                  <select
                    value={form.patientId}
                    onChange={(event) =>
                      updateField("patientId", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Search or select a patient</option>

                    {PATIENT_OPTIONS.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} — {patient.id}
                      </option>
                    ))}
                  </select>
                </FormField>

                {selectedPatient && (
                  <div className="mt-4 rounded-control bg-surface-muted p-4">
                    <p className="text-caption text-muted">
                      Selected patient
                    </p>

                    <p className="mt-1 text-body font-medium text-ink">
                      {selectedPatient.name}
                    </p>

                    <p className="mt-1 text-caption text-muted">
                      Hospital number: {selectedPatient.id}
                    </p>
                  </div>
                )}
              </section>

              {/* Sample details */}
              <section className="rounded-card border border-line bg-surface p-5 lg:p-6">
                <div className="mb-6">
                  <h2 className="text-body font-semibold text-ink">
                    Sample details
                  </h2>

                  <p className="mt-1 text-caption text-muted">
                    Provide the sample type and collection information.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField label="Sample type" required>
                    <select
                      value={form.sampleType}
                      onChange={(event) =>
                        updateField("sampleType", event.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="">Select sample type</option>

                      {SAMPLE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Priority" required>
                    <select
                      value={form.priority}
                      onChange={(event) =>
                        updateField("priority", event.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="Routine">Routine</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </FormField>

                  <FormField label="Collection date" required>
                    <input
                      type="date"
                      value={form.collectionDate}
                      onChange={(event) =>
                        updateField("collectionDate", event.target.value)
                      }
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Collection time" required>
                    <input
                      type="time"
                      value={form.collectionTime}
                      onChange={(event) =>
                        updateField("collectionTime", event.target.value)
                      }
                      className={inputClass}
                    />
                  </FormField>
                </div>
              </section>

              {/* Test request */}
              <section className="rounded-card border border-line bg-surface p-5 lg:p-6">
                <div className="mb-6">
                  <h2 className="text-body font-semibold text-ink">
                    Test request
                  </h2>

                  <p className="mt-1 text-caption text-muted">
                    Choose the department and test to be performed.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField label="Laboratory department" required>
                    <select
                      value={form.department}
                      onChange={(event) =>
                        updateField("department", event.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="">Select department</option>

                      {Object.keys(DEPARTMENT_TESTS).map((department) => (
                        <option key={department} value={department}>
                          {department}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Test requested" required>
                    <select
                      value={form.test}
                      onChange={(event) =>
                        updateField("test", event.target.value)
                      }
                      disabled={!form.department}
                      className={`${inputClass} disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted`}
                    >
                      <option value="">
                        {form.department
                          ? "Select test"
                          : "Select a department first"}
                      </option>

                      {availableTests.map((test) => (
                        <option key={test} value={test}>
                          {test}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
              </section>

              {/* Additional information */}
              <section className="rounded-card border border-line bg-surface p-5 lg:p-6">
                <div className="mb-6">
                  <h2 className="text-body font-semibold text-ink">
                    Additional information
                  </h2>

                  <p className="mt-1 text-caption text-muted">
                    Optional details about sample collection.
                  </p>
                </div>

                <div className="space-y-5">
                  <FormField label="Collected by">
                    <input
                      value={form.collectedBy}
                      onChange={(event) =>
                        updateField("collectedBy", event.target.value)
                      }
                      placeholder="Enter staff name"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Collection notes">
                    <textarea
                      value={form.notes}
                      onChange={(event) =>
                        updateField("notes", event.target.value)
                      }
                      rows={4}
                      placeholder="Add any relevant collection information..."
                      className="w-full resize-y rounded-control border border-line bg-surface px-3 py-3 text-body outline-none transition-colors focus:border-primary"
                    />
                  </FormField>
                </div>
              </section>
            </div>

            {/* Summary panel */}
            <aside className="space-y-5">
              <section className="rounded-card border border-line bg-surface p-5">
                <h2 className="text-body font-semibold text-ink">
                  Registration summary
                </h2>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-caption text-muted">
                      Sample number
                    </p>

                    <p className="mt-1 text-body font-medium text-ink">
                      Generated on registration
                    </p>
                  </div>

                  <div className="border-t border-line pt-4">
                    <p className="text-caption text-muted">
                      Patient
                    </p>

                    <p className="mt-1 text-body font-medium text-ink">
                      {selectedPatient?.name || "Not selected"}
                    </p>
                  </div>

                  <div className="border-t border-line pt-4">
                    <p className="text-caption text-muted">
                      Sample type
                    </p>

                    <p className="mt-1 text-body font-medium text-ink">
                      {form.sampleType || "Not selected"}
                    </p>
                  </div>

                  <div className="border-t border-line pt-4">
                    <p className="text-caption text-muted">
                      Department
                    </p>

                    <p className="mt-1 text-body font-medium text-ink">
                      {form.department || "Not selected"}
                    </p>
                  </div>

                  <div className="border-t border-line pt-4">
                    <p className="text-caption text-muted">
                      Test requested
                    </p>

                    <p className="mt-1 text-body font-medium text-ink">
                      {form.test || "Not selected"}
                    </p>
                  </div>

                  <div className="border-t border-line pt-4">
                    <p className="text-caption text-muted">
                      Priority
                    </p>

                    <span
                      className={`mt-2 inline-flex rounded-badge px-2.5 py-1 text-caption font-medium ${
                        form.priority === "Urgent"
                          ? "bg-warning-soft text-warning"
                          : "bg-surface-muted text-muted"
                      }`}
                    >
                      {form.priority}
                    </span>
                  </div>
                </div>
              </section>

              <section className="rounded-card border border-line bg-surface-muted p-5">
                <h2 className="text-label font-semibold text-ink">
                  Before submitting
                </h2>

                <ul className="mt-3 space-y-2 text-caption leading-relaxed text-muted">
                  <li>• Confirm the correct patient is selected.</li>
                  <li>• Verify the sample type and collection details.</li>
                  <li>• Ensure the requested test belongs to the selected department.</li>
                  <li>• Mark urgent samples appropriately.</li>
                </ul>
              </section>
            </aside>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
            <Link
              href="/samples"
              className="inline-flex h-control items-center justify-center rounded-control border border-line bg-surface px-5 text-label font-medium text-ink hover:bg-page"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="h-control rounded-control bg-primary px-6 text-label font-medium text-white transition-colors hover:bg-primary/90"
            >
              Register sample
            </button>
          </div>
        </form>
      )}
    </div>
  );
}