"use client";

import type { FaqUsageResult } from "@/content/types/faqs";
import {
  formatFaqUsageDetail,
  formatFaqUsageSummary,
} from "@/lib/cms/faq-utils";

type FaqUsageIndicatorProps = {
  /** Assignment usage from admin FAQ APIs. */
  usage?: FaqUsageResult;
  /** compact = chip; hint = one muted line; detail = linked reference list. */
  variant?: "compact" | "hint" | "detail";
};

/**
 * Admin-only indicator showing where a catalog FAQ is assigned.
 *
 * @param props - Usage payload and display variant
 */
export function FaqUsageIndicator({
  usage,
  variant = "compact",
}: FaqUsageIndicatorProps) {
  const resolved = usage ?? { inUse: false, references: [] };
  const inUse = resolved.inUse;

  if (variant === "hint") {
    return (
      <span className="admin-faq-usage__hint">
        {formatFaqUsageSummary(resolved)}
      </span>
    );
  }

  if (variant === "detail") {
    return (
      <div className="admin-faq-usage admin-faq-usage--detail">
        <span
          className={`admin-status-chip${inUse ? " admin-status-chip--warn" : " admin-status-chip--ok"}`}
        >
          {inUse ? "In use" : "Not assigned"}
        </span>
        {inUse ? (
          <ul className="admin-faq-usage__list">
            {resolved.references.map((reference) => (
              <li key={`${reference.label}:${reference.href ?? ""}`}>
                {reference.href ? (
                  <a href={reference.href} className="admin-link">
                    {reference.label}
                  </a>
                ) : (
                  reference.label
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="admin-hint admin-hint--tight">
            Assign this FAQ from a page editor or shared sections.
          </p>
        )}
      </div>
    );
  }

  return (
    <span
      className={`admin-status-chip${inUse ? " admin-status-chip--warn" : " admin-status-chip--ok"}`}
      title={inUse ? formatFaqUsageDetail(resolved) : undefined}
    >
      {inUse ? "In use" : "Not assigned"}
    </span>
  );
}
