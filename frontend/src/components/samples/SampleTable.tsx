import Link from "next/link";

import type {
  SampleRecord,
  SampleStatus,
} from "@/app/lib/sample-data";

interface SampleTableProps {
  samples: SampleRecord[];
}

function StatusBadge({ status }: { status: SampleStatus }) {
  const styles: Record<SampleStatus, string> = {
    Received: "bg-info-soft text-info",
    Processing: "bg-info-soft text-info",
    Completed: "bg-primary-soft text-primary",
    Pending: "bg-warning-soft text-warning",
  };

  const labels: Record<SampleStatus, string> = {
    Received: "Received",
    Processing: "Processing",
    Completed: "Completed",
    Pending: "Pending",
  };

  return (
    <span
      className={`inline-flex items-center rounded-badge px-2.5 py-1 text-caption font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: SampleRecord["priority"];
}) {
  if (priority === "Routine") {
    return (
      <span className="text-caption text-muted">
        Routine
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-caption font-medium text-warning">
      <span className="size-1.5 rounded-full bg-warning" />
      Urgent
    </span>
  );
}

export default function SampleTable({
  samples,
}: SampleTableProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left">
          <thead className="bg-surface-muted">
            <tr className="h-table-head text-caption font-medium text-muted">
              <th className="px-5">Sample ID</th>
              <th className="px-4">Patient</th>
              <th className="px-4">Test requested</th>
              <th className="px-4">Department</th>
              <th className="px-4">Received</th>
              <th className="px-4">Priority</th>
              <th className="px-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {samples.map((sample) => (
              <tr
                key={sample.id}
                className="h-table-row border-b border-line text-body last:border-0 hover:bg-page/60"
              >
                <td className="whitespace-nowrap px-5">
                  <Link
                    href={`/samples/${sample.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {sample.sampleNumber}
                  </Link>
                </td>

                <td className="whitespace-nowrap px-4">
                  <p className="font-medium text-ink">
                    {sample.patientName}
                  </p>
                  <p className="mt-1 text-caption text-muted">
                    {sample.hospitalNumber}
                  </p>
                </td>

                <td className="whitespace-nowrap px-4 text-ink">
                  {sample.test}
                </td>

                <td className="whitespace-nowrap px-4 text-muted">
                  {sample.department}
                </td>

                <td className="whitespace-nowrap px-4">
                  <p className="text-ink">{sample.receivedAt}</p>
                  <p className="mt-1 text-caption text-muted">
                    {sample.receivedTime}
                  </p>
                </td>

                <td className="whitespace-nowrap px-4">
                  <PriorityBadge priority={sample.priority} />
                </td>

                <td className="whitespace-nowrap px-4">
                  <StatusBadge status={sample.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-line lg:hidden">
        {samples.map((sample) => (
          <article key={sample.id} className="space-y-3 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/samples/${sample.id}`}
                  className="text-label font-semibold text-primary hover:underline"
                >
                  {sample.sampleNumber}
                </Link>

                <p className="mt-1 text-body font-medium text-ink">
                  {sample.patientName}
                </p>

                <p className="mt-1 text-caption text-muted">
                  {sample.hospitalNumber}
                </p>
              </div>

              <StatusBadge status={sample.status} />
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-caption">
              <div>
                <p className="text-muted">Test requested</p>
                <p className="mt-1 text-ink">{sample.test}</p>
              </div>

              <div>
                <p className="text-muted">Department</p>
                <p className="mt-1 text-ink">
                  {sample.department}
                </p>
              </div>

              <div>
                <p className="text-muted">Received</p>
                <p className="mt-1 text-ink">
                  {sample.receivedAt}
                </p>
                <p className="mt-0.5 text-muted">
                  {sample.receivedTime}
                </p>
              </div>

              <div>
                <p className="text-muted">Priority</p>
                <div className="mt-1">
                  <PriorityBadge priority={sample.priority} />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}