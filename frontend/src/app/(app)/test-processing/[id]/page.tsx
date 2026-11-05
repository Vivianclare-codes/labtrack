import { notFound } from "next/navigation";
import TestProcessing from "@/components/processing/TestProcessing";
import { samples } from "@/app/lib/sample-data";

interface TestProcessingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TestProcessingPage({
  params,
}: TestProcessingPageProps) {
  const { id } = await params;

  const sample = samples.find((item) => item.id === id);

  if (!sample) {
    notFound();
  }

  return <TestProcessing sample={sample} />;
}