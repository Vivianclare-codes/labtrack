"use client";

import { useMemo, useState } from "react";
import {
  activities,
  activityCategories,
  type ActivityCategory,
  type ActivityRecord,
} from "@/app/lib/activity-data";

const categoryStyles: Record<ActivityCategory, string> = {
  Patient: "bg-info-soft text-info",
  Sample: "bg-primary-soft text-primary",
  Test: "bg-muted-surface text-foreground",
  Result: "bg-warning-soft text-warning",
  Staff: "bg-[#F1EEF8] text-[#725B9A]",
  System: "bg-muted-surface text-muted",
};

function ActivityAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[11px] font-semibold text-primary">
      {initials}
    </div>
  );
}

function ActivityItem({ activity }: { activity: ActivityRecord }) {
  return (
    <div className="flex gap-3 border-b border-border px-4 py-5 last:border-b-0 sm:px-5">
      <ActivityAvatar name={activity.actor} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs leading-5 text-foreground">
              <span className="font-semibold">{activity.actor}</span>{" "}
              <span className="text-muted">{activity.action.toLowerCase()}</span>
            </p>

            <p className="mt-1 break-words text-xs font-medium text-primary">
              {activity.target}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
            <span className="text-[10px] text-muted">
              {activity.timestamp}
            </span>
            <span className="text-[10px] text-muted">
              {activity.time}
            </span>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${categoryStyles[activity.category]}`}
          >
            {activity.category}
          </span>

          <span className="text-[10px] text-muted">{activity.role}</span>
        </div>

        <p className="mt-2 text-[11px] leading-5 text-muted">
          {activity.details}
        </p>
      </div>
    </div>
  );
}

export default function ActivityLogsView() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(8);

  const filteredActivities = useMemo(() => {
    const query = search.trim().toLowerCase();

    return activities.filter((activity) => {
      const matchesCategory =
        category === "All" || activity.category === category;

      const searchableText = [
        activity.actor,
        activity.role,
        activity.action,
        activity.target,
        activity.category,
        activity.details,
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory && searchableText.includes(query);
    });
  }, [search, category]);

  const visibleActivities = filteredActivities.slice(0, visibleCount);

  function handleCategoryChange(value: string) {
    setCategory(value);
    setVisibleCount(8);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setVisibleCount(8);
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Page heading */}
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

      {/* Demo notice */}
      <div className="rounded-lg border border-border bg-muted-surface px-4 py-3">
        <p className="text-xs text-muted">
          <span className="font-semibold text-foreground">Demo activity:</span>{" "}
          These records are illustrative. Live activity tracking will be
          connected to the backend later.
        </p>
      </div>

      {/* Summary */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-[10px] border border-border bg-white p-4">
          <p className="text-[11px] text-muted">Total activities</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {activities.length}
          </p>
        </div>

        <div className="rounded-[10px] border border-border bg-white p-4">
          <p className="text-[11px] text-muted">Today</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {activities.filter((item) => item.timestamp === "14 Mar 2026").length}
          </p>
        </div>

        <div className="col-span-2 rounded-[10px] border border-border bg-white p-4 sm:col-span-1">
          <p className="text-[11px] text-muted">Staff members active</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {new Set(activities.map((item) => item.actor)).size}
          </p>
        </div>
      </section>

      {/* Activity list */}
      <section className="overflow-hidden rounded-[10px] border border-border bg-white">
        <div className="border-b border-border p-4 sm:p-5">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Recent activity
              </h2>
              <p className="mt-1 text-xs text-muted">
                A chronological record of system activity.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search activity, staff or record..."
                aria-label="Search activity logs"
                className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-white px-3 text-xs text-foreground outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
              />

              <select
                value={category}
                onChange={(event) => handleCategoryChange(event.target.value)}
                aria-label="Filter activity category"
                className="h-10 rounded-lg border border-border bg-white px-3 text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="All">All categories</option>
                {activityCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] text-muted">
              Showing {visibleActivities.length} of {filteredActivities.length}{" "}
              activities
            </p>

            {(search || category !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                  setVisibleCount(8);
                }}
                className="text-[11px] font-medium text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {visibleActivities.length > 0 ? (
          <div>
            {visibleActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="px-5 py-14 text-center">
            <p className="text-sm font-medium text-foreground">
              No activities found
            </p>
            <p className="mt-2 text-xs text-muted">
              Try another search term or category.
            </p>
          </div>
        )}

        {visibleCount < filteredActivities.length && (
          <div className="border-t border-border p-4 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((current) => current + 8)}
              className="rounded-lg border border-border px-5 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted-surface"
            >
              Load more activities
            </button>
          </div>
        )}
      </section>
    </div>
  );
}