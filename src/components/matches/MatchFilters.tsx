"use client";

import { useRouter, useSearchParams } from "next/navigation";

const statusFilters = [
  { value: "all", label: "All Matches" },
  { value: "upcoming", label: "Upcoming" },
  { value: "live", label: "Live" },
  { value: "completed", label: "Completed" },
];

const stageFilters = [
  { value: "all", label: "All Stages" },
  { value: "group", label: "Group Stage" },
  { value: "round-of-16", label: "Round of 16" },
  { value: "quarter-final", label: "Quarter-Finals" },
  { value: "semi-final", label: "Semi-Finals" },
  { value: "third-place", label: "3rd Place" },
  { value: "final", label: "Final" },
];

export function MatchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentStatus = searchParams.get("status") || "all";
  const currentStage = searchParams.get("stage") || "all";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/matches?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-4 mb-8">
      {/* Status Filter */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-[var(--muted-bg)]">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => updateFilter("status", filter.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentStatus === filter.value
                ? "bg-primary-500 text-dark-950"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Stage Filter */}
      <select
        value={currentStage}
        onChange={(e) => updateFilter("stage", e.target.value)}
        className="px-4 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {stageFilters.map((filter) => (
          <option key={filter.value} value={filter.value}>
            {filter.label}
          </option>
        ))}
      </select>
    </div>
  );
}
