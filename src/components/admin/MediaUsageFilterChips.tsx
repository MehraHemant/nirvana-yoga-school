"use client";

export type MediaUsageFilter = "all" | "unused" | "inUse";

const USAGE_OPTIONS: ReadonlyArray<readonly [MediaUsageFilter, string]> = [
  ["all", "All"],
  ["unused", "Unused"],
  ["inUse", "In use"],
];

type MediaUsageFilterChipsProps = {
  value: MediaUsageFilter;
  onChange: (value: MediaUsageFilter) => void;
};

/**
 * Chip row filtering a media picker by CMS usage.
 *
 * @param props - Active filter and change handler
 */
export function MediaUsageFilterChips({
  value,
  onChange,
}: MediaUsageFilterChipsProps) {
  return (
    <div className="admin-chip-row admin-media-picker-usage">
      {USAGE_OPTIONS.map(([key, label]) => (
        <button
          key={key}
          type="button"
          className={`admin-chip ${value === key ? "admin-chip--active" : ""}`}
          aria-pressed={value === key}
          onClick={() => onChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/**
 * Maps the chip value to the `usage` query param (`all` → no filter).
 *
 * @param value - Active usage filter
 */
export function mediaUsageQuery(
  value: MediaUsageFilter,
): "unused" | "inUse" | undefined {
  return value === "all" ? undefined : value;
}
