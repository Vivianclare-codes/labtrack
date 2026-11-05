import type { SampleStatus } from "@/app/lib/sample-data";

const stages = [
  "Registered",
  "Collected",
  "Received",
  "Processing",
  "Result recorded",
  "Approved",
];

interface SampleJourneyProps {
  status: SampleStatus;
}

function getCurrentStage(status: SampleStatus) {
  switch (status) {
    case "Pending":
    case "Received":
      return 2;
    case "Processing":
      return 3;
    case "Completed":
      return 4;
    default:
      return 0;
  }
}

export default function SampleJourney({ status }: SampleJourneyProps) {
  const currentStage = getCurrentStage(status);

  return (
    <section className="rounded-xl border border-border bg-white p-5 sm:p-6">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-foreground">
          Sample journey
        </h2>
        <p className="mt-1 text-sm text-muted">
          Track the sample through each stage of laboratory processing.
        </p>
      </div>

      {/* Desktop timeline */}
      <div className="hidden md:block">
        <div className="flex items-start">
          {stages.map((stage, index) => {
            const completed = index < currentStage;
            const active = index === currentStage;

            return (
              <div key={stage} className="flex flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  {index > 0 && (
                    <div
                      className={`h-0.5 flex-1 ${
                        completed || active
                          ? "bg-primary"
                          : "bg-border"
                      }`}
                    />
                  )}

                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                      completed
                        ? "border-primary bg-primary text-white"
                        : active
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border bg-white text-muted"
                    }`}
                  >
                    {completed ? "✓" : index + 1}
                  </div>

                  {index < stages.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 ${
                        completed ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>

                <p
                  className={`mt-3 text-center text-xs ${
                    active
                      ? "font-semibold text-primary"
                      : completed
                        ? "font-medium text-foreground"
                        : "text-muted"
                  }`}
                >
                  {stage}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile timeline */}
      <div className="md:hidden">
        {stages.map((stage, index) => {
          const completed = index < currentStage;
          const active = index === currentStage;
          const upcoming = index > currentStage;

          return (
            <div key={stage} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                    completed
                      ? "border-primary bg-primary text-white"
                      : active
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-white text-muted"
                  }`}
                >
                  {completed ? "✓" : index + 1}
                </div>

                {index < stages.length - 1 && (
                  <div
                    className={`my-1 w-0.5 flex-1 ${
                      completed ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>

              <div className="pb-6">
                <p
                  className={`text-sm ${
                    active
                      ? "font-semibold text-primary"
                      : completed
                        ? "font-medium text-foreground"
                        : "text-muted"
                  }`}
                >
                  {stage}
                </p>

                {active && (
                  <p className="mt-1 text-xs text-muted">
                    Current stage
                  </p>
                )}

                {upcoming && (
                  <p className="mt-1 text-xs text-muted">
                    Awaiting completion
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}