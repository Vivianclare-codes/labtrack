export default function ActivityLogsView() {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          Laboratory / Administration
        </p>

        <h1 className="mt-2 text-[26px] font-semibold tracking-tight text-foreground">
          Activity logs
        </h1>

        <p className="mt-1 text-[13px] text-muted">
          Track actions and changes made across the laboratory system.
        </p>
      </div>

      <section className="overflow-hidden rounded-[10px] border border-border bg-white">
        <div className="border-b border-border p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-foreground">
            Recent activity
          </h2>
          <p className="mt-1 text-xs text-muted">
            A chronological record of system activity.
          </p>
        </div>

        <div className="px-5 py-14 text-center">
          <p className="text-sm font-medium text-foreground">
            Activity history is not available yet
          </p>
          <p className="mt-2 text-xs text-muted">
            The backend does not currently provide activity-log records, so no
            sample data is shown.
          </p>
        </div>
      </section>
    </div>
  );
}
