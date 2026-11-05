"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { apiRequest } from "@/app/lib/api";

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

interface Department {
  id: number;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
}

interface Test {
  id: number;
  name: string;
  code: string;
  description: string | null;
  department_id: number;
  sample_type: string;
  is_active: boolean;
}

interface Patient {
  id: number;
  patient_id: string;
  first_name: string;
  last_name: string;
  hospital_number: string;
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


export default function SampleRegistration() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [sampleNumber, setSampleNumber] = useState("");

  const [departments, setDepartments] = useState<Department[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
  async function loadOptions() {
    try {
      const [departmentData, testData, patientData] = await Promise.all([
        apiRequest("/departments/"),
        apiRequest("/tests/"),
        apiRequest("/patients/"),
      ]);

      setDepartments(departmentData);
      setTests(testData);
      setPatients(patientData);
    } catch (error) {
      console.error("Failed to load form options:", error);
      setFetchError("Could not load patients, departments and tests.");
    } finally {
      setLoadingOptions(false);
    }
  }

  loadOptions();
}, []);

  const selectedPatient = patients.find(
    (patient) => String(patient.id) === form.patientId
  );

  const selectedDepartment = departments.find(
    (department) => department.name === form.department
  );

const availableTests = tests.filter(
  (test) =>
    test.department_id === selectedDepartment?.id &&
    test.is_active
);

const selectedTest = tests.find(
  (test) => String(test.id) === form.test
);

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

 async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

  try {
    setErrors([]);

    // Prepare the collection date and time.
    const collectionDateTime = `${form.collectionDate}T${form.collectionTime}:00`;

    // Get the current local date and time.
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, "0");

    const receivedDateTime = [
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
      `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    ].join("T");

    // Step 1: Create the sample.
    const createdSample = await apiRequest("/samples/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        patient_id: Number(form.patientId),
        sample_type: form.sampleType,
        collection_datetime: collectionDateTime,
        received_datetime: receivedDateTime,
        sample_condition: "Good",
        receiving_staff: "Laboratory staff",
        status: "Registered",
      }),
    });

    // Step 2: Create a test request for the new sample.
    await apiRequest("/test-requests/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sample_id: createdSample.id,
        test_id: Number(form.test),
      }),
    });

    // Step 3: Display the sample number returned by the backend.
    setSampleNumber(createdSample.sample_id);
    setSubmitted(true);
  } catch (error) {
    console.error("Sample registration failed:", error);

    setErrors([
      error instanceof Error
        ? error.message
        : "Something went wrong while registering the sample.",
    ]);
  }
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
              The sample and its test request have been successfully registered.
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
                {selectedPatient
                  ? `${selectedPatient.first_name} ${selectedPatient.last_name}`
                  : ""}
              </p>

              <p>
                <span className="font-medium text-ink">Test:</span>{" "}
                {selectedTest?.name}
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

                    {patients.map((patient) => (
  <option key={patient.id} value={String(patient.id)}>
    {patient.first_name} {patient.last_name} — {patient.hospital_number}
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
                     {selectedPatient
  ? `${selectedPatient.first_name} ${selectedPatient.last_name}`
  : ""}
                    </p>

                    <p className="mt-1 text-caption text-muted">
                      Hospital number: {selectedPatient.hospital_number}
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

                      {departments
  .filter((department) => department.is_active)
  .map((department) => (
    <option key={department.id} value={department.name}>
      {department.name}
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
  <option key={test.id} value={String(test.id)}>
    {test.name}
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
                      {selectedPatient
                        ? `${selectedPatient.first_name} ${selectedPatient.last_name}`
                        : "Not selected"}
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
                      {selectedTest?.name || "Not selected"}
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