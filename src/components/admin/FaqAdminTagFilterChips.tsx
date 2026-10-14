"use client";

import {
  FAQ_ADMIN_TAGS,
  type FaqAdminTagFilter,
} from "@/content/types/faqs";

type FaqAdminTagFilterChipsProps = {
  /** Active admin tag filter. */
  value: FaqAdminTagFilter;
  /** Called when an admin tag chip is selected. */
  onChange: (value: FaqAdminTagFilter) => void;
  /** Per-filter counts for chip badges. */
  counts: Record<FaqAdminTagFilter, number>;
  /** Toolbar label above the chips. */
  label?: string;
};

/**
 * Admin-only chip row for filtering FAQs by catalog admin tag.
 *
 * @param props - Filter value, counts, and change handler
 */
export function FaqAdminTagFilterChips({
  value,
  onChange,
  counts,
  label = "Filter by admin tag",
}: FaqAdminTagFilterChipsProps) {
  return (
    <div className="admin-faq-editor__toolbar">
      <span className="admin-label admin-faq-editor__filter-label">{label}</span>
      <div className="admin-faq-editor__filters admin-faq-editor__filters--tags">
        <button
          type="button"
          className={`admin-chip ${value === "all" ? "admin-chip--active" : ""}`}
          onClick={() => onChange("all")}
        >
          All tags
          <span className="admin-chip-count">{counts.all}</span>
        </button>
        {FAQ_ADMIN_TAGS.map((tag) => (
          <button
            key={tag.id}
            type="button"
            className={`admin-chip ${value === tag.id ? "admin-chip--active" : ""}`}
            onClick={() => onChange(tag.id)}
          >
            {tag.label}
            <span className="admin-chip-count">{counts[tag.id]}</span>
          </button>
        ))}
        {counts.untagged > 0 ? (
          <button
            type="button"
            className={`admin-chip ${value === "untagged" ? "admin-chip--active" : ""}`}
            onClick={() => onChange("untagged")}
          >
            Untagged
            <span className="admin-chip-count">{counts.untagged}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
