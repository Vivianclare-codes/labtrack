import type { Metadata } from "next";

import SampleRegistration from "@/components/samples/SampleRegistration";

export const metadata: Metadata = {
  title: "Sample Registration",
  description: "Register a new laboratory sample.",
};

export default function SampleRegistrationPage() {
  return <SampleRegistration />;
}