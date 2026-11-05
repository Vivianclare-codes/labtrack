"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

interface PatientForm {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  patientType: string;
  clinic: string;
  referringClinician: string;
  clinicalNotes: string;
}

const initialForm: PatientForm = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  phone: "",
  email: "",
  patientType: "Outpatient",
  clinic: "",
  referringClinician: "",
  clinicalNotes: "",
};

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
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

export default function PatientRegistration() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [hospitalNumber, setHospitalNumber] = useState("");

  function updateField(
    field: keyof PatientForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSubmitted(false);
    setErrors([]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const requiredFields: {
      key: keyof PatientForm;
      label: string;
    }[] = [
      { key: "firstName", label: "First name" },
      { key: "lastName", label: "Last name" },
      { key: "dateOfBirth", label: "Date of birth" },
      { key: "gender", label: "Gender" },
      { key: "phone", label: "Phone number" },
      { key: "patientType", label: "Patient type" },
      { key: "clinic", label: "Clinic or ward" },
    ];

    const missing = requiredFields
      .filter(({ key }) => !form[key].trim())
      .map(({ label }) => label);

    if (missing.length > 0) {
      setErrors(missing);
      setSubmitted(false);
      return;
    }

    const demoNumber = `PT-${String(
      Math.floor(Math.random() * 900000) + 100000
    )}`;

    setHospitalNumber(demoNumber);
    setErrors([]);
    setSubmitted(true);
  }

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <p className="mb-2 text-micro font-medium uppercase tracking-wider text-muted">
          Laboratory / Patients / Registration
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-title font-semibold tracking-tight text-ink">
              Patient registration
            </h1>

            <p className="mt-2 text-body text-muted">
              Create a new patient record in the hospital registry.
            </p>
          </div>

          <Link
            href="/patients"
            className="text-label font-medium text-primary hover:underline"
          >
            Back to patient registry
          </Link>
        </div>
      </div>

      {submitted ? (
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
              Patient registered successfully
            </h2>

            <p className="mt-2 text-body text-muted">
              A demo patient record has been created.
            </p>

            <div className="mt-6 rounded-control bg-primary-soft px-5 py-4">
              <p className="text-caption text-muted">
                Hospital number
              </p>
              <p className="mt-1 text-lg font-semibold tracking-wide text-primary">
                {hospitalNumber}
              </p>
            </div>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/patients"
                className="inline-flex h-control items-center justify-center rounded-control bg-primary px-5 text-label font-medium text-white hover:bg-primary/90"
              >
                Return to patient registry
              </Link>

              <button
                type="button"
                onClick={() => {
                  setForm(initialForm);
                  setSubmitted(false);
                  setHospitalNumber("");
                }}
                className="h-control rounded-control border border-line px-5 text-label font-medium text-ink hover:bg-page"
              >
                Register another patient
              </button>
            </div>
          </div>
        </section>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Validation message */}
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
              {/* Personal information */}
              <section className="rounded-card border border-line bg-surface p-5 lg:p-6">
                <div className="mb-6">
                  <h2 className="text-body font-semibold text-ink">
                    Personal information
                  </h2>
                  <p className="mt-1 text-caption text-muted">
                    Enter the patient's basic personal details.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField label="First name" required>
                    <input
                      value={form.firstName}
                      onChange={(e) =>
                        updateField("firstName", e.target.value)
                      }
                      placeholder="Enter first name"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Last name" required>
                    <input
                      value={form.lastName}
                      onChange={(e) =>
                        updateField("lastName", e.target.value)
                      }
                      placeholder="Enter last name"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Date of birth" required>
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) =>
                        updateField("dateOfBirth", e.target.value)
                      }
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Gender" required>
                    <select
                      value={form.gender}
                      onChange={(e) =>
                        updateField("gender", e.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="">Select gender</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                    </select>
                  </FormField>
                </div>
              </section>

              {/* Contact information */}
              <section className="rounded-card border border-line bg-surface p-5 lg:p-6">
                <div className="mb-6">
                  <h2 className="text-body font-semibold text-ink">
                    Contact information
                  </h2>
                  <p className="mt-1 text-caption text-muted">
                    How the hospital can contact the patient.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField label="Phone number" required>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        updateField("phone", e.target.value)
                      }
                      placeholder="Enter phone number"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Email address">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        updateField("email", e.target.value)
                      }
                      placeholder="Enter email address"
                      className={inputClass}
                    />
                  </FormField>
                </div>
              </section>

              {/* Hospital information */}
              <section className="rounded-card border border-line bg-surface p-5 lg:p-6">
                <div className="mb-6">
                  <h2 className="text-body font-semibold text-ink">
                    Hospital information
                  </h2>
                  <p className="mt-1 text-caption text-muted">
                    Record the patient's hospital and clinical details.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField label="Patient type" required>
                    <select
                      value={form.patientType}
                      onChange={(e) =>
                        updateField("patientType", e.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="Outpatient">Outpatient</option>
                      <option value="Inpatient">Inpatient</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </FormField>

                  <FormField label="Clinic / Ward" required>
                    <select
                      value={form.clinic}
                      onChange={(e) =>
                        updateField("clinic", e.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="">Select clinic or ward</option>
                      <option value="General Medicine">
                        General Medicine
                      </option>
                      <option value="Surgery">Surgery</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Paediatrics">Paediatrics</option>
                      <option value="Emergency Unit">
                        Emergency Unit
                      </option>
                      <option value="Maternity">Maternity</option>
                    </select>
                  </FormField>

                  <div className="sm:col-span-2">
                    <FormField label="Referring clinician">
                      <input
                        value={form.referringClinician}
                        onChange={(e) =>
                          updateField(
                            "referringClinician",
                            e.target.value
                          )
                        }
                        placeholder="Enter clinician's name"
                        className={inputClass}
                      />
                    </FormField>
                  </div>

                  <div className="sm:col-span-2">
                    <FormField label="Clinical notes">
                      <textarea
                        value={form.clinicalNotes}
                        onChange={(e) =>
                          updateField("clinicalNotes", e.target.value)
                        }
                        rows={4}
                        placeholder="Add relevant clinical information..."
                        className="w-full resize-y rounded-control border border-line bg-surface px-3 py-3 text-body outline-none transition-colors focus:border-primary"
                      />
                    </FormField>
                  </div>
                </div>
              </section>
            </div>

            {/* Side panel */}
            <aside className="space-y-5">
              <section className="rounded-card border border-line bg-surface p-5">
                <h2 className="text-body font-semibold text-ink">
                  Registration summary
                </h2>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-caption text-muted">
                      Hospital number
                    </p>
                    <p className="mt-1 text-body font-medium text-ink">
                      Generated on registration
                    </p>
                  </div>

                  <div className="border-t border-line pt-4">
                    <p className="text-caption text-muted">
                      Patient name
                    </p>
                    <p className="mt-1 text-body font-medium text-ink">
                      {form.firstName || form.lastName
                        ? `${form.firstName} ${form.lastName}`.trim()
                        : "Not provided"}
                    </p>
                  </div>

                  <div className="border-t border-line pt-4">
                    <p className="text-caption text-muted">
                      Patient type
                    </p>
                    <p className="mt-1 text-body font-medium text-ink">
                      {form.patientType || "Not selected"}
                    </p>
                  </div>

                  <div className="border-t border-line pt-4">
                    <p className="text-caption text-muted">
                      Clinic / Ward
                    </p>
                    <p className="mt-1 text-body font-medium text-ink">
                      {form.clinic || "Not selected"}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-card border border-line bg-surface-muted p-5">
                <h2 className="text-label font-semibold text-ink">
                  Before submitting
                </h2>

                <ul className="mt-3 space-y-2 text-caption leading-relaxed text-muted">
                  <li>• Confirm the patient's name and date of birth.</li>
                  <li>• Check that the contact number is correct.</li>
                  <li>• Select the correct patient type and clinic.</li>
                  <li>• Avoid entering unnecessary sensitive information in clinical notes.</li>
                </ul>
              </section>
            </aside>
          </div>

          {/* Form actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
            <Link
              href="/patients"
              className="inline-flex h-control items-center justify-center rounded-control border border-line bg-surface px-5 text-label font-medium text-ink hover:bg-page"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="h-control rounded-control bg-primary px-6 text-label font-medium text-white transition-colors hover:bg-primary/90"
            >
              Register patient
            </button>
          </div>
        </form>
      )}
    </div>
  );
}