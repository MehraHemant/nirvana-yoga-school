import type { OverviewSpec } from "./types";

/**
 * USP glance chips — primary gradient pill, sage border, emphasized label/value.
 *
 * @param props.specs - Normalized glance rows
 */
export function GlanceChips({ specs }: { specs: OverviewSpec[] }) {
  if (specs.length === 0) return null;

  return (
    <dl className="flex flex-wrap gap-2.5 sm:gap-3">
      {specs.map((spec) => (
        <div
          key={`${spec.label}-${spec.index}`}
          className="inline-flex items-baseline gap-1.5 rounded-full border border-primary/25 bg-linear-to-br from-primary/15 via-primary/8 to-white px-4 py-2 shadow-xs ring-1 ring-primary/10"
        >
          <dt className="type-eyebrow text-primary">{spec.label}</dt>
          <span className="type-eyebrow text-primary/40" aria-hidden>
            ·
          </span>
          <dd className="text-sm font-semibold text-ink">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}
