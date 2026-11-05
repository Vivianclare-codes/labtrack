import type { Metadata } from "next";

import PatientRegistry from "@/components/patients/PatientRegistry";

export const metadata: Metadata = {
  title: "Patient Registry",
  description: "View and manage registered hospital patients.",
};

export default function PatientsPage() {
  return <PatientRegistry />;
}