import SampleDetails from "@/components/samples/SampleDetails";

interface SampleDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SampleDetailsPage({
  params,
}: SampleDetailsPageProps) {
  const { id } = await params;

  return <SampleDetails sampleId={id} />;
}