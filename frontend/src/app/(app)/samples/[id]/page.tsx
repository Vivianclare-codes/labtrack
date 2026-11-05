import { notFound } from "next/navigation";
import SampleDetails from "@/components/samples/SampleDetails";
import { samples } from "@/app/lib/sample-data";

interface SampleDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SampleDetailsPage({
  params,
}: SampleDetailsPageProps) {
  const { id } = await params;

  const sample = samples.find((item) => item.id === id);

  if (!sample) {
    notFound();
  }

  return <SampleDetails sample={sample} />;
}