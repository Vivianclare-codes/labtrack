import type { Metadata } from "next";

import SampleRegistry from "@/components/samples/SampleRegistry";

export const metadata: Metadata = {
  title: "Sample Registry",
  description: "View and track laboratory samples.",
};

export default function SamplesPage() {
  return <SampleRegistry />;
}