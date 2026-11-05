import TestProcessing from "@/components/processing/TestProcessing";

interface TestProcessingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TestProcessingPage({
  params,
}: TestProcessingPageProps) {
  const { id } = await params;

  return <TestProcessing testRequestId={id} />;
}