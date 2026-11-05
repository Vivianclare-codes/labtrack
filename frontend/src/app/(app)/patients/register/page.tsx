import type { Metadata } from "next";

import PatientRegistration from "@/components/patients/PatientRegistration";

export const metadata: Metadata = {
  title: "Patient Registration",
  description: "Register a new patient at St. Anne's Hospital.",
};

export default function PatientRegistrationPage() {
  return <PatientRegistration />;
}