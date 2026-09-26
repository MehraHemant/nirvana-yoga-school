import type { OverviewSpec } from "./types";

/**
 * Quiet wrap of glance chips — muted eyebrow label, ·, small ink value.
 *
 * @param props.specs - Normalized glance rows
 */
export function GlanceChips({ specs }: { specs: OverviewSpec[] }) {
  if (specs.length === 0) return null;

  return (
    <dl className="flex flex-wrap gap-2">
      {specs.map((spec) => (
        <div
          key={`${spec.label}-${spec.index}`}
          className="inline-flex items-baseline gap-1.5 rounded-full border border-ink/8 bg-sand px-3.5 py-1.5"
        >
          <dt className="type-eyebrow text-muted">{spec.label}</dt>
          <span className="type-eyebrow text-muted" aria-hidden>
            ·
          </span>
          <dd className="text-sm text-ink">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}
